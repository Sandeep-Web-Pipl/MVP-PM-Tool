-- Enable RLS on invitations table
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage invitations" ON invitations
  FOR ALL
  USING (
    get_user_role(organization_id) IN ('owner', 'admin')
  )
  WITH CHECK (
    get_user_role(organization_id) IN ('owner', 'admin')
  );

-- Any authenticated user can read invitations for their own email
-- Critical for auto-join flow to work on signup
CREATE POLICY "Users can view own invitation" ON invitations
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = email
  );