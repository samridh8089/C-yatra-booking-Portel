// C-Yatra Supabase Full Bootstrap Script
// Runs migration SQL + seed data + creates owner & admin users

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env.local automatically
try {
  const __dir = dirname(fileURLToPath(import.meta.url));
  const envContent = readFileSync(resolve(__dir, '../.env.local'), 'utf8');
  envContent.split('\n').forEach(line => {
    const [k, ...vParts] = line.split('=');
    if (k && vParts.length && !k.startsWith('#')) process.env[k.trim()] = vParts.join('=').trim();
  });
} catch {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dvxabpdaygmkrjsmgitb.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "owner@c-yatra.com";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "Owner@CYatra2026!";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@c-yatra.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@CYatra2026!";

async function supabaseRequest(path, method = "GET", body = null) {
  const opts = {
    method,
    headers: {
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${SUPABASE_URL}${path}`, opts);
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

async function authAdmin(path, method = "GET", body = null) {
  const opts = {
    method,
    headers: {
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${SUPABASE_URL}/auth/v1${path}`, opts);
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

// =============================================
// STEP 1: Create tables via REST upsert
// We'll insert into tables once they exist
// First check what tables exist
// =============================================

async function checkTablesExist() {
  const r = await supabaseRequest("/rest/v1/categories?limit=1");
  return r.status !== 404 && !String(r.data).includes("does not exist");
}

// =============================================
// STEP 2: Create Auth Users
// =============================================

async function createUser(email, password, fullName, role) {
  console.log(`\nCreating user: ${email} (${role})...`);

  // Check if exists
  const listRes = await authAdmin("/admin/users?page=1&per_page=100");
  const existing = listRes.data?.users?.find(u => u.email === email);

  let userId;
  if (existing) {
    console.log(`  → Already exists (ID: ${existing.id})`);
    userId = existing.id;
    // Update password
    await authAdmin(`/admin/users/${userId}`, "PUT", { password });
    console.log(`  → Password updated`);
  } else {
    const createRes = await authAdmin("/admin/users", "POST", {
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (createRes.status !== 200 && createRes.status !== 201) {
      console.error(`  ✗ Failed to create user:`, createRes.data);
      return null;
    }
    userId = createRes.data.id;
    console.log(`  ✓ Created (ID: ${userId})`);
  }
  return { id: userId, email, full_name: fullName, role };
}

// =============================================
// STEP 3: Insert Categories via REST
// =============================================

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

async function main() {
  console.log("==============================================");
  console.log("  C-YATRA SUPABASE BOOTSTRAP");
  console.log("==============================================\n");

  // ---- STEP 1: Check if tables exist ----
  console.log("STEP 1: Checking database tables...");
  const tablesExist = await checkTablesExist();
  if (!tablesExist) {
    console.log("  ✗ Tables not found. Please run the migration SQL manually in Supabase SQL Editor.");
    console.log("  File: supabase/migrations/20261020000000_init_c_yatra.sql");
    console.log("  After running migration, run this script again.\n");
    process.exit(1);
  }
  console.log("  ✓ Database tables exist!\n");

  // ---- STEP 2: Insert Categories ----
  console.log("STEP 2: Inserting 11 categories...");
  const catRes = await supabaseRequest("/rest/v1/categories", "POST", CATEGORIES);
  if (catRes.status === 201 || catRes.status === 200) {
    console.log(`  ✓ ${CATEGORIES.length} categories inserted!`);
  } else if (String(catRes.data).includes("duplicate") || String(catRes.data).includes("already exists") || catRes.status === 409) {
    console.log("  → Categories already exist, skipping.");
  } else {
    // Try upsert
    const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(CATEGORIES),
    });
    if (upsertRes.status === 201 || upsertRes.status === 200) {
      console.log(`  ✓ Categories upserted!`);
    } else {
      const errText = await upsertRes.text();
      console.log(`  Status: ${upsertRes.status} | ${errText.substring(0, 200)}`);
    }
  }

  // ---- STEP 3: Insert Portals ----
  console.log("\nSTEP 3: Inserting 65 portals...");
  // Insert in batches of 20
  for (let i = 0; i < PORTALS.length; i += 20) {
    const batch = PORTALS.slice(i, i + 20);
    const pRes = await fetch(`${SUPABASE_URL}/rest/v1/portals`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(batch),
    });
    if (pRes.status === 201 || pRes.status === 200) {
      console.log(`  ✓ Portals batch ${Math.floor(i/20)+1} inserted (${i+1}-${Math.min(i+20, PORTALS.length)})`);
    } else {
      const t = await pRes.text();
      console.log(`  Batch ${Math.floor(i/20)+1} status: ${pRes.status} | ${t.substring(0,150)}`);
    }
  }

  // ---- STEP 4: Create Auth Users ----
  console.log("\nSTEP 4: Creating Owner & Admin auth accounts...");
  const owner = await createUser(OWNER_EMAIL, OWNER_PASSWORD, "Samridh Tomar", "owner");
  const admin = await createUser(ADMIN_EMAIL, ADMIN_PASSWORD, "C-Yatra Admin", "admin");

  // ---- STEP 5: Assign Profiles & Roles ----
  console.log("\nSTEP 5: Assigning roles in profiles table...");
  if (owner) {
    const pRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({ id: owner.id, email: owner.email, full_name: owner.full_name, role: "owner" }),
    });
    console.log(`  ${pRes.status === 200 || pRes.status === 201 ? "✓" : "→"} Owner profile: ${pRes.status === 200 || pRes.status === 201 ? "set" : await pRes.text()}`);
  }
  if (admin) {
    const pRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({ id: admin.id, email: admin.email, full_name: admin.full_name, role: "admin" }),
    });
    console.log(`  ${pRes.status === 200 || pRes.status === 201 ? "✓" : "→"} Admin profile: ${pRes.status === 200 || pRes.status === 201 ? "set" : await pRes.text()}`);
  }

  // ---- STEP 6: Verify ----
  console.log("\nSTEP 6: Verification...");
  const cats = await supabaseRequest("/rest/v1/categories?select=count");
  const ports = await supabaseRequest("/rest/v1/portals?select=count");
  const catCount = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=id`, { headers:{ "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}`, "Prefer":"count=exact" }});
  const portCount = await fetch(`${SUPABASE_URL}/rest/v1/portals?select=id`, { headers:{ "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}`, "Prefer":"count=exact" }});
  
  console.log(`  Categories in DB: ${catCount.headers.get("content-range") || "check manually"}`);
  console.log(`  Portals in DB:    ${portCount.headers.get("content-range") || "check manually"}`);

  console.log("\n==============================================");
  console.log("  BOOTSTRAP COMPLETE!");
  console.log("==============================================");
  console.log(`  Owner:  ${OWNER_EMAIL} / ${OWNER_PASSWORD}`);
  console.log(`  Admin:  ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log("==============================================\n");
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
