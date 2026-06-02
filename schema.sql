-- ==========================================
-- BISHWAS DATABASE SCHEMA & INITIAL SEED
-- ==========================================

-- 1. profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  location TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'business_owner', 'admin')),
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'bn')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. business_categories table
CREATE TABLE IF NOT EXISTS business_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  icon TEXT,
  description_en TEXT,
  description_bn TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with the 4 main categories if not already present
INSERT INTO business_categories (slug, name_en, name_bn, icon) VALUES
  ('ecommerce', 'E-commerce Shops', 'ই-কমার্স শপ', 'ShoppingBag'),
  ('local-services', 'Local Services', 'স্থানীয় সেবা', 'MapPin'),
  ('financial', 'Banks & Financial', 'ব্যাংক ও আর্থিক সেবা', 'Landmark'),
  ('freelancers', 'Freelancers & Agencies', 'ফ্রিল্যান্সার ও এজেন্সি', 'Briefcase')
ON CONFLICT (slug) DO NOTHING;

-- 3. businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  description_bn TEXT,
  category_id UUID REFERENCES business_categories(id),
  sub_category TEXT,
  logo_url TEXT,
  cover_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  address_bn TEXT,
  city TEXT,
  district TEXT,
  division TEXT,
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_by UUID REFERENCES profiles(id),
  claimed_at TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  trust_score NUMERIC(3,1) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT NOT NULL,
  body_bn TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'bn')),
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. business_replies table
CREATE TABLE IF NOT EXISTS business_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  replied_by UUID REFERENCES profiles(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. review_votes table (helpful/not helpful)
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vote TEXT CHECK (vote IN ('helpful', 'not_helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- 7. business_claims table (claim requests queue)
CREATE TABLE IF NOT EXISTS business_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  proof_document_url TEXT,
  notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. flags table (report abuse)
CREATE TABLE IF NOT EXISTS flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  flagged_by UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TRUST SCORE COMPUTATION FUNCTIONS & TRIGGERS
-- ==========================================

-- Auto-calculate trust score when a review is approved
CREATE OR REPLACE FUNCTION calculate_trust_score(business_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_rating NUMERIC;
  review_count INT;
  score NUMERIC;
BEGIN
  SELECT AVG(rating), COUNT(*)
  INTO avg_rating, review_count
  FROM reviews
  WHERE business_id = business_uuid AND status = 'approved';

  IF review_count = 0 THEN RETURN 0; END IF;

  -- Weighted: raw avg (70%) + volume bonus (30%, capped at 50 reviews)
  score := (avg_rating * 0.7) + (LEAST(review_count, 50) / 50.0 * 5 * 0.3);
  RETURN ROUND(score, 1);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update trust score after review status changes
CREATE OR REPLACE FUNCTION update_business_trust_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE businesses SET
    trust_score = calculate_trust_score(NEW.business_id),
    total_reviews = (
      SELECT COUNT(*) FROM reviews
      WHERE business_id = NEW.business_id AND status = 'approved'
    ),
    updated_at = NOW()
  WHERE id = NEW.business_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to avoid errors on run
DROP TRIGGER IF EXISTS after_review_status_change ON reviews;

CREATE TRIGGER after_review_status_change
AFTER INSERT OR UPDATE OF status ON reviews
FOR EACH ROW EXECUTE FUNCTION update_business_trust_score();

-- ==========================================
-- AUTOMATIC PROFILE CREATION TRIGGER (AUTH)
-- ==========================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;

-- 1. profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. businesses policies
DROP POLICY IF EXISTS "Anyone can view active businesses" ON businesses;
CREATE POLICY "Anyone can view active businesses" ON businesses FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can add businesses" ON businesses;
CREATE POLICY "Authenticated users can add businesses" ON businesses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Owner can update their business" ON businesses;
CREATE POLICY "Owner can update their business" ON businesses FOR UPDATE USING (auth.uid() = claimed_by);

-- 3. reviews policies
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Authenticated users can write reviews" ON reviews;
CREATE POLICY "Authenticated users can write reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- 4. business_replies policies
DROP POLICY IF EXISTS "Anyone can view replies" ON business_replies;
CREATE POLICY "Anyone can view replies" ON business_replies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Business owner can reply" ON business_replies;
CREATE POLICY "Business owner can reply" ON business_replies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
