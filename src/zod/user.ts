import z from 'zod'

const UserRegistrationSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(32),
})

const UserLoginSchema = UserRegistrationSchema

export { UserRegistrationSchema, UserLoginSchema }
