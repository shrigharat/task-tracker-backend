import z from 'zod'

const getTasksRequestSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
})

const taskStatusEnum = z.enum(['to_be_picked', 'in_progress', 'completed', 'archived', 'cancelled'])
const taskPriorityEnum = z.enum(['low', 'medium', 'high', 'urgent'])

const createTaskRequestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: taskStatusEnum.optional(),
  assignee: z.string().optional(),
  priority: taskPriorityEnum.optional(),
  deadline: z.string().optional(),
})

const updateTaskRequestSchema = createTaskRequestSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one task field must be provided' },
)

export { getTasksRequestSchema, createTaskRequestSchema, updateTaskRequestSchema }
