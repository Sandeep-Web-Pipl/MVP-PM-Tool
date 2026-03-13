'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { projectSchema, ProjectFormData } from './schemas';
import { getCurrentOrganization } from '@/lib/auth/get-organization';
import { canCreateProject, canManageProject } from '@/lib/permissions';
import { logActivity } from '@/lib/utils/activity-logger';

export async function createProjectAction(data: ProjectFormData) {
    const supabase = await createClient();
    const context = await getCurrentOrganization(supabase);

    if (!context) return { error: 'Unauthorized' };

    if (!canCreateProject(context.membership.role)) {
        return { error: 'You do not have permission to create projects' };
    }

    const validated = projectSchema.safeParse(data);
    if (!validated.success) return { error: 'Invalid input' };

    const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
            name: validated.data.name,
            description: validated.data.description,
            status: validated.data.status,
            start_date: validated.data.startDate,
            end_date: validated.data.endDate,
            organization_id: context.organization.id,
            created_by: context.user.id,
        })
        .select()
        .single();

    if (projectError) return { error: projectError.message };

    // Add creator as project member
    const { error: memberError } = await supabase
        .from('project_members')
        .insert({
            project_id: project.id,
            user_id: context.user.id,
        });

    if (memberError) {
        console.error('Failed to add creator as project member:', memberError);
    }

    // Log activity
    await logActivity(supabase, {
        organizationId: context.organization.id,
        entityType: 'project',
        entityId: project.id,
        action: 'created',
        actorId: context.user.id,
        metadata: { name: project.name },
    });

    revalidatePath('/projects');
    redirect(`/projects/${project.id}`);
}

export async function updateProjectAction(projectId: string, data: ProjectFormData) {
    const supabase = await createClient();
    const context = await getCurrentOrganization(supabase);

    if (!context) return { error: 'Unauthorized' };

    // Check if user is a project member or has higher role
    const { data: membership } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', context.user.id)
        .single();

    if (!canManageProject(context.membership.role, !!membership)) {
        return { error: 'You do not have permission to manage this project' };
    }

    const validated = projectSchema.safeParse(data);
    if (!validated.success) return { error: 'Invalid input' };

    const { error: updateError } = await supabase
        .from('projects')
        .update({
            name: validated.data.name,
            description: validated.data.description,
            status: validated.data.status,
            start_date: validated.data.startDate,
            end_date: validated.data.endDate,
        })
        .eq('id', projectId);

    if (updateError) return { error: updateError.message };

    // Log activity
    await logActivity(supabase, {
        organizationId: context.organization.id,
        entityType: 'project',
        entityId: projectId,
        action: 'updated',
        actorId: context.user.id,
        metadata: { name: validated.data.name },
    });

    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

export async function deleteProjectAction(projectId: string) {
    const supabase = await createClient();
    const context = await getCurrentOrganization(supabase);

    if (!context) return { error: 'Unauthorized' };

    if (context.membership.role !== 'owner' && context.membership.role !== 'admin') {
        return { error: 'Only owners and admins can delete projects' };
    }

    const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

    if (deleteError) return { error: deleteError.message };

    revalidatePath('/projects');
    redirect('/projects');
}
