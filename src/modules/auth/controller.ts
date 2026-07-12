import { type Context, Handler } from 'hono'
import { UserLoginSchema, UserRegistrationSchema } from './request-schema'
import { redisClient } from '../../lib/redis/client'
import {
  checkIfUserExists,
  createAccessToken,
  createRefreshToken,
  createUser,
  setAccessTokenInCookie,
  setRefreshTokenInCookie,
} from './service'
import {
  InvalidFormDataError,
  UserEmailAlreadyExistsError,
  UserEmailNotRegisteredError,
  UserEmailPasswordMismatchError,
} from './errors'
import { publishUserSignupEmail } from '@/lib/rmq/publishers/user-signup.publisher'
import { userSignupEmailChannel } from '@/lib/rmq/channels/user-signup-email'

const validateUserRegistrationRequest = async (context: Context) => {
  const formData = await context.req.formData()
  const email = formData.get('email')?.toString().toLowerCase() ?? ''
  const password = formData.get('password')?.toString() ?? ''
  const parsed = UserRegistrationSchema.safeParse({ email, password })
  if (!parsed.success) {
    throw new InvalidFormDataError()
  }
  return parsed.data
}

const registerUser: Handler = async (context) => {
  const parsedData = await validateUserRegistrationRequest(context)
  try {
    await createUser(parsedData.email, parsedData.password)
    if (userSignupEmailChannel) {
      publishUserSignupEmail(parsedData.email, userSignupEmailChannel)
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
    if (error instanceof InvalidFormDataError) {
      return context.json(
        {
          message: 'Invalid form data',
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
  const formData = await context.req.formData()
  const email = formData.get('email')?.toString() ?? ''
  const password = formData.get('password')?.toString() ?? ''
  const parsed = UserLoginSchema.safeParse({ email, password })
  if (!parsed.success) {
    throw new InvalidFormDataError()
  }
  return parsed.data
}

const loginUser: Handler = async (context) => {
  const parsedData = await validateUserLoginRequest(context)

  try {
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
    if (error instanceof InvalidFormDataError) {
      return context.json(
        {
          message: 'Invalid form data',
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

export { registerUser, loginUser, validateUserRegistrationRequest, validateUserLoginRequest }
