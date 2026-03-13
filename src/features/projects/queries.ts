import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export async function getProjects(supabase: SupabaseClient<Database>, organizationId: string) {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getProjectById(supabase: SupabaseClient<Database>, projectId: string) {
    const { data, error } = await supabase
        .from('projects')
        .select(`
      *,
      project_members (
        id,
        user_id,
        profiles (
          id,
          full_name,
          avatar_url
        )
      )
    `)
        .eq('id', projectId)
        .single();

    if (error) throw error;
    return data;
}

export async function getProjectMembers(supabase: SupabaseClient<Database>, projectId: string) {
    const { data, error } = await supabase
        .from('project_members')
        .select(`
      id,
      user_id,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `)
        .eq('project_id', projectId);

    if (error) throw error;
    return data;
}
