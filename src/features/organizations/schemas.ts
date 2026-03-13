import * as z from 'zod';

export const createOrganizationSchema = z.object({
    name: z.string().min(2, { message: 'Organization name must be at least 2 characters' }),
    slug: z.string()
        .min(2, { message: 'Slug must be at least 2 characters' })
        .regex(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens' }),
});

export const inviteMemberSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    role: z.enum(['owner', 'admin', 'manager', 'member'], { message: 'Invalid role' }),
});

export const updateMemberRoleSchema = z.object({
    memberId: z.string().uuid(),
    role: z.enum(['owner', 'admin', 'manager', 'member'], { message: 'Invalid role' }),
});

export const updateOrganizationSchema = createOrganizationSchema;

export type CreateOrganizationFormData = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationFormData = z.infer<typeof updateOrganizationSchema>;
export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleFormData = z.infer<typeof updateMemberRoleSchema>;
