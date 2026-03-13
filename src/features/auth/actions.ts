'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { LoginFormData, SignUpFormData } from './schemas';
import { getCurrentOrganization } from '@/lib/auth/get-organization';
import { logActivity } from '@/lib/utils/activity-logger';

export async function loginAction(data: LoginFormData) {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard');
}

export async function signUpAction(data: SignUpFormData) {
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: {
                full_name: data.fullName,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/onboarding');
}

export async function forgotPasswordAction(email: string) {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/settings`,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}

export async function signOutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/login');
}

export async function updateProfileAction(data: { fullName: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase.auth.updateUser({
        data: { full_name: data.fullName }
    });

    if (error) return { error: error.message };

    // Also update the profiles table
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: data.fullName })
        .eq('id', user.id);

    if (profileError) return { error: profileError.message };

    const context = await getCurrentOrganization(supabase);
    if (context) {
        await logActivity(supabase, {
            organizationId: context.organization.id,
            actorId: user.id,
            entityType: 'profile',
            entityId: user.id,
            action: 'updated',
            metadata: { full_name: data.fullName },
        });
    }

    revalidatePath('/settings');
    return { success: true };
}
