import { createClient } from 'redis'

let _client: ReturnType<typeof createClient> | undefined

const connectRedis = async (redisUri: string, redisPassword: string) => {
  if (!_client) {
    _client = createClient({
      url: redisUri,
      password: redisPassword,
    })
    await _client.connect()
    _client.on('error', (err) => {
      console.error('Redis error', err)
    })
    _client.on('connect', () => {
      console.log('Redis connected')
    })
    _client.on('disconnect', () => {
      console.log('Redis disconnected')
    })
  }
  return _client
}

export { connectRedis, _client as redisClient }
