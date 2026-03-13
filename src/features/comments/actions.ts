'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { commentSchema, CommentFormData } from './schemas';
import { getCurrentOrganization } from '@/lib/auth/get-organization';
import { logActivity } from '@/lib/utils/activity-logger';

export async function addCommentAction(taskId: string, projectId: string, data: CommentFormData) {
    const supabase = await createClient();
    const context = await getCurrentOrganization(supabase);

    if (!context) return { error: 'Unauthorized' };

    const validated = commentSchema.safeParse(data);
    if (!validated.success) return { error: 'Invalid input' };

    const { data: comment, error: commentError } = await supabase
        .from('task_comments')
        .insert({
            task_id: taskId,
            user_id: context.user.id,
            content: validated.data.content,
        })
        .select()
        .single();

    if (commentError) return { error: commentError.message };

    // Log activity
    await logActivity(supabase, {
        organizationId: context.organization.id,
        entityType: 'task',
        entityId: taskId,
        action: 'commented',
        actorId: context.user.id,
        metadata: { contentExcerpt: validated.data.content.substring(0, 50), projectId },
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/kanban`);
    return { success: true, comment };
}

export async function deleteCommentAction(commentId: string, taskId: string, projectId: string) {
    const supabase = await createClient();
    const context = await getCurrentOrganization(supabase);

    if (!context) return { error: 'Unauthorized' };

    const { error: deleteError } = await supabase
        .from('task_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', context.user.id); // Only allow deleting own comments

    if (deleteError) return { error: deleteError.message };

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/kanban`);
    return { success: true };
}
