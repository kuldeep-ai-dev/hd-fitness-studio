-- ====================================================================
-- HD FITNESS STUDIO - SUPABASE DATABASE SCHEMA & SEED DATA
-- Project: rxunwbwcgbcistubdngp.supabase.co
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rxunwbwcgbcistubdngp/sql/new
-- ====================================================================

-- 1. Coaches Table
CREATE TABLE IF NOT EXISTS public.coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  specialties TEXT NOT NULL,
  experience TEXT NOT NULL,
  certifications TEXT NOT NULL,
  image_url TEXT,
  instagram TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Programs Table
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  badge TEXT,
  description TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  intensity TEXT NOT NULL,
  duration TEXT NOT NULL,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Classes / Weekly Schedule Table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  coach_name TEXT NOT NULL,
  zone TEXT NOT NULL,
  capacity INT DEFAULT 20,
  intensity TEXT DEFAULT 'High',
  category TEXT DEFAULT 'strength',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Membership Plans Table
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  badge TEXT,
  price_monthly NUMERIC NOT NULL,
  price_annual_monthly NUMERIC NOT NULL,
  billing_period_text TEXT DEFAULT 'per month',
  description TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Offers / Announcements Table
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  banner_text TEXT NOT NULL,
  cta_text TEXT DEFAULT 'Claim Now →',
  cta_link TEXT DEFAULT '#trial-modal',
  discount_code TEXT,
  discount_percentage INT DEFAULT 0,
  valid_until TEXT,
  is_active BOOLEAN DEFAULT true,
  show_top_banner BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Trial Bookings / Leads Table
CREATE TABLE IF NOT EXISTS public.trial_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  goal TEXT,
  preferred_slot TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Homepage Hero Stat Counters Table
CREATE TABLE IF NOT EXISTS public.studio_stats (
  id TEXT PRIMARY KEY DEFAULT 'hero_stats',
  stat1_number TEXT NOT NULL DEFAULT '1,800+',
  stat1_label TEXT NOT NULL DEFAULT 'Active Members',
  stat2_number TEXT NOT NULL DEFAULT '2 Floors',
  stat2_label TEXT NOT NULL DEFAULT 'Spacious Arena',
  stat3_number TEXT NOT NULL DEFAULT '15+',
  stat3_label TEXT NOT NULL DEFAULT 'Elite Coaches',
  stat4_number TEXT NOT NULL DEFAULT '100%',
  stat4_label TEXT NOT NULL DEFAULT 'Results Driven',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read & management with publishable/anon key
DROP POLICY IF EXISTS "Allow public read studio_stats" ON public.studio_stats;
DROP POLICY IF EXISTS "Allow all studio_stats" ON public.studio_stats;
CREATE POLICY "Allow public read studio_stats" ON public.studio_stats FOR SELECT USING (true);
CREATE POLICY "Allow all studio_stats" ON public.studio_stats FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public read coaches" ON public.coaches;
DROP POLICY IF EXISTS "Allow all coaches" ON public.coaches;
CREATE POLICY "Allow public read coaches" ON public.coaches FOR SELECT USING (true);
CREATE POLICY "Allow all coaches" ON public.coaches FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read programs" ON public.programs;
DROP POLICY IF EXISTS "Allow all programs" ON public.programs;
CREATE POLICY "Allow public read programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Allow all programs" ON public.programs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read classes" ON public.classes;
DROP POLICY IF EXISTS "Allow all classes" ON public.classes;
CREATE POLICY "Allow public read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Allow all classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read membership_plans" ON public.membership_plans;
DROP POLICY IF EXISTS "Allow all membership_plans" ON public.membership_plans;
CREATE POLICY "Allow public read membership_plans" ON public.membership_plans FOR SELECT USING (true);
CREATE POLICY "Allow all membership_plans" ON public.membership_plans FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read offers" ON public.offers;
DROP POLICY IF EXISTS "Allow all offers" ON public.offers;
CREATE POLICY "Allow public read offers" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Allow all offers" ON public.offers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert trial_bookings" ON public.trial_bookings;
DROP POLICY IF EXISTS "Allow all trial_bookings" ON public.trial_bookings;
CREATE POLICY "Allow public insert trial_bookings" ON public.trial_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all trial_bookings" ON public.trial_bookings FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- SEED INITIAL GYM DATA
-- ====================================================================

-- Coaches
INSERT INTO public.coaches (name, role, specialties, experience, certifications, image_url, instagram, display_order)
VALUES 
  ('Vikram "Vick" Sharma', 'Head Strength & Conditioning Coach', 'Olympic Weightlifting, Hypertrophy, Athlete Prep', '9+ Years', 'CSCS, NSCA, K-11 Master', 'assets/images/trainer_head.png', '@vick_hd_fitness', 1),
  ('Ananya Roy', 'Lead HIIT & Functional Performance', 'Metabolic Conditioning, Functional Turf, Fat Loss', '6+ Years', 'ACE Certified, CrossFit L2', 'assets/images/trainer_coach.png', '@ananya_roy_fit', 2),
  ('Rahul Das', 'CrossFit & Mobility Specialist', 'Kettlebells, Movement Flow, Joint Prehab', '5+ Years', 'CrossFit L1, FMS Level 2', 'assets/images/trainer_head.png', '@rahul_movement', 3)
ON CONFLICT DO NOTHING;

-- Programs
INSERT INTO public.programs (title, category, badge, description, features, intensity, duration, image_url, display_order)
VALUES
  ('Hypertrophy & Strength', 'Strength & Conditioning', 'Most Popular', 'Engineered compound lifting, periodized progression, and targeted muscle hypertrophy with competition-grade Eleiko bars.', '["Deadlift & Squat Platforms", "Bilateral Barbell Work", "Progressive Overload Tracking", "Form Video Breakdown"]'::jsonb, 'High', '60 Mins', 'assets/images/strength.png', 1),
  ('Metabolic HIIT & Turf', 'Endurance & Fat Loss', 'High Intensity', 'Sprint intervals, battle ropes, prowler sled pushes, and plyometrics on our 30-meter high-friction turf field.', '["30m Functional Turf Arena", "Prowler Sleds & Battle Ropes", "Heart Rate Zone Tracking", "Calorie Burn Maximizer"]'::jsonb, 'Extreme', '45 Mins', 'assets/images/turf.png', 2),
  ('CrossFit WOD & Kettlebells', 'Functional Fitness', 'All Levels', 'Constant functional variation across gymnastics, Olympic lifting, and metabolic conditioning in our open rig.', '["Custom Rogue Pull-up Rig", "Competition Kettlebells", "Daily WOD Leaderboard", "Scalable for Beginners"]'::jsonb, 'High', '55 Mins', 'assets/images/hero.png', 3),
  ('Athletic Conditioning & Core', 'Functional Fitness', 'All Levels', 'Dynamic core work, mobility restoration, and calisthenic endurance circuits to maximize overall athletic output.', '["Core Stability & Rig Work", "Kettlebell Movement Flows", "Joint Prehab & Stretching", "Active Movement Restoration"]'::jsonb, 'Moderate', '45 Mins', 'assets/images/wellness.png', 4)
ON CONFLICT DO NOTHING;

-- Weekly Schedule Classes (Monday to Saturday; Sunday Closed)
INSERT INTO public.classes (title, day_of_week, start_time, end_time, coach_name, zone, capacity, intensity, category, display_order)
VALUES
  ('Morning Barbell Strength', 'Monday', '06:30 AM', '07:30 AM', 'Vikram Sharma', 'Lifting Deck', 16, 'High', 'strength', 1),
  ('HIIT Turf Inferno', 'Monday', '08:00 AM', '08:45 AM', 'Ananya Roy', 'Turf Zone', 20, 'Extreme', 'hiit', 2),
  ('Evening CrossFit WOD', 'Monday', '06:30 PM', '07:30 PM', 'Rahul Das', 'CrossFit Rig', 18, 'Extreme', 'crossfit', 3),
  ('Mobility & Prehab Flow', 'Tuesday', '07:00 AM', '07:45 AM', 'Rahul Das', 'Recovery Area', 15, 'Moderate', 'mobility', 1),
  ('Olympic Clean & Snatch', 'Tuesday', '06:00 PM', '07:15 PM', 'Vikram Sharma', 'Lifting Deck', 12, 'High', 'strength', 2),
  ('Prowler Sled Cardio Blast', 'Wednesday', '07:00 AM', '07:50 AM', 'Ananya Roy', 'Turf Zone', 20, 'Extreme', 'hiit', 1),
  ('Deadlift Precision Clinic', 'Wednesday', '06:30 PM', '07:30 PM', 'Vikram Sharma', 'Lifting Deck', 14, 'High', 'strength', 2),
  ('CrossFit Engine & Rowers', 'Thursday', '06:30 AM', '07:30 AM', 'Rahul Das', 'CrossFit Rig', 18, 'High', 'crossfit', 1),
  ('Glute & Core Forge', 'Thursday', '06:00 PM', '06:50 PM', 'Ananya Roy', 'Functional Turf', 20, 'Moderate', 'strength', 2),
  ('Friday Heavy Compound PRs', 'Friday', '06:30 PM', '07:45 PM', 'Vikram Sharma', 'Lifting Deck', 16, 'Extreme', 'strength', 1),
  ('Saturday Super Turf Team Challenge', 'Saturday', '08:00 AM', '09:15 AM', 'Vikram & Ananya', 'Main Floor', 28, 'Extreme', 'hiit', 1),
  ('Saturday Mobility & Core Workshop', 'Saturday', '05:30 PM', '06:30 PM', 'Rahul Das', 'Main Floor', 18, 'Moderate', 'mobility', 2)
ON CONFLICT DO NOTHING;

-- Membership Plans
INSERT INTO public.membership_plans (name, badge, price_monthly, price_annual_monthly, billing_period_text, description, features, is_featured, display_order)
VALUES
  ('Standard Pass', '', 2499, 1999, 'per month', 'Full access to gym floor, cardio deck, and locker rooms during all operating hours.', '["Unlimited gym floor & strength arena access", "Free 1-on-1 coach fitness induction", "Locker room & high-pressure showers", "Standard HD fitness mobile tracking", "No long-term lock-in contract"]'::jsonb, false, 1),
  ('Pro Performance', 'Most Popular', 3999, 3199, 'per month', 'Complete all-inclusive fitness package with group classes and functional turf arena.', '["Everything in Standard Pass", "Unlimited HIIT, CrossFit & group classes", "Functional turf & Olympic platform access", "Monthly personalized coach consultation", "Complimentary locker & shower access", "Exclusive HD Athletic Tee upon signup"]'::jsonb, true, 2),
  ('VIP Elite Coaching', 'VIP Exclusive', 6999, 5599, 'per month', 'Dedicated personal coach, bespoke nutrition programming, and priority floor support.', '["Everything in Pro Performance", "8x 1-on-1 Personal Training sessions / mo", "Personalized macro & nutrition protocol", "Priority locker & VIP booking privileges", "Priority booking for workshops & events", "Guaranteed body transformation timeline"]'::jsonb, false, 3)
ON CONFLICT DO NOTHING;

-- Offers
INSERT INTO public.offers (title, banner_text, cta_text, cta_link, discount_code, discount_percentage, valid_until, is_active, show_top_banner)
VALUES
  ('Silapathar Fitness Launch: Free 1-Day Trial Pass', 'LIMITED PASSES: Claim your Free 1-Day Trial Pass this week!', 'Claim Now →', '#trial-modal', 'HDFREE', 100, 'End of Month', true, true)
ON CONFLICT DO NOTHING;

-- Studio Stats (Hero Social Proof Counters)
INSERT INTO public.studio_stats (id, stat1_number, stat1_label, stat2_number, stat2_label, stat3_number, stat3_label, stat4_number, stat4_label)
VALUES ('hero_stats', '1,800+', 'Active Members', '2 Floors', 'Spacious Arena', '15+', 'Elite Coaches', '100%', 'Results Driven')
ON CONFLICT (id) DO NOTHING;
