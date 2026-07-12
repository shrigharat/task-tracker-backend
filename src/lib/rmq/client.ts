import { connect } from 'amqplib'
import type { ChannelModel } from 'amqplib'

let _client: ChannelModel | undefined

const connectRMQ = async (uri: string) => {
  if (!_client) {
    _client = await connect(uri)
    _client.on('error', (err) => {
      console.error('RMQ error', err)
    })
    _client.on('close', () => {
      console.log('RMQ disconnected')
    })
  }

  return _client
}

export { connectRMQ, _client as rmqClient }
