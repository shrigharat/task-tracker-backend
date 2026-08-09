import { Hono } from 'hono'
import { requireAuthentication } from '../../middleware/require-authentication'
import { getCurrentUser, loginUser, refreshAccessToken, registerUser } from './controller'

const authRouter = new Hono<{ Variables: { userId: string } }>()

authRouter.post('/register', registerUser)
authRouter.post('/login', loginUser)
authRouter.post('/refresh', refreshAccessToken)
authRouter.get('/me', requireAuthentication, getCurrentUser)

export { authRouter }
