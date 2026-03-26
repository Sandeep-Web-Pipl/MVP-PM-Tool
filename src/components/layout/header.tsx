'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { NotificationWithDetails } from '@/types/features';

interface HeaderProps {
    user: User;
    organization: {
        id: string;
        name: string;
        slug: string;
    };
    notifications: NotificationWithDetails[];
}

export function Header({ user, organization, notifications }: HeaderProps) {
    const router = useRouter();
    const supabase = createClient();

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    }

    return (
        <header className="h-16 border-b border-purple-100 bg-white/90 backdrop-blur-sm flex items-center justify-between px-6 w-full shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="font-semibold text-lg text-neutral-900 tracking-tight">
                    {organization.name}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <NotificationBell initialNotifications={notifications} />

                <div className="w-px h-6 bg-neutral-200 mx-1" />

                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Avatar className="h-8 w-8 cursor-pointer border border-neutral-200 hover:ring-2 hover:ring-primary/20 transition-all">
                            <AvatarImage src={user.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                {user.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">{user.user_metadata?.full_name || 'User'}</span>
                                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/settings')}>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
