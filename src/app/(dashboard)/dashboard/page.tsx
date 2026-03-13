import { createClient } from '@/lib/supabase/server';
import { getCurrentOrganization } from '@/lib/auth/get-organization';
import { 
    getDashboardStats, 
    getUpcomingTasks, 
    getOrganizationActivity 
} from '@/features/dashboard/queries';
import { StatsOverview } from '@/features/dashboard/components/stats-overview';
import { UpcomingTasks } from '@/features/dashboard/components/upcoming-tasks';
import { RecentActivityWidget } from '@/features/dashboard/components/recent-activity-widget';
import { DistributionCharts } from '@/features/dashboard/components/distribution-charts';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard - PM Tool MVP',
    description: 'Project and task overview for your organization',
};

export default async function DashboardPage() {
    const supabase = await createClient();
    const context = await getCurrentOrganization(supabase);

    if (!context) return null;

    const [stats, upcomingTasks, activities] = await Promise.all([
        getDashboardStats(supabase, context.organization.id),
        getUpcomingTasks(supabase, context.organization.id),
        getOrganizationActivity(supabase, context.organization.id),
    ]);

    return (
        <div className="space-y-8 pb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome Back!</h1>
                <p className="text-slate-500 mt-1">Here&apos;s an overview of what&apos;s happening across your team.</p>
            </div>

            <StatsOverview stats={stats} />

            <div className="grid gap-8 grid-cols-1 xl:grid-cols-3">
                <div className="xl:col-span-2 space-y-8">
                    <DistributionCharts 
                        statusDistribution={stats.taskStatusDistribution}
                        priorityDistribution={stats.taskPriorityDistribution}
                        totalTasks={stats.totalTasks}
                    />
                    <RecentActivityWidget activities={activities} />
                </div>
                <div className="space-y-8 text-neutral-900 leading-none text-base">
                    <UpcomingTasks tasks={upcomingTasks} />
                    
                    {/* Placeholder for Quick Actions or Team workload */}
                    <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-primary mb-4">Quick Insights</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Project Health</span>
                                <span className="font-bold text-green-600">Stable</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Team Capacity</span>
                                <span className="font-bold">85%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Overdue Tasks</span>
                                <span className="font-bold text-red-500">0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
