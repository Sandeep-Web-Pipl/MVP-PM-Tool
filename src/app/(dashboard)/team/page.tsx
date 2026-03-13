import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentOrganization } from '@/lib/auth/get-organization';
import { getOrganizationMembers, getMemberByUserId } from '@/features/organizations/queries';
import { MemberList } from '@/features/organizations/components/member-list';
import { InviteMemberDialog } from '@/features/organizations/components/invite-member-dialog';

export const metadata = {
    title: 'Team Management | PM Tool',
    description: 'Manage your organization team members and roles.',
};

export default async function TeamPage() {
    const supabase = await createClient();
    const context = await getCurrentOrganization(supabase);

    if (!context?.organization) {
        return null; // Should be handled by middleware, but safe fallback
    }

    const members = await getOrganizationMembers(supabase, context.organization.id);
    const currentMember = await getMemberByUserId(supabase, context.organization.id, context.user.id);

    const canInvite = currentMember?.role === 'owner' || currentMember?.role === 'admin';

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Team Management</h1>
                    <p className="text-slate-500 mt-1">
                        View and manage members of <span className="font-semibold text-indigo-600">{context.organization.name}</span>
                    </p>
                </div>
                {canInvite && (
                    <InviteMemberDialog organizationId={context.organization.id} />
                )}
            </div>

            <Suspense fallback={<TeamSkeleton />}>
                <MemberList 
                    organizationId={context.organization.id}
                    members={members} 
                    currentUserId={context.user.id}
                    currentUserRole={currentMember?.role || 'member'}
                />
            </Suspense>
        </div>
    );
}

function TeamSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-xl animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-slate-200 rounded-full" />
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-slate-200 rounded" />
                            <div className="h-3 w-20 bg-slate-100 rounded" />
                        </div>
                    </div>
                    <div className="h-8 w-20 bg-slate-100 rounded" />
                </div>
            ))}
        </div>
    );
}
