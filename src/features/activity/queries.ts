import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export async function getProjectActivity(supabase: SupabaseClient<Database>, projectId: string) {
    const { data, error } = await supabase
        .from('activity_logs')
        .select(`
      *,
      actor:profiles(id, full_name, avatar_url)
    `)
        .or(`metadata->>projectId.eq.${projectId}`)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) throw error;
    return data;
}

export async function getTaskActivity(supabase: SupabaseClient<Database>, taskId: string) {
    const { data, error } = await supabase
        .from('activity_logs')
        .select(`
      *,
      actor:profiles(id, full_name, avatar_url)
    `)
        .eq('entity_id', taskId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}
