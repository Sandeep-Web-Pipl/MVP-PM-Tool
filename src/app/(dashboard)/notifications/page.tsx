import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getAllNotifications } from '@/features/notifications/queries';
import { NotificationList } from '@/features/notifications/components/notification-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
    title: 'Notifications | PM Tool',
    description: 'View your recent activity and mentions.',
};

export default async function NotificationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const notifications = await getAllNotifications(supabase, user.id);

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Notifications</h1>
                <p className="text-slate-500 mt-1">
                    Stay up to date with tasks, comments, and project updates.
                </p>
            </div>

            <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<NotificationsSkeleton />}>
                        <NotificationList notifications={notifications} />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}

function NotificationsSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 border rounded-xl animate-pulse">
                    <div className="h-10 w-10 bg-slate-200 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-slate-200 rounded" />
                        <div className="h-3 w-1/2 bg-slate-100 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}
