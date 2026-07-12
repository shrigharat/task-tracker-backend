import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { connect as connectToMongo } from './lib/mongo/client'
import { connectRedis } from './lib/redis/client'
import { authRouter } from './modules/auth/routes'
import {
  checkMissingRequiredEnvironmentVariables,
  ENVIRONMENT_CONFIG,
} from './constants/environment'
import { connectRMQ } from './lib/rmq/client'
import { initializeUserSignupEmailChannel } from './lib/rmq/channels/user-signup-email'
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
  await connectRMQ(ENVIRONMENT_CONFIG.RABBITMQ_URI).catch((err) => {
    console.error('Error connecting to RMQ', err)
    process.exit(1)
  })
  await initializeUserSignupEmailChannel().catch((err) => {
    console.error('Error initializing user signup email channel', err)
  })
  serve({
    ...app,
    port: ENVIRONMENT_CONFIG.PORT,
  })
}

startServer().catch((err) => {
  console.error('Fatal error: could not start server', err)
  process.exit(1)
})
