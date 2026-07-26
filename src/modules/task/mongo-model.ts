import { Schema, model } from 'mongoose'

const _taskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    status: { type: String, required: false },
    assignee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    priority: { type: String, required: false },
    deadline: { type: Date, required: false },
  },
  {
    timestamps: true,
  },
)

const Task = model('Task', _taskSchema)

export { Task }
