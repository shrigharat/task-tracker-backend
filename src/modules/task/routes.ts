import { Hono } from 'hono'
import { createTaskRequestSchema, getTasksRequestSchema } from './request-schema'
import { Task } from './mongo-model'

const tasksRouter = new Hono()

tasksRouter.get('/', async (c) => {
  try {
    const parsedQuery = getTasksRequestSchema.safeParse(c.req.query())
    if (!parsedQuery.success) {
      return c.json({ error: parsedQuery.error.message }, 400)
    }
    const { page, limit } = parsedQuery.data
    const tasks = await Task.find({})
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
    const totalTasks = await Task.countDocuments()
    return c.json({ data: tasks, meta: { total: totalTasks }, success: true })
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

tasksRouter.post('/', async (c) => {
  try {
    const requestBody = await c.req.json()
    const parsedBody = createTaskRequestSchema.safeParse(requestBody)
    if (!parsedBody.success) {
      return c.json({ error: parsedBody.error.message }, 400)
    }
    const { title, description, status, assignee, priority, createdBy } = parsedBody.data
    const task = await Task.create({ title, description, status, assignee, priority, createdBy })
    return c.json({ data: task, success: true, message: 'Task created successfully' }, 201)
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

export { tasksRouter }
