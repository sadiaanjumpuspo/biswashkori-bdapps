# 🛡️ BiswashKori (বিশ্বাষকরি) — BDApps Trust & Review Platform

> **Trusted Reviews, Right Decisions** — Bangladesh's premier independent business reviews platform integrated with BDApps carrier billing for Robi and Cirkle subscribers.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)](https://supabase.com/)
[![BDApps](https://img.shields.io/badge/BDApps-APP__140029-red)](https://bdapps.com/)

---

## 📖 Overview

**BiswashKori** is a modern Next.js web application tailored for Bangladeshi consumers and business owners. It provides authentic customer reviews, business verification tools, and a mathematical **Trust Score** algorithm to calculate company credibility objectively.

Integrated seamlessly with **BDApps Gateway**, subscribers on **Robi** and **Cirkle** networks can authenticate via 1-tap OTP and access verified review tools for **2.78 BDT / day (VAT incl.)**.

---

## ✨ Key Features

- 🌟 **Automated Trust Score**: Calculates dynamic business ratings based on review volume, weighted averages, and recency.
- 📱 **BDApps OTP Authentication**: Fast carrier billing authentication for Robi and Cirkle subscribers via `APP_140029`.
- 🏢 **Business Registration & Claiming**: Allows business owners to submit new listings (`/businesses/new`), claim existing profiles, and upload official verification documents.
- 🛡️ **Review Moderation Queue**: Admin dashboard (`/admin/reviews`) to review, approve, or reject customer feedback and recalculate trust scores automatically.
- 🌐 **Bilingual Support**: Fully translated in Bangla (**Anek Bangla** font) and English with instant language toggling.
- 🌓 **Dark Mode Support**: System-aware light/dark theme switching.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4, Lucide Icons, Framer Motion
- **Database & Auth**: Supabase PostgreSQL, Row Level Security (RLS)
- **Carrier Billing**: BDApps PHP Gateway API Proxy (`https://bdappsdigitalapps.com/BishwasKori`)
- **Typography**: Anek Bangla, Hind Siliguri, DM Sans

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+ or 20+
- npm, pnpm, or yarn

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# BDApps Gateway API
NEXT_PUBLIC_BDAPPS_BASE_URL=https://bdappsdigitalapps.com/BishwasKori
NEXT_PUBLIC_BDAPPS_APP_ID=APP_140029
NEXT_PUBLIC_BDAPPS_APP_PASSWORD=your-bdapps-password
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```text
bishwaskori/
├── messages/                   # i18n Translation dictionary (bn.json, en.json)
├── src/
│   ├── app/                    # Next.js App Router Pages
│   │   ├── (auth)/             # Login & Signup routes
│   │   ├── admin/              # Super-Admin Moderation Portal
│   │   ├── api/bdapps/         # BDApps Serverless Proxy Endpoint
│   │   ├── business/[slug]/    # Business Profile & Review Submission
│   │   ├── businesses/new/     # User Business Registration Form
│   │   └── dashboard/          # Subscriber Account Dashboard
│   ├── components/             # Reusable UI & Modal Components
│   ├── hooks/                  # React Custom Hooks
│   └── lib/                    # Supabase Client & BDApps Context Provider
├── faq_BiswashKori_SadiaAnjumPuspo.tex  # LaTeX BDApps Detail Sheet
└── schema.sql                  # PostgreSQL Database Schema
```

---

## 🔐 Admin Credentials

- **Authorized Admin Phone**: `01878932651` / `8801878932651`
- **Admin Portal**: Access [`/admin`](http://localhost:3000/admin) to manage reviews, flags, business claims, and verification badges.

---

## 📜 License

Developed for **BDApps Challenge / Sadia Puspo** (`sadiapuspo`). All rights reserved.
