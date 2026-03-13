'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, Users, Bell, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Team', href: '/team', icon: Users },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
    className?: string;
    organization: {
        id: string;
        name: string;
        slug: string;
    };
}

export function Sidebar({ className, organization }: SidebarProps) {
    const pathname = usePathname()

    return (
        <div className={cn("flex flex-col w-64 h-full border-r bg-white text-sm", className)}>
            <div className="p-4 border-b font-semibold text-lg flex items-center overflow-hidden whitespace-nowrap">
                {organization.name}
            </div>
            <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                                isActive
                                    ? 'bg-neutral-100 text-neutral-900 font-medium'
                                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
