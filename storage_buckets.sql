-- ============================================================
-- Run this SQL in your Supabase Dashboard → SQL Editor
-- URL: https://supabase.com/dashboard/project/amkszvicgglwqevzugsy/sql/new
-- ============================================================

-- 1. Create the site_config table (stores CMS data)
CREATE TABLE IF NOT EXISTS public.site_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,  -- Stringified JSON
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to READ site config (used by storefront)
DROP POLICY IF EXISTS "Public can read site_config" ON public.site_config;
CREATE POLICY "Public can read site_config"
  ON public.site_config FOR SELECT
  USING (true);

-- 4. Allow anon + authenticated + service_role to write site config
--    (Admin writes go through NextAuth, not Supabase auth, so anon key is used server-side)
DROP POLICY IF EXISTS "Anyone can write site_config" ON public.site_config;
CREATE POLICY "Anyone can write site_config"
  ON public.site_config FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Create storage buckets for product images and CMS images
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('cms', 'cms', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 6. Storage policies — drop existing ones first to avoid conflicts
DROP POLICY IF EXISTS "Public Access to Products" ON storage.objects;
DROP POLICY IF EXISTS "Allow Uploads to Products" ON storage.objects;
DROP POLICY IF EXISTS "Allow Updates to Products" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to CMS" ON storage.objects;
DROP POLICY IF EXISTS "Allow Uploads to CMS" ON storage.objects;
DROP POLICY IF EXISTS "Allow Updates to CMS" ON storage.objects;

-- Products bucket: public read, open write (admin-only in practice via NextAuth)
CREATE POLICY "Public Access to Products"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

CREATE POLICY "Allow Uploads to Products"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow Updates to Products"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'products');

-- CMS bucket: public read, open write
CREATE POLICY "Public Access to CMS"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cms');

CREATE POLICY "Allow Uploads to CMS"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cms');

CREATE POLICY "Allow Updates to CMS"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'cms');
