-- Re-grant permissions just in case
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Force structural reload by renaming
ALTER TABLE notifications RENAME TO notifications_temp;
ALTER TABLE notifications_temp RENAME TO notifications;

ALTER TABLE profiles RENAME TO profiles_temp;
ALTER TABLE profiles_temp RENAME TO profiles;
