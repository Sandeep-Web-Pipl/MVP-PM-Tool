'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getCurrentOrganization } from '@/lib/auth/get-organization';

export async function uploadAttachmentAction(
    taskId: string,
    projectId: string,
    formData: FormData
) {
    const supabase = await createClient();
    const context = await getCurrentOrganization(supabase);

    if (!context) return { error: 'Unauthorized' };

    const file = formData.get('file') as File;
    if (!file) return { error: 'No file provided' };

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${context.organization.id}/${taskId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file);

    if (uploadError) return { error: uploadError.message };

    const { data: attachment, error: dbError } = await supabase
        .from('task_attachments')
        .insert({
            task_id: taskId,
            user_id: context.user.id,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            storage_path: filePath,
        })
        .select()
        .single();

    if (dbError) return { error: dbError.message };

    revalidatePath(`/projects/${projectId}`);
    return { success: true, attachment };
}

export async function deleteAttachmentAction(
    attachmentId: string,
    storagePath: string,
    projectId: string
) {
    const supabase = await createClient();
    const context = await getCurrentOrganization(supabase);

    if (!context) return { error: 'Unauthorized' };

    // Delete from storage
    await supabase.storage
        .from('task-attachments')
        .remove([storagePath]);

    // Delete from DB
    const { error: dbError } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachmentId);

    if (dbError) return { error: dbError.message };

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}
