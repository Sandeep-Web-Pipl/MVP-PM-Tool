export const TASK_STATUSES = {
    todo: 'To Do',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done',
} as const;

export const TASK_PRIORITIES = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
} as const;

export const PROJECT_STATUSES = {
    planning: 'Planning',
    active: 'Active',
    completed: 'Completed',
    on_hold: 'On Hold',
    archived: 'Archived',
} as const;

export const USER_ROLES = {
    owner: 'Owner',
    admin: 'Admin',
    manager: 'Manager',
    member: 'Member',
} as const;
