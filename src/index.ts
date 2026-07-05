import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { config } from 'dotenv'
import { connect as connectToMongo } from './db/client'
import { connectRedis } from './redis/client'
import { authRouter } from './modules/auth/routes'
import {
  checkMissingRequiredEnvironmentVariables,
  ENVIRONMENT_CONFIG,
} from './constants/environment'
const app = new Hono()

app.route('/auth', authRouter)

const startServer = async () => {
  checkMissingRequiredEnvironmentVariables(ENVIRONMENT_CONFIG)
  await connectToMongo(ENVIRONMENT_CONFIG.MONGO_URI).catch((err) => {
    console.error('Error connecting to MongoDB', err)
    process.exit(1)
  })
  await connectRedis(ENVIRONMENT_CONFIG.REDIS_URI, ENVIRONMENT_CONFIG.REDIS_PASSWORD).catch(
    (err) => {
      console.error('Error connecting to Redis', err)
      process.exit(1)
    },
  )
  serve({
    ...app,
    port: ENVIRONMENT_CONFIG.PORT,
  })
}

startServer().catch((err) => {
  console.error('Fatal error: could not start server', err)
  process.exit(1)
})
