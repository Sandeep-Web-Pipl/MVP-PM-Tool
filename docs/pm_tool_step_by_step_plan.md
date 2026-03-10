# PM Tool MVP — Step-by-Step Implementation Plan

## Context

Greenfield PM tool MVP for software teams. Modular monolith architecture: Next.js (App Router) + Supabase. No separate backend. 11 modules across 9 implementation steps. ~85 files total.

---

## Architectural Decisions (Lock In Before Coding)

1. **Package manager:** `pnpm` — avoids React 19 peer-dep issues with shadcn
2. **DB migrations:** Raw SQL in `supabase/migrations/`, applied via Supabase CLI. No ORM.
3. **Mutation pipeline:** Every server action follows:
   ```
   Zod validate -> getAuthUser -> check permission -> DB operation -> logActivity -> createNotification (if needed) -> revalidatePath -> return {data} or {error}
   ```
4. **Kanban position:** Float-based. Insert between: `(posA + posB) / 2`. Top: `first - 1000`. Bottom: `last + 1000`.
5. **Feature folder convention:** Each feature has `schemas.ts`, `actions.ts`, `queries.ts`, `components/`

---

## Step 1: Foundation

**Goal:** Working Next.js app with Supabase auth, protected routes, dashboard layout shell.

### Commands

```bash
pnpm create next-app@latest pm-tool --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd pm-tool

# Supabase
pnpm add @supabase/supabase-js @supabase/ssr

# UI
pnpm add lucide-react date-fns clsx tailwind-merge class-variance-authority sonner

# Forms
pnpm add react-hook-form @hookform/resolvers zod

# Kanban
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Data fetching
pnpm add @tanstack/react-query

# Dev
pnpm add -D supabase

# shadcn/ui
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card input label textarea select badge dialog sheet dropdown-menu avatar separator skeleton tabs toast tooltip table
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/supabase/client.ts` | Browser Supabase client using `createBrowserClient<Database>()` |
| `src/lib/supabase/server.ts` | Server Supabase client using `createServerClient<Database>()` with cookie handling |
| `src/middleware.ts` | Route protection — redirect unauthenticated to `/login`, redirect authenticated away from `/login`/`/signup`. Matcher excludes static files. |
| `src/lib/auth/get-user.ts` | `getAuthUser()` (redirects if not authed), `getOptionalUser()` (returns null) |
| `src/lib/utils.ts` | `cn()` utility from shadcn |
| `src/types/index.ts` | Type aliases: `UserRole`, `ProjectStatus`, `TaskStatus`, `TaskPriority`, `MemberStatus` |
| `src/types/database.types.ts` | Placeholder — auto-generated after Step 2 |
| `src/constants/index.ts` | `TASK_STATUSES`, `TASK_PRIORITIES`, `PROJECT_STATUSES`, `USER_ROLES`, label maps |
| `src/components/layout/sidebar.tsx` | Client Component — nav links (Dashboard, Projects, Team, Notifications, Settings), Lucide icons, `usePathname()` active state |
| `src/components/layout/header.tsx` | Client Component — page title/breadcrumb, user avatar dropdown with logout |
| `src/components/providers/query-provider.tsx` | TanStack Query provider with 60s staleTime |
| `src/app/layout.tsx` | Root layout — wraps in `QueryProvider`, `<Toaster />` from sonner |
| `src/app/(dashboard)/layout.tsx` | Dashboard shell — calls `getAuthUser()`, renders Sidebar + Header + `{children}` |
| `src/app/(dashboard)/dashboard/page.tsx` | Placeholder |
| `src/app/(public)/layout.tsx` | Minimal public layout |
| `src/app/(public)/page.tsx` | Landing page with Login/Signup CTAs |
| `src/app/(auth)/layout.tsx` | Centered card layout for auth forms |
| `.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL` |
| `.env.example` | Same keys, no values |

### Checkpoint

- `pnpm dev` runs without errors
- `/dashboard` redirects to `/login` when not authenticated
- Landing page renders at `/`

---

## Step 2: Database

**Goal:** All 10 tables, indexes, RLS policies, triggers, storage bucket. TypeScript types generated.

### Migration Files

**`supabase/migrations/00001_initial_schema.sql`**

- Custom enums: `user_role`, `member_status`, `project_status`, `task_status`, `task_priority`
- Tables: `profiles`, `organizations`, `organization_members`, `projects`, `project_members`, `tasks`, `task_comments`, `task_attachments`, `notifications`, `activity_logs`
- All with proper FK constraints, `UNIQUE` where needed (e.g., `organization_members(organization_id, user_id)`)
- Indexes on: `org_members(org_id)`, `org_members(user_id)`, `projects(org_id)`, `project_members(project_id)`, `tasks(project_id)`, `tasks(assignee_id)`, `tasks(status)`, `tasks(project_id, status)`, `tasks(due_date)`, `comments(task_id)`, `attachments(task_id)`, `notifications(user_id)`, `notifications(user_id, is_read) WHERE is_read = false`, `activity_logs(entity_type, entity_id)`, `activity_logs(org_id)`
- `updated_at` trigger function applied to: profiles, organizations, projects, tasks, task_comments

**`supabase/migrations/00002_rls_policies.sql`**

- Enable RLS on all 10 tables
- Helper function: `is_org_member(org_id UUID)` — checks `organization_members` for active membership
- Policies:
  - `profiles`: anyone can SELECT, only own INSERT/UPDATE
  - `organizations`: SELECT/UPDATE for members, INSERT for owner
  - `organization_members`: SELECT/INSERT/UPDATE/DELETE for org members
  - `projects`, `tasks`: SELECT/INSERT/UPDATE/DELETE for org members
  - `project_members`: SELECT/INSERT/DELETE via project -> org membership check
  - `task_comments`: SELECT via task -> org check, INSERT/UPDATE/DELETE for own comments
  - `task_attachments`: SELECT via task -> org check, INSERT/DELETE for own uploads
  - `notifications`: SELECT/UPDATE only for target user, INSERT for org members
  - `activity_logs`: SELECT/INSERT for org members

**`supabase/migrations/00003_profile_trigger.sql`**

- Trigger on `auth.users` INSERT — auto-creates `profiles` row with `full_name` and `avatar_url` from `raw_user_meta_data`

**`supabase/migrations/00004_storage.sql`**

- Create `task-attachments` bucket (private)
- Storage policies: authenticated users can SELECT/INSERT/DELETE

### Post-Migration

```bash
pnpm supabase init
pnpm supabase db push  # or supabase migration up
pnpm supabase gen types typescript --linked > src/types/database.types.ts
```

Update `src/lib/supabase/server.ts` and `client.ts` to use `Database` generic.

### Checkpoint

- All tables visible in Supabase dashboard
- RLS enabled on every table
- `database.types.ts` generated with full type safety

---

## Step 3: Auth & Onboarding

**Goal:** Signup, login, forgot password, auth callback, org creation, `getCurrentOrganization()` helper.

### Files to Create

| File | Purpose |
|------|---------|
| `src/features/auth/schemas.ts` | `loginSchema`, `signupSchema` (with confirmPassword refine), `forgotPasswordSchema` |
| `src/features/auth/actions.ts` | `loginAction` (signInWithPassword -> redirect /dashboard), `signupAction` (signUp with metadata -> redirect /onboarding), `logoutAction` (signOut -> redirect /login), `forgotPasswordAction` (resetPasswordForEmail) |
| `src/features/auth/components/login-form.tsx` | Client Component, RHF + zodResolver, field errors, "Forgot Password?" link |
| `src/features/auth/components/signup-form.tsx` | Fields: fullName, email, password, confirmPassword |
| `src/features/auth/components/forgot-password-form.tsx` | Single email field, success message on completion |
| `src/app/(auth)/login/page.tsx` | Renders LoginForm in centered layout |
| `src/app/(auth)/signup/page.tsx` | Renders SignupForm |
| `src/app/(auth)/forgot-password/page.tsx` | Renders ForgotPasswordForm |
| `src/app/auth/callback/route.ts` | GET handler: exchange code for session, redirect to `next` param or `/dashboard` |
| `src/features/organizations/schemas.ts` | `createOrganizationSchema` (name: 2-100 chars) |
| `src/features/organizations/actions.ts` | `createOrganizationAction`: creates org with slugified name + timestamp, adds creator as owner member, redirects to /dashboard |
| `src/features/organizations/components/create-organization-form.tsx` | Client Component with RHF |
| `src/app/(auth)/onboarding/page.tsx` | Server Component — if user has org, redirect to /dashboard; else show CreateOrganizationForm |
| `src/lib/auth/get-organization.ts` | `getCurrentOrganization()` — fetches user's org membership + org data. Returns `{ user, organization, role, organizationId }`. Redirects to /onboarding if no org. **This is the central context function used by every protected page and server action.** |

### Checkpoint

- Signup -> org creation -> dashboard flow works end to end
- Login/logout works
- Forgot password sends email
- Unauthenticated users redirected to /login
- Users with existing org skip onboarding

---

## Step 4: Projects

**Goal:** Project CRUD, list page, detail page, archive. Permission helpers established.

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/permissions/index.ts` | Role hierarchy (`owner:4, admin:3, manager:2, member:1`), `hasMinRole()`, permission functions: `canCreateProject(manager+)`, `canEditProject(manager+)`, `canArchiveProject(admin+)`, `canDeleteProject(admin+)`, `canManageMembers(admin+)`, `canCreateTask(member+)`, `canEditTask(member+)`, `canDeleteTask(manager+)`, `canCommentOnTask(member+)`, `canUploadAttachment(member+)` |
| `src/features/projects/schemas.ts` | `createProjectSchema`, `updateProjectSchema` (partial) |
| `src/features/projects/queries.ts` | `getProjects(orgId)` — with creator profile join, excludes archived, ordered by created_at desc. `getProject(projectId)` — with creator profile + project members join. `getProjectMembers(projectId)` |
| `src/features/projects/actions.ts` | `createProjectAction` — permission check, insert, add creator as project member, log activity, revalidate. `updateProjectAction` — permission check, update, log. `archiveProjectAction` — admin+ check, set status archived, log. |
| `src/features/projects/components/project-list.tsx` | Grid of project cards: name, status badge, description, dates, member count. Links to `/projects/[id]` |
| `src/features/projects/components/create-project-dialog.tsx` | Dialog with RHF: name, description, status, start/end dates |
| `src/features/projects/components/edit-project-form.tsx` | Edit form for project detail page |
| `src/features/projects/components/project-detail.tsx` | Project info + tabs/links: Overview, Board, Tasks |
| `src/features/projects/components/project-status-badge.tsx` | Status -> colored Badge component |
| `src/app/(dashboard)/projects/page.tsx` | Server Component: fetch projects, render list + create button (if manager+) |
| `src/app/(dashboard)/projects/[projectId]/page.tsx` | Server Component: fetch project, render detail. `notFound()` if missing. |
| `src/app/(dashboard)/projects/[projectId]/layout.tsx` | Sub-navigation tabs for project pages |
| `src/features/activity/actions.ts` | `logActivity({ organizationId, actorId, entityType, entityId, action, metadata })` — simple DB insert. **Created here, used from Step 4 onward.** |

### Checkpoint

- Create/edit/archive projects works
- Project list shows projects with status badges
- Detail page renders with tabs
- Only managers+ see create button
- Activity logged for all project actions

---

## Step 5: Tasks

**Goal:** Task CRUD, detail page with metadata editing, notifications on assign/status change.

### Files to Create

| File | Purpose |
|------|---------|
| `src/features/tasks/schemas.ts` | `createTaskSchema` (title required, status/priority enums, assigneeId nullable uuid, dueDate optional), `updateTaskSchema` (partial), `moveTaskSchema` (taskId, newStatus, newPosition) |
| `src/features/tasks/queries.ts` | `getTasksByProject(projectId)` — with assignee/reporter profile joins, ordered by position. `getTask(taskId)` — with profiles + project join. `getTasksByProjectGroupedByStatus(projectId)` — returns `{ todo, in_progress, review, done }` |
| `src/features/tasks/actions.ts` | `createTaskAction(projectId, input)` — calculates position (last + 1000), inserts, logs, notifies assignee. `updateTaskAction(taskId, input)` — fetches old task for diff, updates, logs, notifies on status change + reassignment. `deleteTaskAction(taskId)` — manager+ check, deletes, logs. `moveTaskAction(input)` — updates status + position, logs. |
| `src/features/tasks/components/create-task-dialog.tsx` | Dialog with RHF: title, description, status, priority, assignee picker, due date |
| `src/features/tasks/components/task-detail-view.tsx` | Two-column layout — Left: title (editable), description, comments, activity timeline. Right: metadata sidebar. |
| `src/features/tasks/components/task-metadata-sidebar.tsx` | Client Component — inline edit status/priority/assignee/due date. Each change calls `updateTaskAction` immediately. |
| `src/features/tasks/components/task-priority-badge.tsx` | Priority -> colored Badge |
| `src/features/tasks/components/task-status-badge.tsx` | Status -> colored Badge |
| `src/features/tasks/components/assignee-picker.tsx` | Client Component — dropdown of project members |
| `src/app/(dashboard)/projects/[projectId]/tasks/[taskId]/page.tsx` | Server Component: fetch task, render TaskDetailView. `notFound()` if missing. |
| `src/features/notifications/actions.ts` | `createNotification({ organizationId, userId, type, title, body, entityType, entityId })` — simple DB insert. **Stub created here, full UI in Step 8.** |

### Checkpoint

- Create/edit/delete tasks works
- Task detail page shows all metadata, editable inline
- Activity logged for all task actions
- Notifications created on assignment and status change

---

## Step 6: Kanban Board

**Goal:** dnd-kit drag-and-drop board with 4 columns, position persistence, optimistic updates.

### Files to Create

| File | Purpose |
|------|---------|
| `src/features/tasks/components/kanban/kanban-board.tsx` | **Core Client Component.** Uses `DndContext`, `closestCorners`, `PointerSensor`, `KeyboardSensor`. Local state for optimistic updates. `onDragStart` sets active task, `onDragOver` moves between columns optimistically, `onDragEnd` persists via `moveTaskAction` (reverts on error with toast). Position calc: top = `first - 1000`, bottom = `last + 1000`, between = `(a + b) / 2`. |
| `src/features/tasks/components/kanban/kanban-column.tsx` | Client Component — `useDroppable`, column header with count + "Add task" button, wraps tasks in `SortableContext(verticalListSortingStrategy)` |
| `src/features/tasks/components/kanban/kanban-card.tsx` | Client Component — `useSortable`, renders: title, priority badge, assignee avatar, due date (red if overdue). Click navigates to task detail. |
| `src/features/tasks/components/kanban/kanban-card-overlay.tsx` | Used in `DragOverlay` — same visual as card but with shadow/scale |
| `src/app/(dashboard)/projects/[projectId]/board/page.tsx` | Server Component: fetch grouped tasks + project members, render `<KanbanBoard>` |
| `src/hooks/use-realtime-tasks.ts` | Optional: subscribe to `postgres_changes` on tasks table filtered by project_id. Triggers refetch on change. |

### Checkpoint

- Board renders 4 columns with tasks sorted by position
- Drag between columns updates status + position
- Position persists on page reload
- Optimistic UI makes drag feel instant
- DragOverlay shows card preview while dragging

---

## Step 7: Collaboration (Comments, Attachments, Activity)

**Goal:** Comments, file attachments, and activity timeline on task detail page.

### Files to Create

| File | Purpose |
|------|---------|
| `src/features/activity/queries.ts` | `getActivityByEntity(entityType, entityId, limit)` — with actor profile join. `getRecentActivity(orgId, limit)` — org-wide feed. |
| `src/features/activity/components/activity-timeline.tsx` | Vertical timeline: actor avatar, action description from `action` + `metadata`, relative timestamp via `formatDistanceToNow` |
| `src/features/comments/schemas.ts` | `createCommentSchema` (content: 1-5000 chars), `updateCommentSchema` |
| `src/features/comments/queries.ts` | `getCommentsByTask(taskId)` — with user profile join, excludes soft-deleted, ordered asc |
| `src/features/comments/actions.ts` | `addCommentAction(taskId, input)` — insert, log activity, notify assignee + reporter (except commenter). `editCommentAction(commentId, input)` — own comments only. `deleteCommentAction(commentId)` — soft-delete (set `deleted_at`), own only. |
| `src/features/comments/components/comment-list.tsx` | Renders list of comment items |
| `src/features/comments/components/comment-form.tsx` | Client Component: textarea + submit, RHF + Zod, clears on success |
| `src/features/comments/components/comment-item.tsx` | Client Component: avatar, name, content, timestamp, edit/delete buttons (own only), inline edit mode |
| `src/hooks/use-realtime-comments.ts` | Subscribe to `task_comments` INSERT events for current taskId. Triggers refetch. |
| `src/features/attachments/schemas.ts` | `ALLOWED_MIME_TYPES` (images, pdf, text, csv, doc/docx, xls/xlsx), `MAX_FILE_SIZE` (10MB) |
| `src/features/attachments/queries.ts` | `getAttachmentsByTask(taskId)` — with uploader profile join |
| `src/features/attachments/actions.ts` | `deleteAttachmentAction(attachmentId)` — own uploads only, removes from Storage + DB, logs |
| `src/app/api/uploads/route.ts` | Route Handler: accepts FormData (file, taskId, projectId), validates mime/size, uploads to Supabase Storage at `org/{orgId}/project/{projectId}/task/{taskId}/{timestamp}-{filename}`, inserts metadata, logs activity |
| `src/features/attachments/components/attachment-list.tsx` | File icon by mime type, name, size, uploader, date, download link, delete button |
| `src/features/attachments/components/attachment-upload.tsx` | Client Component: file input / drop zone, client-side validation, upload progress, calls `/api/uploads` |

### Update

Expand `src/features/tasks/components/task-detail-view.tsx` to integrate all sections:
- Fetch comments, attachments, activity in the page server component
- Pass as props to TaskDetailView
- Wire up realtime comments hook

### Checkpoint

- Add/edit/delete comments on task detail
- Upload/download/delete attachments
- Activity timeline shows all changes
- Realtime comment updates on open task page
- Notifications fire on new comments

---

## Step 8: Notifications & Dashboard

**Goal:** Notification list with badge, dashboard with 5 widgets.

### Files to Create

| File | Purpose |
|------|---------|
| `src/features/notifications/queries.ts` | `getNotifications(userId, limit)`, `getUnreadCount(userId)` |
| `src/features/notifications/actions.ts` | Add `markNotificationReadAction(notificationId)`, `markAllNotificationsReadAction()` to existing file |
| `src/features/notifications/components/notification-list.tsx` | Items: icon by type, title, body, timestamp, read/unread styling. Click navigates to entity. |
| `src/features/notifications/components/notification-badge.tsx` | Client Component: red badge with unread count on Bell icon in sidebar/header |
| `src/features/notifications/components/mark-all-read-button.tsx` | Client Component: calls `markAllNotificationsReadAction` |
| `src/hooks/use-realtime-notifications.ts` | Subscribe to notifications INSERT/UPDATE for current user. Updates badge count live. |
| `src/app/(dashboard)/notifications/page.tsx` | Server Component: fetch notifications, render list + mark-all-read button |
| `src/features/dashboard/queries.ts` | `getMyTasks(userId, orgId)` — assigned to user, not done, ordered by due date. `getOverdueTasks(orgId)` — past due, not done. `getTaskCountsByStatus(orgId)` — count per status. `getProjectSummary(orgId)` — active projects. |
| `src/features/dashboard/components/my-tasks-widget.tsx` | Card: task list with title, project name, priority, due date |
| `src/features/dashboard/components/overdue-tasks-widget.tsx` | Card: overdue tasks with red date highlighting |
| `src/features/dashboard/components/tasks-by-status-widget.tsx` | Card: 4 stat counters (todo, in progress, review, done) |
| `src/features/dashboard/components/project-summary-widget.tsx` | Card: active projects with status badges |
| `src/features/dashboard/components/recent-activity-widget.tsx` | Card: last 10 activity entries |
| `src/app/(dashboard)/dashboard/page.tsx` | **Full build:** fetch all widget data via `Promise.all`, render 5 widgets in responsive grid |

### Checkpoint

- Dashboard shows real data across 5 widgets
- Notifications page lists all notifications
- Mark as read / mark all as read works
- Notification badge updates in realtime

---

## Step 9: Hardening

**Goal:** Loading/empty/error states, team page, settings page, responsive layout, deployment prep.

### Loading Skeletons (7 files)

Create `loading.tsx` for each route using shadcn `Skeleton`:
- `src/app/(dashboard)/dashboard/loading.tsx`
- `src/app/(dashboard)/projects/loading.tsx`
- `src/app/(dashboard)/projects/[projectId]/loading.tsx`
- `src/app/(dashboard)/projects/[projectId]/board/loading.tsx`
- `src/app/(dashboard)/projects/[projectId]/tasks/[taskId]/loading.tsx`
- `src/app/(dashboard)/notifications/loading.tsx`
- `src/app/(dashboard)/team/loading.tsx`

### Error Boundaries

- `src/app/(dashboard)/error.tsx` — Client Component with error message + retry button
- `src/app/not-found.tsx` — Global 404
- `src/app/(dashboard)/projects/[projectId]/not-found.tsx` — Project 404

### Shared Components

- `src/components/shared/empty-state.tsx` — Reusable: icon, title, description, optional action button
- `src/components/shared/confirm-dialog.tsx` — Reusable confirmation for destructive actions

### Team Page

- `src/app/(dashboard)/team/page.tsx` — Server Component: member list + invite button (admin+)
- `src/features/organizations/queries.ts` — `getOrganizationMembers(orgId)` with profile joins
- `src/features/organizations/components/team-member-list.tsx` — Table: avatar, name, role badge, joined date, actions
- `src/features/organizations/components/invite-member-dialog.tsx` — Add by email form (MVP: add existing users only)

### Settings Page

- `src/app/(dashboard)/settings/page.tsx` — Tabs: Profile, Organization, Password
- `src/features/auth/components/profile-settings-form.tsx` — Edit full_name, avatar_url
- `src/features/organizations/components/org-settings-form.tsx` — Edit org name (owner only)

### Responsive Design

- Sidebar: collapse to hamburger/Sheet on mobile (`md:` breakpoint)
- Dashboard grid: 3 cols -> 1 col on mobile
- Kanban: horizontal scroll on mobile
- Task detail: two-column -> single-column on mobile
- Dialogs: become full-screen sheets on mobile

### Deployment Checklist

1. Set env vars on Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`
2. Add production URL to Supabase Auth "Site URL" and "Redirect URLs"
3. Ensure `task-attachments` bucket exists in production Supabase
4. Enable Realtime for `tasks`, `task_comments`, `notifications` tables
5. `pnpm build` succeeds without errors
6. Create `README.md` with setup instructions

---

## Dependency Map

```
Step 1 (Foundation)
  └─> Step 2 (Database) ──> generates types used everywhere
       └─> Step 3 (Auth) ──> provides getCurrentOrganization()
            └─> Step 4 (Projects) ──> creates permission helpers + logActivity()
                 └─> Step 5 (Tasks) ──> creates createNotification() stub
                      └─> Step 6 (Kanban) ──> uses moveTaskAction
                           └─> Step 7 (Collaboration) ──> fills out comments/attachments/activity
                                └─> Step 8 (Notifications & Dashboard) ──> uses all prior data
                                     └─> Step 9 (Hardening) ──> touches all prior steps
```

**Note:** `logActivity()` and `createNotification()` are simple DB inserts created early (Steps 4-5) but their UI is built later (Steps 7-8). They work from day one.

---

## Complete File Inventory (~85 files)

### Config & Root (5)
`.env.local`, `.env.example`, `README.md`, `src/middleware.ts`, `supabase/config.toml`

### SQL Migrations (4)
`supabase/migrations/00001_initial_schema.sql`, `00002_rls_policies.sql`, `00003_profile_trigger.sql`, `00004_storage.sql`

### Library (9)
`src/lib/supabase/client.ts`, `server.ts` | `src/lib/auth/get-user.ts`, `get-organization.ts` | `src/lib/permissions/index.ts` | `src/lib/utils.ts` | `src/types/index.ts`, `database.types.ts` | `src/constants/index.ts`

### Layout & Shared (8)
`src/components/layout/sidebar.tsx`, `header.tsx` | `src/components/providers/query-provider.tsx` | `src/components/shared/empty-state.tsx`, `confirm-dialog.tsx` | `src/app/layout.tsx`, `(dashboard)/layout.tsx`, `(auth)/layout.tsx`, `(public)/layout.tsx`

### Auth (11)
`schemas.ts`, `actions.ts`, `login-form.tsx`, `signup-form.tsx`, `forgot-password-form.tsx`, `profile-settings-form.tsx` | Pages: `login`, `signup`, `forgot-password`, `onboarding` | `auth/callback/route.ts`

### Organizations (7)
`schemas.ts`, `actions.ts`, `queries.ts`, `create-organization-form.tsx`, `team-member-list.tsx`, `invite-member-dialog.tsx`, `org-settings-form.tsx`

### Projects (10)
`schemas.ts`, `actions.ts`, `queries.ts`, `project-list.tsx`, `create-project-dialog.tsx`, `edit-project-form.tsx`, `project-detail.tsx`, `project-status-badge.tsx` | Pages: `projects/page.tsx`, `[projectId]/page.tsx`, `[projectId]/layout.tsx`

### Tasks (13)
`schemas.ts`, `actions.ts`, `queries.ts`, `create-task-dialog.tsx`, `task-detail-view.tsx`, `task-metadata-sidebar.tsx`, `task-priority-badge.tsx`, `task-status-badge.tsx`, `assignee-picker.tsx` | Kanban: `kanban-board.tsx`, `kanban-column.tsx`, `kanban-card.tsx`, `kanban-card-overlay.tsx`

### Comments (6)
`schemas.ts`, `actions.ts`, `queries.ts`, `comment-list.tsx`, `comment-form.tsx`, `comment-item.tsx`

### Attachments (6)
`schemas.ts`, `actions.ts`, `queries.ts`, `attachment-list.tsx`, `attachment-upload.tsx`, `api/uploads/route.ts`

### Activity (3)
`actions.ts`, `queries.ts`, `activity-timeline.tsx`

### Notifications (6)
`actions.ts`, `queries.ts`, `notification-list.tsx`, `notification-badge.tsx`, `mark-all-read-button.tsx`

### Dashboard (6)
`queries.ts`, `my-tasks-widget.tsx`, `overdue-tasks-widget.tsx`, `tasks-by-status-widget.tsx`, `project-summary-widget.tsx`, `recent-activity-widget.tsx`

### Hooks (3)
`use-realtime-tasks.ts`, `use-realtime-comments.ts`, `use-realtime-notifications.ts`

### Pages (10)
Landing, dashboard, projects, project detail, board, task detail, team, notifications, settings

### Loading/Error (10)
7 loading files, 2 error files, 1 not-found
