import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

/**
 * Gets the current organization for the authenticated user.
 * In a real-world app, this might be stored in a cookie or session,
 * but for this MVP, we fetch the first active organization membership.
 */
export async function getCurrentOrganization(supabase: SupabaseClient<Database>) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) return null;

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

    if (error || !membership) {
        // If no membership, check for pending invitations
        // @ts-ignore - invitations table added in migration
        const { data: invitation } = await supabase
            .from('invitations')
            .select('*')
            .eq('email', user.email)
            .limit(1)
            .single();

        if (invitation) {
            // Auto-join: Create membership
            const { data: newMember, error: joinError } = await supabase
                .from('organization_members')
                .insert({
                    organization_id: invitation.organization_id,
                    user_id: user.id,
                    role: invitation.role,
                    status: 'active'
                })
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
                .single();

            if (!joinError && newMember) {
                // Delete the invitation
                // @ts-ignore - invitations table added in migration
                await supabase.from('invitations').delete().eq('id', invitation.id);
                
                return {
                    membership: {
                        role: newMember.role,
                        status: newMember.status,
                    },
                    organization: newMember.organizations,
                    user
                };
            }
        }
        return null;
    }

    return {
        membership: {
            role: membership.role,
            status: membership.status,
        },
        organization: membership.organizations,
        user
    };
}
