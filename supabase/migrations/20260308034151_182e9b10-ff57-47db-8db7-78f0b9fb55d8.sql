
-- Create hero_banners table for configurable homepage hero
CREATE TABLE public.hero_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  subtitle text,
  image_url text,
  link_url text DEFAULT '/collection',
  button_text text DEFAULT 'Shop Now',
  display_type text DEFAULT 'text',
  enabled boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hero banners" ON public.hero_banners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage hero banners" ON public.hero_banners FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default hero banner
INSERT INTO public.hero_banners (title, display_type, button_text, link_url) VALUES ('FLTHYMRKT', 'text', 'Shop Now', '/collection');

-- Drop foreign key on offers.product_id so we can store Shopify GIDs
ALTER TABLE public.offers DROP CONSTRAINT IF EXISTS offers_product_id_fkey;
ALTER TABLE public.offers ALTER COLUMN product_id TYPE text;

-- Add new_arrivals table
CREATE TABLE public.new_arrivals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_handle text NOT NULL UNIQUE,
  product_title text,
  added_at timestamptz DEFAULT now()
);

ALTER TABLE public.new_arrivals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view new arrivals" ON public.new_arrivals FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage new arrivals" ON public.new_arrivals FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
