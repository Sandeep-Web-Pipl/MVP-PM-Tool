import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export async function getDashboardStats(supabase: SupabaseClient<Database>, organizationId: string) {
    const { data: projects } = await supabase
        .from('projects')
        .select('id, status')
        .eq('organization_id', organizationId);

    const { data: tasks } = await supabase
        .from('tasks')
        .select('id, status, priority, due_date')
        .eq('organization_id', organizationId);

    const totalProjects = projects?.length || 0;
    const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
    
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
    const openTasks = totalTasks - completedTasks;
    
    const urgentTasks = tasks?.filter(t => t.priority === 'urgent' && t.status !== 'done').length || 0;
    
    return {
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
        openTasks,
        urgentTasks,
        taskStatusDistribution: {
            todo: tasks?.filter(t => t.status === 'todo').length || 0,
            in_progress: tasks?.filter(t => t.status === 'in_progress').length || 0,
            review: tasks?.filter(t => t.status === 'review').length || 0,
            done: tasks?.filter(t => t.status === 'done').length || 0,
        },
        taskPriorityDistribution: {
            low: tasks?.filter(t => t.priority === 'low').length || 0,
            medium: tasks?.filter(t => t.priority === 'medium').length || 0,
            high: tasks?.filter(t => t.priority === 'high').length || 0,
            urgent: tasks?.filter(t => t.priority === 'urgent').length || 0,
        }
    };
}

export async function getUpcomingTasks(supabase: SupabaseClient<Database>, organizationId: string) {
    const { data, error } = await supabase
        .from('tasks')
        .select(`
            *,
            project:projects(name)
        `)
        .eq('organization_id', organizationId)
        .neq('status', 'done')
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true })
        .limit(5);

    if (error) throw error;
    return data;
}

export async function getOrganizationActivity(supabase: SupabaseClient<Database>, organizationId: string) {
    const { data, error } = await supabase
        .from('activity_logs')
        .select(`
            *,
            actor:profiles(id, full_name, avatar_url)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) throw error;
    return data;
}
