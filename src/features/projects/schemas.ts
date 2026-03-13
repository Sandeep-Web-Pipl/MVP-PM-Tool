import * as z from 'zod';

export const projectSchema = z.object({
    name: z.string().min(2, { message: 'Project name must be at least 2 characters' }),
    description: z.string().optional(),
    status: z.enum(['planning', 'active', 'completed', 'on_hold', 'archived']),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
