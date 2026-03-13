import { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
import { Json } from './database.types';

export type ActivityMetadata = {
    title?: string;
    contentExcerpt?: string;
    [key: string]: Json | undefined;
};

export type ActivityLog = Omit<Database['public']['Tables']['activity_logs']['Row'], 'metadata'> & {
    metadata: ActivityMetadata | null;
};
export type Comment = Database['public']['Tables']['task_comments']['Row'];
export type Attachment = Database['public']['Tables']['task_attachments']['Row'];
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row'];

// Composite types with relations
export type ActivityWithActor = ActivityLog & {
    actor: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
};

export type NotificationWithDetails = Notification;

export type MemberWithProfile = OrganizationMember & {
    profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
};

export type ProjectWithMemberCount = Project & {
    project_members?: { id: string }[];
};

export type CommentWithUser = Comment & {
    user: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
};

export type TaskWithAssignee = Task & {
    assignee?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
    reporter?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
    project?: Pick<Project, 'name'> | null;
};
