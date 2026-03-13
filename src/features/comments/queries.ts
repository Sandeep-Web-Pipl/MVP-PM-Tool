import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export async function getTaskComments(supabase: SupabaseClient<Database>, taskId: string) {
    const { data, error } = await supabase
        .from('task_comments')
        .select(`
      *,
      user:profiles(id, full_name, avatar_url)
    `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
}
