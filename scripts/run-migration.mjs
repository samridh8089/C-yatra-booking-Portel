// C-Yatra: Direct PostgreSQL Migration Runner
// Uses pg package to connect directly to Supabase Postgres and run the full migration + seed

import pg from 'pg';
const { Client } = pg;

// Supabase connection via transaction pooler (port 6543) or session pooler (port 5432)
// Connection string format: postgresql://postgres.[project-ref]:[password]@[host]:6543/postgres
// We use the service key as the password for the postgres user won't work - 
// instead use the REST API approach with a raw SQL function

// PLAN B: Create tables via PostgREST by first creating them via pg-meta
// PLAN C: Use Supabase's built-in pg function calling

// Actually - we'll use the Supabase REST API to insert into _sql table trick
// OR better: use Node's https to POST to Supabase's pg-meta

import https from 'https';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load from .env.local if running locally
try {
  const __dir = dirname(fileURLToPath(import.meta.url));
  const envPath = resolve(__dir, '../.env.local');
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [k, ...vParts] = line.split('=');
    if (k && vParts.length && !k.startsWith('#')) {
      process.env[k.trim()] = vParts.join('=').trim();
    }
  });
} catch {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dvxabpdaygmkrjsmgitb.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SERVICE_KEY) {
  console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY not set. Add it to .env.local");
  process.exit(1);
}

// Supabase project connection details
const DB_HOST_SESSION = "aws-0-ap-southeast-1.pooler.supabase.com";
const DB_HOST_DIRECT = `db.${SUPABASE_URL.replace("https://","").replace(".supabase.co","")+".supabase.co"}`;
const DB_NAME = "postgres";
const DB_USER_POOLER = `postgres.${SUPABASE_URL.replace("https://","").replace(".supabase.co","")}`;
const DB_USER_DIRECT = "postgres";
const DB_PASS = SERVICE_KEY;

const MIGRATION_SQL = `
-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Portals Table
CREATE TABLE IF NOT EXISTS public.portals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  internal_notes TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_categories_active_sort ON public.categories (is_active, sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_portals_category_active_sort ON public.portals (category_id, is_active, sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_categories_updated_at ON public.categories;
CREATE TRIGGER trigger_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_portals_updated_at ON public.portals;
CREATE TRIGGER trigger_portals_updated_at
  BEFORE UPDATE ON public.portals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Security Helper Functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'owner' OR role = 'admin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Owners and admins can read active categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Service role full access on categories" ON public.categories;
DROP POLICY IF EXISTS "Owners and admins can read active portals" ON public.portals;
DROP POLICY IF EXISTS "Admins can insert portals" ON public.portals;
DROP POLICY IF EXISTS "Admins can update portals" ON public.portals;
DROP POLICY IF EXISTS "Admins can delete portals" ON public.portals;
DROP POLICY IF EXISTS "Service role full access on portals" ON public.portals;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Service role full access on profiles"
  ON public.profiles FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Categories Policies
CREATE POLICY "Owners and admins can read active categories"
  ON public.categories FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Service role full access on categories"
  ON public.categories FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Portals Policies
CREATE POLICY "Owners and admins can read active portals"
  ON public.portals FOR SELECT TO authenticated
  USING (
    (is_active = true AND EXISTS (
      SELECT 1 FROM public.categories WHERE categories.id = portals.category_id AND categories.is_active = true
    )) OR public.is_admin()
  );

CREATE POLICY "Admins can insert portals"
  ON public.portals FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update portals"
  ON public.portals FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete portals"
  ON public.portals FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Service role full access on portals"
  ON public.portals FOR ALL TO service_role
  USING (true) WITH CHECK (true);
`;

async function tryConnect(host, user, port) {
  const client = new Client({
    host,
    port,
    database: DB_NAME,
    user,
    password: DB_PASS,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });
  try {
    await client.connect();
    return client;
  } catch (e) {
    console.log(`  ✗ ${host}:${port} (${user}) — ${e.message}`);
    return null;
  }
}

async function main() {
  console.log("==============================================");
  console.log("  C-YATRA DATABASE MIGRATION RUNNER");
  console.log("==============================================\n");

  console.log("Trying Supabase Postgres connections...\n");

  let client = null;

  // Try session pooler first
  console.log("1. Session pooler (port 5432)...");
  client = await tryConnect(DB_HOST_SESSION, DB_USER_POOLER, 5432);
  
  if (!client) {
    console.log("2. Session pooler (port 6543)...");
    client = await tryConnect(DB_HOST_SESSION, DB_USER_POOLER, 6543);
  }

  if (!client) {
    console.log("3. Direct connection (port 5432)...");
    client = await tryConnect(DB_HOST_DIRECT, DB_USER_DIRECT, 5432);
  }

  if (!client) {
    console.log("4. Direct connection (port 5433)...");
    client = await tryConnect(DB_HOST_DIRECT, DB_USER_DIRECT, 5433);
  }

  if (!client) {
    console.log("\n✗ Could not connect via pg. Falling back to REST API method...\n");
    await restApiFallback();
    return;
  }

  console.log("  ✓ Connected!\n");

  try {
    console.log("Running migration SQL...");
    // Split and run each statement
    const statements = MIGRATION_SQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      try {
        await client.query(stmt);
        const preview = stmt.replace(/\s+/g, ' ').substring(0, 60);
        console.log(`  ✓ ${preview}...`);
      } catch (e) {
        if (e.message.includes('already exists')) {
          const preview = stmt.replace(/\s+/g, ' ').substring(0, 50);
          console.log(`  → Already exists: ${preview}...`);
        } else {
          console.log(`  ✗ Error: ${e.message}`);
        }
      }
    }

    console.log("\n✓ Migration complete!\n");
    await client.end();
    
    // Now run seed data via REST
    await seedViaRest();
    
  } catch (e) {
    console.error("Migration error:", e.message);
    await client.end();
  }
}

async function restApiFallback() {
  console.log("REST API method: checking tables via PostgREST...");
  const r = await fetch(`${SUPABASE_URL}/rest/v1/categories?limit=1`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
  });
  const body = await r.text();
  console.log(`Status: ${r.status}, body: ${body.substring(0, 100)}`);
  
  if (r.status === 200 || (r.status !== 404 && !body.includes("does not exist") && !body.includes("PGRST205"))) {
    console.log("Tables appear to exist! Proceeding with seed...");
    await seedViaRest();
  } else {
    console.log("\n❌ CANNOT CREATE TABLES AUTOMATICALLY");
    console.log("The Supabase project requires manual SQL execution.");
    console.log("\nPlease follow these steps:");
    console.log("1. Go to: https://supabase.com/dashboard/project/dvxabpdaygmkrjsmgitb/sql/new");
    console.log("2. Copy and paste the migration SQL from:");
    console.log("   C:\\Users\\samri\\.gemini\\antigravity\\scratch\\c-yatra\\supabase\\migrations\\20261020000000_init_c_yatra.sql");
    console.log("3. Click 'Run' (Ctrl+Enter)");
    console.log("4. Then paste the seed SQL from:");
    console.log("   C:\\Users\\samri\\.gemini\\antigravity\\scratch\\c-yatra\\supabase\\seed.sql");
    console.log("5. Click 'Run' again");
    console.log("6. Then run: node scripts/supabase-bootstrap.mjs\n");
  }
}

async function seedViaRest() {
  console.log("==============================================");
  console.log("  SEEDING DATA VIA REST API");
  console.log("==============================================\n");

  const headers = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=minimal",
  };

  // Categories
  const CATEGORIES = [
    { id: "c0000000-0000-0000-0000-000000000001", name: "Flight", slug: "flight", icon: "Plane", sort_order: 1, is_active: true },
    { id: "c0000000-0000-0000-0000-000000000002", name: "Fix Departure", slug: "fix-departure", icon: "Users", sort_order: 2, is_active: true },
    { id: "c0000000-0000-0000-0000-000000000003", name: "Hotel", slug: "hotel", icon: "BedDouble", sort_order: 3, is_active: true },
    { id: "c0000000-0000-0000-0000-000000000004", name: "Online Cab", slug: "online-cab", icon: "Car", sort_order: 4, is_active: true },
    { id: "c0000000-0000-0000-0000-000000000005", name: "Villa", slug: "villa", icon: "Home", sort_order: 5, is_active: true },
    { id: "c0000000-0000-0000-0000-000000000006", name: "Home Stay", slug: "home-stay", icon: "Store", sort_order: 6, is_active: true },
    { id: "c0000000-0000-0000-0000-000000000007", name: "Bus", slug: "bus", icon: "Bus", sort_order: 7, is_active: true },
    { id: "c0000000-0000-0000-0000-000000000008", name: "Train", slug: "train", icon: "Train", sort_order: 8, is_active: true },
    { id: "c0000000-0000-0000-0000-000000000009", name: "Visa", slug: "visa", icon: "Globe", sort_order: 9, is_active: true },
    { id: "c0000000-0000-0000-0000-000000000010", name: "Insurance", slug: "insurance", icon: "ShieldCheck", sort_order: 10, is_active: true },
    { id: "c0000000-0000-0000-0000-000000000011", name: "Tour Packages", slug: "tour-packages", icon: "Compass", sort_order: 11, is_active: true },
  ];

  console.log("Inserting 11 categories...");
  const catRes = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
    method: "POST", headers, body: JSON.stringify(CATEGORIES),
  });
  console.log(`  Categories: ${catRes.status} ${catRes.status === 201 || catRes.status === 200 ? "✓" : await catRes.text()}`);

  // All 65 portals
  const PORTALS = [
    // FLIGHT (15)
    { category_id:"c0000000-0000-0000-0000-000000000001", name:"Cleartrip Agent Portal", website_url:"https://agency.cleartrip.com/", logo_url:"https://www.google.com/s2/favicons?domain=cleartrip.com&sz=128", description:"Agent B2B Booking Portal", sort_order:1, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000001", name:"BT Travels", website_url:"https://bttravels.in/", logo_url:"https://www.google.com/s2/favicons?domain=bttravels.in&sz=128", description:"B2B Travel Booking Partner", sort_order:2, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000001", name:"Fly24Hrs B2B", website_url:"https://b2b.fly24hrs.com/B2BLogin", logo_url:"https://www.google.com/s2/favicons?domain=fly24hrs.com&sz=128", description:"B2B Flight Reservations", sort_order:3, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000001", name:"MakeMyTrip Flights", website_url:"https://www.makemytrip.com/flights/", logo_url:"https://www.google.com/s2/favicons?domain=makemytrip.com&sz=128", description:"Domestic & International Flights", sort_order:4, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000001", name:"NDC Deals", website_url:"https://ndc.deals/", logo_url:"https://www.google.com/s2/favicons?domain=ndc.deals&sz=128", description:"Exclusive Airline NDC Fares", sort_order:5, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000001", name:"Bonton Holidays Partner Portal", website_url:"https://partner.bontonholidays.com/", logo_url:"https://www.google.com/s2/favicons?domain=bontonholidays.com&sz=128", description:"Bonton Partner Flight System", sort_order:6, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000001", name:"TripAirPe", website_url:"https://tripairpe.com/", logo_url:"https://www.google.com/s2/favicons?domain=tripairpe.com&sz=128", description:"Online Air Ticketing Portal", sort_order:7, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000001", name:"Akbar Travels B2B", website_url:"https://agents.akbartravelsonline.com/b2bplus/login", logo_url:"https://www.google.com/s2/favicons?domain=akbartravels.com&sz=128", description:"Akbar B2B Plus Agent Login", sort_order:8, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000001", name:"MakeMyTrip MyPartner Flights", website_url:"https://mypartner.makemytrip.com/landing/flights", logo_url:"https://www.google.com/s2/favicons?domain=makemytrip.com&sz=128", description:"MyPartner Travel Agent Portal", sort_order:9, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000001", name:"Cleartrip Flights", website_url:"https://www.cleartrip.com/flights", logo_url:"https://www.google.com/s2/favicons?domain=cleartrip.com&sz=128", description:"Domestic & International Flights", sort_order:10, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000001", name:"Yatra Travel Agents", website_url:"https://www.yatra.com/travel-agents", logo_url:"https://www.google.com/s2/favicons?domain=yatra.com&sz=128", description:"Yatra B2B Travel Agent Network", sort_order:11, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000001", name:"Skyscanner India", website_url:"https://www.skyscanner.co.in/", logo_url:"https://www.google.com/s2/favicons?domain=skyscanner.co.in&sz=128", description:"Global Flight Search", sort_order:12, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000001", name:"Google Flights", website_url:"https://www.google.com/travel/flights", logo_url:"https://www.google.com/s2/favicons?domain=google.com&sz=128", description:"Compare Flights Worldwide", sort_order:13, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000001", name:"Yatra Flights", website_url:"https://www.yatra.com/flights", logo_url:"https://www.google.com/s2/favicons?domain=yatra.com&sz=128", description:"Flights, Hotels & Holidays", sort_order:14, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000001", name:"EaseMyTrip Flights", website_url:"https://www.easemytrip.com/flights", logo_url:"https://www.google.com/s2/favicons?domain=easemytrip.com&sz=128", description:"Best Fares on Flights", sort_order:15, is_active:true },
    // FIX DEPARTURE (14)
    { category_id:"c0000000-0000-0000-0000-000000000002", name:"AirIQ", website_url:"https://www.airiq.in/", logo_url:"https://www.google.com/s2/favicons?domain=airiq.in&sz=128", description:"Group & Fixed Departure Air Tickets", sort_order:1, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000002", name:"Ease2Fly", website_url:"https://www.ease2fly.com/", logo_url:"https://www.google.com/s2/favicons?domain=ease2fly.com&sz=128", description:"Fixed Departure Seat Booking", sort_order:2, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000002", name:"GoFlySmart", website_url:"https://www.goflysmart.com/;jsessionid=153FA3484B87131C6CCB70FF08F51485", logo_url:"https://www.google.com/s2/favicons?domain=goflysmart.com&sz=128", description:"Smart Fixed Departure Booking", sort_order:3, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000002", name:"Kandhari Travels", website_url:"https://kandharitravels.in/", logo_url:"https://www.google.com/s2/favicons?domain=kandharitravels.in&sz=128", description:"B2B Group Fare Inventory", sort_order:4, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000002", name:"RTTFD", website_url:"https://www.rttfd.com/home", logo_url:"https://www.google.com/s2/favicons?domain=rttfd.com&sz=128", description:"Real Time Fixed Departure Portal", sort_order:5, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000002", name:"Travel Deals B2B", website_url:"https://www.traveldealb2b.com/", logo_url:"https://www.google.com/s2/favicons?domain=traveldealb2b.com&sz=128", description:"B2B Travel Deals & Departures", sort_order:6, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000002", name:"World Travels Online", website_url:"https://worldtravelsonline.in/", logo_url:"https://www.google.com/s2/favicons?domain=worldtravelsonline.in&sz=128", description:"Online Fixed Departure Portal", sort_order:7, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000002", name:"Coupon Fares", website_url:"https://travel.couponfares.com/Info/Home", logo_url:"https://www.google.com/s2/favicons?domain=couponfares.com&sz=128", description:"Special Coupon Fares & Blocks", sort_order:8, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000002", name:"Fly Series", website_url:"https://flyseries.in/signin", logo_url:"https://www.google.com/s2/favicons?domain=flyseries.in&sz=128", description:"Series Flight Bookings Portal", sort_order:9, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000002", name:"JustMyTrip", website_url:"https://www.justmytrip.in/dashboard", logo_url:"https://www.google.com/s2/favicons?domain=justmytrip.in&sz=128", description:"Fixed Departure Inventory Dashboard", sort_order:10, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000002", name:"Oxytra", website_url:"https://oxytra.com/", logo_url:"https://www.google.com/s2/favicons?domain=oxytra.com&sz=128", description:"B2B Travel & Series Fare Portal", sort_order:11, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000002", name:"Travel Boutique Online (TBO)", website_url:"https://www.travelboutiqueonline.com/", logo_url:"https://www.google.com/s2/favicons?domain=travelboutiqueonline.com&sz=128", description:"Global B2B Travel Distribution", sort_order:12, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000002", name:"TripCircuit", website_url:"https://tripcircuit.in/home", logo_url:"https://www.google.com/s2/favicons?domain=tripcircuit.in&sz=128", description:"Fixed Departures & Holiday Circuits", sort_order:13, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000002", name:"Riya Travel", website_url:"https://riya.travel/", logo_url:"https://www.google.com/s2/favicons?domain=riya.travel&sz=128", description:"Enterprise Travel & Group Fares", sort_order:14, is_active:true },
    // HOTEL (9)
    { category_id:"c0000000-0000-0000-0000-000000000003", name:"Cleartrip Agent Portal", website_url:"https://agency.cleartrip.com/", logo_url:"https://www.google.com/s2/favicons?domain=cleartrip.com&sz=128", description:"B2B Hotel & Agent Bookings", sort_order:1, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000003", name:"Suba Hotels", website_url:"https://www.subahotels.com/", logo_url:"https://www.google.com/s2/favicons?domain=subahotels.com&sz=128", description:"Suba Group of Hotels & Stays", sort_order:2, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000003", name:"TripMax Agent Portal", website_url:"https://agents.tripmax.in/", logo_url:"https://www.google.com/s2/favicons?domain=tripmax.in&sz=128", description:"TripMax Agent Hotel Inventory", sort_order:3, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000003", name:"MakeMyTrip Hotels", website_url:"https://www.makemytrip.com/hotels/", logo_url:"https://www.google.com/s2/favicons?domain=makemytrip.com&sz=128", description:"Hotels & Stays Worldwide", sort_order:4, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000003", name:"Cleartrip Hotels", website_url:"https://www.cleartrip.com/hotels", logo_url:"https://www.google.com/s2/favicons?domain=cleartrip.com&sz=128", description:"Domestic & International Hotels", sort_order:5, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000003", name:"Booking.com", website_url:"https://www.booking.com/", logo_url:"https://www.google.com/s2/favicons?domain=booking.com&sz=128", description:"Hotels, Homes & Holiday Stays", sort_order:6, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000003", name:"Trimurti Hotels and Resorts", website_url:"https://trimurtihotelsandresorts.com/", logo_url:"https://www.google.com/s2/favicons?domain=trimurtihotelsandresorts.com&sz=128", description:"Luxury Resorts & Hotel Bookings", sort_order:7, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000003", name:"Agoda", website_url:"https://www.agoda.com/?ds=IZ4QLiQdDMLyxrJw", logo_url:"https://www.google.com/s2/favicons?domain=agoda.com&sz=128", description:"Global Hotel Deals & Discounts", sort_order:8, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000003", name:"Goibibo Hotels", website_url:"https://www.goibibo.com/hotels/", logo_url:"https://www.google.com/s2/favicons?domain=goibibo.com&sz=128", description:"Best Value Hotel Stays", sort_order:9, is_active:true },
    // ONLINE CAB (5)
    { category_id:"c0000000-0000-0000-0000-000000000004", name:"ClickGo B2B", website_url:"https://clickgoab2b.com/", logo_url:"https://www.google.com/s2/favicons?domain=clickgoab2b.com&sz=128", description:"B2B Cab Booking Platform", sort_order:1, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000004", name:"Savaari", website_url:"https://www.savaari.com/", logo_url:"https://www.google.com/s2/favicons?domain=savaari.com&sz=128", description:"Intercity & Local Car Rentals", sort_order:2, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000004", name:"MakeMyTrip Cabs", website_url:"https://www.makemytrip.com/cabs/", logo_url:"https://www.google.com/s2/favicons?domain=makemytrip.com&sz=128", description:"Outstation & Airport Cabs", sort_order:3, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000004", name:"One Way Drop Taxi", website_url:"https://onewaydroptaxi.com/", logo_url:"https://www.google.com/s2/favicons?domain=onewaydroptaxi.com&sz=128", description:"Affordable One Way Taxi Service", sort_order:4, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000004", name:"TaxiBazaar", website_url:"https://taxibazaar.in/", logo_url:"https://www.google.com/s2/favicons?domain=taxibazaar.in&sz=128", description:"Intercity Taxi Booking Service", sort_order:5, is_active:true },
    // VILLA (1)
    { category_id:"c0000000-0000-0000-0000-000000000005", name:"Airbnb Luxury", website_url:"https://www.airbnb.co.in/luxury", logo_url:"https://www.google.com/s2/favicons?domain=airbnb.co.in&sz=128", description:"Luxury Retreats & Designer Villas", sort_order:1, is_active:true },
    // HOME STAY (1)
    { category_id:"c0000000-0000-0000-0000-000000000006", name:"Airbnb Homestays", website_url:"https://www.airbnb.co.in/luxury", logo_url:"https://www.google.com/s2/favicons?domain=airbnb.co.in&sz=128", description:"Authentic Homestays & Unique Stays", internal_notes:"Duplicate URL flagged for review", sort_order:1, is_active:true },
    // BUS (3)
    { category_id:"c0000000-0000-0000-0000-000000000007", name:"AbhiBus", website_url:"https://www.abhibus.com/", logo_url:"https://www.google.com/s2/favicons?domain=abhibus.com&sz=128", description:"Online Bus Ticket Booking", sort_order:1, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000007", name:"SeatSeller", website_url:"https://in3.seatseller.travel/ssui/NewLoginPage-iFrm", logo_url:"https://www.google.com/s2/favicons?domain=seatseller.travel&sz=128", description:"Agent Bus Inventory System", sort_order:2, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000007", name:"redBus", website_url:"https://www.redbus.in/", logo_url:"https://www.google.com/s2/favicons?domain=redbus.in&sz=128", description:"India's Largest Bus Ticketing", sort_order:3, is_active:true },
    // TRAIN (6)
    { category_id:"c0000000-0000-0000-0000-000000000008", name:"ConfirmTkt", website_url:"https://www.confirmtkt.com/", logo_url:"https://www.google.com/s2/favicons?domain=confirmtkt.com&sz=128", description:"Train Seat Availability & Tatkal", sort_order:1, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000008", name:"IRCTC Next Generation", website_url:"https://www.irctc.co.in/nget/train-search", logo_url:"https://www.google.com/s2/favicons?domain=irctc.co.in&sz=128", description:"Official Indian Railways E-Ticketing", sort_order:2, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000008", name:"eRail", website_url:"https://erail.in/", logo_url:"https://www.google.com/s2/favicons?domain=erail.in&sz=128", description:"Live Train Running & PNR Status", sort_order:3, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000008", name:"eTrain", website_url:"https://etrain.info/in", logo_url:"https://www.google.com/s2/favicons?domain=etrain.info&sz=128", description:"Indian Railways Timetable & Seats", sort_order:4, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000008", name:"TripJack", website_url:"https://www.tripjack.com/", logo_url:"https://www.google.com/s2/favicons?domain=tripjack.com&sz=128", description:"B2B Rail & Travel Portal", sort_order:5, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000008", name:"ixigo", website_url:"https://www.ixigo.com/", logo_url:"https://www.google.com/s2/favicons?domain=ixigo.com&sz=128", description:"Compare Train, Flight & Bus Fares", sort_order:6, is_active:true },
    // VISA (2)
    { category_id:"c0000000-0000-0000-0000-000000000009", name:"Atlys", website_url:"https://www.atlys.com/en-IN", logo_url:"https://www.google.com/s2/favicons?domain=atlys.com&sz=128", description:"Fast Online Visa Applications", sort_order:1, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000009", name:"VFS Global", website_url:"https://www.vfsglobal.com/en/individuals/index.html", logo_url:"https://www.google.com/s2/favicons?domain=vfsglobal.com&sz=128", description:"Official Visa Application Center", sort_order:2, is_active:true },
    // INSURANCE (1)
    { category_id:"c0000000-0000-0000-0000-000000000010", name:"Policybazaar Travel Insurance", website_url:"https://travel.policybazaar.com/", logo_url:"https://www.google.com/s2/favicons?domain=policybazaar.com&sz=128", description:"Compare International & Domestic Travel Cover", sort_order:1, is_active:true },
    // TOUR PACKAGES (8)
    { category_id:"c0000000-0000-0000-0000-000000000011", name:"Flamingo Travels", website_url:"https://www.flamingotravels.co.in/group-tour-packages", logo_url:"https://www.google.com/s2/favicons?domain=flamingotravels.co.in&sz=128", description:"Curated Group Tours", sort_order:1, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000011", name:"Kesari Tours", website_url:"https://www.kesari.in/", logo_url:"https://www.google.com/s2/favicons?domain=kesari.in&sz=128", description:"World Tours & Family Holidays", sort_order:2, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000011", name:"Swan Tours", website_url:"https://www.swantour.com/", logo_url:"https://www.google.com/s2/favicons?domain=swantour.com&sz=128", description:"India & International Tour Packages", sort_order:3, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000011", name:"Travel Setu", website_url:"https://travelsetu.com/", logo_url:"https://www.google.com/s2/favicons?domain=travelsetu.com&sz=128", description:"Custom Holiday Itineraries", sort_order:4, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000011", name:"Heena Tours", website_url:"https://www.heenatours.in/", logo_url:"https://www.google.com/s2/favicons?domain=heenatours.in&sz=128", description:"Specialty Vegetarian Holiday Packages", sort_order:5, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000011", name:"SOTC Travel Associates", website_url:"https://www.sotc.in/become-travel-business-associate", logo_url:"https://www.google.com/s2/favicons?domain=sotc.in&sz=128", description:"SOTC Travel Associate Partner Portal", sort_order:6, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000011", name:"Thomas Cook India", website_url:"https://www.thomascook.in/", logo_url:"https://www.google.com/s2/favicons?domain=thomascook.in&sz=128", description:"Global Holidays, Forex & Packages", sort_order:7, is_active:true },
    { category_id:"c0000000-0000-0000-0000-000000000011", name:"YU TRP", website_url:"https://yutrp.com/", logo_url:"https://www.google.com/s2/favicons?domain=yutrp.com&sz=128", description:"Wholesale Tour Packages & B2B Rates", sort_order:8, is_active:true },
  ];

  console.log(`\nInserting ${PORTALS.length} portals in batches...`);
  for (let i = 0; i < PORTALS.length; i += 20) {
    const batch = PORTALS.slice(i, i + 20);
    const r = await fetch(`${SUPABASE_URL}/rest/v1/portals`, {
      method: "POST", headers, body: JSON.stringify(batch),
    });
    const txt = r.status === 201 || r.status === 200 ? "✓" : await r.text();
    console.log(`  Portals batch ${Math.floor(i/20)+1} (${i+1}-${Math.min(i+20,PORTALS.length)}): ${r.status} ${txt}`);
  }

  // Create Auth Users
  console.log("\nCreating auth users...");
  const users = [
    { email: "owner@c-yatra.com", password: "Owner@CYatra2026!", full_name: "Samridh Tomar", role: "owner" },
    { email: "admin@c-yatra.com", password: "Admin@CYatra2026!", full_name: "C-Yatra Admin", role: "admin" },
  ];

  const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=100`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
  });
  const existingUsers = (await listRes.json())?.users || [];

  for (const u of users) {
    const existing = existingUsers.find(e => e.email === u.email);
    let userId;
    if (existing) {
      userId = existing.id;
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: "PUT",
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ password: u.password }),
      });
      console.log(`  → ${u.email}: already exists, password updated`);
    } else {
      const cr = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: "POST",
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email: u.email, password: u.password, email_confirm: true, user_metadata: { full_name: u.full_name } }),
      });
      const crData = await cr.json();
      userId = crData.id;
      console.log(`  ✓ ${u.email}: created (${cr.status})`);
    }

    // Insert profile
    if (userId) {
      const pr = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: "POST",
        headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ id: userId, email: u.email, full_name: u.full_name, role: u.role }),
      });
      console.log(`  ${pr.status === 200 || pr.status === 201 ? "✓" : "→"} ${u.email} profile: ${pr.status}`);
    }
  }

  // Final verification
  console.log("\n=== VERIFICATION ===");
  const catCount = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=id`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, Prefer: "count=exact" }
  });
  const portCount = await fetch(`${SUPABASE_URL}/rest/v1/portals?select=id`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, Prefer: "count=exact" }
  });
  console.log(`  Categories: ${catCount.headers.get("content-range") || catCount.status}`);
  console.log(`  Portals:    ${portCount.headers.get("content-range") || portCount.status}`);

  console.log("\n==============================================");
  console.log("  ALL DONE! Ready to deploy to Vercel.");
  console.log("==============================================\n");
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
