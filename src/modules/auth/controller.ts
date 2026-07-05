import { Handler } from 'hono'
import { UserLoginSchema, UserRegistrationSchema } from '../../zod/user'
import { compare, hash } from 'bcrypt'
import { User } from '../../db/models/user'
import { JWT_CONFIG } from '../../constants/jwt'
import jwt from 'jsonwebtoken'
import { setCookie } from 'hono/cookie'
import { ENVIRONMENT_CONFIG } from '../../constants/environment'
import { redisClient } from '../../redis/client'
import {
  checkIfUserExists,
  createAccessToken,
  createRefreshToken,
  createUser,
  setAccessTokenInCookie,
  setRefreshTokenInCookie,
} from './service'
import {
  UserEmailAlreadyExistsError,
  UserEmailNotRegisteredError,
  UserEmailPasswordMismatchError,
} from './errors'

const registerUser: Handler = async ({ req, json }) => {
  const formData = await req.formData()
  const email = formData.get('email')?.toString().toLowerCase() ?? ''
  const password = formData.get('password')?.toString() ?? ''
  const parsed = UserRegistrationSchema.safeParse({ email, password })
  if (!parsed.success) {
    return json({ message: 'Invalid form data', error: parsed.error.cause, success: false }, 400)
  }
  try {
    await createUser(email, password)
    return json({ success: true, message: 'User registered successfully' }, 201)
  } catch (error: unknown) {
    console.error(error)
    if (error instanceof UserEmailAlreadyExistsError) {
      return json(
        {
          message: 'User with this email already exists',
          error: error.message,
          success: false,
        },
        409,
      )
    }
    return json(
      {
        message: 'Failed to register user',
        error: 'Something went wrong',
        success: false,
      },
      500,
    )
  }
}

const loginUser: Handler = async (context) => {
  const formData = await context.req.formData()
  const email = formData.get('email')?.toString() ?? ''
  const password = formData.get('password')?.toString() ?? ''
  const parsed = UserLoginSchema.safeParse({ email, password })
  if (!parsed.success) {
    return context.json(
      {
        message: 'Invalid form data',
        error: parsed.error.message,
        success: false,
      },
      400,
    )
  }
  try {
    const user = await checkIfUserExists(email, password)
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

export { registerUser, loginUser }
