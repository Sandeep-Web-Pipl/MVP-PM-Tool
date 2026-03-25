import { createClient } from '@/lib/supabase/server';
import { getProjects } from '@/features/projects/queries';
import { getCurrentOrganization } from '@/lib/auth/get-organization';
import { Badge } from '@/components/ui/badge';
import { Calendar, FolderKanban } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { EmptyState } from '@/components/shared/empty-state';
import { CreateProjectButton } from '@/features/projects/components/create-project-button';

export default async function ProjectsPage() {
    const supabase = await createClient();
    const context = await getCurrentOrganization(supabase);

    if (!context) return null;

    const projects = await getProjects(supabase, context.organization.id);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Projects</h1>
                    <p className="text-slate-500 mt-1">
                        Manage and track your organization&apos;s projects.
                    </p>
                </div>

                {/* Role-aware button — only shows for owner/admin/manager */}
                <CreateProjectButton organizationId={context.organization.id} />
            </div>

            {projects.length === 0 ? (
                <EmptyState
                    title="No projects found"
                    description="Get started by creating your first project for the team."
                    icon={<FolderKanban className="h-8 w-8 text-slate-400" />}
                    actionLabel="Create Project"
                    actionHref="/projects/new"
                />
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="group block rounded-lg border bg-card p-6 transition-all hover:shadow-[0_4px_20px_rgba(196,67,183,0.4)]"
                        >
                            <div className="flex items-start justify-between">
                                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                                    {project.status.toUpperCase()}
                                </Badge>
                            </div>
                            <h3 className="mt-4 text-xl font-bold group-hover:text-primary">
                                {project.name}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                {project.description || 'No description provided.'}
                            </p>
                            <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : 'No date'}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}