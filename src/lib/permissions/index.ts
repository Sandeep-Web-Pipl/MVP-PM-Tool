import { Database } from '@/types/database.types';

type UserRole = Database['public']['Enums']['user_role'];

export function canManageOrg(role: UserRole): boolean {
    return role === 'owner' || role === 'admin';
}

export function canCreateProject(role: UserRole): boolean {
    return role === 'owner' || role === 'admin' || role === 'manager';
}

export function canManageProject(role: UserRole, isProjectMember: boolean): boolean {
    if (role === 'owner' || role === 'admin') return true;
    return isProjectMember && role === 'manager';
}

export function canViewProject(role: UserRole, isProjectMember: boolean): boolean {
    if (role === 'owner' || role === 'admin' || role === 'manager') return true;
    return isProjectMember;
}
