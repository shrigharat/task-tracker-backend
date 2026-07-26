import { Hono } from 'hono'
import { requireAuthentication } from '../../middleware/require-authentication'
import { createTask, deleteTaskById, getMyTasks, getTaskById, getTasks } from './controller'

const tasksRouter = new Hono<{ Variables: { userId: string } }>()

tasksRouter.use('*', requireAuthentication)
tasksRouter.get('/', getTasks)
tasksRouter.post('/', createTask)
tasksRouter.get('/mine', getMyTasks)
tasksRouter.get('/:id', getTaskById)
tasksRouter.delete('/:id', deleteTaskById)

export { tasksRouter }
