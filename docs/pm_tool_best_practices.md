# PM Tool MVP — Best Practices & Code Organization Guide

---

## 1. Project Structure Principles

### Feature-Based Modular Architecture

```
src/
  app/          → Routes only. Minimal logic. Delegate to features.
  components/   → Shared UI primitives and layout components
  features/     → Business logic grouped by domain
  lib/          → Infrastructure: Supabase, auth, permissions, utilities
  hooks/        → Shared React hooks
  types/        → Global TypeScript types
  constants/    → App-wide constants and enums
```

### Rules

- **Pages are thin.** A page file should import a query function, call it, and pass data to a component. Max ~30 lines.
- **Features own their domain.** Each feature folder contains everything related to that domain: schemas, actions, queries, components.
- **No cross-feature imports** between feature folders. If two features need the same thing, extract it to `lib/` or `components/shared/`.
- **`lib/` is infrastructure only.** No business logic. Just Supabase clients, auth helpers, permission helpers, and generic utilities.
- **`components/ui/`** = shadcn primitives (Button, Card, Input). Never modify these for business logic.
- **`components/shared/`** = reusable app-level components (EmptyState, ConfirmDialog). Not feature-specific.
- **`components/layout/`** = Sidebar, Header, page shells.

---

## 2. File Naming & Organization

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ProjectList.tsx` or `project-list.tsx` (pick one, be consistent) |
| Hooks | camelCase with `use` prefix | `use-realtime-tasks.ts` |
| Utilities | camelCase | `get-user.ts` |
| Schemas | camelCase | `schemas.ts` |
| Actions | camelCase | `actions.ts` |
| Queries | camelCase | `queries.ts` |
| Types | PascalCase for types | `UserRole`, `TaskStatus` |
| Constants | UPPER_SNAKE_CASE for values | `TASK_STATUSES`, `MAX_FILE_SIZE` |

### Use kebab-case for file names (Next.js convention)

```
features/
  tasks/
    schemas.ts          ← One file, all task Zod schemas
    actions.ts          ← One file, all task server actions
    queries.ts          ← One file, all task query functions
    components/
      create-task-dialog.tsx
      task-detail-view.tsx
      task-metadata-sidebar.tsx
      kanban/
        kanban-board.tsx
        kanban-column.tsx
        kanban-card.tsx
```

### When to Split Files

- **Actions:** Split when a single `actions.ts` exceeds ~200 lines. Split by sub-domain (e.g., `task-crud-actions.ts`, `task-move-actions.ts`).
- **Components:** Split when a component exceeds ~150 lines. Extract sub-components.
- **Queries:** Rarely needs splitting. One `queries.ts` per feature is usually fine.

---

## 3. TypeScript Best Practices

### Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Type Patterns

```typescript
// DO: Use the generated Database types
import type { Database } from "@/types/database.types"
type Task = Database["public"]["Tables"]["tasks"]["Row"]
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"]
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"]

// DO: Create application-level types for complex joins
type TaskWithRelations = Task & {
  assignee: Pick<Profile, "id" | "full_name" | "avatar_url"> | null
  reporter: Pick<Profile, "id" | "full_name" | "avatar_url">
  project: Pick<Project, "id" | "name">
}

// DO: Infer types from Zod schemas
import type { z } from "zod"
type CreateTaskInput = z.infer<typeof createTaskSchema>

// DON'T: Use `any`
// DON'T: Use `as` type assertions unless absolutely necessary
// DON'T: Create redundant type definitions that duplicate DB types
```

### Return Types for Server Actions

```typescript
// Consistent return shape
type ActionResult<T> =
  | { data: T; error?: never }
  | { error: string; data?: never }

// Usage
export async function createProjectAction(input: unknown): Promise<ActionResult<Project>> {
  // ...
  if (error) return { error: error.message }
  return { data: project }
}
```

---

## 4. Server Action Patterns

### The Universal Pipeline

Every server action follows this exact order:

```typescript
"use server"

export async function createTaskAction(projectId: string, input: unknown) {
  // 1. VALIDATE input with Zod
  const validated = createTaskSchema.parse(input)

  // 2. AUTHENTICATE — get current user and org context
  const { user, organizationId, role } = await getCurrentOrganization()

  // 3. AUTHORIZE — check permission
  if (!canCreateTask(role)) return { error: "Permission denied" }

  // 4. EXECUTE — perform the DB operation
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tasks")
    .insert({ /* ... */ })
    .select()
    .single()

  if (error) return { error: error.message }

  // 5. SIDE EFFECTS — log activity, create notifications
  await logActivity({ /* ... */ })
  if (validated.assigneeId && validated.assigneeId !== user.id) {
    await createNotification({ /* ... */ })
  }

  // 6. REVALIDATE — invalidate cached pages
  revalidatePath(`/projects/${projectId}`)

  // 7. RETURN — structured result
  return { data }
}
```

### Rules

- **Never skip validation.** Even if the form validates client-side, always re-validate server-side.
- **Never skip auth.** Even if middleware protects the route, always verify the user in the action.
- **Never skip permissions.** RLS is a safety net, not a replacement for application-level checks.
- **Always return structured results.** `{ data }` or `{ error }`. Never throw from server actions.
- **Activity logging is non-blocking.** If `logActivity` fails, the main action already succeeded. Use `await` but don't let it fail the whole action.

---

## 5. Query Function Patterns

### Structure

```typescript
// src/features/projects/queries.ts
import { createClient } from "@/lib/supabase/server"

export async function getProjects(organizationId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      created_by_profile:profiles!created_by(full_name, avatar_url)
    `)
    .eq("organization_id", organizationId)
    .neq("status", "archived")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}
```

### Rules

- **One query function = one Supabase query.** No business logic.
- **Throw on error.** Let Next.js error boundaries catch it.
- **Always select specific joins.** Don't use `select("*")` with joins — be explicit about what you need.
- **Name consistently.** `getX`, `getXById`, `getXByY`, `getXCount`.
- **Keep in `queries.ts`.** Don't scatter query logic across components.

---

## 6. Component Patterns

### Server Component (Default)

```typescript
// Page or data-fetching component — NO "use client"
import { getCurrentOrganization } from "@/lib/auth/get-organization"
import { getProjects } from "@/features/projects/queries"
import { ProjectList } from "@/features/projects/components/project-list"

export default async function ProjectsPage() {
  const { organizationId, role } = await getCurrentOrganization()
  const projects = await getProjects(organizationId)
  return <ProjectList projects={projects} userRole={role} />
}
```

### Client Component (Only When Needed)

```typescript
"use client"
// Only for: forms, drag-and-drop, modals, inline editing, realtime, usePathname, useState

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

export function CreateProjectDialog() {
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", description: "", status: "active" },
  })

  const onSubmit = async (data: CreateProjectInput) => {
    const result = await createProjectAction(data)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success("Project created")
    form.reset()
  }

  return (/* ... */)
}
```

### Component Size Rules

- **Max ~150 lines per component.** Extract sub-components at this threshold.
- **Max 5 props for leaf components.** If you need more, consider a context or composition pattern.
- **Separate data fetching from rendering.** Server Component fetches, passes to presentational component.

---

## 7. Form Patterns

### Every Form Must Have

```typescript
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useTransition } from "react"

export function CreateTaskForm({ projectId, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { title: "", status: "todo", priority: "medium" },
  })

  const onSubmit = (data: CreateTaskInput) => {
    startTransition(async () => {
      const result = await createTaskAction(projectId, data)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Task created")
      form.reset()
      onSuccess?.()
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Field with inline error */}
      <div>
        <Label htmlFor="title">Title</Label>
        <Input {...form.register("title")} />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
        )}
      </div>

      {/* Submit button with loading state */}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Task"}
      </Button>
    </form>
  )
}
```

### Checklist

- [ ] Zod schema for validation
- [ ] `zodResolver` for form
- [ ] Inline field-level error messages
- [ ] `useTransition` or `isPending` state
- [ ] Submit button disabled while pending
- [ ] Toast on success
- [ ] Toast on error
- [ ] Form reset on success (or close dialog)

---

## 8. Permission Patterns

### Centralized, Never Scattered

```typescript
// src/lib/permissions/index.ts

const ROLE_LEVELS: Record<UserRole, number> = {
  owner: 4, admin: 3, manager: 2, member: 1,
}

export function hasMinRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole]
}

// Named, self-documenting permission functions
export function canCreateProject(role: UserRole) { return hasMinRole(role, "manager") }
export function canEditProject(role: UserRole) { return hasMinRole(role, "manager") }
export function canArchiveProject(role: UserRole) { return hasMinRole(role, "admin") }
export function canManageMembers(role: UserRole) { return hasMinRole(role, "admin") }
// ... etc
```

### Two-Layer Enforcement

```typescript
// Layer 1: UI visibility (hide buttons the user can't use)
{canCreateProject(role) && <CreateProjectDialog />}

// Layer 2: Server-side enforcement (NEVER skip this)
export async function createProjectAction(input: unknown) {
  const { role } = await getCurrentOrganization()
  if (!canCreateProject(role)) return { error: "Permission denied" }
  // ...
}

// Layer 3: Database RLS (safety net — catches anything that slips through)
```

---

## 9. Error Handling Patterns

### Server Actions — Never Throw

```typescript
// DO: Return structured errors
export async function updateTaskAction(taskId: string, input: unknown) {
  try {
    const validated = updateTaskSchema.parse(input)
    // ... DB operation
    if (error) return { error: error.message }
    return { data: task }
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { error: e.errors[0].message }
    }
    return { error: "An unexpected error occurred" }
  }
}
```

### Client-Side — Toast Feedback

```typescript
const result = await updateTaskAction(taskId, data)
if (result.error) {
  toast.error(result.error)  // Always show user what went wrong
  return
}
toast.success("Task updated")
```

### Query Functions — Throw (Let Error Boundaries Catch)

```typescript
export async function getProject(projectId: string) {
  const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).single()
  if (error) throw error  // Caught by error.tsx boundary
  return data
}
```

### Error Boundary Per Route

```typescript
// src/app/(dashboard)/error.tsx
"use client"
export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

---

## 10. Supabase Best Practices

### Client Usage

```typescript
// Server-side: ALWAYS use server client (cookie-based)
import { createClient } from "@/lib/supabase/server"
const supabase = await createClient()  // Note: async in server

// Client-side: ALWAYS use browser client
import { createClient } from "@/lib/supabase/client"
const supabase = createClient()  // Note: sync in browser
```

### Query Patterns

```typescript
// Joins with profile data
.select(`
  *,
  assignee:profiles!assignee_id(id, full_name, avatar_url)
`)

// Filtered counts
.select("*", { count: "exact", head: true })
.eq("user_id", userId)
.eq("is_read", false)

// Partial index usage
.eq("project_id", projectId)
.eq("status", "todo")
.order("position", { ascending: true })
```

### Security Rules

- **Never use service role key in client code**
- **Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser**
- **Prefer user-scoped client** for all normal operations — let RLS do its job
- **Only use service role** in trusted server-side code when bypassing RLS is intentionally needed (rare in MVP)

---

## 11. Realtime Usage Patterns

### Only Use Where It Matters

```typescript
// DO use for: board updates, comments on open page, notification badge
// DON'T use for: project list, dashboard, team page (use revalidatePath + refetch)
```

### Hook Pattern

```typescript
"use client"
import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function useRealtimeComments(taskId: string, onNewComment: () => void) {
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`comments:${taskId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "task_comments",
        filter: `task_id=eq.${taskId}`,
      }, () => onNewComment())
      .subscribe()

    return () => { supabase.removeChannel(channel) }  // ALWAYS clean up
  }, [taskId, onNewComment])
}
```

---

## 12. Tailwind & UI Patterns

### Consistent Spacing

```typescript
// Page-level padding
<main className="flex-1 overflow-y-auto p-6">

// Section spacing
<div className="space-y-6">

// Card content padding
<CardContent className="p-6">

// Form field spacing
<div className="space-y-4">
```

### Color Semantics

```typescript
// Status colors (use badge variants)
const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
  done: "bg-green-100 text-green-700",
}

// Priority colors
const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
}
```

### Responsive Breakpoints

```typescript
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Sidebar: hidden on mobile, visible on md+
<aside className="hidden md:flex md:w-64 flex-col border-r">

// Kanban: horizontal scroll on mobile
<div className="flex gap-4 overflow-x-auto pb-4">
```

---

## 13. Import Organization

### Order Convention

```typescript
// 1. React/Next.js imports
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// 2. Third-party libraries
import { z } from "zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

// 3. Internal lib imports
import { createClient } from "@/lib/supabase/server"
import { getCurrentOrganization } from "@/lib/auth/get-organization"
import { canCreateTask } from "@/lib/permissions"

// 4. Feature imports
import { createTaskSchema } from "@/features/tasks/schemas"
import { logActivity } from "@/features/activity/actions"

// 5. Component imports
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"

// 6. Type imports (always use `import type`)
import type { TaskStatus } from "@/types"
```

---

## 14. Git & Code Quality

### Commit Convention

```
feat: add task creation with assignee notification
fix: prevent duplicate org membership on signup
refactor: extract permission helpers to lib/permissions
chore: update shadcn/ui components
docs: add setup instructions to README
```

### Pre-Commit Checklist

- [ ] `pnpm build` passes (no type errors)
- [ ] No `any` types introduced
- [ ] No `console.log` left in production code (use structured logging or remove)
- [ ] No hardcoded secrets or URLs
- [ ] No unused imports
- [ ] Server actions validate input + check auth + check permissions
- [ ] Forms show loading/error/success states

---

## 15. Performance Best Practices

### Server-Side

- **Use Server Components** for data-heavy pages (dashboard, project list, task detail)
- **Use `Promise.all`** for parallel data fetching in pages
- **Paginate** notifications and activity logs (limit 50)
- **Use DB indexes** for all common filter columns

### Client-Side

- **Lazy-load heavy components** (Kanban board) with `next/dynamic`
- **Use `useTransition`** for non-blocking UI updates
- **Use optimistic updates** for Kanban drag-and-drop
- **TanStack Query** with `staleTime: 60000` to avoid redundant fetches
- **Avoid re-renders:** Memoize callbacks passed to realtime hooks

### Supabase

- **Select only needed columns** in joins
- **Use filtered indexes** (e.g., `notifications WHERE is_read = false`)
- **Use `head: true` + `count: "exact"`** for counts without fetching rows
