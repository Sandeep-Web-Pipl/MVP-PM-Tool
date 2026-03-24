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
        <div className={cn(
            "flex flex-col w-64 h-full text-sm",
            "bg-[oklch(0.22_0.06_285)]", // deep purple
            className
        )}>
            {/* Logo / Org name */}
            <div className="p-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' }}>
                        W
                    </div>
                    <span className="font-semibold text-white truncate text-base">
                        {organization.name}
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150',
                                isActive
                                    ? 'bg-white/15 text-white font-medium shadow-sm'
                                    : 'text-white/55 hover:text-white hover:bg-white/8'
                            )}
                        >
                            <item.icon className={cn(
                                "h-4 w-4 flex-shrink-0",
                                isActive ? "text-purple-300" : "text-white/40"
                            )} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom brand strip */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-xs text-white/40">
                        Powered by WebPipl
                    </span>
                </div>
            </div>
        </div>
    )
}