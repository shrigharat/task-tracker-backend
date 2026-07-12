import { rmqClient } from '../client'
import { USER_SIGNUP_EMAIL_QUEUE } from '../config'
import { UserSignupEmailEventSchema } from '../contracts/user-signup-email.event'
import type { UserSignupEmailEvent } from '../contracts/user-signup-email.event'

const startWelcomeEmailConsumer = async () => {
  if (!rmqClient) {
    throw new Error('RMQ client not connected')
  }

  const channel = await rmqClient.createChannel()
  await channel.assertQueue(USER_SIGNUP_EMAIL_QUEUE, { durable: true })
  await channel.consume(
    USER_SIGNUP_EMAIL_QUEUE,
    (msg) => {
      if (!msg) return

      let receivedEvent: UserSignupEmailEvent | undefined
      try {
        receivedEvent = JSON.parse(msg.content.toString())
      } catch (error) {
        console.error('Error parsing user signup email event', error)
        channel.ack(msg)
        return
      }
      const parsedEvent = UserSignupEmailEventSchema.safeParse(receivedEvent)
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
