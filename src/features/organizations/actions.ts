'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createOrganizationSchema, CreateOrganizationFormData, inviteMemberSchema, InviteMemberFormData, updateMemberRoleSchema, UpdateMemberRoleFormData } from './schemas';
import { logActivity } from '@/lib/utils/activity-logger';
import { createNotification } from '@/lib/utils/notifications';
import { sendInvitationEmail } from '@/lib/utils/email';
import { getMemberByUserId } from './queries';

export async function createOrganizationAction(data: CreateOrganizationFormData) {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const validated = createOrganizationSchema.safeParse(data);
    if (!validated.success) {
        return { error: 'Invalid input' };
    }

    // 1. Create the organization (using admin to bypass RLS during creation)
    const { data: org, error: orgError } = await adminSupabase
        .from('organizations')
        .insert({
            name: validated.data.name,
            slug: validated.data.slug,
        })
        .select()
        .single();

    if (orgError) {
        if (orgError.code === '23505') {
            return { error: 'An organization with this slug already exists' };
        }
        return { error: orgError.message };
    }

    // 2. Create the organization membership (Owner) (using admin to bypass RLS)
    const { error: memberError } = await adminSupabase
        .from('organization_members')
        .insert({
            organization_id: org.id,
            user_id: user.id,
            role: 'owner',
            status: 'active',
        });

    if (memberError) {
        return { error: memberError.message };
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard');
}

export async function inviteMemberAction(orgId: string, data: InviteMemberFormData) {
    console.log('>>> inviteMemberAction CALLED', { orgId, data });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const currentMember = await getMemberByUserId(supabase, orgId, user.id);
    if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
        return { error: 'Permission denied' };
    }

    const validated = inviteMemberSchema.safeParse(data);
    if (!validated.success) return { error: 'Invalid input' };

    const email = validated.data.email.toLowerCase();

    // 1. Check if user already exists in profiles
    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
        
    if (profile) {
        // User exists, add directly to organization_members
        const { error: memberError } = await supabase
            .from('organization_members')
            .insert({
                organization_id: orgId,
                user_id: profile.id,
                role: validated.data.role,
                status: 'active',
            });

        if (memberError) {
            if (memberError.code === '23505') return { error: 'User is already a member' };
            return { error: memberError.message };
        }

        // Fetch organization name for the notification
        const { data: org } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', orgId)
            .single();

        await createNotification(supabase, {
            organizationId: orgId,
            userId: profile.id,
            type: 'team_invite',
            title: 'You were added to a team',
            body: `You have been added to ${org?.name || 'an organization'} as a ${validated.data.role}.`,
            entityType: 'organization',
            entityId: orgId,
        });

        // Send confirmation email
        await sendInvitationEmail(email, org?.name || 'an organization', validated.data.role);

        await logActivity(supabase, {
            organizationId: orgId,
            actorId: user.id,
            entityType: 'organization',
            entityId: orgId,
            action: 'member_added',
            metadata: { invited_user_id: profile.id, email, role: validated.data.role },
        });

        revalidatePath('/team');
        return { success: true, message: 'Member added successfully' };
    }

    // 2. User does not exist, create or update a pending invitation (allow "resending")
    // Note: We use delete then insert instead of upsert to avoid missing UPDATE RLS policy issues
    console.log('>>> DELETING EXISTING INVITE FOR', email);
    const deleteRes = await supabase
        .from('invitations')
        .delete()
        .eq('organization_id', orgId)
        .eq('email', email);
    
    console.log('>>> DELETE RESULT', deleteRes);

    const { error: inviteError } = await supabase
        .from('invitations')
        .insert({
            organization_id: orgId,
            inviter_id: user.id,
            email: email,
            role: validated.data.role,
        });

    if (inviteError) {
        console.error('>>> INVITE ERROR', inviteError);
        return { error: inviteError.message };
    }

    // Fetch organization name for the email
    const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', orgId)
        .single();

    // Send invitation email
    await sendInvitationEmail(email, org?.name || 'an organization', validated.data.role);

    await logActivity(supabase, {
        organizationId: orgId,
        actorId: user.id,
        entityType: 'organization',
        entityId: orgId,
        action: 'member_invited',
        metadata: { email, role: validated.data.role },
    });

    revalidatePath('/team');
    return { success: true, message: `Invitation sent to ${email}. they will join once they sign up.` };
}

export async function updateMemberRoleAction(orgId: string, data: UpdateMemberRoleFormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const currentMember = await getMemberByUserId(supabase, orgId, user.id);
    if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
        return { error: 'Permission denied' };
    }

    const validated = updateMemberRoleSchema.safeParse(data);
    if (!validated.success) return { error: 'Invalid input' };

    const { error } = await supabase
        .from('organization_members')
        .update({ role: validated.data.role })
        .eq('id', validated.data.memberId)
        .eq('organization_id', orgId);

    if (error) return { error: error.message };

    revalidatePath('/team');
    return { success: true };
}

export async function removeMemberAction(orgId: string, memberId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const currentMember = await getMemberByUserId(supabase, orgId, user.id);
    if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
        return { error: 'Permission denied' };
    }

    const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId)
        .eq('organization_id', orgId);

    if (error) return { error: error.message };

    revalidatePath('/team');
    return { success: true };
}

export async function updateOrganizationAction(orgId: string, data: { name: string, slug: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const currentMember = await getMemberByUserId(supabase, orgId, user.id);
    if (!currentMember || currentMember.role !== 'owner') {
        return { error: 'Only the owner can update organization settings' };
    }

    const { error } = await supabase
        .from('organizations')
        .update({
            name: data.name,
            slug: data.slug,
        })
        .eq('id', orgId);

    if (error) {
        if (error.code === '23505') return { error: 'Slug already in use' };
        return { error: error.message };
    }

    await logActivity(supabase, {
        organizationId: orgId,
        actorId: user.id,
        entityType: 'organization',
        entityId: orgId,
        action: 'updated',
        metadata: { name: data.name, slug: data.slug },
    });

    revalidatePath('/settings');
    return { success: true };
}
