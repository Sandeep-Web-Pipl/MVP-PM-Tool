-- Create task_assignees junction table
CREATE TABLE task_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

-- Indexes for fast lookup
CREATE INDEX idx_task_assignees_task_id ON task_assignees(task_id);
CREATE INDEX idx_task_assignees_user_id ON task_assignees(user_id);

-- Enable RLS
ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;

-- Org members can view task assignees
CREATE POLICY "Org members can view task assignees" ON task_assignees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_assignees.task_id
      AND is_org_member(tasks.organization_id)
    )
  );

-- Admin/manager/lead can assign people to tasks
CREATE POLICY "Admin+ can insert task assignees" ON task_assignees
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_assignees.task_id
      AND get_user_role(tasks.organization_id) IN ('owner', 'admin', 'manager', 'lead')
    )
  );

-- Admin/manager/lead can remove assignees
CREATE POLICY "Admin+ can delete task assignees" ON task_assignees
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_assignees.task_id
      AND get_user_role(tasks.organization_id) IN ('owner', 'admin', 'manager', 'lead')
    )
  );