import { rmqClient } from '../client'
import { USER_SIGNUP_EMAIL_QUEUE } from '../config'
import { UserSignupEmailEventSchema } from '../contracts/user-signup-email.event'

const startWelcomeEmailConsumer = async () => {
  if (!rmqClient) {
    console.error('RMQ client not connected')
    return
  }

  const channel = await rmqClient.createChannel()
  await channel.assertQueue(USER_SIGNUP_EMAIL_QUEUE, { durable: true })
  await channel.consume(
    USER_SIGNUP_EMAIL_QUEUE,
    (msg) => {
      if (!msg) return

      const signupEmailEvent = JSON.parse(msg.content.toString())
      const parsedEvent = UserSignupEmailEventSchema.safeParse(signupEmailEvent)
      if (!parsedEvent.success) {
        console.error('Invalid user signup email event', parsedEvent.error)
        channel.ack(msg)
        return
      }
      const { recipientEmail } = parsedEvent.data.data
      console.log(`Received user signup email for ${recipientEmail}`)
      channel.ack(msg)
    },
    { noAck: false },
  )
}

export { startWelcomeEmailConsumer }
