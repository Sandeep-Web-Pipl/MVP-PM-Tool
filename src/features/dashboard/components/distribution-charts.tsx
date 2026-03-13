'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DistributionChartsProps {
    statusDistribution: Record<string, number>;
    priorityDistribution: Record<string, number>;
    totalTasks: number;
}

export function DistributionCharts({ statusDistribution, priorityDistribution, totalTasks }: DistributionChartsProps) {
    const statusMap = [
        { label: 'To Do', value: statusDistribution.todo, color: 'bg-neutral-400' },
        { label: 'In Progress', value: statusDistribution.in_progress, color: 'bg-blue-500' },
        { label: 'Review', value: statusDistribution.review, color: 'bg-purple-500' },
        { label: 'Done', value: statusDistribution.done, color: 'bg-green-500' },
    ];

    const priorityMap = [
        { label: 'Low', value: priorityDistribution.low, color: 'bg-gray-400' },
        { label: 'Medium', value: priorityDistribution.medium, color: 'bg-blue-400' },
        { label: 'High', value: priorityDistribution.high, color: 'bg-orange-400' },
        { label: 'Urgent', value: priorityDistribution.urgent, color: 'bg-red-500' },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Tasks by Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {statusMap.map((item) => {
                        const percentage = totalTasks > 0 ? (item.value / totalTasks) * 100 : 0;
                        return (
                            <div key={item.label} className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-neutral-700">{item.label}</span>
                                    <span className="text-muted-foreground">{item.value} ({Math.round(percentage)}%)</span>
                                </div>
                                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${item.color} transition-all duration-500`} 
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Tasks by Priority</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {priorityMap.map((item) => {
                        const percentage = totalTasks > 0 ? (item.value / totalTasks) * 100 : 0;
                        return (
                            <div key={item.label} className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-neutral-700">{item.label}</span>
                                    <span className="text-muted-foreground">{item.value} ({Math.round(percentage)}%)</span>
                                </div>
                                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${item.color} transition-all duration-500`} 
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
