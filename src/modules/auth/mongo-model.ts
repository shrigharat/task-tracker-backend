import mongoose from 'mongoose'

const _userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
})

const User = mongoose.model('User', _userSchema)

export { User }
