import { type Context, Handler } from 'hono'
import { getCookie } from 'hono/cookie'
import jwt from 'jsonwebtoken'
import { UserLoginSchema, UserRegistrationSchema } from './request-schema'
import { redisClient } from '../../lib/redis/client'
import { ENVIRONMENT_CONFIG } from '../../constants/environment'
import { JWT_CONFIG } from '../../constants/jwt'
import {
  checkIfUserExists,
  createAccessToken,
  createRefreshToken,
  createUser,
  setAccessTokenInCookie,
  setRefreshTokenInCookie,
} from './service'
import {
  InvalidJsonPayloadError,
  UserEmailAlreadyExistsError,
  UserEmailNotRegisteredError,
  UserEmailPasswordMismatchError,
} from './errors'
import { publishUserSignupEmail } from '@/lib/rmq/publishers/user-signup.publisher'
import { userSignupEmailChannel } from '@/lib/rmq/channels/user-signup-email'
import { User } from './mongo-model'

type AuthEnvironment = {
  Variables: {
    userId: string
  }
}

const getJsonRequestBody = async (context: Context): Promise<unknown> => {
  if (!context.req.header('content-type')?.toLowerCase().startsWith('application/json')) {
    throw new InvalidJsonPayloadError()
  }

  try {
    return await context.req.json()
  } catch {
    throw new InvalidJsonPayloadError()
  }
}

const validateUserRegistrationRequest = async (context: Context) => {
  const parsed = UserRegistrationSchema.safeParse(await getJsonRequestBody(context))
  if (!parsed.success) {
    throw new InvalidJsonPayloadError()
  }
  return parsed.data
}

const registerUser: Handler = async (context) => {
  try {
    const parsedData = await validateUserRegistrationRequest(context)
    await createUser(parsedData.email, parsedData.password)
    if (userSignupEmailChannel) {
      await publishUserSignupEmail(parsedData.email, userSignupEmailChannel)
    }
    return context.json({ success: true, message: 'User registered successfully' }, 201)
  } catch (error: unknown) {
    console.error(error)
    if (error instanceof UserEmailAlreadyExistsError) {
      return context.json(
        {
          message: 'User with this email already exists',
          error: error.message,
          success: false,
        },
        409,
      )
    }
    if (error instanceof InvalidJsonPayloadError) {
      return context.json(
        {
          message: 'Invalid JSON payload',
          error: error.message,
          success: false,
        },
        400,
      )
    }
    return context.json(
      {
        message: 'Failed to register user',
        error: 'Something went wrong',
        success: false,
      },
      500,
    )
  }
}

const validateUserLoginRequest = async (context: Context) => {
  const parsed = UserLoginSchema.safeParse(await getJsonRequestBody(context))
  if (!parsed.success) {
    throw new InvalidJsonPayloadError()
  }
  return parsed.data
}

const loginUser: Handler = async (context) => {
  try {
    const parsedData = await validateUserLoginRequest(context)
    const user = await checkIfUserExists(parsedData.email, parsedData.password)
    const accessToken = await createAccessToken(user._id.toString())
    const refreshToken = await createRefreshToken(user._id.toString())

    await setAccessTokenInCookie(context, accessToken)
    await setRefreshTokenInCookie(context, refreshToken)
    await redisClient?.set(`refresh:${user._id}`, refreshToken, {
      expiration: {
        type: 'EX',
        value: 60 * 60 * 24 * 30, // 30 days
      },
    })
    return context.json({ success: true, message: 'Login successful' }, 200)
  } catch (error: unknown) {
    console.error(error)
    if (error instanceof InvalidJsonPayloadError) {
      return context.json(
        {
          message: 'Invalid JSON payload',
          error: error.message,
          success: false,
        },
        400,
      )
    }
    if (error instanceof UserEmailNotRegisteredError) {
      return context.json(
        {
          message: 'User email not registered',
          error: error.message,
          success: false,
        },
        401,
      )
    }
    if (error instanceof UserEmailPasswordMismatchError) {
      return context.json(
        {
          message: 'User email and password mismatch',
          error: error.message,
          success: false,
        },
        401,
      )
    }
    return context.json(
      {
        message: 'Failed to login',
        error: 'Something went wrong',
        success: false,
      },
      500,
    )
  }
}

const refreshAccessToken: Handler = async (context) => {
  const refreshToken = getCookie(context, 'refresh_token')
  if (!refreshToken) {
    return context.json({ success: false, message: 'Invalid or expired refresh token' }, 401)
  }

  try {
    const payload = jwt.verify(refreshToken, ENVIRONMENT_CONFIG.REFRESH_TOKEN_SECRET, {
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE,
      subject: JWT_CONFIG.SUBJECT,
    })
    const userId = typeof payload === 'object' ? payload.userId : undefined
    if (typeof userId !== 'string') {
      return context.json({ success: false, message: 'Invalid or expired refresh token' }, 401)
    }

    const storedRefreshToken = await redisClient?.get(`refresh:${userId}`)
    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      return context.json({ success: false, message: 'Invalid or expired refresh token' }, 401)
    }

    const accessToken = await createAccessToken(userId)
    await setAccessTokenInCookie(context, accessToken)
    return context.json({ success: true, message: 'Access token refreshed' }, 200)
  } catch (error) {
    console.error(error)
    return context.json({ success: false, message: 'Invalid or expired refresh token' }, 401)
  }
}

const getCurrentUser: Handler<AuthEnvironment> = async (context) => {
  try {
    const user = await User.findById(context.var.userId).select('_id email').lean()

    if (!user) {
      return context.json({ success: false, message: 'Authentication required' }, 401)
    }

    context.header('Cache-Control', 'no-store')
    return context.json({
      data: {
        id: user._id.toString(),
        email: user.email,
      },
      success: true,
    })
  } catch (error) {
    console.error(error)
    return context.json({ success: false, message: 'Failed to retrieve user details' }, 500)
  }
}

export {
  getCurrentUser,
  registerUser,
  loginUser,
  refreshAccessToken,
  validateUserRegistrationRequest,
  validateUserLoginRequest,
}
