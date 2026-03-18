import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

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
        .maybeSingle();

    if (error || !membership) {
        // @ts-ignore - invitations table added in migration
        const { data: invitation } = await supabase
            .from('invitations')
            .select('*')
            .eq('email', user.email)
            .limit(1)
            .maybeSingle();

        if (invitation) {
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
                .maybeSingle();

            if (!joinError && newMember) {
                // ✅ FIX: safely extract organization from array or object
                const org = Array.isArray(newMember.organizations)
                    ? newMember.organizations[0]
                    : newMember.organizations;

                if (!org) return null;

                // @ts-ignore - invitations table added in migration
                await supabase.from('invitations').delete().eq('id', invitation.id);

                return {
                    membership: {
                        role: newMember.role,
                        status: newMember.status,
                    },
                    organization: {
                        id: String(org.id),
                        name: String(org.name),
                        slug: String(org.slug),
                    },
                    user
                };
            }
        }
        return null;
    }

    // ✅ FIX: safely extract organization from array or object
    const org = Array.isArray(membership.organizations)
        ? membership.organizations[0]
        : membership.organizations;

    if (!org) return null;

    return {
        membership: {
            role: membership.role,
            status: membership.status,
        },
        organization: {
            id: String(org.id),
            name: String(org.name),
            slug: String(org.slug),
        },
        user
    };
}