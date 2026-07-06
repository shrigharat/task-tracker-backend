import mongoose from 'mongoose'
import type { Mongoose } from 'mongoose'

let _client: Mongoose | null

const connect = async (mongoUri: string) => {
  if (!_client) {
    _client = await mongoose.connect(mongoUri, { authSource: 'admin' })
    _client.connection.on('connected', () => {
      console.log('Connected to MongoDB')
    })
    _client.connection.on('error', (err) => {
      console.error('Error connecting to MongoDB', err)
    })
    _client.connection.on('disconnected', () => {
      console.log('Disconnected from MongoDB')
    })
    _client.connection.on('reconnected', () => {
      console.log('Reconnected to MongoDB')
    })
    _client.connection.on('reconnectFailed', (err) => {
      console.error('Reconnect failed', err)
    })
    _client.connection.on('close', () => {
      console.log('Connection closed')
    })
    _client.connection.on('fullsetup', () => {
      console.log('Full setup')
    })
  }
  return _client
}

export { connect }
