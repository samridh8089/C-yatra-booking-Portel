-- ====================================================================
-- C-Yatra Initial Seed Script: 11 Categories & 65 Verified Portals
-- ====================================================================

-- 1. Insert 11 Default Categories
INSERT INTO public.categories (id, name, slug, icon, sort_order, is_active)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Flight', 'flight', 'Plane', 1, true),
  ('c0000000-0000-0000-0000-000000000002', 'Fix Departure', 'fix-departure', 'Users', 2, true),
  ('c0000000-0000-0000-0000-000000000003', 'Hotel', 'hotel', 'BedDouble', 3, true),
  ('c0000000-0000-0000-0000-000000000004', 'Online Cab', 'online-cab', 'Car', 4, true),
  ('c0000000-0000-0000-0000-000000000005', 'Villa', 'villa', 'Home', 5, true),
  ('c0000000-0000-0000-0000-000000000006', 'Home Stay', 'home-stay', 'Store', 6, true),
  ('c0000000-0000-0000-0000-000000000007', 'Bus', 'bus', 'Bus', 7, true),
  ('c0000000-0000-0000-0000-000000000008', 'Train', 'train', 'Train', 8, true),
  ('c0000000-0000-0000-0000-000000000009', 'Visa', 'visa', 'Globe', 9, true),
  ('c0000000-0000-0000-0000-000000000010', 'Insurance', 'insurance', 'ShieldCheck', 10, true),
  ('c0000000-0000-0000-0000-000000000011', 'Tour Packages', 'tour-packages', 'Compass', 11, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- 2. Insert 65 Booking Portals
INSERT INTO public.portals (category_id, name, website_url, logo_url, description, internal_notes, sort_order, is_active)
VALUES
  -- 1. FLIGHT
  ('c0000000-0000-0000-0000-000000000001', 'Cleartrip Agent Portal', 'https://agency.cleartrip.com/', 'https://www.google.com/s2/favicons?domain=cleartrip.com&sz=128', 'Agent B2B Booking Portal', 'B2B agent login', 1, true),
  ('c0000000-0000-0000-0000-000000000001', 'BT Travels', 'https://bttravels.in/', 'https://www.google.com/s2/favicons?domain=bttravels.in&sz=128', 'B2B Travel Booking Partner', 'B2B air ticketing', 2, true),
  ('c0000000-0000-0000-0000-000000000001', 'Fly24Hrs B2B', 'https://b2b.fly24hrs.com/B2BLogin', 'https://www.google.com/s2/favicons?domain=fly24hrs.com&sz=128', 'B2B Flight Reservations', 'Agency portal login', 3, true),
  ('c0000000-0000-0000-0000-000000000001', 'MakeMyTrip Flights', 'https://www.makemytrip.com/flights/', 'https://www.google.com/s2/favicons?domain=makemytrip.com&sz=128', 'Domestic & International Flights', 'Major aggregator', 4, true),
  ('c0000000-0000-0000-0000-000000000001', 'NDC Deals', 'https://ndc.deals/', 'https://www.google.com/s2/favicons?domain=ndc.deals&sz=128', 'Exclusive Airline NDC Fares', 'NDC direct ticketing', 5, true),
  ('c0000000-0000-0000-0000-000000000001', 'Bonton Holidays Partner Portal', 'https://partner.bontonholidays.com/', 'https://www.google.com/s2/favicons?domain=bontonholidays.com&sz=128', 'Bonton Partner Flight System', 'Partner portal', 6, true),
  ('c0000000-0000-0000-0000-000000000001', 'TripAirPe', 'https://tripairpe.com/', 'https://www.google.com/s2/favicons?domain=tripairpe.com&sz=128', 'Online Air Ticketing Portal', 'B2B ticketing', 7, true),
  ('c0000000-0000-0000-0000-000000000001', 'Akbar Travels B2B', 'https://agents.akbartravelsonline.com/b2bplus/login', 'https://www.google.com/s2/favicons?domain=akbartravels.com&sz=128', 'Akbar B2B Plus Agent Login', 'Agent portal login', 8, true),
  ('c0000000-0000-0000-0000-000000000001', 'MakeMyTrip MyPartner Flights', 'https://mypartner.makemytrip.com/landing/flights', 'https://www.google.com/s2/favicons?domain=makemytrip.com&sz=128', 'MyPartner Travel Agent Portal', 'Travel agent partner login', 9, true),
  ('c0000000-0000-0000-0000-000000000001', 'Cleartrip Flights', 'https://www.cleartrip.com/flights', 'https://www.google.com/s2/favicons?domain=cleartrip.com&sz=128', 'Domestic & International Flights', 'Consumer flight portal', 10, true),
  ('c0000000-0000-0000-0000-000000000001', 'Yatra Travel Agents', 'https://www.yatra.com/travel-agents', 'https://www.google.com/s2/favicons?domain=yatra.com&sz=128', 'Yatra B2B Travel Agent Network', 'Agent network', 11, true),
  ('c0000000-0000-0000-0000-000000000001', 'Skyscanner India', 'https://www.skyscanner.co.in/', 'https://www.google.com/s2/favicons?domain=skyscanner.co.in&sz=128', 'Global Flight Search & Comparison', 'Global meta-search', 12, true),
  ('c0000000-0000-0000-0000-000000000001', 'Google Flights', 'https://www.google.com/travel/flights', 'https://www.google.com/s2/favicons?domain=google.com&sz=128', 'Compare Flights Worldwide', 'Google Travel', 13, true),
  ('c0000000-0000-0000-0000-000000000001', 'Yatra Flights', 'https://www.yatra.com/flights', 'https://www.google.com/s2/favicons?domain=yatra.com&sz=128', 'Flights, Hotels & Holidays', 'Domestic & intl', 14, true),
  ('c0000000-0000-0000-0000-000000000001', 'EaseMyTrip Flights', 'https://www.easemytrip.com/flights', 'https://www.google.com/s2/favicons?domain=easemytrip.com&sz=128', 'Best Fares on Flights', 'Low fee flight portal', 15, true),

  -- 2. FIX DEPARTURE
  ('c0000000-0000-0000-0000-000000000002', 'AirIQ', 'https://www.airiq.in/', 'https://www.google.com/s2/favicons?domain=airiq.in&sz=128', 'Group & Fixed Departure Air Tickets', 'Series booking', 1, true),
  ('c0000000-0000-0000-0000-000000000002', 'Ease2Fly', 'https://www.ease2fly.com/', 'https://www.google.com/s2/favicons?domain=ease2fly.com&sz=128', 'Fixed Departure Seat Booking', 'Group seats', 2, true),
  ('c0000000-0000-0000-0000-000000000002', 'GoFlySmart', 'https://www.goflysmart.com/;jsessionid=153FA3484B87131C6CCB70FF08F51485', 'https://www.google.com/s2/favicons?domain=goflysmart.com&sz=128', 'Smart Fixed Departure Booking', 'B2B series', 3, true),
  ('c0000000-0000-0000-0000-000000000002', 'Kandhari Travels', 'https://kandharitravels.in/', 'https://www.google.com/s2/favicons?domain=kandharitravels.in&sz=128', 'B2B Group Fare Inventory', 'Group fares', 4, true),
  ('c0000000-0000-0000-0000-000000000002', 'RTTFD', 'https://www.rttfd.com/home', 'https://www.google.com/s2/favicons?domain=rttfd.com&sz=128', 'Real Time Fixed Departure Portal', 'RT fixed departure', 5, true),
  ('c0000000-0000-0000-0000-000000000002', 'Travel Deals B2B', 'https://www.traveldealb2b.com/', 'https://www.google.com/s2/favicons?domain=traveldealb2b.com&sz=128', 'B2B Travel Deals & Departures', 'Wholesale fares', 6, true),
  ('c0000000-0000-0000-0000-000000000002', 'World Travels Online', 'https://worldtravelsonline.in/', 'https://www.google.com/s2/favicons?domain=worldtravelsonline.in&sz=128', 'Online Fixed Departure Portal', 'Fixed departure online', 7, true),
  ('c0000000-0000-0000-0000-000000000002', 'Coupon Fares', 'https://travel.couponfares.com/Info/Home', 'https://www.google.com/s2/favicons?domain=couponfares.com&sz=128', 'Special Coupon Fares & Blocks', 'Coupon blocks', 8, true),
  ('c0000000-0000-0000-0000-000000000002', 'Fly Series', 'https://flyseries.in/signin', 'https://www.google.com/s2/favicons?domain=flyseries.in&sz=128', 'Series Flight Bookings Portal', 'Series fares', 9, true),
  ('c0000000-0000-0000-0000-000000000002', 'JustMyTrip', 'https://www.justmytrip.in/dashboard', 'https://www.google.com/s2/favicons?domain=justmytrip.in&sz=128', 'Fixed Departure Inventory Dashboard', 'Inventory dashboard', 10, true),
  ('c0000000-0000-0000-0000-000000000002', 'Oxytra', 'https://oxytra.com/', 'https://www.google.com/s2/favicons?domain=oxytra.com&sz=128', 'B2B Travel & Series Fare Portal', 'Oxytra B2B', 11, true),
  ('c0000000-0000-0000-0000-000000000002', 'Travel Boutique Online (TBO)', 'https://www.travelboutiqueonline.com/', 'https://www.google.com/s2/favicons?domain=travelboutiqueonline.com&sz=128', 'Global B2B Travel Distribution', 'TBO global', 12, true),
  ('c0000000-0000-0000-0000-000000000002', 'TripCircuit', 'https://tripcircuit.in/home', 'https://www.google.com/s2/favicons?domain=tripcircuit.in&sz=128', 'Fixed Departures & Holiday Circuits', 'Circuits inventory', 13, true),
  ('c0000000-0000-0000-0000-000000000002', 'Riya Travel', 'https://riya.travel/', 'https://www.google.com/s2/favicons?domain=riya.travel&sz=128', 'Enterprise Travel & Group Fares', 'Riya group', 14, true),

  -- 3. HOTEL
  ('c0000000-0000-0000-0000-000000000003', 'Cleartrip Agent Portal', 'https://agency.cleartrip.com/', 'https://www.google.com/s2/favicons?domain=cleartrip.com&sz=128', 'B2B Hotel & Agent Bookings', 'Agent rates', 1, true),
  ('c0000000-0000-0000-0000-000000000003', 'Suba Hotels', 'https://www.subahotels.com/', 'https://www.google.com/s2/favicons?domain=subahotels.com&sz=128', 'Suba Group of Hotels & Stays', 'Suba direct', 2, true),
  ('c0000000-0000-0000-0000-000000000003', 'TripMax Agent Portal', 'https://agents.tripmax.in/', 'https://www.google.com/s2/favicons?domain=tripmax.in&sz=128', 'TripMax Agent Hotel Inventory', 'TripMax B2B', 3, true),
  ('c0000000-0000-0000-0000-000000000003', 'MakeMyTrip Hotels', 'https://www.makemytrip.com/hotels/', 'https://www.google.com/s2/favicons?domain=makemytrip.com&sz=128', 'Hotels & Stays Worldwide', 'MMT Hotel catalog', 4, true),
  ('c0000000-0000-0000-0000-000000000003', 'Cleartrip Hotels', 'https://www.cleartrip.com/hotels', 'https://www.google.com/s2/favicons?domain=cleartrip.com&sz=128', 'Domestic & International Hotels', 'Cleartrip stay', 5, true),
  ('c0000000-0000-0000-0000-000000000003', 'Booking.com', 'https://www.booking.com/', 'https://www.google.com/s2/favicons?domain=booking.com&sz=128', 'Hotels, Homes & Holiday Stays', 'Worldwide leader', 6, true),
  ('c0000000-0000-0000-0000-000000000003', 'Trimurti Hotels and Resorts', 'https://trimurtihotelsandresorts.com/', 'https://www.google.com/s2/favicons?domain=trimurtihotelsandresorts.com&sz=128', 'Luxury Resorts & Hotel Bookings', 'Resort bookings', 7, true),
  ('c0000000-0000-0000-0000-000000000003', 'Agoda', 'https://www.agoda.com/?ds=IZ4QLiQdDMLyxrJw', 'https://www.google.com/s2/favicons?domain=agoda.com&sz=128', 'Global Hotel Deals & Discounts', 'Asian & global hotels', 8, true),
  ('c0000000-0000-0000-0000-000000000003', 'Goibibo Hotels', 'https://www.goibibo.com/hotels/', 'https://www.google.com/s2/favicons?domain=goibibo.com&sz=128', 'Best Value Hotel Stays', 'Goibibo rates', 9, true),

  -- 4. ONLINE CAB
  ('c0000000-0000-0000-0000-000000000004', 'ClickGo B2B', 'https://clickgoab2b.com/', 'https://www.google.com/s2/favicons?domain=clickgoab2b.com&sz=128', 'B2B Cab Booking Platform', 'Fleet reservation', 1, true),
  ('c0000000-0000-0000-0000-000000000004', 'Savaari', 'https://www.savaari.com/', 'https://www.google.com/s2/favicons?domain=savaari.com&sz=128', 'Intercity & Local Car Rentals', 'Chauffeur car rental', 2, true),
  ('c0000000-0000-0000-0000-000000000004', 'MakeMyTrip Cabs', 'https://www.makemytrip.com/cabs/', 'https://www.google.com/s2/favicons?domain=makemytrip.com&sz=128', 'Outstation & Airport Cabs', 'Airport transfers', 3, true),
  ('c0000000-0000-0000-0000-000000000004', 'One Way Drop Taxi', 'https://onewaydroptaxi.com/', 'https://www.google.com/s2/favicons?domain=onewaydroptaxi.com&sz=128', 'Affordable One Way Taxi Service', 'One way fares', 4, true),
  ('c0000000-0000-0000-0000-000000000004', 'TaxiBazaar', 'https://taxibazaar.in/', 'https://www.google.com/s2/favicons?domain=taxibazaar.in&sz=128', 'Intercity Taxi Booking Service', 'Intercity taxi', 5, true),

  -- 5. VILLA
  ('c0000000-0000-0000-0000-000000000005', 'Airbnb Luxury', 'https://www.airbnb.co.in/luxury', 'https://www.google.com/s2/favicons?domain=airbnb.co.in&sz=128', 'Luxury Retreats & Designer Villas', 'Luxury villas', 1, true),

  -- 6. HOME STAY
  ('c0000000-0000-0000-0000-000000000006', 'Airbnb Homestays', 'https://www.airbnb.co.in/luxury', 'https://www.google.com/s2/favicons?domain=airbnb.co.in&sz=128', 'Authentic Homestays & Unique Stays', 'Duplicate URL flagged for review per instructions', 1, true),

  -- 7. BUS
  ('c0000000-0000-0000-0000-000000000007', 'AbhiBus', 'https://www.abhibus.com/', 'https://www.google.com/s2/favicons?domain=abhibus.com&sz=128', 'Online Bus Ticket Booking', 'Intercity buses', 1, true),
  ('c0000000-0000-0000-0000-000000000007', 'SeatSeller', 'https://in3.seatseller.travel/ssui/NewLoginPage-iFrm', 'https://www.google.com/s2/favicons?domain=seatseller.travel&sz=128', 'Agent Bus Inventory System', 'Agent B2B seat inventory', 2, true),
  ('c0000000-0000-0000-0000-000000000007', 'redBus', 'https://www.redbus.in/', 'https://www.google.com/s2/favicons?domain=redbus.in&sz=128', 'India''s Largest Bus Ticketing', 'RedBus network', 3, true),

  -- 8. TRAIN
  ('c0000000-0000-0000-0000-000000000008', 'ConfirmTkt', 'https://www.confirmtkt.com/', 'https://www.google.com/s2/favicons?domain=confirmtkt.com&sz=128', 'Train Seat Availability & Tatkal', 'Tatkal predictor', 1, true),
  ('c0000000-0000-0000-0000-000000000008', 'IRCTC Next Generation', 'https://www.irctc.co.in/nget/train-search', 'https://www.google.com/s2/favicons?domain=irctc.co.in&sz=128', 'Official Indian Railways E-Ticketing', 'IRCTC official portal', 2, true),
  ('c0000000-0000-0000-0000-000000000008', 'eRail', 'https://erail.in/', 'https://www.google.com/s2/favicons?domain=erail.in&sz=128', 'Live Train Running & PNR Status', 'Live status & timetable', 3, true),
  ('c0000000-0000-0000-0000-000000000008', 'eTrain', 'https://etrain.info/in', 'https://www.google.com/s2/favicons?domain=etrain.info&sz=128', 'Indian Railways Timetable & Seats', 'Train information', 4, true),
  ('c0000000-0000-0000-0000-000000000008', 'TripJack', 'https://www.tripjack.com/', 'https://www.google.com/s2/favicons?domain=tripjack.com&sz=128', 'B2B Rail & Travel Portal', 'TripJack agent rail', 5, true),
  ('c0000000-0000-0000-0000-000000000008', 'ixigo', 'https://www.ixigo.com/', 'https://www.google.com/s2/favicons?domain=ixigo.com&sz=128', 'Compare Train, Flight & Bus Fares', 'ixigo trains & travel', 6, true),

  -- 9. VISA
  ('c0000000-0000-0000-0000-000000000009', 'Atlys', 'https://www.atlys.com/en-IN', 'https://www.google.com/s2/favicons?domain=atlys.com&sz=128', 'Fast Online Visa Applications', 'E-visa service', 1, true),
  ('c0000000-0000-0000-0000-000000000009', 'VFS Global', 'https://www.vfsglobal.com/en/individuals/index.html', 'https://www.google.com/s2/favicons?domain=vfsglobal.com&sz=128', 'Official Visa Application Center', 'VFS center appointments', 2, true),

  -- 10. INSURANCE
  ('c0000000-0000-0000-0000-000000000010', 'Policybazaar Travel Insurance', 'https://travel.policybazaar.com/', 'https://www.google.com/s2/favicons?domain=policybazaar.com&sz=128', 'Compare International & Domestic Travel Cover', 'Travel insurance aggregator', 1, true),

  -- 11. TOUR PACKAGES
  ('c0000000-0000-0000-0000-000000000011', 'Flamingo Travels', 'https://www.flamingotravels.co.in/group-tour-packages', 'https://www.google.com/s2/favicons?domain=flamingotravels.co.in&sz=128', 'Curated Domestic & International Group Tours', 'Holiday group packages', 1, true),
  ('c0000000-0000-0000-0000-000000000011', 'Kesari Tours', 'https://www.kesari.in/', 'https://www.google.com/s2/favicons?domain=kesari.in&sz=128', 'World Tours & Family Holidays', 'Escorted tours', 2, true),
  ('c0000000-0000-0000-0000-000000000011', 'Swan Tours', 'https://www.swantour.com/', 'https://www.google.com/s2/favicons?domain=swantour.com&sz=128', 'India & International Tour Packages', 'Bespoke tours', 3, true),
  ('c0000000-0000-0000-0000-000000000011', 'Travel Setu', 'https://travelsetu.com/', 'https://www.google.com/s2/favicons?domain=travelsetu.com&sz=128', 'Custom Holiday Itineraries', 'Custom packages', 4, true),
  ('c0000000-0000-0000-0000-000000000011', 'Heena Tours', 'https://www.heenatours.in/', 'https://www.google.com/s2/favicons?domain=heenatours.in&sz=128', 'Specialty Vegetarian Holiday Packages', 'Veg group tours', 5, true),
  ('c0000000-0000-0000-0000-000000000011', 'SOTC Travel Associates', 'https://www.sotc.in/become-travel-business-associate', 'https://www.google.com/s2/favicons?domain=sotc.in&sz=128', 'SOTC Travel Associate Partner Portal', 'SOTC business partner', 6, true),
  ('c0000000-0000-0000-0000-000000000011', 'Thomas Cook India', 'https://www.thomascook.in/', 'https://www.google.com/s2/favicons?domain=thomascook.in&sz=128', 'Global Holidays, Forex & Packages', 'Global travel holidays', 7, true),
  ('c0000000-0000-0000-0000-000000000011', 'YU TRP', 'https://yutrp.com/', 'https://www.google.com/s2/favicons?domain=yutrp.com&sz=128', 'Wholesale Tour Packages & B2B Rates', 'B2B holiday wholesaler', 8, true);
