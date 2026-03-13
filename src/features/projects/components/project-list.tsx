'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CalendarIcon, UsersIcon } from 'lucide-react';
import { format } from 'date-fns';

import { ProjectWithMemberCount } from '@/types/features';

interface ProjectListProps {
    projects: ProjectWithMemberCount[];
}

export function ProjectList({ projects }: ProjectListProps) {
    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-medium">No projects found</h3>
                <p className="text-sm text-muted-foreground">Get started by creating your first project.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                    <Card className="h-full hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
                                <ProjectStatusBadge status={project.status} />
                            </div>
                            <CardDescription className="line-clamp-2 h-10">
                                {project.description || 'No description provided.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="size-4" />
                                    <span>
                                        {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : 'No start date'}
                                        {' - '}
                                        {project.end_date ? format(new Date(project.end_date), 'MMM d, yyyy') : 'No end date'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <UsersIcon className="size-4" />
                                    <span>{project.project_members?.length || 0} members</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}

function ProjectStatusBadge({ status }: { status: string }) {
    const variants: Record<string, string> = {
        planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };

    return (
        <Badge variant="outline" className={cn('capitalize border-none', variants[status])}>
            {status.replace('_', ' ')}
        </Badge>
    );
}
