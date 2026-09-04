-- ==========================================
-- BISHWAS DATABASE RLS PERMISSIVE FIX
-- Copy and run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ytnikzxsahtrtrsoapiw/sql
-- ==========================================

-- Disable Row Level Security to allow BDApps client queries & seeding
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS business_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS business_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS review_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS business_claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS flags DISABLE ROW LEVEL SECURITY;

-- Add permissive public access policies (Fallback)
DROP POLICY IF EXISTS "Public Profiles Access" ON profiles;
CREATE POLICY "Public Profiles Access" ON profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Categories Access" ON business_categories;
CREATE POLICY "Public Categories Access" ON business_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Businesses Access" ON businesses;
CREATE POLICY "Public Businesses Access" ON businesses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Reviews Access" ON reviews;
CREATE POLICY "Public Reviews Access" ON reviews FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Replies Access" ON business_replies;
CREATE POLICY "Public Replies Access" ON business_replies FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Votes Access" ON review_votes;
CREATE POLICY "Public Votes Access" ON review_votes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Claims Access" ON business_claims;
CREATE POLICY "Public Claims Access" ON business_claims FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Flags Access" ON flags;
CREATE POLICY "Public Flags Access" ON flags FOR ALL USING (true) WITH CHECK (true);
