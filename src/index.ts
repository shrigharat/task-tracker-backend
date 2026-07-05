import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { serve } from '@hono/node-server'
import { config } from 'dotenv'
import { connect as connectToMongo } from './db/client'
import { UserLoginSchema, UserRegistrationSchema } from './zod/user'
import { User } from './db/models/user'
import { hash, compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
import {
  checkMissingRequiredEnvironmentVariables,
  getEnvironmentVariables,
} from './constants/environment'
import { connectRedis, redisClient } from './redis/client'
import { JWT_CONFIG } from './constants/jwt'

// load ENV variables
config()
checkMissingRequiredEnvironmentVariables()
const {
  MONGO_URI,
  PORT,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ENVIRONMENT_TYPE,
  REDIS_URI,
  REDIS_PASSWORD,
} = getEnvironmentVariables()

const app = new Hono()

app.post('/auth/register', async ({ req, json }) => {
  const formData = await req.formData()
  const email = formData.get('email')?.toString().toLowerCase() ?? ''
  const password = formData.get('password')?.toString() ?? ''
  const parsed = UserRegistrationSchema.safeParse({ email, password })
  if (!parsed.success) {
    return json({ message: 'Invalid form data', error: parsed.error.cause, success: false }, 400)
  }
  try {
    const hashedPassword = await hash(password, 10)
    await User.create({ email, password: hashedPassword })
    return json({ success: true, message: 'User registered successfully' }, 201)
  } catch (error: unknown) {
    console.error(error)
    if (error instanceof Error && 'code' in error && error.code === 11000) {
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
})

app.post('/auth/login', async (context) => {
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
    const user = await User.findOne({ email: parsed.data.email })
    if (!user) {
      return context.json(
        {
          message: 'Invalid credentials',
          error: 'User not found',
          success: false,
        },
        401,
      )
    }
    const isMatchingPassword = await compare(password, user.password)
    if (!isMatchingPassword) {
      return context.json(
        {
          message: 'Invalid credentials',
          error: 'User with this email and password combination does not exist',
          success: false,
        },
        401,
      )
    }
    const accessToken = jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, {
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRATION,
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE,
      subject: JWT_CONFIG.SUBJECT,
    })
    const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, {
      expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRATION,
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE,
      subject: JWT_CONFIG.SUBJECT,
    })
    setCookie(context, 'access_token', accessToken, {
      httpOnly: true,
      secure: ENVIRONMENT_TYPE === 'production',
      path: '/',
      maxAge: 60 * 15, // 15 minutes
      sameSite: 'lax',
    })
    setCookie(context, 'refresh_token', refreshToken, {
      httpOnly: true,
      secure: ENVIRONMENT_TYPE === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    })
    await redisClient?.set(`refresh:${user._id}`, refreshToken, {
      expiration: {
        type: 'EX',
        value: 60 * 60 * 24 * 30, // 30 days
      },
    })
    return context.json({ success: true, message: 'Login successful' }, 200)
  } catch (error: unknown) {
    console.error(error)
    return context.json(
      {
        message: 'Failed to login',
        error: 'Something went wrong',
        success: false,
      },
      500,
    )
  }
})

const startServer = async () => {
  await connectToMongo(MONGO_URI).catch((err) => {
    console.error('Error connecting to MongoDB', err)
    process.exit(1)
  })
  await connectRedis(REDIS_URI, REDIS_PASSWORD).catch((err) => {
    console.error('Error connecting to Redis', err)
    process.exit(1)
  })
  serve({
    ...app,
    port: PORT || 4000,
  })
}

startServer()
