'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRole } from '@/features/auth/hooks/useRole'
import { CreateProjectButton } from '@/features/projects/components/create-project-button';

interface CreateProjectButtonProps {
    organizationId: string
}

export function CreateProjectButton({ organizationId }: CreateProjectButtonProps) {
    const { canManageProjects, isLoading } = useRole(organizationId)

    if (isLoading) return null
    if (!canManageProjects) return null

    return (
        <CreateProjectButton organizationId={context.organization.id} />
    )
}
