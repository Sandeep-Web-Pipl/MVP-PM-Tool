-- Insert storage bucket with public access disabled
INSERT INTO storage.buckets (id, name, public) 
VALUES ('task-attachments', 'task-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for task-attachments (Authenticated users)
CREATE POLICY "Authenticated users can upload task attachments" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'task-attachments');

CREATE POLICY "Authenticated users can read task attachments" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'task-attachments');

CREATE POLICY "Authenticated users can delete own task attachments" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'task-attachments' AND auth.uid() = owner);
