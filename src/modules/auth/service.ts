import { compare, hash } from 'bcrypt'
import { User } from './mongo-model'
import {
  UserEmailAlreadyExistsError,
  UserEmailNotRegisteredError,
  UserEmailPasswordMismatchError,
} from './errors'
import { JWT_CONFIG } from '../../constants/jwt'
import jwt from 'jsonwebtoken'
import { ENVIRONMENT_CONFIG } from '../../constants/environment'
import { Context } from 'hono'
import { setCookie } from 'hono/cookie'

/**
 * 
 @throws {UserEmailNotRegisteredError, UserEmailPasswordMismatchError}
 */
const checkIfUserExists = async (email: string, password: string) => {
  const user = await User.findOne({ email })
  if (!user) {
    throw new UserEmailNotRegisteredError()
  }
  const isMatchingPassword = await compare(password, user.password)
  if (!isMatchingPassword) {
    throw new UserEmailPasswordMismatchError()
  }

  return user
}

/**
 * @throws {UserEmailAlreadyExistsError}
 */
const createUser = async (email: string, password: string) => {
  console.log('Creating user...', email, password)
  try {
    const hashedPassword = await hash(password, 10)
    const newUser = await User.create({ email, password: hashedPassword })
    return newUser
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      console.error(error)
      throw new UserEmailAlreadyExistsError()
    }
    throw error
  }
}

const createAccessToken = async (userId: string) => {
  const accessToken = jwt.sign({ userId }, ENVIRONMENT_CONFIG.ACCESS_TOKEN_SECRET, {
    expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRATION,
    issuer: JWT_CONFIG.ISSUER,
    audience: JWT_CONFIG.AUDIENCE,
    subject: JWT_CONFIG.SUBJECT,
  })
  return accessToken
}

const setAccessTokenInCookie = async (context: Context, accessToken: string) => {
  setCookie(context, 'access_token', accessToken, {
    httpOnly: true,
    secure: ENVIRONMENT_CONFIG.ENVIRONMENT_TYPE === 'production',
    path: '/',
    maxAge: 60 * 15, // 15 minutes
    sameSite: 'lax',
  })
}

const setRefreshTokenInCookie = async (context: Context, refreshToken: string) => {
  setCookie(context, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: ENVIRONMENT_CONFIG.ENVIRONMENT_TYPE === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
  })
}

const createRefreshToken = async (userId: string) => {
  const refreshToken = jwt.sign({ userId }, ENVIRONMENT_CONFIG.REFRESH_TOKEN_SECRET, {
    expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRATION,
    issuer: JWT_CONFIG.ISSUER,
    audience: JWT_CONFIG.AUDIENCE,
    subject: JWT_CONFIG.SUBJECT,
  })
  return refreshToken
}

export {
  checkIfUserExists,
  createAccessToken,
  createUser,
  createRefreshToken,
  setAccessTokenInCookie,
  setRefreshTokenInCookie,
}
