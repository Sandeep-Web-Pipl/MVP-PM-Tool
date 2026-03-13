'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createOrganizationSchema, CreateOrganizationFormData, inviteMemberSchema, InviteMemberFormData, updateMemberRoleSchema, UpdateMemberRoleFormData } from './schemas';
import { logActivity } from '@/lib/utils/activity-logger';
import { getMemberByUserId } from './queries';

export async function createOrganizationAction(data: CreateOrganizationFormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const validated = createOrganizationSchema.safeParse(data);
    if (!validated.success) {
        return { error: 'Invalid input' };
    }

    // 1. Create the organization
    const { data: org, error: orgError } = await supabase
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

    // 2. Create the organization membership (Owner)
    const { error: memberError } = await supabase
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const currentMember = await getMemberByUserId(supabase, orgId, user.id);
    if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
        return { error: 'Permission denied' };
    }

    const validated = inviteMemberSchema.safeParse(data);
    if (!validated.success) return { error: 'Invalid input' };

    // Find the user by email using Admin Client
    const adminSupabase = await createAdminClient();
    const { data: { users }, error: searchError } = await adminSupabase.auth.admin.listUsers();

    let profileId: string | undefined;

    if (!searchError && users) {
        const foundUser = users.find(u => u.email === validated.data.email);
        if (foundUser) {
            profileId = foundUser.id;
        }
    }

    if (!profileId) {
        // Fallback to checking profiles table
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', validated.data.email)
            .single();
            
        if (!profile) {
            return { error: 'User not found. They must sign up first in this MVP.' };
        }
        
        profileId = profile.id;
    }

    const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
            organization_id: orgId,
            user_id: profileId,
            role: validated.data.role,
            status: 'active',
        });

    if (memberError) {
        if (memberError.code === '23505') return { error: 'User is already a member' };
        return { error: memberError.message };
    }

    await logActivity(supabase, {
        organizationId: orgId,
        actorId: user.id,
        entityType: 'organization',
        entityId: orgId,
        action: 'member_added',
        metadata: { invited_user_id: profileId, role: validated.data.role },
    });

    revalidatePath('/team');
    return { success: true };
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
