import z from 'zod'

const UserRegistrationSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(32),
})

const UserLoginSchema = UserRegistrationSchema

export { UserRegistrationSchema, UserLoginSchema }
