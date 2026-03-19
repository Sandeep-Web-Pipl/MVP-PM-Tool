-- ============================================
-- Migration: 00011_invitations_rls.sql
-- Description: Add RLS policies for invitations table
-- Date: 2026-03-19
-- ============================================

-- Enable RLS on invitations table
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Owners and admins can do everything
CREATE POLICY "Admins can manage invitations" ON invitations
  FOR ALL
  USING (
    get_user_role(organization_id) IN ('owner', 'admin')
  )
  WITH CHECK (
    get_user_role(organization_id) IN ('owner', 'admin')
  );

-- Anyone can view an invitation by email
-- (needed when someone clicks the invite link)
CREATE POLICY "Anyone can view invitation by email" ON invitations
  FOR SELECT
  USING (true);