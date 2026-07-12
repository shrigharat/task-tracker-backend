import { connectRMQ } from '@/lib/rmq/client'
import { startWelcomeEmailConsumer } from '@/lib/rmq/consumers/welcome-email'
import { ENVIRONMENT_CONFIG } from '@/constants/environment'

const startEmailWorker = async () => {
  console.log('Starting email worker...')
  await connectRMQ(ENVIRONMENT_CONFIG.RABBITMQ_URI).catch((err) => {
    console.error('Error connecting to RMQ', err)
    process.exit(1)
  })
  await startWelcomeEmailConsumer().catch((err) => {
    console.error('Error starting welcome email consumer', err)
    process.exit(1)
  })
}

startEmailWorker()
