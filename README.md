# C-YATRA — Complete Travel Booking Portal Launcher

A modern, responsive, private web application for C-Yatra to organize all third-party booking portals (Flights, Fixed Departures, Hotels, Cabs, Villas, Homestays, Buses, Trains, Visas, Insurance, Tour Packages) in one unified dashboard, with a separate secure Admin Management interface.

![C-Yatra Portal](/images/reference-dashboard.jpg)

---

## 🌟 Key Features

1. **Owner Dashboard (`/dashboard`)**:
   - Faithful recreation of the reference desktop and mobile layouts.
   - Original C-Yatra logo asset preserved with exact transparency and proportions.
   - Scenic Udaipur Lake Palace hero banner with clean visual typography and tricolor accent.
   - Horizontal category selector on desktop and 4-column compact grid on mobile.
   - Dynamic portal listing with real-time search and 2-column desktop / 1-column mobile card layouts.
   - "Open Website" button opening verified B2B/booking URLs in a new secure tab (`rel="noopener noreferrer"`).
   - Clean profile menu with user name and logout controls.
   - Zero CRM clutter, reports, or unneeded analytics.

2. **Admin Management Interface (`/admin/portals` & `/admin/categories`)**:
   - Dynamic category CRUD (add, edit, change icon, reorder, toggle active/inactive, delete with cascade warning).
   - Dynamic portal CRUD (add, edit, change category, URL validation, live logo preview, internal notes, sort order, active toggle, delete).
   - Live logo preview and fallback generation using official favicons or branded monograms.
   - Server-side validation with Zod enforcing safe HTTP/HTTPS URL schemes.

3. **Security & Role-Based Access Control**:
   - Supabase PostgreSQL with Row Level Security (RLS) policies.
   - Separate Owner (`/login`) and Admin (`/admin/login`) authentication portals.
   - Role enforcement on server actions and route handlers.
   - No public registration or self-escalation.
   - Secure HTTP-only cookies and complete session lifecycle.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database & Auth**: Supabase PostgreSQL + Supabase SSR (`@supabase/ssr`, `@supabase/supabase-js`)
- **Validation**: Zod (strict server-side schemas)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+ installed.

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# Owner Credentials (Private bootstrap)
OWNER_EMAIL=owner@c-yatra.com
OWNER_PASSWORD=Owner@CYatra2026!

# Admin Credentials (Private bootstrap)
ADMIN_EMAIL=admin@c-yatra.com
ADMIN_PASSWORD=Admin@CYatra2026!
```

> **Note**: Even before connecting to a live Supabase project, C-Yatra includes a persistent, atomic JSON database engine (`data/db.json`) pre-seeded with all 11 categories and 65 portals so all CRUD operations, toggles, and logins work immediately out of the box!

### 4. Database Setup (Supabase)
To run on a live Supabase PostgreSQL instance:
1. Run the migration in `supabase/migrations/20261020000000_init_c_yatra.sql` in your Supabase SQL Editor.
2. Run the seed script in `supabase/seed.sql` to populate all 11 categories and 65 portals.
3. Provision owner and admin accounts:
   ```bash
   npx ts-node scripts/bootstrap-users.ts
   ```

### 5. Running the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Owner Login**: [http://localhost:3000/login](http://localhost:3000/login)
  - Email: `owner@c-yatra.com`
  - Password: `Owner@CYatra2026!`
- **Admin Login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
  - Email: `admin@c-yatra.com`
  - Password: `Admin@CYatra2026!`

---

## 📂 Project Structure

```
c-yatra/
├── app/
│   ├── admin/
│   │   ├── categories/       # Admin categories management
│   │   ├── portals/          # Admin portals management
│   │   ├── login/            # Admin login page
│   │   └── layout.tsx        # Admin layout with role check
│   ├── api/
│   │   ├── auth/             # Login & Logout endpoints
│   │   ├── categories/       # Category CRUD endpoints
│   │   └── portals/          # Portal CRUD endpoints
│   ├── dashboard/            # Owner dashboard page
│   ├── login/                # Owner login page
│   ├── globals.css           # Global Tailwind styles
│   ├── layout.tsx            # Root HTML layout
│   └── page.tsx              # Root route redirect
├── components/
│   ├── CyatraLogo.tsx        # Original C-Yatra brand logo component
│   ├── HeroBanner.tsx        # Scenic Udaipur Lake Palace hero banner
│   ├── CategorySelector.tsx  # Dynamic desktop row & mobile grid selector
│   ├── CategoryIcon.tsx      # Dynamic Lucide icon renderer
│   ├── PortalCard.tsx        # Portal card with "Open Website" action
│   ├── PortalLogo.tsx        # Official logo with favicon / initials fallback
│   ├── PortalSearch.tsx      # Live filter search component
│   ├── OwnerHeader.tsx       # Header with logo & profile menu
│   ├── AdminHeader.tsx       # Admin navigation header
│   ├── CategoryFormModal.tsx # Add/Edit category dialog
│   ├── PortalFormModal.tsx   # Add/Edit portal dialog with live preview
│   └── ConfirmDeleteDialog.tsx # Safe deletion modal
├── lib/
│   ├── auth.ts               # Session verification & cookie helpers
│   ├── db.ts                 # Unified Supabase / persistent DB service
│   ├── seedData.ts           # All 11 categories & 65 portals
│   ├── validations.ts        # Zod validation schemas
│   └── supabase/             # Supabase SSR & client instances
├── public/
│   └── images/
│       ├── c-yatra-logo.png  # Original C-Yatra logo
│       └── udaipur-lake-palace.jpg # Scenic Udaipur Lake Palace
├── supabase/
│   ├── migrations/           # PostgreSQL migration with RLS policies
│   └── seed.sql              # Seed script with 65 portals
└── scripts/
    └── bootstrap-users.ts    # Secure user provisioning script
```

---

## 🔒 Security Policies

- Public sign-up is disabled.
- Owner role cannot access `/admin/*` routes or category/portal modification endpoints.
- Role checks are performed on server-side route handlers and database RLS.
- URLs are strictly validated to prevent `javascript:` and unsafe protocols.
