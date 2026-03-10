# Project Management Tool MVP — Implementation Plan

## 1. Project Goal

Build an MVP project management tool for a software company using:

- Next.js (App Router)
- TypeScript
- Supabase (Auth, Postgres, Storage, Realtime)
- Vercel
- Tailwind CSS
- shadcn/ui

This MVP should help teams:

- manage projects
- assign and track tasks
- collaborate through comments
- visualize work through a Kanban board
- receive simple notifications

The architecture choice is **Option A**:

- **Next.js + Supabase only**
- no separate backend service for MVP
- no microservices for MVP
- use a modular monolith approach inside the Next.js app

---

## 2. Product Scope for MVP

### In scope

- authentication
- organization/workspace setup
- team member invitations
- projects
- project members
- tasks
- Kanban board
- task detail page
- comments
- attachments
- notifications
- activity log
- dashboard

### Out of scope for MVP

- Gantt charts
- time tracking
- advanced analytics
- GitHub/GitLab integrations
- automation rules
- AI features
- custom workflow builder
- subtasks
- recurring tasks
- mobile app

---

## 3. Core Architecture

## Frontend and app layer

Use **Next.js App Router** for:

- routing
- layouts
- protected app pages
- server components for data-heavy pages
- client components for highly interactive UI
- server actions for mutations where appropriate
- route handlers for external/webhook-style endpoints

## Backend responsibilities within Next.js

Handle these inside the app:

- auth-aware data access
- form submission logic
- validation
- permission checks
- file upload orchestration
- notification creation
- activity log creation

## Supabase responsibilities

Use Supabase for:

- authentication
- PostgreSQL database
- row-level security
- file storage
- realtime subscriptions

---

## 4. Recommended Tech Stack

## Core

- Next.js (latest stable, App Router)
- TypeScript
- Supabase
- Vercel

## UI

- Tailwind CSS
- shadcn/ui
- Lucide icons
- dnd-kit (Kanban drag and drop)
- date-fns

## Forms and validation

- React Hook Form
- Zod

## Data fetching and state

- Server Components for initial loads
- TanStack Query for client-side state sync where needed
- local state for UI-only interactions

## Utilities

- clsx / cn utility
- sonner or shadcn toast system
- pino-style logging if needed server-side, or simple structured console logging for MVP

---

## 5. Product Modules

## Module 1: Authentication

### Features

- sign up
- login
- logout
- forgot password
- session persistence
- protected routes

### Implementation notes

- use Supabase Auth
- use cookie-based SSR auth helpers
- create middleware for route protection
- create server-side helper to fetch current user and organization membership

---

## Module 2: Organizations and Team

### Features

- create organization/workspace after signup
- invite team members by email
- assign roles
- list members
- remove or deactivate members later if needed

### Roles for MVP

- Owner
- Admin
- Manager
- Member

### Implementation notes

- each user can belong to one or more organizations later, but for MVP keep one primary org model if that speeds up delivery
- every business entity must reference `organization_id`

---

## Module 3: Projects

### Features

- create project
- edit project
- archive project
- assign members to project
- list projects
- project detail page

### Fields

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

### Status values

- active
- on_hold
- completed
- archived

---

## Module 4: Tasks

### Features

- create task
- edit task
- assign task
- set priority
- set due date
- move between statuses
- list/filter/search tasks

### Task fields

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

### Status values

- todo
- in_progress
- review
- done

### Priority values

- low
- medium
- high
- critical

---

## Module 5: Kanban Board

### Features

- project-level board view
- drag and drop across columns
- ordering within columns
- realtime refresh or optimistic update

### Implementation notes

- use dnd-kit
- store `position` per task within a status column
- update status and position on move
- use optimistic UI for smoother interaction

---

## Module 6: Task Detail

### Features

- full task information
- comments section
- attachments section
- activity history
- assign/reassign task
- update due date / priority / status

---

## Module 7: Comments

### Features

- add comment
- edit own comment
- delete own comment or admin/moderator delete
- show author and timestamps

### Later

- mentions
- markdown

---

## Module 8: Attachments

### Features

- upload attachment to task
- view/download attachment
- delete attachment based on permissions

### Implementation notes

- use Supabase Storage bucket `task-attachments`
- store metadata in database table
- keep files organized by organization/project/task paths

Example path:

`org/{organizationId}/project/{projectId}/task/{taskId}/filename`

---

## Module 9: Notifications

### MVP triggers

- task assigned
- comment added on task
- task status changed
- due date approaching

### Delivery

- in-app notifications first
- email optional later

---

## Module 10: Activity Log

### Track actions such as

- project created
- task created
- task updated
- status changed
- assignee changed
- comment added
- attachment uploaded

### Why important

- transparency
- auditability
- future analytics foundation

---

## Module 11: Dashboard

### Widgets

- my tasks
- overdue tasks
- tasks by status
- project summary
- recent activity

---

## 6. Recommended Folder Structure

```txt
src/
  app/
    (public)/
      page.tsx
    (auth)/
      login/
        page.tsx
      signup/
        page.tsx
      forgot-password/
        page.tsx
    (dashboard)/
      layout.tsx
      dashboard/
        page.tsx
      projects/
        page.tsx
        [projectId]/
          page.tsx
          board/
            page.tsx
          tasks/
            [taskId]/
              page.tsx
      team/
        page.tsx
      notifications/
        page.tsx
      settings/
        page.tsx
    api/
      webhooks/
      uploads/
  components/
    ui/
    shared/
    layout/
    forms/
    dashboard/
    projects/
    tasks/
    comments/
    notifications/
  features/
    auth/
      actions/
      components/
      schemas/
      utils/
    organizations/
      actions/
      queries/
      schemas/
      utils/
    projects/
      actions/
      queries/
      schemas/
      components/
    tasks/
      actions/
      queries/
      schemas/
      components/
    comments/
    attachments/
    notifications/
    activity/
  lib/
    supabase/
      browser.ts
      server.ts
      middleware.ts
    auth/
    permissions/
    db/
    realtime/
    utils/
  hooks/
  types/
  constants/
```

---

## 7. Database Design

## Core tables

### profiles

Stores app-level user profile info.

Suggested columns:

- id (uuid, same as auth user id)
- full_name
- avatar_url
- created_at
- updated_at

### organizations

- id
- name
- slug
- owner_id
- created_at
- updated_at

### organization_members

- id
- organization_id
- user_id
- role
- status
- joined_at

### projects

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

### project_members

- id
- project_id
- user_id
- role
- created_at

### tasks

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

### task_comments

- id
- task_id
- user_id
- content
- created_at
- updated_at
- deleted_at nullable

### task_attachments

- id
- task_id
- uploaded_by
- file_name
- file_path
- file_size
- mime_type
- created_at

### notifications

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

### activity_logs

- id
- organization_id
- actor_id
- entity_type
- entity_id
- action
- metadata jsonb
- created_at

---

## 8. Row-Level Security Strategy

Apply RLS from day one.

### Rules

- users can only access rows for organizations they belong to
- project access should depend on organization membership and optionally project membership
- task access should depend on project/org membership
- attachments and comments follow task visibility
- notifications only visible to the target user

### Recommendation

- keep RLS simple and strict
- use membership checks through `organization_members`
- if project-level privacy is added later, enforce via `project_members`

---

## 9. Server and Client Rendering Strategy

## Use Server Components for

- dashboard initial render
- project list page
- project detail page
- task detail initial data
- team page
- notifications page

## Use Client Components for

- Kanban interactions
- drag and drop
- modals and drawers
- inline task editing
- comments composer
- realtime UI updates

---

## 10. Data Mutation Strategy

## Use Server Actions for

- create organization
- create project
- update project
- create task
- update task
- move task
- add comment
- mark notification as read

## Use Route Handlers for

- webhook-style callbacks
- storage helper endpoints if needed
- future cron endpoints
- future integrations

---

## 11. Realtime Strategy

Use Supabase Realtime only where it clearly improves UX.

### Realtime events for MVP

- board updates when tasks move
- new comments on open task detail page
- notifications badge updates

### Recommendation

- do not over-rely on realtime for every page
- use normal fetch + refetch for most pages
- add realtime only to high-value collaborative surfaces

---

## 12. Permissions Strategy

## Organization-level roles

### Owner
- full access

### Admin
- manage most org/project resources

### Manager
- manage projects/tasks within assigned scope

### Member
- work on assigned and visible project items

## Permission checks should exist in two places

- UI visibility rules
- server-side enforcement

Never depend on frontend hiding alone.

---

## 13. UI Pages to Build

### Public/Auth

- Landing page
- Login
- Signup
- Forgot password

### Protected

- Dashboard
- Projects list
- Project detail overview
- Project Kanban board
- Task detail page
- Team members page
- Notifications page
- Settings page

---

## 14. Suggested Milestones

## Milestone 1: Foundation

Deliver:

- Next.js project setup
- Tailwind + shadcn/ui setup
- Supabase project setup
- auth integration
- protected routes
- base layout
- environment setup

## Milestone 2: Organization and Team

Deliver:

- organization creation flow
- team member listing
- organization membership table
- basic roles

## Milestone 3: Projects

Deliver:

- create/edit/archive project
- project list page
- project detail page

## Milestone 4: Tasks

Deliver:

- create/edit task
- task list
- status/priority/due date support
- assignee support

## Milestone 5: Kanban Board

Deliver:

- board UI
- drag and drop
- task position persistence

## Milestone 6: Task Collaboration

Deliver:

- comments
- attachments
- activity logs

## Milestone 7: Notifications and Dashboard

Deliver:

- in-app notifications
- unread count
- dashboard widgets

## Milestone 8: Hardening

Deliver:

- validation improvements
- loading states
- empty states
- error handling
- access control tests
- Vercel deployment

---

## 15. Implementation Sequence

### Phase 1: Setup and foundation

1. create Next.js app with TypeScript and App Router
2. install Tailwind and shadcn/ui
3. create Supabase project
4. configure env vars for local and production
5. create auth helpers and middleware
6. create base dashboard layout and navigation

### Phase 2: Data model

7. create core tables in Supabase
8. define indexes and foreign keys
9. write RLS policies
10. test auth + access boundaries

### Phase 3: Core product flows

11. implement organization onboarding
12. implement project CRUD
13. implement task CRUD
14. implement board UI
15. implement task detail page

### Phase 4: Collaboration

16. implement comments
17. implement file attachments
18. implement activity logs
19. implement notifications

### Phase 5: Polish and production

20. add dashboards and filters
21. add optimistic updates where useful
22. improve errors and loading states
23. test permissions and failure cases
24. deploy to Vercel
25. connect custom domain if needed

---

## 16. Environment Variables

### App

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

### Notes

- never expose service role key to client
- only use service role key in trusted server-side code when absolutely necessary
- prefer normal user-scoped client access for most flows

---

## 17. Error Handling and UX Rules

### Must have

- proper form validation messages
- loading states on all async actions
- empty states for pages and widgets
- toasts for success/error feedback
- not-found handling for invalid routes
- permission denied UI

### Avoid

- silent failures
- generic "something went wrong" without context
- blocking full-page refreshes for simple actions

---

## 18. Security and Data Integrity Checklist

- use RLS everywhere
- validate all mutations with Zod
- check permissions server-side
- sanitize file metadata
- limit upload file types and size
- use foreign keys and indexes
- use enums or constrained values where useful
- log important actions

---

## 19. Performance Notes

- server-render list-heavy pages first
- lazy-load heavy board/task client components if needed
- paginate notifications and activity logs
- add indexes for common filters:
  - project_id
  - organization_id
  - assignee_id
  - status
  - due_date

---

## 20. Deployment Plan

## Vercel

- deploy main Next.js app to Vercel
- use preview deployments for branches
- store env variables per environment

## Supabase

- create dev/staging/prod projects if needed later
- start with one dev and one prod at minimum
- maintain SQL migrations in repo

---

## 21. Definition of MVP Done

The MVP is done when:

- a user can sign up and log in
- create an organization
- create a project
- invite teammates
- create and assign tasks
- move tasks on Kanban board
- open task detail page
- comment on tasks
- upload task attachments
- receive in-app notifications
- view basic dashboard summaries
- app is deployed on Vercel
- permissions and basic RLS are working correctly

---

## 22. Suggested Phase 2 After MVP

- sprints/milestones
- advanced filters and saved views
- mentions
- email notifications
- AI task breakdown
- AI standup summaries
- GitHub integration
- audit and reporting improvements

