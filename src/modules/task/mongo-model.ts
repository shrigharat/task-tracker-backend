import mongoose from 'mongoose'

const _taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  status: { type: String, required: false },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  priority: { type: String, required: false },
  deadline: { type: Date, required: false },
})

const Task = mongoose.model('Task', _taskSchema)

export { Task }
