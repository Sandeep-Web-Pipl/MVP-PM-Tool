import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export async function getOrganizationMembers(supabase: SupabaseClient<Database>, organizationId: string) {
    const { data, error } = await supabase
        .from('organization_members')
        .select(`
            *,
            profiles(id, full_name, avatar_url)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
}

export async function getMemberByUserId(supabase: SupabaseClient<Database>, organizationId: string, userId: string) {
    const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

export async function getPendingInvitations(supabase: SupabaseClient<Database>, email: string) {
    const { data, error } = await supabase
        // @ts-ignore - invitations table added in migration
        .from('invitations')
        .select('*')
        .eq('email', email.toLowerCase());

    if (error) throw error;
    return data;
}
