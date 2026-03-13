import * as z from 'zod';

export const taskSchema = z.object({
    title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
    description: z.string().optional().nullable(),
    status: z.enum(['todo', 'in_progress', 'review', 'done']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    assigneeId: z.string().uuid().optional().nullable(),
    dueDate: z.string().optional().nullable(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
