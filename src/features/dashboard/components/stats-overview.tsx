'use client';

import { 
    BriefcaseIcon, 
    CheckCircleIcon, 
    ClockIcon, 
    AlertTriangleIcon 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsOverviewProps {
    stats: {
        totalProjects: number;
        activeProjects: number;
        totalTasks: number;
        completedTasks: number;
        openTasks: number;
        urgentTasks: number;
    };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
    const cards = [
        {
            title: 'Active Projects',
            value: stats.activeProjects,
            subtitle: `of ${stats.totalProjects} total`,
            icon: BriefcaseIcon,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            title: 'Open Tasks',
            value: stats.openTasks,
            subtitle: `${stats.completedTasks} completed`,
            icon: ClockIcon,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
        },
        {
            title: 'Urgent Tasks',
            value: stats.urgentTasks,
            subtitle: 'Requires attention',
            icon: AlertTriangleIcon,
            color: 'text-red-600',
            bg: 'bg-red-50',
        },
        {
            title: 'Completion Rate',
            value: stats.totalTasks > 0 ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%` : '0%',
            subtitle: 'Overall progress',
            icon: CheckCircleIcon,
            color: 'text-green-600',
            bg: 'bg-green-50',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                        <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                            <card.icon className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {card.subtitle}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
