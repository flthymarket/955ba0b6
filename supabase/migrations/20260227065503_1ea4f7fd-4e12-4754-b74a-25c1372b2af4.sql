
-- Discount fields on products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS discount_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS discount_type text DEFAULT 'percentage',
  ADD COLUMN IF NOT EXISTS discount_value numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_start timestamptz,
  ADD COLUMN IF NOT EXISTS discount_end timestamptz,
  ADD COLUMN IF NOT EXISTS is_flash_sale boolean DEFAULT false;

-- Announcements / banners table
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled boolean DEFAULT false,
  banner_type text DEFAULT 'informational',
  banner_text text NOT NULL DEFAULT '',
  subtext text,
  text_alignment text DEFAULT 'center',
  background_style text DEFAULT 'light',
  start_date timestamptz,
  end_date timestamptz,
  show_countdown boolean DEFAULT false,
  link_url text,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage announcements"
  ON public.announcements FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view active announcements"
  ON public.announcements FOR SELECT
  USING (enabled = true);

-- Flash sales table
CREATE TABLE public.flash_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled boolean DEFAULT false,
  scope text DEFAULT 'store',
  category text,
  discount_percentage numeric DEFAULT 0,
  start_date timestamptz,
  end_date timestamptz,
  stacking_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage flash sales"
  ON public.flash_sales FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view active flash sales"
  ON public.flash_sales FOR SELECT
  USING (enabled = true);
