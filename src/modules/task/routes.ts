import { Hono } from 'hono'
import { requireAuthentication } from '../../middleware/require-authentication'
import {
  createTask,
  deleteTaskById,
  getMyTasks,
  getTaskById,
  getTasks,
  updateTaskById,
} from './controller'

const tasksRouter = new Hono<{ Variables: { userId: string } }>()

tasksRouter.use('*', requireAuthentication)
tasksRouter.get('/', getTasks)
tasksRouter.post('/', createTask)
tasksRouter.get('/mine', getMyTasks)
tasksRouter.get('/:id', getTaskById)
tasksRouter.patch('/:id', updateTaskById)
tasksRouter.delete('/:id', deleteTaskById)

export { tasksRouter }
