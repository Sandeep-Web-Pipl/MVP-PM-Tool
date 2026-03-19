-- ============================================
-- Migration: 00010_roles_rbac.sql
-- Description: Add role-aware RLS policies
-- and get_user_role helper function
-- Date: 2026-03-19
-- ============================================


-- STEP 2: Role-checking helper function
-- (role column already existed in 00001_initial_schema.sql)

CREATE OR REPLACE FUNCTION get_user_role(org_id UUID)
RETURNS TEXT AS $$
  SELECT role::TEXT 
  FROM organization_members
  WHERE organization_id = org_id
  AND user_id = auth.uid()
  AND status = 'active'
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- STEP 3: Rewrite critical policies to be role-aware

-- PROJECTS: only owner/admin/manager can create
DROP POLICY IF EXISTS "Org members can insert projects" ON projects;
CREATE POLICY "Only admin+ can insert projects" ON projects
  FOR INSERT WITH CHECK (
    get_user_role(organization_id) IN ('owner', 'admin', 'manager')
  );

-- PROJECTS: only owner/admin can delete
DROP POLICY IF EXISTS "Org members can delete projects" ON projects;
CREATE POLICY "Only owner/admin can delete projects" ON projects
  FOR DELETE USING (
    get_user_role(organization_id) IN ('owner', 'admin')
  );

-- TASKS: only admin+ can delete
DROP POLICY IF EXISTS "Org members can delete tasks" ON tasks;
CREATE POLICY "Only admin+ can delete tasks" ON tasks
  FOR DELETE USING (
    get_user_role(organization_id) IN ('owner', 'admin', 'manager')
  );

-- ORG MEMBERS: only owner/admin can add people
DROP POLICY IF EXISTS "Org members can insert organization members" ON organization_members;
CREATE POLICY "Only owner/admin can insert org members" ON organization_members
  FOR INSERT WITH CHECK (
    get_user_role(organization_id) IN ('owner', 'admin')
  );

-- ORG MEMBERS: only owner/admin can remove people
DROP POLICY IF EXISTS "Org members can delete organization members" ON organization_members;
CREATE POLICY "Only owner/admin can delete org members" ON organization_members
  FOR DELETE USING (
    get_user_role(organization_id) IN ('owner', 'admin')
  );

-- ORG MEMBERS: only owner/admin can change roles
DROP POLICY IF EXISTS "Org members can update organization members" ON organization_members;
CREATE POLICY "Only owner/admin can update org members" ON organization_members
  FOR UPDATE USING (
    get_user_role(organization_id) IN ('owner', 'admin')
  );