import type { Channel } from 'amqplib'
import { rmqClient } from '../client'

let _userSignupEmailChannel: Channel | undefined

const initializeUserSignupEmailChannel = async () => {
  if (!rmqClient) {
    throw new Error('RMQ client not connected')
  }
  if (_userSignupEmailChannel) return

  _userSignupEmailChannel = await rmqClient.createChannel()
}

export { initializeUserSignupEmailChannel, _userSignupEmailChannel as userSignupEmailChannel }
