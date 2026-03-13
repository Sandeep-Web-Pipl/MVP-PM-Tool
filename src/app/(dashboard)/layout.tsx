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
    const context = await getCurrentOrganization(supabase);

    // If no organization found, redirect to onboarding
    if (!context?.organization) {
        redirect('/onboarding');
    }

    const notifications = await getAllNotifications(supabase, context.user.id);

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            <Sidebar className="hidden lg:flex" organization={context.organization} />
            <div className="flex flex-1 flex-col">
                <Header
                    user={context.user}
                    organization={context.organization}
                    notifications={notifications}
                />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
