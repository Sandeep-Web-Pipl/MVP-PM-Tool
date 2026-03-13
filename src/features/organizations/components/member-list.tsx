'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Shield, UserMinus } from 'lucide-react';
import { format } from 'date-fns';
import { updateMemberRoleAction, removeMemberAction } from '../actions';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { MemberWithProfile } from '@/types/features';
import { UserRole } from '@/types';

interface MemberListProps {
    organizationId: string;
    members: MemberWithProfile[];
    currentUserId: string;
    currentUserRole: string;
}

const roleColors: Record<string, string> = {
    owner: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200',
    admin: 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200',
    manager: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200',
    member: 'bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200',
};

export function MemberList({ organizationId, members, currentUserId, currentUserRole }: MemberListProps) {
    const [isPending, startTransition] = useTransition();
    const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin';

    async function handleRoleChange(memberId: string, newRole: UserRole) {
        startTransition(async () => {
            const result = await updateMemberRoleAction(organizationId, { memberId, role: newRole });
            if (result.error) toast.error(result.error);
            else toast.success('Role updated');
        });
    }

    async function handleRemoveMember(memberId: string, memberName: string) {
        if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) return;

        startTransition(async () => {
            const result = await removeMemberAction(organizationId, memberId);
            if (result.error) toast.error(result.error);
            else toast.success(`${memberName} removed from team`);
        });
    }

    return (
        <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                    <AvatarImage src={member.profiles?.avatar_url || ''} />
                                    <AvatarFallback className="bg-slate-100 text-slate-600">
                                        {member.profiles?.full_name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-slate-900">
                                            {member.profiles?.full_name || 'System User'}
                                            {member.profiles?.id === currentUserId && (
                                                <span className="ml-2 text-xs text-slate-400 font-normal">(You)</span>
                                            )}
                                        </p>
                                        <Badge variant="outline" className={`${roleColors[member.role]} capitalize border px-2 py-0 h-5`}>
                                            {member.role}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Joined {format(new Date(member.created_at), 'MMM d, yyyy')}
                                    </p>
                                </div>
                            </div>

                            {canManageMembers && member.profiles?.id !== currentUserId && member.role !== 'owner' && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            disabled={isPending}
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-slate-400" />
                                                Change Role
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent className="w-40">
                                                <DropdownMenuRadioGroup 
                                                    value={member.role}
                                                    onValueChange={(val) => handleRoleChange(member.id, val as UserRole)}
                                                >
                                                    <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem value="manager">Manager</DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem value="member">Member</DropdownMenuRadioItem>
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>

                                        <DropdownMenuItem 
                                            className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                                            onClick={() => handleRemoveMember(member.id, member.profiles?.full_name || 'Member')}
                                        >
                                            <UserMinus className="h-4 w-4" />
                                            Remove from Team
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
