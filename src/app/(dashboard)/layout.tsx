import { Header } from "@/components/layout/header"
import { Sidebar } from '@/components/layout/sidebar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getCurrentOrganization } from '@/lib/auth/get-organization';
import { getAllNotifications } from '@/features/notifications/queries';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const [context, notifications] = await Promise.all([
        getCurrentOrganization(supabase),
        getAllNotifications(supabase, user.id)
    ]);

    // If no organization found, redirect to onboarding
    if (!context?.organization) {
        redirect('/onboarding');
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[oklch(0.99_0.005_300)]">
            <Sidebar className="hidden lg:flex" organization={context.organization} />
            <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
                <Header
                    user={context.user}
                    organization={context.organization}
                    notifications={notifications}
                />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[oklch(0.99_0.005_300)]">
                    {children}
                </main>
            </div>
        </div>
    );
}
