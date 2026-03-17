-- Function to force PostgREST to reload its schema cache
CREATE OR REPLACE FUNCTION reload_schema_cache()
RETURNS void AS $$
BEGIN
  NOTIFY pgrst, 'reload schema';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
