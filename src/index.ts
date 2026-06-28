import { Hono } from 'hono'
import { connect as connectToMongo } from './db/client'

const app = new Hono()

connectToMongo()
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err)
    process.exit(1)
  })

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
