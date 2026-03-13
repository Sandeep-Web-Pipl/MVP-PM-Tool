'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { taskSchema, TaskFormData } from './schemas';
import { getCurrentOrganization } from '@/lib/auth/get-organization';
import { logActivity } from '@/lib/utils/activity-logger';

export async function createTaskAction(projectId: string, data: TaskFormData) {
    const supabase = await createClient();
    const context = await getCurrentOrganization(supabase);

    if (!context) return { error: 'Unauthorized' };

    const validated = taskSchema.safeParse(data);
    if (!validated.success) return { error: 'Invalid input' };

    // Get max position for initial positioning
    const { data: maxPosData } = await supabase
        .from('tasks')
        .select('position')
        .eq('project_id', projectId)
        .order('position', { ascending: false })
        .limit(1);

    const newPosition = (maxPosData?.[0]?.position ?? 0) + 1000;

    const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
            project_id: projectId,
            organization_id: context.organization.id,
            title: validated.data.title,
            description: validated.data.description,
            status: validated.data.status,
            priority: validated.data.priority,
            assignee_id: validated.data.assigneeId,
            reporter_id: context.user.id,
            position: newPosition,
            due_date: validated.data.dueDate,
        })
        .select()
        .single();

    if (taskError) return { error: taskError.message };

    // Log activity
    await logActivity(supabase, {
        organizationId: context.organization.id,
        entityType: 'task',
        entityId: task.id,
        action: 'created',
        actorId: context.user.id,
        metadata: { title: task.title, projectId },
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, task };
}

export async function updateTaskAction(taskId: string, projectId: string, data: Partial<TaskFormData>) {
    const supabase = await createClient();
    const context = await getCurrentOrganization(supabase);

    if (!context) return { error: 'Unauthorized' };

    const { data: task, error: updateError } = await supabase
        .from('tasks')
        .update({
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            assignee_id: data.assigneeId,
            due_date: data.dueDate,
        })
        .eq('id', taskId)
        .select()
        .single();

    if (updateError) return { error: updateError.message };

    // Log activity
    await logActivity(supabase, {
        organizationId: context.organization.id,
        entityType: 'task',
        entityId: taskId,
        action: 'updated',
        actorId: context.user.id,
        metadata: { title: task.title, projectId },
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

export async function deleteTaskAction(taskId: string, projectId: string) {
    const supabase = await createClient();
    const context = await getCurrentOrganization(supabase);

    if (!context) return { error: 'Unauthorized' };

    const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

    if (deleteError) return { error: deleteError.message };

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

export async function updateTaskPositionAction(
    taskId: string,
    projectId: string,
    newStatus: 'todo' | 'in_progress' | 'review' | 'done',
    newPosition: number
) {
    const supabase = await createClient();
    const context = await getCurrentOrganization(supabase);

    if (!context) return { error: 'Unauthorized' };

    const { data: task, error: updateError } = await supabase
        .from('tasks')
        .update({
            status: newStatus,
            position: newPosition,
        })
        .eq('id', taskId)
        .select()
        .single();

    if (updateError) return { error: updateError.message };

    // Log activity
    await logActivity(supabase, {
        organizationId: context.organization.id,
        entityType: 'task',
        entityId: taskId,
        action: 'moved',
        actorId: context.user.id,
        metadata: { title: task.title, status: newStatus, projectId },
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/kanban`);
    return { success: true };
}
