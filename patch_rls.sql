-- ==========================================
-- BISHWAS RLS POLICIES PATCH
-- Run this in the Supabase SQL Editor
-- ==========================================

-- 1. Enable RLS on the tables (just in case they aren't already enabled)
ALTER TABLE business_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- 2. business_claims policies
DROP POLICY IF EXISTS "Users can view own claims" ON business_claims;
CREATE POLICY "Users can view own claims" ON business_claims FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own claims" ON business_claims;
CREATE POLICY "Users can insert own claims" ON business_claims FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all claims" ON business_claims;
CREATE POLICY "Admins can manage all claims" ON business_claims FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. flags policies
DROP POLICY IF EXISTS "Users can insert flags" ON flags;
CREATE POLICY "Users can insert flags" ON flags FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage flags" ON flags;
CREATE POLICY "Admins can manage flags" ON flags FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. review_votes policies
DROP POLICY IF EXISTS "Anyone can view votes" ON review_votes;
CREATE POLICY "Anyone can view votes" ON review_votes FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can manage own votes" ON review_votes;
CREATE POLICY "Users can manage own votes" ON review_votes FOR ALL 
USING (auth.uid() = user_id);
