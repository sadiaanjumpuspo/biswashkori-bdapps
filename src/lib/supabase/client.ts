import { createBrowserClient } from '@supabase/ssr'

const DEFAULT_SUPABASE_URL = 'https://ytnikzxsahtrtrsoapiw.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0bmlrenhzYWh0cnRyc29hcGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1ODgwNTYsImV4cCI6MjEwMzE2NDA1Nn0.gR7_TA2VrojHQkwVAHCjyteziRPgH8Hx-Mb0tlWPX_s'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

  return createBrowserClient(url, key)
}
