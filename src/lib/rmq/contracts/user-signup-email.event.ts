import z from 'zod'

type UserSignupEmailEvent = {
  id: string
  name: 'user-signup-email'
  version: 'v1'
  createdAt: string
  data: {
    recipientEmail: string
  }
}

const UserSignupEmailEventSchema = z.object({
  id: z.string(),
  name: z.literal('user-signup-email'),
  version: z.literal('v1'),
  createdAt: z.string(),
  data: z.object({
    recipientEmail: z.email(),
  }),
})

export { UserSignupEmailEventSchema }
export type { UserSignupEmailEvent }
