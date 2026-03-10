# Claude Coding Agent Instructions — Project Management Tool MVP

You are the coding agent responsible for implementing a production-ready MVP of a project management tool for a software company.

Your goal is to build a clean, maintainable, scalable MVP using:

- Next.js (App Router)
- TypeScript
- Supabase (Auth, Postgres, Storage, Realtime)
- Vercel
- Tailwind CSS
- shadcn/ui

Do **not** introduce unnecessary complexity.

The architecture is:

- **Next.js + Supabase only**
- no Express
- no NestJS
- no separate backend service
- no microservices for MVP
- modular monolith inside Next.js app

---

# 1. High-Level Product Goal

Build a collaborative project management web app where software teams can:

- create organizations
- invite team members
- create projects
- create and assign tasks
- manage tasks on a Kanban board
- comment on tasks
- upload attachments
- receive notifications
- view a simple dashboard

---

# 2. Non-Negotiable Engineering Principles

## Architecture

- Use a **feature-based modular structure**.
- Keep business logic close to feature modules, not scattered randomly.
- Keep shared utilities inside `lib/`.
- Keep UI components reusable and small.
- Use Server Components by default unless interactivity requires Client Components.

## Quality

- Use **TypeScript strictly**.
- Avoid `any` unless absolutely unavoidable.
- Use **Zod** for all input validation.
- Use **React Hook Form** for forms.
- Prefer composition over overly large components.
- Prefer small server actions and focused utility functions.

## Security

- Use **Supabase Auth**.
- Enforce **authorization server-side**, not just in UI.
- Use **RLS** in Supabase from the beginning.
- Never expose secrets to the client.
- Never use service role key in browser code.

## Maintainability

- Write code that is easy for another engineer to extend.
- Keep naming explicit and consistent.
- Avoid hidden coupling.
- Do not over-engineer for imaginary future scale.
- Start clean, modular, and simple.

---

# 3. Core Product Scope

Implement these modules only.

## Authentication
- sign up
- login
- logout
- forgot password
- protected routes

## Organization / Team
- create organization
- list members
- invite members
- role support

## Projects
- create/edit/archive project
- list projects
- project detail page

## Tasks
- create/edit/delete task
- assign task
- set priority
- set due date
- change status
- filter/search basic task views

## Kanban
- drag and drop task movement
- column ordering persistence

## Task Collaboration
- comments
- attachments
- activity log

## Notifications
- in-app notifications
- unread count

## Dashboard
- my tasks
- overdue tasks
- simple project/task summary widgets

Do not implement phase-2 features.

---

# 4. Features That Must Not Be Added in MVP

Do not add these unless explicitly requested later:

- microservices
- custom websocket server
- Redux
- GraphQL
- event bus
- advanced analytics
- Gantt charts
- time tracking
- subtasks
- automation rules
- AI features
- GitHub integration
- multilevel workflow builders

---

# 5. Required Folder Structure

Use a clean feature-based structure similar to this:

```txt
src/
  app/
    (public)/
    (auth)/
    (dashboard)/
    api/
  components/
    ui/
    shared/
    layout/
    forms/
  features/
    auth/
    organizations/
    projects/
    tasks/
    comments/
    attachments/
    notifications/
    activity/
  lib/
    supabase/
    auth/
    permissions/
    utils/
    validations/
  hooks/
  types/
  constants/
```

### Rules

- shared primitives go in `components/ui`
- reusable domain UI goes in feature folders or `components/shared`
- feature-specific server actions live inside the relevant feature folder
- schema definitions live close to the feature
- permission helpers live in `lib/permissions`

---

# 6. App Routing Plan

Implement these routes:

## Public
- `/`
- `/login`
- `/signup`
- `/forgot-password`

## Protected
- `/dashboard`
- `/projects`
- `/projects/[projectId]`
- `/projects/[projectId]/board`
- `/projects/[projectId]/tasks/[taskId]`
- `/team`
- `/notifications`
- `/settings`

Use route groups and layout nesting properly.

---

# 7. UI and Design Rules

## Styling

- Use Tailwind CSS.
- Use shadcn/ui components where helpful.
- Build a clean professional dashboard style.
- Prefer clarity over decorative styling.
- Keep spacing, typography, borders, and shadows consistent.

## UX

- Every async action must show loading feedback.
- Every page should have proper empty states.
- Every form should have field-level validation messages.
- Use drawers/modals only where they improve speed and clarity.
- Board interactions should feel fast and responsive.

## Accessibility

- Use proper button labels
- use form labels
- use keyboard-friendly interactions where practical
- avoid inaccessible icon-only actions without tooltips/labels

---

# 8. Data Model Requirements

Implement the following database tables in Supabase.

## profiles
- id
- full_name
- avatar_url
- created_at
- updated_at

## organizations
- id
- name
- slug
- owner_id
- created_at
- updated_at

## organization_members
- id
- organization_id
- user_id
- role
- status
- joined_at

## projects
- id
- organization_id
- name
- description
- status
- start_date
- end_date
- created_by
- created_at
- updated_at

## project_members
- id
- project_id
- user_id
- role
- created_at

## tasks
- id
- organization_id
- project_id
- title
- description
- status
- priority
- assignee_id
- reporter_id
- due_date
- position
- created_at
- updated_at

## task_comments
- id
- task_id
- user_id
- content
- created_at
- updated_at
- deleted_at nullable

## task_attachments
- id
- task_id
- uploaded_by
- file_name
- file_path
- file_size
- mime_type
- created_at

## notifications
- id
- organization_id
- user_id
- type
- title
- body
- entity_type
- entity_id
- is_read
- created_at

## activity_logs
- id
- organization_id
- actor_id
- entity_type
- entity_id
- action
- metadata jsonb
- created_at

---

# 9. Database Rules

## Multi-tenancy

Every core entity must belong to an organization.

## RLS

Set up row-level security for all protected tables.

### Principle
A user should only read or write data for organizations they belong to, and only within their role permissions.

## Constraints

- add foreign keys
- add useful indexes
- use enums or constrained values when practical
- use timestamps consistently

## Suggested status values

### Project status
- active
- on_hold
- completed
- archived

### Task status
- todo
- in_progress
- review
- done

### Task priority
- low
- medium
- high
- critical

### Member role
- owner
- admin
- manager
- member

---

# 10. Authentication Requirements

Use Supabase Auth with SSR-friendly setup.

## Must implement

- auth client helper for browser
- auth client helper for server
- middleware protection for app routes
- helper to retrieve current authenticated user
- helper to load organization membership context

## Rules

- use secure cookie-based session flow
- do not implement custom JWT auth
- do not build your own password logic

---

# 11. Server vs Client Component Rules

## Prefer Server Components for

- dashboard page shell
- project listing
- project detail initial data
- task detail initial data
- team page
- notifications page

## Use Client Components for

- Kanban board drag and drop
- inline form interactions
- modals/drawers
- task editor
- comments composer
- live notification badge

Do not turn everything into Client Components.

---

# 12. Mutation Strategy

## Use Server Actions for

- create/update/archive project
- create/update/delete task
- move task across statuses
- add/edit/delete comment
- create invitation flow if implemented simply
- mark notifications as read

## Use Route Handlers for

- storage-related upload helpers if required
- webhooks
- future integrations

All mutations must:

- validate input with Zod
- validate user authentication
- validate permissions
- return structured success/error states
- create activity log entries when relevant

---

# 13. Feature-by-Feature Implementation Rules

## Organizations

Implement:

- create organization on first-use onboarding
- list current organization members
- support roles
- basic invite flow placeholder or working invite flow based on Supabase-compatible approach

If email invites are too heavy for MVP, create a controlled member onboarding workaround but keep data model future-ready.

## Projects

Implement:

- create project
- update project
- archive project
- list projects with status
- open project detail page

## Tasks

Implement:

- create task
- edit task
- delete task
- assign task
- update status
- update priority
- update due date
- fetch tasks by project

## Board

Implement:

- 4 columns: todo, in_progress, review, done
- drag and drop movement
- position persistence
- optimistic update if possible

## Task detail

Implement:

- task metadata section
- comments section
- attachments section
- activity timeline section

## Comments

Implement:

- add comment
- edit own comment
- soft-delete or delete comment based on simpler implementation

## Attachments

Implement:

- upload to Supabase Storage
- store metadata in DB
- restrict file size and type
- show attachment list in task detail

## Notifications

Create notifications for:

- task assignment
- comment creation on relevant task
- status change

## Activity Logs

Log major actions:

- project created/updated/archived
- task created/updated/deleted
- status changes
- assignee changes
- comment added
- attachment uploaded

---

# 14. Realtime Rules

Use Supabase Realtime sparingly and intentionally.

## Use it for

- comments on open task page
- board changes when collaborating users are present
- notification count refresh

## Do not use it for

- everything by default
- pages where refetch is enough

Fallback to normal query refetch if realtime complexity becomes high.

---

# 15. Form and Validation Rules

For every form:

- use React Hook Form
- use Zod schema
- show inline validation
- disable submit while pending
- show success/error toast

Required forms include:

- login
- signup
- create organization
- create project
- edit project
- create task
- edit task
- comment form

---

# 16. Error Handling Rules

Implement proper error boundaries and useful messages.

## Must have

- page-level fallback for failed fetches where needed
- toast messages for mutations
- field validation messages
- graceful handling for unauthorized / forbidden / not found

## Avoid

- console-only errors without UX feedback
- generic failures with no explanation
- swallowing promise errors

---

# 17. File Upload Rules

- Use Supabase Storage bucket `task-attachments`
- Restrict allowed mime types
- Restrict max size
- Store metadata in `task_attachments`
- Use structured file path naming

Suggested path:

`org/{organizationId}/project/{projectId}/task/{taskId}/{timestamp}-{filename}`

---

# 18. Permissions Rules

Create centralized permission helpers.

Examples:

- canViewProject
- canEditProject
- canCreateTask
- canEditTask
- canDeleteTask
- canCommentOnTask
- canUploadAttachment
- canManageMembers

Do not scatter permission logic randomly across components.

Always enforce permissions in server-side code.

---

# 19. Query and Data Access Rules

- Centralize Supabase queries by feature as much as practical.
- Avoid duplicate query logic spread across many files.
- Keep naming consistent.
- Use typed result mapping where useful.
- Avoid mixing raw database access deeply inside UI components.

---

# 20. Suggested Build Order

Implement in this order.

## Step 1: Foundation
- scaffold Next.js app
- configure TypeScript, Tailwind, shadcn/ui
- configure Supabase clients
- setup auth middleware
- create dashboard layout and nav shell

## Step 2: Database
- create SQL migrations
- create tables
- add indexes and constraints
- add RLS policies
- verify auth and membership access

## Step 3: Authentication and onboarding
- signup/login/forgot password
- create organization flow
- create profile record flow

## Step 4: Projects
- projects list page
- create/edit/archive project
- project detail page

## Step 5: Tasks
- create/edit/delete task
- task listing by project
- task detail page

## Step 6: Kanban board
- build client-side board
- wire drag/drop persistence
- add optimistic updates

## Step 7: Collaboration
- comments
- attachments
- activity logs

## Step 8: Notifications and dashboard
- notifications list and badge
- dashboard widgets

## Step 9: Hardening
- loading states
- empty states
- error states
- permission edge cases
- responsive polish
- deployment checks

---

# 21. Testing Expectations

At minimum, manually verify:

- auth flow works
- protected routes work
- user only sees allowed org data
- project CRUD works
- task CRUD works
- board movement persists correctly
- comments work
- attachments work
- notifications are created correctly
- activity logs are recorded correctly

If time allows, add focused tests for:

- validation schemas
- permission helpers
- critical server actions

---

# 22. Deployment Expectations

Deploy the app on Vercel.

## Requirements

- env vars set correctly
- no secret leaked to client
- auth callback flow works in production
- storage works in production
- Supabase URLs configured correctly

---

# 23. Code Style Expectations

- Use descriptive file names
- Use descriptive component and function names
- Keep files reasonably small
- Split very large components into subcomponents
- Prefer readable code over clever code
- Add comments only where logic is non-obvious

Avoid:

- giant page files
- giant action files
- untyped helper utilities
- repeated schema definitions in many places

---

# 24. Deliverables Expected From You

Produce:

1. complete Next.js codebase for MVP
2. SQL migration files for schema and RLS
3. clean README with setup instructions
4. `.env.example`
5. clear folder structure
6. usable deployed-ready app

---

# 25. Final Instruction

Build this as a **clean production-grade MVP**, not as a throwaway prototype.

That means:

- good structure
- good naming
- strict validation
- proper permissions
- proper RLS
- good UX states
- deployable quality

But also keep it **simple enough to ship fast**.

Do not overcomplicate the system.
