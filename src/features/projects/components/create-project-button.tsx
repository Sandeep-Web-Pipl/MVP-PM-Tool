'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRole } from '@/features/auth/hooks/useRole'

interface CreateProjectButtonProps {
    organizationId: string
}

export function CreateProjectButton({ organizationId }: CreateProjectButtonProps) {
    const { canManageProjects, isLoading } = useRole(organizationId)

    if (isLoading) return null
    if (!canManageProjects) return null

    return (
        <Link href="/projects/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                <Plus className="mr-2 h-4 w-4" />
                New Project
            </Button>
        </Link>
    )
}