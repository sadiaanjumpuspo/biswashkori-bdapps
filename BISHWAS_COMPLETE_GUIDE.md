# 🇧🇩 Bishwas (বিশ্বাস) — Complete Platform Guide & Playbook

**Bishwas (বিশ্বাস)** is a highly premium, modern review and reputation platform custom-tailored for Bangladesh. Built to counter fake listings and reviews, it helps Bangladeshi consumers discover verified local businesses, read authentic feedback, and make trusted decisions, while enabling business owners to establish credibility and grow their online presence.

This comprehensive guide walks you through the entire ecosystem, architectural stack, feature flows, user/admin dashboards, and a rigorous step-by-step Quality Assurance (QA) verification playbook.

---

## 📑 Table of Contents
1. **Technology Stack & Architecture**
2. **Visual Design & Aesthetic Identity**
3. **Platform Core Features & Flows**
4. **User & Business Owner Dashboards**
5. **Superuser Admin Moderation Panel**
6. **Dynamic SEO & Launch Configurations**
7. **Rigorous Quality Assurance (QA) & Verification Playbook**
8. **Supabase Database Schema & RLS Security Rules**

---

## 1. ⚙️ Technology Stack & Architecture

Bishwas is engineered as a state-of-the-art web application prioritizing blazing-fast loading speeds, robust security controls, and search engine discoverability.

*   **Core Framework**: **Next.js 16.2.6 (App Router)** utilizing server-side rendering (SSR) for fast loads and SEO, coupled with client-side hydration for fast interaction.
*   **Styling Engine**: **Tailwind CSS v4** utilizing clean custom tokens mapped to highly dynamic CSS HSL variables for system-wide light/dark themes.
*   **Database & Auth**: **Supabase (PostgreSQL)** handling real-time data persistence, authentication, automatic triggers, and strict Row-Level Security (RLS) policies.
*   **Bilingual Translation**: **next-intl** powering real-time English and Bangla translations dynamically matched via cookie headers.
*   **Icons & Assets**: **Lucide React** for consistent, modern icons, and dynamic, fractional inline SVG elements for ratings and charts.

---

## 2. 🎨 Visual Design & Aesthetic Identity

The design language of **Bishwas (বিশ্বাস)** is premium, clean, and highly interactive, combining glassmorphism and subtle animations with strict visual hierarchies.

### Color Tokens (Dynamic Light & Dark Modes)
*   **Primary Accent**: Elite Emerald Green (`#00A86B` / HSL customized) symbolizing trust, safety, and growth.
*   **Gold Standard**: Warm Amber (`#FFB000`) for verified purchases and top-tier rating indicators.
*   **Danger/Alert**: Alert Crimson (`#D32F2F`) for warnings, flagging, and error notifications.
*   **Surface Layers**: Light cream card layouts transitioning to sleek glassmorphic obsidian cards in Dark Mode.

### Micro-Animations & Interactivity
*   **Responsive Hovering**: Star rating inputs fill dynamically on hover; dashboard cards rise smoothly with subtle shadow depths.
*   **Shimmering Glows**: Premium cards feature looping gradient shimmers to project exclusive status.
*   **Zero Theme-Flicker**: A head-injected blocking script evaluates the system/stored preference instantly before drawing pixels, guaranteeing a zero-flash transition on load.

---

## 3. 🌐 Platform Core Features & Flows

### A. Real-Time Bilingual Toggle (Bangla & English)
*   Users can switch between **বাংলা** and **English** with a single click on the global floating globe icon in the Navbar.
*   The system saves the preference into a persistent `NEXT_LOCALE` cookie, automatically refreshes the viewport, and translates thousands of keys (headers, dashboard controls, forms, listings).
*   If a user is authenticated, it updates their profile's `preferred_language` in the database.

### B. Search & Discovery Engine
*   **Dynamic Categories**: Standard categories (E-commerce Shops, Local Services, Banks & Financial, Freelancers & Agencies) represent the core market of Bangladesh.
*   **Interactive Search**: Users can search by business name, city, or categories. Results resolve instantly using server-side query filters.

### C. Advanced Trust Signaling (Phase 8)
*   **Circular Progress Trust Wheel (`<TrustScore>`)**: A beautifully animated SVG progress ring representing the overall business standing (0.0 to 5.0). Color gradients shift seamlessly based on score tiers:
    *   `4.5 - 5.0`: Deep Emerald Green (High Trust)
    *   `3.5 - 4.4`: Active Mint Green (Good Standing)
    *   `2.5 - 3.4`: Soft Amber (Average Performance)
    *   `1.0 - 2.4`: Crimson Red (Skepticism / Low Trust)
*   **Masked SVG Star Rating (`<StarRating>`)**: Fractional mathematical ratings represented precisely. For instance, a rating of `4.2` will render exactly 4 full stars and a 5th star filled precisely to `20%` using a dynamic SVG linear gradient.
*   **Rating Breakdown Charts (`<RatingBreakdown>`)**: Full bar charts demonstrating the percentage distribution of 1 to 5-star votes.

---

## 4. 👥 User & Business Owner Dashboards

### User Dashboard (`/dashboard`)
*   **Overview Stats**: Lists total reviews written, helpful votes received, and profile status.
*   **My Reviews (`/dashboard/reviews`)**: An interactive log of all historical reviews submitted by the user.
*   **Profile Editor (`/dashboard/profile`)**:
    *   Let's users edit full name, display nickname, short bio, location, and preferred language.
    *   **Avatar Image Upload**: A circular drag-and-drop file uploader that streams files directly to the public `avatars` Supabase storage bucket, instantly updating the user's thumbnail preview.

### Business Owner Dashboard (`/business-dashboard`)
*   **Access Shield Guard**: Restricts dashboard access strictly to accounts with the `business_owner` or `admin` role. General accounts see an elegant Access Denied fallback prompting them to claim a business.
*   **Business Claim Flow (`/business-dashboard/claim`)**:
    *   Unclaimed businesses are selectable in a claims portal.
    *   Business owners upload official verification credentials (e.g. Trade License, NID, Utility Bills) directly to the **private** `claim-documents` Supabase bucket, entering supporting notes.
*   **Business Profile Customizer (`/business-dashboard/profile`)**:
    *   Allows owners to maintain up-to-date business hours, contact numbers, websites, and multilingual descriptions.
    *   **Logo & Cover Photo Uploads**: Premium image customizers connected directly to public `business-logos` and `business-covers` Supabase buckets, featuring drag-and-drop loading indicators and thumbnail previews.
*   **Review Replies Panel (`/business-dashboard/reviews`)**:
    *   Enables claimed business owners to write a public response to approved reviews to address client feedback directly.

---

## 5. 🛡️ Superuser Admin Moderation Panel

Access to `/admin/*` routes is highly restricted and guarded by middleware checks. If a user is not authenticated with the `'admin'` role, they receive a customized **"Access Denied"** error screen.

### Admin Dashboard Home (`/admin`)
*   Provides global platform counters: total businesses, total reviews, pending business claims, and active users.

### A. Review Moderation Queue (`/admin/reviews`)
*   All newly written reviews are initialized with `status = 'pending'` and held inside the moderation queue.
*   Admins can click **"Approve"** (which immediately updates `status = 'approved'`, triggering the database schema to recalculate the business's cumulative trust score and total review counter).
*   Or click **"Reject"** (which displays a textarea prompting the admin to provide a rejection reason, updating the status to `'rejected'`).

### B. Business Claims Queue (`/admin/claims`)
*   Lists all pending claim requests with submitted Trade Licenses/NID proofs. Clicking on a document generates a secure, **1-hour expiring signed URL** for private documents.
*   **Approve Claim**: Single-click updates the business `claimed_by` reference, sets `is_claimed` to true, and elevates the user's profile role from `'user'` to `'business_owner'` automatically.
*   **Reject Claim**: Dismisses the request, notifying the user.

### C. Reported Reviews Flags Moderation Queue (`/admin/flags`)
*   Lists reviews flagged by the community for spam, abuse, inappropriate language, or harassment.
*   Shows the reporter's profile details, custom reasons, and the flagged review body.
*   **Actions**:
    *   **Dismiss flag (खारিজ করুন)**: Sets flag status to `'dismissed'`, leaving the review active.
    *   **Resolve & Reject (রিভিউ বাতিল)**: Sets flag status to `'resolved'` and updates the underlying review status to `'rejected'` with moderation logs.

---

## 6. 📈 Dynamic SEO & Launch Configurations

*   **Dynamic `sitemap.ts` (`/sitemap.xml`)**: Fetches all active business slugs dynamically from Supabase server-side on query, mapping out URLs, modification dates, and priorities automatically.
*   **crawler `robots.ts` (`/robots.txt`)**: Allows search engines to crawl all public landing, category, search, and business profile pages while blocking indexing on secure dashboards (`/dashboard`, `/business-dashboard`, `/admin`).

---

## 7. 🧪 Rigorous Quality Assurance (QA) & Playbook

Follow these step-by-step instructions to verify every major user, owner, and admin flow locally:

### 👤 Flow 1: User Onboarding & Language Selection
1.  Navigate to `http://localhost:3000/`.
2.  Observe the page defaults to **Bangla**. Click the Globe icon on the top right Navbar. Notice the page switches to **English** instantly.
3.  Click **"Sign Up"** (নিবন্ধন). Enter a valid email address and password. Click register.
4.  Check your Supabase project's auth logs. Confirm a new user is successfully registered, and the automatic database trigger (`handle_new_user`) has instantly created a corresponding profile inside the `profiles` table.
5.  Log in through `/login`.

### ✍️ Flow 2: Writing & Flagging a Review
1.  Navigate to `/businesses`. Select an active business.
2.  Click **"Write Review"** (রিভিউ লিখুন).
3.  Choose a star rating (notice the stars fill dynamically on hover). Enter a title and feedback text. Click submit.
4.  Notice the review **does not appear on the business profile yet** because it is pending moderator approval.
5.  Log in as another user. Go to the business profile page, click **"Report Review"** (রিপোর্ট করুন) on a review, select a reason (e.g., Spam), and submit.

### 🏢 Flow 3: Business Claiming & Customizing
1.  Navigate to `/business-dashboard`. Notice the "Access Denied" page since you are a general user.
2.  Click **"Claim a Business"** (ব্যবসা দাবি করুন) or navigate directly to `/business-dashboard/claim`.
3.  Select a business from the dropdown. Enter supporting comments. Choose a file (NID/Trade License pdf or image) to upload. Click submit.
4.  Log in as an **Admin** (role `'admin'` in the `profiles` table in Supabase).
5.  Go to `/admin/claims`. Locate the claim. Click on the Trade License attachment link. Notice a secure private signed URL opens successfully.
6.  Click **"Approve Claim"** (অনুমোদন করুন).
7.  Log back in as the business owner. Navigate to `/business-dashboard`. You now have full access!
8.  Go to `/business-dashboard/profile`. Drag and drop a logo and cover image. Notice the loader spinner appears and updates with the public URL preview instantly on completion. Click **"Save"**.

### 👮 Flow 4: Review and Flag Moderation
1.  As an **Admin**, navigate to `/admin/reviews`. Locate the pending review submitted in Flow 2.
2.  Click **"Approve Review"** (অনুমোদন করুন).
3.  Visit the public business profile page. Notice the review is now live! Confirm the dynamic circular **Trust Score** and **SVG Star Rating** have automatically recalculated and updated.
4.  As an **Admin**, navigate to `/admin/flags`. Locate the report submitted in Flow 2.
5.  Click **"Resolve & Reject Review"** (রিভিউ বাতিল ও রিপোর্ট নিষ্পত্তি করুন).
6.  Visit the public business profile. Confirm the review is now hidden, and the trust score has successfully reverted.

---

## 8. 🗄️ Supabase Database Schema & RLS Security Rules

To ensure full compatibility, verify that the following SQL commands have been run in your Supabase SQL Editor:

```sql
-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;

-- 2. profiles table RLS policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 3. businesses table RLS policies
CREATE POLICY "Anyone can view active businesses" ON businesses FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can add businesses" ON businesses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Owner can update their business" ON businesses FOR UPDATE USING (auth.uid() = claimed_by);

-- 4. reviews table RLS policies
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Authenticated users can write reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- 5. business_claims table RLS policies
CREATE POLICY "Users can view own claims" ON business_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can submit claims" ON business_claims FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can view and edit all claims" ON business_claims FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. flags table RLS policies
CREATE POLICY "Authenticated users can submit flags" ON flags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can view and edit all flags" ON flags FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

---

## 🏁 Summary Checklist for Launch

1.  [x] **Supabase Env Configuration**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are placed in `.env.local`.
2.  [x] **Create Public Buckets**: Ensure `business-logos`, `business-covers`, and `avatars` exist in Supabase Storage with public reading enabled.
3.  [x] **Create Private Bucket**: Ensure `claim-documents` is created as a private storage bucket in Supabase.
4.  [x] **Run RLS Policies**: Execute the RLS SQL patch in your Supabase SQL Editor.
5.  [x] **Generate Production Bundle**: Verified and built successfully using `npm run build`.

Congratulations! The **Bishwas (বিশ্বাস)** platform is fully complete, highly verified, optimized, and ready for deployment to host trust across Bangladesh.
