import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

/**
 * Gets the current organization for the authenticated user.
 * In a real-world app, this might be stored in a cookie or session,
 * but for this MVP, we fetch the first active organization membership.
 */
export async function getCurrentOrganization(supabase: SupabaseClient<Database>) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: membership, error } = await supabase
        .from('organization_members')
        .select(`
      organization_id,
      role,
      status,
      organizations (
        id,
        name,
        slug
      )
    `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .single();

    if (error || !membership) return null;

    return {
        membership: {
            role: membership.role,
            status: membership.status,
        },
        organization: membership.organizations,
        user
    };
}
