-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is a member of an organization
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
    AND user_id = auth.uid()
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Organizations Policies
CREATE POLICY "Org members can view organizations" ON organizations
  FOR SELECT USING (is_org_member(id));

CREATE POLICY "Org members can update organizations" ON organizations
  FOR UPDATE USING (is_org_member(id));

CREATE POLICY "Authenticated users can create organizations" ON organizations
  FOR INSERT TO authenticated WITH CHECK (true);

-- Organization Members Policies
CREATE POLICY "Org members can view organization members" ON organization_members
  FOR SELECT USING (is_org_member(organization_id));

CREATE POLICY "Org members can insert organization members" ON organization_members
  FOR INSERT WITH CHECK (is_org_member(organization_id));

CREATE POLICY "Org members can update organization members" ON organization_members
  FOR UPDATE USING (is_org_member(organization_id));

CREATE POLICY "Org members can delete organization members" ON organization_members
  FOR DELETE USING (is_org_member(organization_id));

-- Projects Policies
CREATE POLICY "Org members can view projects" ON projects
  FOR SELECT USING (is_org_member(organization_id));

CREATE POLICY "Org members can insert projects" ON projects
  FOR INSERT WITH CHECK (is_org_member(organization_id));

CREATE POLICY "Org members can update projects" ON projects
  FOR UPDATE USING (is_org_member(organization_id));
  
CREATE POLICY "Org members can delete projects" ON projects
  FOR DELETE USING (is_org_member(organization_id));

-- Project Members Policies
CREATE POLICY "Org members can view project members" ON project_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND is_org_member(projects.organization_id)
    )
  );

CREATE POLICY "Org members can insert project members" ON project_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND is_org_member(projects.organization_id)
    )
  );

CREATE POLICY "Org members can delete project members" ON project_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND is_org_member(projects.organization_id)
    )
  );

-- Tasks Policies
CREATE POLICY "Org members can view tasks" ON tasks
  FOR SELECT USING (is_org_member(organization_id));

CREATE POLICY "Org members can insert tasks" ON tasks
  FOR INSERT WITH CHECK (is_org_member(organization_id));

CREATE POLICY "Org members can update tasks" ON tasks
  FOR UPDATE USING (is_org_member(organization_id));

CREATE POLICY "Org members can delete tasks" ON tasks
  FOR DELETE USING (is_org_member(organization_id));

-- Task Comments Policies
CREATE POLICY "Org members can view comments" ON task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_comments.task_id
      AND is_org_member(tasks.organization_id)
    )
  );

CREATE POLICY "Users can insert own comments" ON task_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON task_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON task_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Task Attachments Policies
CREATE POLICY "Org members can view attachments" ON task_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_attachments.task_id
      AND is_org_member(tasks.organization_id)
    )
  );

CREATE POLICY "Users can insert own attachments" ON task_attachments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own attachments" ON task_attachments
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Org members can insert notifications" ON notifications
  FOR INSERT WITH CHECK (is_org_member(organization_id));

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Activity Logs Policies
CREATE POLICY "Org members can view activity logs" ON activity_logs
  FOR SELECT USING (is_org_member(organization_id));

CREATE POLICY "Org members can insert activity logs" ON activity_logs
  FOR INSERT WITH CHECK (is_org_member(organization_id));
