import type { Channel } from 'amqplib'
import { USER_SIGNUP_EMAIL_QUEUE } from '../config'
import { UserSignupEmailEvent } from '../contracts/user-signup-email.event'

const publishUserSignupEmail = async (recipientEmail: string, channel: Channel) => {
  await channel.assertQueue(USER_SIGNUP_EMAIL_QUEUE, { durable: true })
  const event: UserSignupEmailEvent = {
    id: crypto.randomUUID(),
    name: 'user-signup-email',
    version: 'v1',
    createdAt: new Date().toISOString(),
    data: {
      recipientEmail,
    },
  }
  const isPublished = channel.sendToQueue(
    USER_SIGNUP_EMAIL_QUEUE,
    Buffer.from(JSON.stringify(event)),
  )
  if (!isPublished) {
    console.error(`Failed to publish user signup email to ${recipientEmail}`)
  } else {
    console.log(`Sent user signup email to ${recipientEmail}`)
  }
  return isPublished
}

export { publishUserSignupEmail }
