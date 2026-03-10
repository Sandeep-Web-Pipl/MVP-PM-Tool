# PM Tool MVP — Comprehensive Test Scenarios

---

## Testing Strategy

### Layers

1. **Unit Tests** — Zod schemas, permission helpers, utility functions
2. **Integration Tests** — Server actions (validate -> auth -> DB -> side effects)
3. **Component Tests** — Form components, interactive UI
4. **E2E Tests** — Full user flows (signup -> create project -> create task -> move on board)
5. **Manual Verification** — RLS policies, realtime, responsive design

### Tools

- **Vitest** — Unit and integration tests
- **React Testing Library** — Component tests
- **Playwright** (optional for MVP) — E2E tests
- **Supabase CLI** — Database testing and RLS verification

---

## Module 1: Authentication

### Unit Tests

#### Schema Validation

| # | Test | Input | Expected |
|---|------|-------|----------|
| 1.1 | loginSchema accepts valid email + password | `{ email: "a@b.com", password: "123456" }` | Pass |
| 1.2 | loginSchema rejects invalid email | `{ email: "notanemail", password: "123456" }` | Fail: "Valid email required" |
| 1.3 | loginSchema rejects short password | `{ email: "a@b.com", password: "123" }` | Fail: "at least 6 characters" |
| 1.4 | signupSchema validates password match | `{ ..., password: "abc123", confirmPassword: "abc123" }` | Pass |
| 1.5 | signupSchema rejects password mismatch | `{ ..., password: "abc123", confirmPassword: "xyz789" }` | Fail: "Passwords do not match" |
| 1.6 | signupSchema rejects short name | `{ fullName: "A", ... }` | Fail: "at least 2 characters" |
| 1.7 | forgotPasswordSchema accepts valid email | `{ email: "a@b.com" }` | Pass |
| 1.8 | forgotPasswordSchema rejects empty email | `{ email: "" }` | Fail |

### Integration Tests (Server Actions)

| # | Test | Precondition | Action | Expected |
|---|------|-------------|--------|----------|
| 1.9 | Successful signup | No existing user | `signupAction({ fullName, email, password, confirmPassword })` | User created in auth.users, profile auto-created, redirect to /onboarding |
| 1.10 | Signup with existing email | User exists | `signupAction(...)` | Return `{ error: "User already registered" }` |
| 1.11 | Successful login | User exists | `loginAction({ email, password })` | Session created, redirect to /dashboard |
| 1.12 | Login with wrong password | User exists | `loginAction({ email, wrongPassword })` | Return `{ error }` |
| 1.13 | Login with non-existent email | No user | `loginAction(...)` | Return `{ error }` |
| 1.14 | Logout clears session | User logged in | `logoutAction()` | Session destroyed, redirect to /login |
| 1.15 | Forgot password sends email | User exists | `forgotPasswordAction({ email })` | Return `{ success }`, email sent |

### E2E / Manual Tests

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1.16 | Protected route redirect | Visit /dashboard without login | Redirected to /login |
| 1.17 | Auth redirect for logged-in user | Visit /login while authenticated | Redirected to /dashboard |
| 1.18 | Session persists across reload | Login, refresh page | Still authenticated |
| 1.19 | Auth callback works | Click email confirmation link | Session established, redirected |

---

## Module 2: Organizations & Team

### Unit Tests

| # | Test | Input | Expected |
|---|------|-------|----------|
| 2.1 | createOrganizationSchema accepts valid name | `{ name: "My Org" }` | Pass |
| 2.2 | Rejects name shorter than 2 chars | `{ name: "A" }` | Fail |
| 2.3 | Rejects name longer than 100 chars | `{ name: "A".repeat(101) }` | Fail |

### Integration Tests

| # | Test | Precondition | Action | Expected |
|---|------|-------------|--------|----------|
| 2.4 | Create organization | Authenticated user, no org | `createOrganizationAction({ name: "Test Org" })` | Org created, user added as owner member, redirect to /dashboard |
| 2.5 | Slug is generated correctly | — | `createOrganizationAction({ name: "My Cool Org!" })` | Slug: `my-cool-org-{timestamp}` |
| 2.6 | Owner membership auto-created | — | After org creation | `organization_members` row with role=owner, status=active |
| 2.7 | getCurrentOrganization returns context | User with org | Call function | Returns `{ user, organization, role, organizationId }` |
| 2.8 | getCurrentOrganization redirects without org | User without org | Call function | Redirects to /onboarding |
| 2.9 | Invite member (existing user) | Admin user | Invite existing user by email | Member added with role=member |
| 2.10 | Invite member (non-admin) | Member role user | Attempt invite | Permission denied |
| 2.11 | Prevent duplicate membership | User already member | Re-invite same user | Error or no-op |

### RLS Tests

| # | Test | User Context | Action | Expected |
|---|------|-------------|--------|----------|
| 2.12 | User can only see own org | User in Org A | Query organizations | Only Org A returned |
| 2.13 | User can see org members | User in Org A | Query org_members for Org A | Returns members |
| 2.14 | User cannot see other org members | User in Org A | Query org_members for Org B | Empty result |

---

## Module 3: Projects

### Unit Tests

| # | Test | Input | Expected |
|---|------|-------|----------|
| 3.1 | createProjectSchema accepts valid input | `{ name: "Project X", status: "active" }` | Pass |
| 3.2 | Rejects empty project name | `{ name: "" }` | Fail: "required" |
| 3.3 | Rejects invalid status | `{ name: "X", status: "invalid" }` | Fail |
| 3.4 | updateProjectSchema allows partial | `{ name: "Updated" }` | Pass (other fields optional) |
| 3.5 | canCreateProject returns true for manager | role = "manager" | `canCreateProject(role)` | true |
| 3.6 | canCreateProject returns false for member | role = "member" | `canCreateProject(role)` | false |
| 3.7 | canArchiveProject returns true for admin | role = "admin" | `canArchiveProject(role)` | true |
| 3.8 | canArchiveProject returns false for manager | role = "manager" | `canArchiveProject(role)` | false |

### Integration Tests

| # | Test | Precondition | Action | Expected |
|---|------|-------------|--------|----------|
| 3.9 | Create project | Manager+ user | `createProjectAction(input)` | Project created, activity logged, creator added as project member |
| 3.10 | Create project denied for member | Member role | `createProjectAction(input)` | Return `{ error: "Permission denied" }` |
| 3.11 | Update project | Manager+ user, project exists | `updateProjectAction(id, input)` | Project updated, activity logged |
| 3.12 | Archive project | Admin+ user | `archiveProjectAction(id)` | Status set to "archived", activity logged |
| 3.13 | Archive denied for manager | Manager role | `archiveProjectAction(id)` | Permission denied |
| 3.14 | getProjects excludes archived | Archived project exists | `getProjects(orgId)` | Archived project not in results |
| 3.15 | getProject returns full data | Project with members | `getProject(id)` | Returns project + creator profile + project members |
| 3.16 | getProject returns null for non-existent | Invalid ID | `getProject("fake-id")` | Throws error |

### RLS Tests

| # | Test | User Context | Action | Expected |
|---|------|-------------|--------|----------|
| 3.17 | User can see own org projects | Org A member | Query projects for Org A | Returns projects |
| 3.18 | User cannot see other org projects | Org A member | Query projects for Org B | Empty result |
| 3.19 | User can insert project in own org | Org A member | Insert project with org_id = Org A | Success |
| 3.20 | User cannot insert project in other org | Org A member | Insert project with org_id = Org B | RLS violation |

---

## Module 4: Tasks

### Unit Tests

| # | Test | Input | Expected |
|---|------|-------|----------|
| 4.1 | createTaskSchema accepts valid input | `{ title: "Fix bug", status: "todo", priority: "high" }` | Pass |
| 4.2 | Rejects empty title | `{ title: "" }` | Fail: "required" |
| 4.3 | Rejects title over 500 chars | `{ title: "A".repeat(501) }` | Fail |
| 4.4 | Accepts nullable assigneeId | `{ title: "X", assigneeId: null }` | Pass |
| 4.5 | Rejects invalid priority | `{ title: "X", priority: "urgent" }` | Fail |
| 4.6 | moveTaskSchema validates correctly | `{ taskId: uuid, newStatus: "done", newPosition: 1500.5 }` | Pass |
| 4.7 | moveTaskSchema rejects invalid status | `{ taskId: uuid, newStatus: "invalid", newPosition: 0 }` | Fail |

### Integration Tests

| # | Test | Precondition | Action | Expected |
|---|------|-------------|--------|----------|
| 4.8 | Create task | Member+ user | `createTaskAction(projectId, input)` | Task created with correct position, reporter set to current user, activity logged |
| 4.9 | Create task with assignee | — | Create with assigneeId | Task created, notification sent to assignee |
| 4.10 | Create task self-assigned | — | assigneeId = current user | Task created, NO notification (don't notify yourself) |
| 4.11 | Position calculated correctly | 2 existing tasks at 1000, 2000 | Create new task | Position = 3000 (last + 1000) |
| 4.12 | Position for empty column | No tasks in "todo" | Create task | Position = 1000 |
| 4.13 | Update task metadata | Member+ user | `updateTaskAction(id, { priority: "critical" })` | Updated, activity logged |
| 4.14 | Update task status triggers notification | Assignee exists | Change status from "todo" to "in_progress" | Notification sent to assignee |
| 4.15 | Reassign task triggers notification | New assignee | Change assigneeId | Notification sent to new assignee |
| 4.16 | Delete task | Manager+ user | `deleteTaskAction(id)` | Task deleted, activity logged |
| 4.17 | Delete denied for member | Member role | `deleteTaskAction(id)` | Permission denied |
| 4.18 | Move task between statuses | — | `moveTaskAction({ taskId, newStatus: "done", newPosition: 1500 })` | Status and position updated, activity logged |
| 4.19 | getTasksByProject returns ordered | 3 tasks with positions 1000, 2000, 3000 | `getTasksByProject(pid)` | Returned in position order |
| 4.20 | getTasksByProjectGroupedByStatus | Tasks in various statuses | Call function | Returns `{ todo: [...], in_progress: [...], review: [...], done: [...] }` |

### RLS Tests

| # | Test | User Context | Action | Expected |
|---|------|-------------|--------|----------|
| 4.21 | User can see tasks in own org | Org A member | Query tasks for Org A project | Returns tasks |
| 4.22 | User cannot see tasks in other org | Org A member | Query tasks for Org B project | Empty result |

---

## Module 5: Kanban Board

### Component/Integration Tests

| # | Test | Precondition | Action | Expected |
|---|------|-------------|--------|----------|
| 5.1 | Board renders 4 columns | Tasks exist | Render KanbanBoard | 4 columns: To Do, In Progress, Review, Done |
| 5.2 | Cards display in correct columns | Tasks with various statuses | Render | Each card in correct column |
| 5.3 | Cards ordered by position | Tasks with positions 1000, 2000, 3000 | Render | Cards in ascending order |
| 5.4 | Drag card between columns | Card in "todo" | Drag to "in_progress" | Card moves, status updated, position set |
| 5.5 | Drag card within column | 3 cards in "todo" | Move card 3 above card 1 | Position recalculated, order persists |
| 5.6 | Optimistic update | Drag card | Before server response | Card appears in new position immediately |
| 5.7 | Rollback on server error | Drag card, server action fails | After error | Card returns to original position, toast error shown |
| 5.8 | Position: drop at top | Cards at 1000, 2000 | Drop new card above 1000 | Position = 0 (1000 - 1000) |
| 5.9 | Position: drop at bottom | Cards at 1000, 2000 | Drop new card below 2000 | Position = 3000 (2000 + 1000) |
| 5.10 | Position: drop between | Cards at 1000, 2000 | Drop between them | Position = 1500 |
| 5.11 | Empty column accepts drops | Column "review" is empty | Drag card to review | Card placed at position 1000 |
| 5.12 | Card click navigates to detail | Card rendered | Click card | Navigate to `/projects/{pid}/tasks/{tid}` |
| 5.13 | Card shows priority badge | Task with priority "critical" | Render | Red priority badge visible |
| 5.14 | Card shows overdue indicator | Task with past due date | Render | Due date shown in red |
| 5.15 | Card shows assignee avatar | Task with assignee | Render | Avatar displayed |
| 5.16 | DragOverlay renders during drag | Start dragging | During drag | Card preview visible with shadow |

### Persistence Tests (Manual)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 5.17 | Position persists on reload | Drag card, reload page | Card in same position |
| 5.18 | Multiple rapid drags | Drag 3 cards quickly | All positions saved correctly |

---

## Module 6: Comments

### Unit Tests

| # | Test | Input | Expected |
|---|------|-------|----------|
| 6.1 | createCommentSchema accepts valid | `{ content: "Great work!" }` | Pass |
| 6.2 | Rejects empty comment | `{ content: "" }` | Fail: "cannot be empty" |
| 6.3 | Rejects comment over 5000 chars | `{ content: "A".repeat(5001) }` | Fail |

### Integration Tests

| # | Test | Precondition | Action | Expected |
|---|------|-------------|--------|----------|
| 6.4 | Add comment | Member+ user | `addCommentAction(taskId, { content })` | Comment created, activity logged |
| 6.5 | Comment notifies assignee | Task has assignee (not commenter) | Add comment | Notification sent to assignee |
| 6.6 | Comment notifies reporter | Task has reporter (not commenter) | Add comment | Notification sent to reporter |
| 6.7 | Comment does not self-notify | Commenter is assignee | Add comment | No notification to self |
| 6.8 | Edit own comment | Comment belongs to user | `editCommentAction(id, { content })` | Content updated |
| 6.9 | Cannot edit other's comment | Comment belongs to other user | `editCommentAction(id, ...)` | Error (RLS or action check) |
| 6.10 | Delete own comment (soft) | Own comment | `deleteCommentAction(id)` | `deleted_at` set, comment hidden from queries |
| 6.11 | Cannot delete other's comment | Other user's comment | `deleteCommentAction(id)` | Error |
| 6.12 | Deleted comments excluded from query | Soft-deleted comment exists | `getCommentsByTask(taskId)` | Deleted comment not in results |
| 6.13 | Comments ordered chronologically | Multiple comments | Query | Oldest first |

### Realtime Tests (Manual)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 6.14 | Realtime new comment | User A on task detail, User B adds comment | Comment appears for User A without refresh |

---

## Module 7: Attachments

### Integration Tests

| # | Test | Precondition | Action | Expected |
|---|------|-------------|--------|----------|
| 7.1 | Upload valid file | Member+ user | POST `/api/uploads` with image/png < 10MB | File in Storage, metadata in DB, activity logged |
| 7.2 | Reject invalid mime type | — | Upload `.exe` file | 400: "File type not allowed" |
| 7.3 | Reject oversized file | — | Upload 15MB file | 400: "File too large" |
| 7.4 | Reject missing fields | — | POST without taskId | 400: "Missing fields" |
| 7.5 | Permission denied for upload | Non-member user | Upload file | 403: "Permission denied" |
| 7.6 | File path structured correctly | orgId=A, projectId=B, taskId=C | Upload "doc.pdf" | Path: `org/A/project/B/task/C/{timestamp}-doc.pdf` |
| 7.7 | Delete own attachment | Uploader | `deleteAttachmentAction(id)` | File removed from Storage, metadata deleted, activity logged |
| 7.8 | Cannot delete other's attachment | Not uploader | `deleteAttachmentAction(id)` | Error |
| 7.9 | Download attachment | Authenticated user | Get signed URL | File downloadable |
| 7.10 | Attachment list query | Task has 3 attachments | `getAttachmentsByTask(taskId)` | Returns 3 items with uploader profiles |

### File Type Tests

| # | Test | File Type | Expected |
|---|------|-----------|----------|
| 7.11 | JPEG accepted | image/jpeg | Success |
| 7.12 | PNG accepted | image/png | Success |
| 7.13 | PDF accepted | application/pdf | Success |
| 7.14 | CSV accepted | text/csv | Success |
| 7.15 | DOCX accepted | application/vnd.openxmlformats-... | Success |
| 7.16 | EXE rejected | application/x-msdownload | Rejected |
| 7.17 | ZIP rejected | application/zip | Rejected |

---

## Module 8: Notifications

### Integration Tests

| # | Test | Precondition | Action | Expected |
|---|------|-------------|--------|----------|
| 8.1 | Notification created on task assign | User A assigns task to User B | Check notifications table | Notification for User B with type "task_assigned" |
| 8.2 | Notification created on comment | User A comments on User B's task | Check | Notification for User B with type "comment_added" |
| 8.3 | Notification created on status change | Assignee exists | Change task status | Notification for assignee with type "status_changed" |
| 8.4 | No self-notification | User assigns task to self | Check | No notification created |
| 8.5 | Mark single notification read | Unread notification | `markNotificationReadAction(id)` | `is_read` = true |
| 8.6 | Mark all notifications read | 5 unread notifications | `markAllNotificationsReadAction()` | All 5 now `is_read` = true |
| 8.7 | Unread count accurate | 3 unread, 2 read | `getUnreadCount(userId)` | Returns 3 |
| 8.8 | getNotifications returns ordered | Multiple notifications | Query | Most recent first |
| 8.9 | Only own notifications visible | User A's notifications | User B queries | User B sees nothing (RLS) |

### Realtime Tests (Manual)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 8.10 | Badge updates on new notification | User on any page, new notification arrives | Badge count increments without refresh |
| 8.11 | Badge decrements on mark read | User marks notification as read | Badge count decrements |

---

## Module 9: Activity Logs

### Integration Tests

| # | Test | Precondition | Action | Expected |
|---|------|-------------|--------|----------|
| 9.1 | Project created log | — | Create project | Activity: `{ entityType: "project", action: "created", metadata: { name } }` |
| 9.2 | Project updated log | — | Update project | Activity: `{ action: "updated", metadata: { changes } }` |
| 9.3 | Project archived log | — | Archive project | Activity: `{ action: "archived" }` |
| 9.4 | Task created log | — | Create task | Activity: `{ entityType: "task", action: "created" }` |
| 9.5 | Task updated log | — | Update task | Activity logged with changed fields |
| 9.6 | Task moved log | — | Move task on board | Activity: `{ action: "moved", metadata: { newStatus } }` |
| 9.7 | Task deleted log | — | Delete task | Activity: `{ action: "deleted" }` |
| 9.8 | Comment added log | — | Add comment | Activity: `{ action: "comment_added" }` |
| 9.9 | Attachment uploaded log | — | Upload file | Activity: `{ action: "attachment_uploaded" }` |
| 9.10 | Activity scoped to org | Org A activity | Query for Org A | Only Org A activity returned |
| 9.11 | getActivityByEntity filters correctly | Task with 5 activities | `getActivityByEntity("task", taskId)` | Returns 5 entries |
| 9.12 | getRecentActivity returns org-wide | Various entities | `getRecentActivity(orgId, 20)` | Returns last 20 across all entities |
| 9.13 | Actor profile joined | Activity exists | Query with join | Actor full_name and avatar_url present |

---

## Module 10: Dashboard

### Integration Tests

| # | Test | Precondition | Action | Expected |
|---|------|-------------|--------|----------|
| 10.1 | My tasks returns assigned tasks | User has 3 assigned tasks | `getMyTasks(userId, orgId)` | Returns 3 tasks, excluding "done" |
| 10.2 | My tasks excludes done | Assigned task with status "done" | Query | "Done" task not included |
| 10.3 | My tasks ordered by due date | Tasks with various due dates | Query | Earliest due date first |
| 10.4 | Overdue tasks detected | Task with past due_date, status != "done" | `getOverdueTasks(orgId)` | Returns overdue task |
| 10.5 | Overdue excludes done tasks | Overdue task marked "done" | Query | Not included |
| 10.6 | Task counts by status | 2 todo, 3 in_progress, 1 review, 5 done | `getTaskCountsByStatus(orgId)` | `{ todo: 2, in_progress: 3, review: 1, done: 5 }` |
| 10.7 | Project summary excludes archived | 3 active, 1 archived | `getProjectSummary(orgId)` | Returns 3 projects |
| 10.8 | Dashboard page renders 5 widgets | Data exists | Visit /dashboard | All 5 widget cards visible |

---

## Module 11: Permissions

### Unit Tests

| # | Test | Role | Function | Expected |
|---|------|------|----------|----------|
| 11.1 | Owner has all permissions | owner | All `can*` functions | All return true |
| 11.2 | Admin can manage members | admin | `canManageMembers` | true |
| 11.3 | Manager can create projects | manager | `canCreateProject` | true |
| 11.4 | Manager cannot manage members | manager | `canManageMembers` | false |
| 11.5 | Member can create tasks | member | `canCreateTask` | true |
| 11.6 | Member cannot create projects | member | `canCreateProject` | false |
| 11.7 | Member cannot delete tasks | member | `canDeleteTask` | false |
| 11.8 | Manager can delete tasks | manager | `canDeleteTask` | true |
| 11.9 | hasMinRole: owner >= member | owner, member | `hasMinRole` | true |
| 11.10 | hasMinRole: member >= admin | member, admin | `hasMinRole` | false |

---

## Cross-Cutting: RLS Policy Tests

These must be tested directly against Supabase using different user contexts.

| # | Table | Test | User Context | Expected |
|---|-------|------|-------------|----------|
| R1 | profiles | User can read any profile | Any authenticated | SELECT succeeds |
| R2 | profiles | User can only update own | User A updates User A | Success |
| R3 | profiles | User cannot update other | User A updates User B | Denied |
| R4 | organizations | Only see orgs you belong to | User in Org A only | Org B not visible |
| R5 | organization_members | Cannot see other org members | User in Org A | Org B members not visible |
| R6 | projects | Cannot see other org projects | User in Org A | Org B projects not visible |
| R7 | projects | Cannot insert into other org | User in Org A | Insert into Org B fails |
| R8 | tasks | Scoped to org membership | User in Org A | Only Org A tasks visible |
| R9 | task_comments | Can only edit own comments | User A | Cannot UPDATE User B's comment |
| R10 | task_attachments | Can only delete own uploads | User A | Cannot DELETE User B's upload |
| R11 | notifications | Only see own notifications | User A | Cannot see User B's notifications |
| R12 | activity_logs | Scoped to org | User in Org A | Only Org A logs visible |

---

## Cross-Cutting: UX State Tests

| # | Page | Test | Expected |
|---|------|------|----------|
| U1 | Projects | Empty state — no projects | "No projects yet" message with create button |
| U2 | Board | Empty state — no tasks | Empty columns with "Add task" buttons |
| U3 | Task Detail | Empty comments | "No comments yet" message |
| U4 | Task Detail | Empty attachments | "No attachments" message |
| U5 | Notifications | Empty notifications | "You're all caught up" message |
| U6 | Dashboard | Empty — new org | Widgets show zeros or "No data" |
| U7 | All pages | Loading state | Skeleton shimmer while data loads |
| U8 | All forms | Validation error | Inline red error message under field |
| U9 | All mutations | Success | Toast notification (green) |
| U10 | All mutations | Server error | Toast notification (red) with message |
| U11 | Any page | 404 — invalid ID | Not found page with back link |
| U12 | All forms | Submit button while pending | Disabled + "Loading..." text |

---

## Cross-Cutting: Security Tests

| # | Test | Steps | Expected |
|---|------|-------|----------|
| S1 | Service role key not in client bundle | Build app, inspect client JS | `SUPABASE_SERVICE_ROLE_KEY` not present |
| S2 | Direct API without auth | Call server action without session | Redirect to login or error |
| S3 | Zod validation on all actions | Send malformed input to any server action | Zod error returned, no DB operation |
| S4 | Permission check on all actions | Call action with insufficient role | "Permission denied" returned |
| S5 | File upload size enforced | Upload 15MB file via API | 400 error |
| S6 | File upload type enforced | Upload .exe via API | 400 error |
| S7 | No XSS in comments | Add comment with `<script>alert(1)</script>` | Rendered as text, not executed |
| S8 | SQL injection prevented | Use `'; DROP TABLE tasks;--` as input | Input safely handled (Supabase parameterized) |

---

## Cross-Cutting: Responsive Design Tests

| # | Breakpoint | Component | Expected |
|---|-----------|-----------|----------|
| D1 | Mobile (< 768px) | Sidebar | Collapsed, hamburger menu |
| D2 | Mobile | Dashboard grid | Single column |
| D3 | Mobile | Kanban board | Horizontal scroll |
| D4 | Mobile | Task detail | Single column (metadata below content) |
| D5 | Mobile | Dialogs | Full-screen sheet |
| D6 | Tablet (768px-1024px) | Dashboard grid | 2 columns |
| D7 | Desktop (> 1024px) | Dashboard grid | 3 columns |
| D8 | Desktop | Sidebar | Always visible, 256px wide |

---

## E2E Flow Tests (Full User Journeys)

### Flow 1: New User Onboarding
1. Visit `/signup`
2. Fill in name, email, password, confirm password
3. Submit -> redirected to `/onboarding`
4. Enter organization name
5. Submit -> redirected to `/dashboard`
6. Dashboard shows empty state widgets

### Flow 2: Project & Task Lifecycle
1. Navigate to `/projects`
2. Click "Create Project" -> fill form -> submit
3. Project appears in list
4. Click project -> detail page
5. Navigate to Board tab
6. Click "Add Task" in To Do column -> fill form -> submit
7. Task appears in To Do column
8. Drag task to In Progress
9. Click task -> opens detail page
10. Edit priority to "critical" in sidebar
11. Add a comment
12. Upload an attachment
13. Check activity timeline shows all actions

### Flow 3: Collaboration
1. User A creates task, assigns to User B
2. User B checks notifications -> sees "Task Assigned"
3. User B opens task, adds comment
4. User A checks notifications -> sees "New Comment"
5. User A moves task to "Done" on board
6. User B checks notifications -> sees "Task Status Changed"

### Flow 4: Permission Enforcement
1. Login as Member role user
2. Projects page -> "Create Project" button NOT visible
3. Navigate to existing project -> "Archive" button NOT visible
4. Can create tasks -> button visible
5. Can comment on tasks -> form visible
6. Cannot delete tasks -> delete button NOT visible

### Flow 5: Data Isolation
1. User A in Org A creates project + tasks
2. User B in Org B logs in
3. User B sees NO projects or tasks from Org A
4. User B cannot access Org A URLs directly (404 or empty)
