import { CreateOrganizationForm } from '@/features/organizations/components/create-organization-form';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getCurrentOrganization } from '@/lib/auth/get-organization';

export default async function OnboardingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // If user already has an org, redirect to dashboard
    const context = await getCurrentOrganization(supabase);
    if (context?.organization) {
        redirect('/dashboard');
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <CreateOrganizationForm />
        </div>
    );
}
