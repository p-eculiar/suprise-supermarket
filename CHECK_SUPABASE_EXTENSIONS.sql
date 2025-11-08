-- Check for Supabase Extensions

SELECT 
  name,
  default_version,
  installed_version,
  comment
FROM pg_available_extensions 
WHERE name LIKE '%supabase%' OR name LIKE '%realtime%'
ORDER BY name;