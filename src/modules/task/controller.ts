import type { Handler } from 'hono'
import { isValidObjectId } from 'mongoose'
import { TaskNotFoundError } from './errors'
import { Task } from './mongo-model'
import {
  createTaskRequestSchema,
  getTasksRequestSchema,
  updateTaskRequestSchema,
} from './request-schema'

type TaskEnvironment = {
  Variables: {
    userId: string
  }
}

const getTasksWithFilter = async (
  context: Parameters<Handler<TaskEnvironment>>[0],
  filter = {},
) => {
  try {
    const parsedQuery = getTasksRequestSchema.safeParse(context.req.query())
    if (!parsedQuery.success) {
      return context.json({ error: parsedQuery.error.message }, 400)
    }
    const { page, limit } = parsedQuery.data
    const tasks = await Task.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
    const totalTasks = await Task.countDocuments(filter)
    return context.json({ data: tasks, meta: { total: totalTasks }, success: true })
  } catch (error) {
    return context.json({ error: (error as Error).message }, 500)
  }
}

const getTasks: Handler<TaskEnvironment> = (context) => getTasksWithFilter(context)

const getMyTasks: Handler<TaskEnvironment> = (context) =>
  getTasksWithFilter(context, { assignee: context.var.userId })

const createTask: Handler<TaskEnvironment> = async (context) => {
  try {
    const requestBody = await context.req.json()
    const parsedBody = createTaskRequestSchema.safeParse(requestBody)
    if (!parsedBody.success) {
      return context.json({ error: parsedBody.error.message }, 400)
    }
    const { title, description, status, assignee, priority } = parsedBody.data
    const task = await Task.create({
      title,
      description,
      status,
      assignee,
      priority,
      createdBy: context.var.userId,
    })
    return context.json({ data: task, success: true, message: 'Task created successfully' }, 201)
  } catch (error) {
    return context.json({ error: (error as Error).message }, 500)
  }
}

const getTaskById: Handler<TaskEnvironment> = async (context) => {
  const { id } = context.req.param()

  if (!isValidObjectId(id)) {
    return context.json({ error: 'Invalid task ID', success: false }, 400)
  }

  try {
    const task = await Task.findById(id)

    if (!task) {
      throw new TaskNotFoundError()
    }

    return context.json({ data: task, success: true })
  } catch (error) {
    if (error instanceof TaskNotFoundError) {
      return context.json({ error: error.message, success: false }, 404)
    }
    return context.json({ error: (error as Error).message }, 500)
  }
}

const updateTaskById: Handler<TaskEnvironment> = async (context) => {
  const { id } = context.req.param()

  if (!isValidObjectId(id)) {
    return context.json({ error: 'Invalid task ID', success: false }, 400)
  }

  try {
    const requestBody = await context.req.json()
    const parsedBody = updateTaskRequestSchema.safeParse(requestBody)
    if (!parsedBody.success) {
      return context.json({ error: parsedBody.error.message }, 400)
    }

    const task = await Task.findByIdAndUpdate(id, parsedBody.data, {
      new: true,
      runValidators: true,
    })

    if (!task) {
      throw new TaskNotFoundError()
    }

    return context.json({ data: task, success: true, message: 'Task updated successfully' })
  } catch (error) {
    if (error instanceof TaskNotFoundError) {
      return context.json({ error: error.message, success: false }, 404)
    }
    return context.json({ error: (error as Error).message }, 500)
  }
}

const deleteTaskById: Handler<TaskEnvironment> = async (context) => {
  const { id } = context.req.param()

  if (!isValidObjectId(id)) {
    return context.json({ error: 'Invalid task ID', success: false }, 400)
  }

  try {
    const task = await Task.findByIdAndDelete(id)

    if (!task) {
      throw new TaskNotFoundError()
    }

    return context.json({ data: task, success: true, message: 'Task deleted successfully' })
  } catch (error) {
    if (error instanceof TaskNotFoundError) {
      return context.json({ error: error.message, success: false }, 404)
    }
    return context.json({ error: (error as Error).message }, 500)
  }
}

export { createTask, deleteTaskById, getMyTasks, getTaskById, getTasks, updateTaskById }
