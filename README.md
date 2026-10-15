# HD Fitness Studio

Official website and administrative console for **HD Fitness Studio**, Silapathar's premier strength, conditioning, and athletic performance center.

---

## 📍 Studio Location & Contact

- **Location**: Silapathar Kalyanpur, Above Jio Office (1st & 2nd Floor), Dhemaji, Assam – 787059
- **Phone / WhatsApp**: +91 9707288610
- **Email**: contact@hdfitnessstudio.in
- **Operating Hours**:
  - **Monday – Saturday**: 5:00 AM – 12:00 PM & 3:00 PM – 10:00 PM
  - **Sunday**: Closed

---

## 🚀 Features

- **Modern Responsive Landing Page**:
  - Hero section with live top promotional banner.
  - Interactive training programs and workout zones (Lifting Deck, HIIT Turf, Olympic Platforms).
  - Weekly class schedule with interactive day filtering.
  - Certified coaching staff showcases.
  - Transparent membership tier pricing.
  - Free 1-Day Trial Pass reservation modal connected directly to the database.
- **Admin Management Console (`/admin`)**:
  - **Secure Supabase Authentication**: Email and password sign-in with session management and persistent tokens.
  - **Live Dashboard**: Operations metrics (total weekly classes, active programs, coaches, active promos, leads count).
  - **Weekly Schedule Manager**: Add, edit, and delete daily training classes.
  - **Programs & Training Zones**: Manage fitness program offerings.
  - **Pricing & Membership Tiers**: Manage subscription rates and feature lists.
  - **Coaches & Trainers**: Manage trainer bios, specialties, and certifications.
  - **Homepage Hero Stats Editor**: Live visual editor for the 4 social proof milestone counters on the main hero section.
  - **Promotional Offers**: Launch flash discount campaigns and control the live announcement banner.
  - **Trial Leads Management**: View incoming free trial pass requests, update lead status (New, Contacted, Enrolled, Lost), and one-click WhatsApp outreach.
  - **Lead Export**: CSV export of prospective members.

---

## 🛠 Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (modern glassmorphism design system), Vanilla JavaScript (ES6+)
- **Icons**: Lucide Icons
- **Database & Authentication**: [Supabase](https://supabase.com) (PostgreSQL, Supabase Auth, Row Level Security)
- **Deployment**: Vercel ready (`vercel.json`)

---

## 📂 Project Structure

```text
├── admin/
│   └── index.html             # Admin console entrypoint (/admin/)
├── admin.html                 # Direct admin console page
├── assets/
│   ├── css/
│   │   ├── admin.css          # Admin panel styling & design system
│   │   └── style.css          # Public website styling
│   ├── images/                # Studio branding, logos, trainers & equipment photos
│   └── js/
│       ├── admin.js           # Admin controller & CRUD logic
│       ├── main.js            # Landing page interactions & modal controller
│       └── supabase-client.js # Supabase database & authentication client
├── index.html                 # Public website homepage
├── supabase_schema.sql        # PostgreSQL schema, tables, and RLS policies
└── vercel.json                # Vercel deployment configuration
```

---

## ⚡ Getting Started Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kuldeep-ai-dev/hd-fitness-studio.git
   cd hd-fitness-studio
   ```

2. **Run a local development server**:
   ```bash
   python3 -m http.server 3000
   ```

3. **Open in browser**:
   - Website: `http://localhost:3000`
   - Admin Console: `http://localhost:3000/admin/`

---

## 🚢 Deploying to Vercel

This repository is pre-configured and 100% hosting-ready for **Vercel**:

### Method 1: Via Vercel Dashboard (Recommended)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and import **`kuldeep-ai-dev/hd-fitness-studio`**.
3. Under **Framework Preset**, select **"Other"** (or leave default).
4. Root Directory: `./` (leave default).
5. Click **Deploy**.
6. Your site will be live immediately with SSL, global CDN, and automatic branch previews.

### Method 2: Via Vercel CLI
```bash
npm i -g vercel
vercel
```

The bundled [`vercel.json`](vercel.json) automatically handles clean URLs, `/admin` rewrites, and security headers.

---

## 🔒 Database Setup

The database schema, tables (`studio_stats`, `coaches`, `programs`, `classes`, `membership_plans`, `offers`, `trial_bookings`), and Row Level Security (RLS) policies are documented in [`supabase_schema.sql`](supabase_schema.sql).
