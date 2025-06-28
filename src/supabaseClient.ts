import { createClient } from '@supabase/supabase-js';

// Deine Supabase-URL und dein Key
const supabaseUrl = 'https://rshorvzyxmzvdxwfdtqs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzaG9ydnp5eG16dmR4d2ZkdHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODgzMTMsImV4cCI6MjA2NjI2NDMxM30.1Cp2Wrd71w3oBr8Djsd8LNLoE6NfJHFW2icqQnwmm40';

export const supabase = createClient(supabaseUrl, supabaseKey);

