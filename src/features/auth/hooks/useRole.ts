import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | null

interface UseRoleReturn {
    role: UserRole
    isOwner: boolean
    isAdmin: boolean
    isManager: boolean
    isMember: boolean
    canManageTeam: boolean
    canManageProjects: boolean
    canDeleteTasks: boolean
    canCreateTasks: boolean
    isLoading: boolean
}

export function useRole(organizationId: string | undefined): UseRoleReturn {
    const supabase = createClient()

    const { data: role, isLoading } = useQuery({
        queryKey: ['user-role', organizationId],
        enabled: !!organizationId,
        staleTime: 1000 * 60 * 5, // cache for 5 minutes
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            const { data } = await supabase
                .from('organization_members')
                .select('role')
                .eq('organization_id', organizationId!)
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single()

            return (data?.role as UserRole) ?? null
        }
    })

    const r = role ?? null

    return {
        role: r,
        isLoading,

        // Role checks
        isOwner: r === 'owner',
        isAdmin: r === 'owner' || r === 'admin',
        isManager: r === 'owner' || r === 'admin' || r === 'manager',
        isMember: r !== null,

        // Permission shortcuts — use these in components
        canManageTeam: r === 'owner' || r === 'admin',
        canManageProjects: r === 'owner' || r === 'admin' || r === 'manager',
        canDeleteTasks: r === 'owner' || r === 'admin' || r === 'manager',
        canCreateTasks: r === 'owner' || r === 'admin' || r === 'manager',
    }
}