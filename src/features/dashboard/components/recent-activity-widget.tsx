'use client';

import { ActivityTimeline } from '@/features/activity/components/activity-timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { ActivityWithActor } from '@/types/features';

interface RecentActivityWidgetProps {
    activities: ActivityWithActor[];
}

export function RecentActivityWidget({ activities }: RecentActivityWidgetProps) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <ActivityTimeline activities={activities} />
            </CardContent>
        </Card>
    );
}
