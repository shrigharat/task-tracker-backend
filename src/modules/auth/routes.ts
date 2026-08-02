import { Hono } from 'hono'
import { loginUser, refreshAccessToken, registerUser } from './controller'

const authRouter = new Hono()

authRouter.post('/register', registerUser)
authRouter.post('/login', loginUser)
authRouter.post('/refresh', refreshAccessToken)

export { authRouter }
