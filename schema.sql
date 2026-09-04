-- ==========================================
-- BISHWAS (বিশ্বাস) DATABASE SCHEMA & FULL RESET
-- Tailored for BDApps Phone Authentication & Subscriptions
-- ==========================================

-- 1. DROP EXISTING TABLES (FULL RESET)
DROP TABLE IF EXISTS flags CASCADE;
DROP TABLE IF EXISTS business_claims CASCADE;
DROP TABLE IF EXISTS review_votes CASCADE;
DROP TABLE IF EXISTS business_replies CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS business_categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. PROFILES TABLE (Keyed by BDApps Phone Number)
CREATE TABLE profiles (
  phone TEXT PRIMARY KEY, -- Standardized format e.g. 8801815644470
  full_name TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT DEFAULT 'Dhaka, Bangladesh',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'business_owner', 'admin')),
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'bn')),
  subscription_status TEXT DEFAULT 'REGISTERED' CHECK (subscription_status IN ('REGISTERED', 'UNREGISTERED', 'PENDING_CHARGE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BUSINESS CATEGORIES
CREATE TABLE business_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  icon TEXT,
  description_en TEXT,
  description_bn TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO business_categories (slug, name_en, name_bn, icon, description_en, description_bn) VALUES
  ('ecommerce', 'E-commerce & Online Shops', 'ই-কমার্স ও অনলাইন শপ', 'ShoppingBag', 'Verified online stores, grocery platforms & marketplaces in Bangladesh', 'বাংলাদেশের নির্ভরযোগ্য ই-কমার্স ও অনলাইন শপিং প্ল্যাটফর্ম'),
  ('local-services', 'Local Services & Tech', 'স্থানীয় সেবা ও প্রযুক্তি', 'MapPin', 'Courier, ride-sharing, Internet Service Providers & repair services', 'কুরিয়ার, রাইড- শেয়ারিং, ইন্টারনেট সেবাদাতা ও সার্ভিস সেন্টার'),
  ('financial', 'Banks & MFS Services', 'ব্যাংক ও মোবাইল ফিন্যান্স', 'Landmark', 'Mobile Financial Services (bKash, Nagad), Banks & Fintech', 'বিকাশ, নগদ, রকেট এবং বাংলাদেশের সকল নির্ভরযোগ্য ব্যাংক'),
  ('freelancers', 'Agencies & Tech Houses', 'এজেন্সি ও ফ্রিল্যান্সার', 'Briefcase', 'Software agencies, digital marketing, design & dev firms', 'সফটওয়্যার ফার্ম, ডিজিটাল মার্কেটিং ও আইটি এজেন্সিসমূহ')
ON CONFLICT (slug) DO NOTHING;

-- 4. BUSINESSES TABLE
CREATE TABLE businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  description_bn TEXT,
  category_id UUID REFERENCES business_categories(id) ON DELETE SET NULL,
  sub_category TEXT,
  logo_url TEXT,
  cover_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  address_bn TEXT,
  city TEXT DEFAULT 'Dhaka',
  district TEXT DEFAULT 'Dhaka',
  division TEXT DEFAULT 'Dhaka',
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_by_phone TEXT REFERENCES profiles(phone) ON DELETE SET NULL,
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

-- 5. REVIEWS TABLE
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_phone TEXT REFERENCES profiles(phone) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT NOT NULL,
  body_bn TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'bn')),
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BUSINESS REPLIES TABLE
CREATE TABLE business_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  replied_by_phone TEXT REFERENCES profiles(phone) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. REVIEW VOTES TABLE
CREATE TABLE review_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  user_phone TEXT REFERENCES profiles(phone) ON DELETE CASCADE NOT NULL,
  vote TEXT CHECK (vote IN ('helpful', 'not_helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_phone)
);

-- 8. BUSINESS CLAIMS TABLE
CREATE TABLE business_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_phone TEXT REFERENCES profiles(phone) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  proof_document_url TEXT,
  notes TEXT,
  reviewed_by_phone TEXT REFERENCES profiles(phone) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FLAGS TABLE
CREATE TABLE flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  flagged_by_phone TEXT REFERENCES profiles(phone) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TRUST SCORE COMPUTATION FUNCTION & TRIGGER
-- ==========================================
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

  IF review_count IS NULL OR review_count = 0 THEN RETURN 0; END IF;

  score := (avg_rating * 0.7) + (LEAST(review_count, 50) / 50.0 * 5 * 0.3);
  RETURN ROUND(score, 1);
END;
$$ LANGUAGE plpgsql;

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

DROP TRIGGER IF EXISTS after_review_status_change ON reviews;
CREATE TRIGGER after_review_status_change
AFTER INSERT OR UPDATE OF status ON reviews
FOR EACH ROW EXECUTE FUNCTION update_business_trust_score();

-- Disable RLS / Allow anonymous client access for rapid BDApps integration
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE flags DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- REALISTIC SEED DATA (BANGLADESH MARKET)
-- ==========================================

-- Seed Profiles
INSERT INTO profiles (phone, full_name, display_name, location, role, subscription_status) VALUES
  ('8801815644470', 'Tanvir Ahmed', 'TanvirBD', 'Dhanmondi, Dhaka', 'user', 'REGISTERED'),
  ('8801711223344', 'Nusrat Jahan', 'Nusrat_Reviewer', 'Uttara, Dhaka', 'user', 'REGISTERED'),
  ('8801911998877', 'Rahim Uddin', 'Rahim_Tech', 'Agrabad, Chattogram', 'business_owner', 'REGISTERED'),
  ('8801800000000', 'Bishwas Admin', 'SuperAdmin', 'Dhaka', 'admin', 'REGISTERED')
ON CONFLICT (phone) DO NOTHING;

-- Seed Businesses
DO $$
DECLARE
  cat_ecom UUID;
  cat_serv UUID;
  cat_fin UUID;
  cat_free UUID;
  b1_id UUID := gen_random_uuid();
  b2_id UUID := gen_random_uuid();
  b3_id UUID := gen_random_uuid();
  b4_id UUID := gen_random_uuid();
  b5_id UUID := gen_random_uuid();
  b6_id UUID := gen_random_uuid();
BEGIN
  SELECT id INTO cat_ecom FROM business_categories WHERE slug = 'ecommerce';
  SELECT id INTO cat_serv FROM business_categories WHERE slug = 'local-services';
  SELECT id INTO cat_fin FROM business_categories WHERE slug = 'financial';
  SELECT id INTO cat_free FROM business_categories WHERE slug = 'freelancers';

  INSERT INTO businesses (id, name, name_bn, slug, description, description_bn, category_id, sub_category, website, phone, email, address, city, is_verified, is_claimed, is_premium, trust_score, total_reviews) VALUES
  (
    b1_id,
    'Shwapno Supershop',
    'স্বপ্ন সুপারশপ',
    'shwapno-supershop',
    'Largest grocery superstore chain in Bangladesh offering online delivery & fresh items.',
    'বাংলাদেশের সর্ববৃহৎ সুপারশপ চেইন। তাজা শাক-সবজি, গ্রোসারি ও হোম ডেলিভারি সেবা।',
    cat_ecom,
    'Grocery Superstore',
    'https://www.shwapno.com',
    '16469',
    'support@shwapno.com',
    'House 12, Road 5, Dhanmondi',
    'Dhaka',
    TRUE, TRUE, TRUE, 4.8, 5
  ),
  (
    b2_id,
    'bKash Limited',
    'বিকাশ লিমিটেড',
    'bkash-limited',
    'Leading Mobile Financial Services (MFS) provider in Bangladesh under BRAC Bank.',
    'বাংলাদেশের এক নম্বর মোবাইল ফিন্যান্সিয়াল সার্ভিস। ক্যাশ ইন, সেন্ড মানি, ও পে-মেন্ট সুবিধা।',
    cat_fin,
    'Mobile Banking',
    'https://www.bkash.com',
    '16247',
    'support@bkash.com',
    'Shanta Western Tower, Tejgaon',
    'Dhaka',
    TRUE, TRUE, TRUE, 4.9, 4
  ),
  (
    b3_id,
    'Chaldal Grocery',
    'চালডাল গ্রোসারি',
    'chaldal-grocery',
    'On-demand 1-hour online grocery delivery service operating across Dhaka and Chattogram.',
    'অনলাইন গ্রোসারি ডেলিভারি সার্ভিস। ১ ঘণ্টার মধ্যে বাসায় পণ্য পৌঁছে দেওয়া হয়।',
    cat_ecom,
    'Online Grocery',
    'https://chaldal.com',
    '09643222222',
    'support@chaldal.com',
    'Tejgaon Industrial Area',
    'Dhaka',
    TRUE, FALSE, FALSE, 4.6, 3
  ),
  (
    b4_id,
    'Star Tech & Engineering',
    'স্টার টেক অ্যান্ড ইঞ্জিনিয়ারিং',
    'star-tech-engineering',
    'Leading computer retail store, laptop seller, and custom PC builder in Bangladesh.',
    'কম্পিউটার, ল্যাপটপ, গেমিং পিসি ও আইটি প্রোডাক্টের নির্ভরযোগ্য খুচরা ও পাইকারি শপ।',
    cat_serv,
    'Computer & Gadgets',
    'https://www.startech.com.bd',
    '16793',
    'info@startech.com.bd',
    'Multiplan Center, Elephant Road',
    'Dhaka',
    TRUE, TRUE, TRUE, 4.7, 3
  ),
  (
    b5_id,
    'Pathao Logistics & Courier',
    'পাঠাও কুরিয়ার ও লজিস্টিকস',
    'pathao-logistics',
    'Nationwide parcel delivery, food delivery, and ride-sharing technology platform.',
    'সারাদেশে দ্রুত পার্সেল ডেলিভারি, ফুড ও রাইড শেয়ারিং প্ল্যাটফর্ম।',
    cat_serv,
    'Courier & Logistics',
    'https://pathao.com',
    '09610000000',
    'support@pathao.com',
    'Gulshan 1',
    'Dhaka',
    TRUE, FALSE, FALSE, 4.4, 2
  ),
  (
    b6_id,
    'Brain Station 23',
    'ব্রেইন স্টেশন ২৩',
    'brain-station-23',
    'Top enterprise software development & AI solutions outsourcing firm in Bangladesh.',
    'বাংলাদেশের অন্যতম শীর্ষ সফটওয়্যার ও কৃত্রিম বুদ্ধিমত্তা সমাধান প্রদানকারী প্রতিষ্ঠান।',
    cat_free,
    'Software & AI House',
    'https://brainstation-23.com',
    '01404055220',
    'sales@brainstation-23.com',
    'Mohakhali DOHS',
    'Dhaka',
    TRUE, TRUE, TRUE, 4.9, 2
  )
  ON CONFLICT (slug) DO NOTHING;

  -- Seed Reviews for Shwapno
  INSERT INTO reviews (business_id, user_phone, rating, title, body, body_bn, is_verified_purchase, helpful_count, status) VALUES
  (
    b1_id,
    '8801815644470',
    5,
    'Fresh veggies and rapid home delivery!',
    'Ordered groceries through Shwapno online. Packaging was top quality and veggies were super fresh. Truly trustworthy service in Dhaka!',
    'অনলাইনে স্বপ্ন থেকে সবজি অর্ডার করেছিলাম। প্যাকেজিং খুব ভালো ছিল এবং শাকসবজি একদম তাজা ছিল। ধানমন্ডি এলাকায় সার্ভিস অসাধারণ।',
    TRUE, 14, 'approved'
  ),
  (
    b1_id,
    '8801711223344',
    4,
    'Good collection of imported items',
    'Found genuine olive oil and imported dairy products. Prices are fixed and fair. Staff in Uttara branch are helpful.',
    'উত্তরা ব্রাঞ্চ থেকে প্রয়োজনীয় ইম্পোর্টেড জিনিসপত্র সহজেই পেলাম। কর্মীদের ব্যবহার চমৎকার।',
    TRUE, 8, 'approved'
  );

  -- Seed Reviews for bKash
  INSERT INTO reviews (business_id, user_phone, rating, title, body, body_bn, is_verified_purchase, helpful_count, status) VALUES
  (
    b2_id,
    '8801815644470',
    5,
    'Extremely smooth app & reliable transaction',
    'bKash is an essential daily utility in Bangladesh. QR payment is super convenient at any store.',
    'বিকাশ অ্যাপের কিউআর কোড পেমেন্ট একদম নিরবচ্ছিন্ন। প্রতিদিনের লেনদেনে খুবই নির্ভরযোগ্য।',
    TRUE, 25, 'approved'
  ),
  (
    b2_id,
    '8801711223344',
    5,
    'Instant Cashout and Customer Support',
    'Had a wrong pin entry issue and customer service resolved it within 5 minutes over call.',
    'পিন সাময়িক ব্লক হয়েছিল, কাস্টমার কেয়ার ৫ মিনিটে সুন্দরভাবে ফিক্স করে দিয়েছে।',
    TRUE, 19, 'approved'
  );

  -- Seed Reviews for Star Tech
  INSERT INTO reviews (business_id, user_phone, rating, title, body, body_bn, is_verified_purchase, helpful_count, status) VALUES
  (
    b4_id,
    '8801711223344',
    5,
    'Best PC Builder in Bangladesh',
    'Built a custom editing rig. Original warranty cards provided for GPU and Processor. 10/10 recommendation.',
    'স্টার টেক থেকে কাস্টম পিসি অ্যাসেম্বল করিয়েছি। জেনুইন পার্টস এবং অফিশিয়াল ওয়ারেন্টি পেয়েছি।',
    TRUE, 11, 'approved'
  );

END $$;
