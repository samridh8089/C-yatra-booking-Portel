-- ====================================================================
-- C-Yatra Complete Database Migration & Security Schema
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Owner & Admin Access Roles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Categories Table
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

-- 4. Portals Table
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

-- 5. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_categories_active_sort ON public.categories (is_active, sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_portals_category_active_sort ON public.portals (category_id, is_active, sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- 6. Updated At Triggers
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

-- 7. Security Helper Functions
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

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portals ENABLE ROW LEVEL SECURITY;

-- 9. Profiles Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Service role full access
CREATE POLICY "Service role full access on profiles"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 10. Categories Policies
-- Authenticated owners/admins can read active categories
CREATE POLICY "Owners and admins can read active categories"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_admin());

-- Administrators can manage all categories (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can insert categories"
  ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories"
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete categories"
  ON public.categories
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Service role bypass
CREATE POLICY "Service role full access on categories"
  ON public.categories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 11. Portals Policies
-- Authenticated owners/admins can view active portals belonging to active categories
CREATE POLICY "Owners and admins can read active portals"
  ON public.portals
  FOR SELECT
  TO authenticated
  USING (
    (is_active = true AND EXISTS (
      SELECT 1 FROM public.categories WHERE categories.id = portals.category_id AND categories.is_active = true
    )) OR public.is_admin()
  );

-- Administrators can manage all portals (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can insert portals"
  ON public.portals
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update portals"
  ON public.portals
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete portals"
  ON public.portals
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Service role bypass
CREATE POLICY "Service role full access on portals"
  ON public.portals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
