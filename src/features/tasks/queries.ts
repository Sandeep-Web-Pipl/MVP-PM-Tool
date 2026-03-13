import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export async function getTasksByProject(supabase: SupabaseClient<Database>, projectId: string) {
    const { data, error } = await supabase
        .from('tasks')
        .select(`
      *,
      assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url),
      reporter:profiles!tasks_reporter_id_fkey(id, full_name, avatar_url)
    `)
        .eq('project_id', projectId)
        .order('position', { ascending: true });

    if (error) throw error;
    return data;
}

export async function getTaskById(supabase: SupabaseClient<Database>, taskId: string) {
    const { data, error } = await supabase
        .from('tasks')
        .select(`
      *,
      assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url),
      reporter:profiles!tasks_reporter_id_fkey(id, full_name, avatar_url),
      project:projects(id, name, organization_id)
    `)
        .eq('id', taskId)
        .single();

    if (error) throw error;
    return data;
}
