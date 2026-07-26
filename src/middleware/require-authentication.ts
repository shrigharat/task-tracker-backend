import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'
import jwt from 'jsonwebtoken'
import { ENVIRONMENT_CONFIG } from '../constants/environment'
import { JWT_CONFIG } from '../constants/jwt'

type AccessTokenPayload = jwt.JwtPayload & {
  userId: string
}

const requireAuthentication: MiddlewareHandler = async (context, next) => {
  const accessToken = getCookie(context, 'access_token')

  if (!accessToken) {
    return context.json({ success: false, message: 'Authentication required' }, 401)
  }

  try {
    const payload = jwt.verify(accessToken, ENVIRONMENT_CONFIG.ACCESS_TOKEN_SECRET, {
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE,
      subject: JWT_CONFIG.SUBJECT,
    })

    if (typeof payload === 'string' || typeof payload.userId !== 'string') {
      return context.json({ success: false, message: 'Invalid access token' }, 401)
    }

    context.set('userId', (payload as AccessTokenPayload).userId)
    await next()
  } catch {
    return context.json({ success: false, message: 'Invalid or expired access token' }, 401)
  }
}

export { requireAuthentication }
