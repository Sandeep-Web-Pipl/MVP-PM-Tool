# PM Tool MVP — Implementation Tracker

> **Status Legend:** &#x2B1C; Not Started | &#x1F7E8; In Progress | &#x2705; Complete | &#x1F6AB; Blocked

---

## Phase 1: Foundation

**Status:** &#x2705; Complete
**Target:** Project scaffold, deps, auth middleware, layout shell

### Setup & Configuration
- [x] Create Next.js app with TypeScript, App Router, src dir
- [x] Install all dependencies (Supabase, UI, forms, dnd-kit, TanStack Query)
- [x] Initialize shadcn/ui and install components (button, card, input, label, textarea, select, badge, dialog, sheet, dropdown-menu, avatar, separator, skeleton, tabs, toast, tooltip, table)
- [x] Create `.env.local` with Supabase credentials
- [x] Create `.env.example` template
- [x] Update `.gitignore` for env files and Supabase temp

### Supabase Clients
- [x] `src/lib/supabase/client.ts` — Browser client with Database generic
- [x] `src/lib/supabase/server.ts` — Server client with cookie handling

### Auth Infrastructure
- [x] `src/middleware.ts` — Route protection, session refresh, public path allowlist
- [x] `src/lib/auth/get-user.ts` — `getAuthUser()` and `getOptionalUser()`

### Types & Constants
- [x] `src/lib/utils.ts` — `cn()` utility
- [x] `src/types/index.ts` — UserRole, ProjectStatus, TaskStatus, TaskPriority, MemberStatus
- [x] `src/types/database.types.ts` — Placeholder (generated in Phase 2)
- [x] `src/constants/index.ts` — Status arrays, priority arrays, label maps

### Layout Shell
- [x] `src/components/layout/sidebar.tsx` — Nav links, Lucide icons, active state
- [x] `src/components/layout/header.tsx` — Page title, user avatar dropdown, logout
- [x] `src/components/providers/query-provider.tsx` — TanStack Query provider

### App Routes (Shell)
- [x] `src/app/layout.tsx` — Root layout with providers and Toaster
- [x] `src/app/(dashboard)/layout.tsx` — Dashboard shell with sidebar + header
- [x] `src/app/(dashboard)/dashboard/page.tsx` — Placeholder
- [x] `src/app/(public)/layout.tsx` — Public layout
- [x] `src/app/(public)/page.tsx` — Landing page
- [x] `src/app/(auth)/layout.tsx` — Centered auth layout

### Phase 1 Verification
- [x] `pnpm build` passes without errors
- [x] `pnpm dev` runs without errors
- [x] Landing page renders at `/`
- [x] `/dashboard` is dynamic (server-rendered with auth)
- [x] Auth pages (login, signup, forgot-password) render as static

---

## Phase 2: Database

**Status:** &#x2705; Complete
**Target:** All tables, indexes, RLS, triggers, storage, type generation

### Supabase CLI Setup
- [ ] Run `pnpm supabase init`
- [ ] Configure `supabase/config.toml` (ports, auth settings, storage limits)
- [ ] Start local Supabase with `pnpm supabase start`

### Migration: Schema
- [ ] `supabase/migrations/00001_initial_schema.sql`
  - [ ] Custom enums: user_role, member_status, project_status, task_status, task_priority
  - [ ] Table: profiles (id, full_name, avatar_url, timestamps)
  - [ ] Table: organizations (id, name, slug, owner_id, timestamps)
  - [ ] Table: organization_members (id, org_id, user_id, role, status, joined_at)
  - [ ] Table: projects (id, org_id, name, description, status, dates, created_by, timestamps)
  - [ ] Table: project_members (id, project_id, user_id, role, created_at)
  - [ ] Table: tasks (id, org_id, project_id, title, description, status, priority, assignee_id, reporter_id, due_date, position, timestamps)
  - [ ] Table: task_comments (id, task_id, user_id, content, timestamps, deleted_at)
  - [ ] Table: task_attachments (id, task_id, uploaded_by, file_name, file_path, file_size, mime_type, created_at)
  - [ ] Table: notifications (id, org_id, user_id, type, title, body, entity_type, entity_id, is_read, created_at)
  - [ ] Table: activity_logs (id, org_id, actor_id, entity_type, entity_id, action, metadata jsonb, created_at)
  - [ ] All indexes (14 indexes on common query columns)
  - [ ] `updated_at` trigger function + triggers on 5 tables
  - [ ] UNIQUE constraints (org_members, project_members)
  - [ ] FK constraints on all references

### Migration: RLS
- [ ] `supabase/migrations/00002_rls_policies.sql`
  - [ ] Enable RLS on all 10 tables
  - [ ] Helper function: `is_org_member(org_id)`
  - [ ] Policies: profiles (read any, write own)
  - [ ] Policies: organizations (read/write for members)
  - [ ] Policies: organization_members (CRUD for org members)
  - [ ] Policies: projects (CRUD scoped to org)
  - [ ] Policies: project_members (via project -> org check)
  - [ ] Policies: tasks (CRUD scoped to org)
  - [ ] Policies: task_comments (read via org, write own)
  - [ ] Policies: task_attachments (read via org, write own)
  - [ ] Policies: notifications (read/write own only)
  - [ ] Policies: activity_logs (read/write for org members)

### Migration: Triggers & Storage
- [ ] `supabase/migrations/00003_profile_trigger.sql` — Auto-create profile on signup
- [ ] `supabase/migrations/00004_storage.sql` — task-attachments bucket + storage policies

### Type Generation
- [ ] Apply migrations: `pnpm supabase db push`
- [ ] Generate types: `pnpm supabase gen types typescript --local > src/types/database.types.ts`
- [ ] Update `src/lib/supabase/server.ts` with `Database` generic
- [ ] Update `src/lib/supabase/client.ts` with `Database` generic

### Phase 2 Verification
- [ ] All tables visible in Supabase Studio (localhost:54323)
- [ ] RLS enabled on every table (check via Studio)
- [ ] `database.types.ts` generated with all table types
- [ ] Profile auto-created on test user signup
- [ ] `task-attachments` storage bucket exists

---

## Phase 3: Authentication & Onboarding

**Status:** &#x2705; Complete
**Target:** Signup, login, forgot password, org creation, getCurrentOrganization()

### Schemas
- [ ] `src/features/auth/schemas.ts` — loginSchema, signupSchema (with confirmPassword), forgotPasswordSchema

### Server Actions
- [ ] `src/features/auth/actions.ts`
  - [ ] `loginAction` — signInWithPassword, redirect to /dashboard
  - [ ] `signupAction` — signUp with full_name metadata, redirect to /onboarding
  - [ ] `logoutAction` — signOut, redirect to /login
  - [ ] `forgotPasswordAction` — resetPasswordForEmail

### Auth Components
- [ ] `src/features/auth/components/login-form.tsx` — RHF + Zod, field errors, forgot password link
- [ ] `src/features/auth/components/signup-form.tsx` — fullName, email, password, confirmPassword
- [ ] `src/features/auth/components/forgot-password-form.tsx` — Email field, success message

### Auth Pages
- [ ] `src/app/(auth)/login/page.tsx`
- [ ] `src/app/(auth)/signup/page.tsx`
- [ ] `src/app/(auth)/forgot-password/page.tsx`
- [ ] `src/app/auth/callback/route.ts` — Code exchange handler

### Organization Onboarding
- [ ] `src/features/organizations/schemas.ts` — createOrganizationSchema
- [ ] `src/features/organizations/actions.ts` — createOrganizationAction (create org + owner member)
- [ ] `src/features/organizations/components/create-organization-form.tsx`
- [ ] `src/app/(auth)/onboarding/page.tsx` — Redirects if org exists, else shows form

### Auth Context Helper
- [ ] `src/lib/auth/get-organization.ts` — `getCurrentOrganization()` returns { user, organization, role, organizationId }

### Phase 3 Verification
- [ ] Signup creates user + profile (check Supabase Studio)
- [ ] Onboarding creates org + owner membership
- [ ] Login redirects to /dashboard
- [ ] Logout redirects to /login
- [ ] Forgot password: check Inbucket (localhost:54324) for email
- [ ] Middleware redirects unauthenticated to /login
- [ ] Middleware redirects authenticated away from /login, /signup
- [ ] Users with existing org skip onboarding

---

## Phase 4: Projects

**Status:** &#x2705; Complete
**Target:** Project CRUD, list page, detail page, permission helpers, activity logging

### Permissions
- [ ] `src/lib/permissions/index.ts`
  - [ ] Role hierarchy (owner:4, admin:3, manager:2, member:1)
  - [ ] `hasMinRole()` helper
  - [ ] `canCreateProject`, `canEditProject`, `canArchiveProject`, `canDeleteProject`
  - [ ] `canManageMembers`
  - [ ] `canCreateTask`, `canEditTask`, `canDeleteTask`
  - [ ] `canCommentOnTask`, `canUploadAttachment`

### Project Feature
- [ ] `src/features/projects/schemas.ts` — createProjectSchema, updateProjectSchema
- [ ] `src/features/projects/queries.ts` — getProjects, getProject, getProjectMembers
- [ ] `src/features/projects/actions.ts` — createProjectAction, updateProjectAction, archiveProjectAction

### Project Components
- [ ] `src/features/projects/components/project-list.tsx` — Grid of cards
- [ ] `src/features/projects/components/create-project-dialog.tsx` — Dialog with form
- [ ] `src/features/projects/components/edit-project-form.tsx`
- [ ] `src/features/projects/components/project-detail.tsx` — Info + tabs
- [ ] `src/features/projects/components/project-status-badge.tsx`

### Project Pages
- [ ] `src/app/(dashboard)/projects/page.tsx` — List page
- [ ] `src/app/(dashboard)/projects/[projectId]/page.tsx` — Detail page
- [ ] `src/app/(dashboard)/projects/[projectId]/layout.tsx` — Sub-nav tabs

### Activity Logging
- [ ] `src/features/activity/actions.ts` — `logActivity()` function

### Phase 4 Verification
- [ ] Create project works (manager+ only)
- [ ] Edit project works
- [ ] Archive project works (admin+ only)
- [ ] Project list shows non-archived projects
- [ ] Detail page renders with creator info
- [ ] Member role cannot see create button
- [ ] Activity logs created for all project actions (check DB)

---

## Phase 5: Tasks

**Status:** &#x2705; Complete
**Target:** Task CRUD, detail page, metadata editing, notifications

### Task Feature
- [ ] `src/features/tasks/schemas.ts` — createTaskSchema, updateTaskSchema, moveTaskSchema
- [ ] `src/features/tasks/queries.ts` — getTasksByProject, getTask, getTasksByProjectGroupedByStatus
- [ ] `src/features/tasks/actions.ts`
  - [ ] `createTaskAction` — position calc, insert, log, notify assignee
  - [ ] `updateTaskAction` — diff old/new, update, log, notify on status/assignee change
  - [ ] `deleteTaskAction` — manager+ check, delete, log
  - [ ] `moveTaskAction` — update status + position, log

### Task Components
- [ ] `src/features/tasks/components/create-task-dialog.tsx`
- [ ] `src/features/tasks/components/task-detail-view.tsx` — Two-column layout
- [ ] `src/features/tasks/components/task-metadata-sidebar.tsx` — Inline edit
- [ ] `src/features/tasks/components/task-priority-badge.tsx`
- [ ] `src/features/tasks/components/task-status-badge.tsx`
- [ ] `src/features/tasks/components/assignee-picker.tsx`

### Task Pages
- [ ] `src/app/(dashboard)/projects/[projectId]/tasks/[taskId]/page.tsx`

### Notification Stub
- [ ] `src/features/notifications/actions.ts` — `createNotification()` DB insert function

### Phase 5 Verification
- [ ] Create task works with all fields
- [ ] Edit task inline (status, priority, assignee, due date)
- [ ] Delete task works (manager+ only)
- [ ] Position calculated correctly (last + 1000, or 1000 for first)
- [ ] Notification created on assignment (check DB)
- [ ] Notification NOT created for self-assignment
- [ ] Notification created on status change
- [ ] Activity logged for all task actions

---

## Phase 6: Kanban Board

**Status:** &#x2705; Complete
**Target:** dnd-kit board, 4 columns, drag-drop, position persistence, optimistic UI

### Board Components
- [ ] `src/features/tasks/components/kanban/kanban-board.tsx`
  - [ ] DndContext with closestCorners strategy
  - [ ] PointerSensor + KeyboardSensor
  - [ ] Local state for optimistic updates
  - [ ] onDragStart: set active task
  - [ ] onDragOver: move between columns optimistically
  - [ ] onDragEnd: persist via moveTaskAction, revert on error
  - [ ] Position calc: top (first-1000), bottom (last+1000), between ((a+b)/2)
- [ ] `src/features/tasks/components/kanban/kanban-column.tsx` — Droppable, SortableContext, header with count
- [ ] `src/features/tasks/components/kanban/kanban-card.tsx` — Sortable, title, priority, assignee, due date
- [ ] `src/features/tasks/components/kanban/kanban-card-overlay.tsx` — DragOverlay visual

### Board Page
- [ ] `src/app/(dashboard)/projects/[projectId]/board/page.tsx` — Fetch grouped tasks

### Realtime (Optional)
- [ ] `src/hooks/use-realtime-tasks.ts` — Subscribe to task changes for board refresh

### Phase 6 Verification
- [ ] 4 columns render: To Do, In Progress, Review, Done
- [ ] Cards appear in correct columns sorted by position
- [ ] Drag card between columns: status updates
- [ ] Drag card within column: order updates
- [ ] Position persists on page reload
- [ ] Optimistic UI: card moves immediately before server response
- [ ] Rollback: card returns to original position on server error
- [ ] Card click navigates to task detail
- [ ] DragOverlay shows card preview while dragging
- [ ] Empty column accepts drops

---

## Phase 7: Collaboration

**Status:** &#x2705; Complete
**Target:** Comments, attachments, activity timeline on task detail

### Activity
- [ ] `src/features/activity/queries.ts` — getActivityByEntity, getRecentActivity
- [ ] `src/features/activity/components/activity-timeline.tsx` — Vertical timeline with actor, action, timestamp

### Comments
- [ ] `src/features/comments/schemas.ts` — createCommentSchema, updateCommentSchema
- [ ] `src/features/comments/queries.ts` — getCommentsByTask
- [ ] `src/features/comments/actions.ts` — addCommentAction, editCommentAction, deleteCommentAction (soft-delete)
- [ ] `src/features/comments/components/comment-list.tsx`
- [ ] `src/features/comments/components/comment-form.tsx`
- [ ] `src/features/comments/components/comment-item.tsx` — Edit/delete own, inline edit mode
- [ ] `src/hooks/use-realtime-comments.ts` — Live comment updates

### Attachments
- [ ] `src/features/attachments/schemas.ts` — ALLOWED_MIME_TYPES, MAX_FILE_SIZE
- [ ] `src/features/attachments/queries.ts` — getAttachmentsByTask
- [ ] `src/features/attachments/actions.ts` — deleteAttachmentAction
- [ ] `src/app/api/uploads/route.ts` — File upload route handler
- [ ] `src/features/attachments/components/attachment-list.tsx`
- [ ] `src/features/attachments/components/attachment-upload.tsx`

### Task Detail Integration
- [ ] Update task detail page to fetch comments, attachments, activity
- [ ] Update TaskDetailView to render all sections
- [ ] Wire realtime comments hook

### Phase 7 Verification
- [ ] Add comment: appears in list, activity logged, notifications sent
- [ ] Edit own comment: content updates
- [ ] Delete own comment: soft-deleted, hidden from list
- [ ] Cannot edit/delete other user's comment
- [ ] Upload file: stored in Supabase Storage, metadata in DB
- [ ] Download file: signed URL works
- [ ] Delete own attachment: removed from storage + DB
- [ ] Reject invalid file types (e.g., .exe)
- [ ] Reject oversized files (> 10MB)
- [ ] Activity timeline shows all actions in chronological order
- [ ] Realtime: new comment appears without page refresh (on open task)

---

## Phase 8: Notifications & Dashboard

**Status:** &#x2705; Complete
**Target:** Notification list + badge, 5 dashboard widgets

### Notifications
- [ ] `src/features/notifications/queries.ts` — getNotifications, getUnreadCount
- [ ] Update `src/features/notifications/actions.ts` — markNotificationReadAction, markAllNotificationsReadAction
- [ ] `src/features/notifications/components/notification-list.tsx`
- [ ] `src/features/notifications/components/notification-badge.tsx` — Realtime badge
- [ ] `src/features/notifications/components/mark-all-read-button.tsx`
- [ ] `src/hooks/use-realtime-notifications.ts` — Live badge count
- [ ] `src/app/(dashboard)/notifications/page.tsx`

### Dashboard
- [ ] `src/features/dashboard/queries.ts`
  - [ ] `getMyTasks(userId, orgId)` — assigned, not done, by due date
  - [ ] `getOverdueTasks(orgId)` — past due, not done
  - [ ] `getTaskCountsByStatus(orgId)` — count per status
  - [ ] `getProjectSummary(orgId)` — active projects
- [ ] `src/features/dashboard/components/my-tasks-widget.tsx`
- [ ] `src/features/dashboard/components/overdue-tasks-widget.tsx`
- [ ] `src/features/dashboard/components/tasks-by-status-widget.tsx`
- [ ] `src/features/dashboard/components/project-summary-widget.tsx`
- [ ] `src/features/dashboard/components/recent-activity-widget.tsx`
- [ ] Update `src/app/(dashboard)/dashboard/page.tsx` — Full build with 5 widgets

### Phase 8 Verification
- [ ] Dashboard: all 5 widgets render with correct data
- [ ] My Tasks: shows assigned tasks (excludes "done"), sorted by due date
- [ ] Overdue: shows only past-due, non-done tasks
- [ ] Counts: accurate todo/in_progress/review/done counts
- [ ] Project Summary: excludes archived projects
- [ ] Recent Activity: shows last 10 org-wide entries
- [ ] Notifications page: lists all notifications, most recent first
- [ ] Mark single notification as read
- [ ] Mark all as read
- [ ] Badge count accurate
- [ ] Badge updates in realtime on new notification
- [ ] Badge decrements on mark-as-read

---

## Phase 9: Hardening

**Status:** &#x2705; Complete
**Target:** Loading/empty/error states, team page, settings, responsive, deployment

### Loading States
- [ ] `src/app/(dashboard)/dashboard/loading.tsx`
- [ ] `src/app/(dashboard)/projects/loading.tsx`
- [ ] `src/app/(dashboard)/projects/[projectId]/loading.tsx`
- [ ] `src/app/(dashboard)/projects/[projectId]/board/loading.tsx`
- [ ] `src/app/(dashboard)/projects/[projectId]/tasks/[taskId]/loading.tsx`
- [ ] `src/app/(dashboard)/notifications/loading.tsx`
- [ ] `src/app/(dashboard)/team/loading.tsx`

### Error States
- [ ] `src/app/(dashboard)/error.tsx` — Error boundary with retry
- [ ] `src/app/not-found.tsx` — Global 404
- [ ] `src/app/(dashboard)/projects/[projectId]/not-found.tsx` — Project 404

### Empty States
- [ ] `src/components/shared/empty-state.tsx` — Reusable component
- [ ] Integrate into: project list, board columns, comments, attachments, notifications, dashboard widgets

### Shared Components
- [ ] `src/components/shared/confirm-dialog.tsx` — Destructive action confirmation

### Team Page
- [ ] `src/features/organizations/queries.ts` — getOrganizationMembers
- [ ] `src/features/organizations/components/team-member-list.tsx`
- [ ] `src/features/organizations/components/invite-member-dialog.tsx`
- [ ] `src/app/(dashboard)/team/page.tsx`

### Settings Page
- [ ] `src/features/auth/components/profile-settings-form.tsx`
- [ ] `src/features/organizations/components/org-settings-form.tsx`
- [ ] `src/app/(dashboard)/settings/page.tsx` — Profile, Organization, Password tabs

### Responsive Design
- [ ] Sidebar: hamburger/Sheet on mobile
- [ ] Dashboard: 3col -> 2col -> 1col
- [ ] Kanban: horizontal scroll on mobile
- [ ] Task detail: 2col -> 1col on mobile
- [ ] Dialogs: full-screen on mobile

### Deployment
- [ ] `pnpm build` succeeds without errors
- [ ] Create `README.md` with setup instructions
- [ ] Set env vars on Vercel
- [ ] Configure Supabase Auth redirect URLs for production
- [ ] Enable Realtime for tables in production
- [ ] Verify task-attachments bucket in production
- [ ] Test auth flow in production
- [ ] Test file upload in production

### Phase 9 Verification
- [ ] All pages show skeleton loading states
- [ ] All pages show empty states when no data
- [ ] Error boundary catches and displays errors with retry
- [ ] 404 pages work for invalid routes/IDs
- [ ] Team page lists members with roles
- [ ] Settings page: edit profile works
- [ ] Settings page: edit org name works (owner only)
- [ ] Responsive: sidebar collapses on mobile
- [ ] Responsive: board scrolls horizontally on mobile
- [ ] Production deployment working end-to-end

---

## Summary

| Phase | Files | Status |
|-------|-------|--------|
| 1. Foundation | ~20 | &#x2705; |
| 2. Database | 4 migrations + types | &#x2705; |
| 3. Auth & Onboarding | ~14 | &#x2705; |
| 4. Projects | ~13 | &#x2705; |
| 5. Tasks | ~11 | &#x2705; |
| 6. Kanban Board | ~6 | &#x2705; |
| 7. Collaboration | ~16 | &#x2705; |
| 8. Notifications & Dashboard | ~13 | &#x2705; |
| 9. Hardening | ~20 | &#x2705; |
| **Total** | **~85 files** | |
