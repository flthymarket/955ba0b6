import { supabase } from "@/integrations/supabase/client";

export interface StoreVariant {
  id: string;
  size: string;
  quantity: number;
}

export interface StoreProduct {
  id: string;
  name: string;
  slug: string | null;
  category: string;
  price: number;
  sku: string | null;
  description: string | null;
  condition: string | null;
  condition_description: string | null;
  color: string | null;
  material: string | null;
  measurements: Record<string, unknown> | null;
  featured: boolean | null;
  sold_out: boolean;
  sort_order: number;
  size_guide: string | null;
  created_at: string | null;
  discount_enabled: boolean | null;
  discount_type: string | null;
  discount_value: number | null;
  discount_start: string | null;
  discount_end: string | null;
  is_flash_sale: boolean | null;
  brand_id: string | null;
  brands: { id: string; name: string } | null;
  product_images: { id: string; url: string; sort_order: number | null }[];
  product_variants: StoreVariant[];
}

const SELECT = `
  id, name, slug, category, price, sku, description, condition, condition_description,
  color, material, measurements, featured, sold_out, sort_order, size_guide, created_at,
  discount_enabled, discount_type, discount_value, discount_start, discount_end,
  is_flash_sale, brand_id,
  brands ( id, name ),
  product_images ( id, url, sort_order ),
  product_variants ( id, size, quantity )
`;

function normalize(row: any): StoreProduct {
  return {
    ...row,
    price: Number(row.price),
    sold_out: !!row.sold_out,
    sort_order: row.sort_order ?? 0,
    discount_value: row.discount_value === null ? null : Number(row.discount_value),
    product_images: (row.product_images || []).sort(
      (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    ),
    product_variants: (row.product_variants || []).sort((a: any, b: any) =>
      String(a.size).localeCompare(String(b.size))
    ),
  } as StoreProduct;
}

export async function fetchProducts(options?: {
  category?: string;
  limit?: number;
  featuredOnly?: boolean;
  newestFirst?: boolean;
}): Promise<StoreProduct[]> {
  let query = supabase.from("products").select(SELECT);

  if (options?.category && options.category.toLowerCase() !== "all") {
    query = query.ilike("category", options.category);
  }
  if (options?.featuredOnly) query = query.eq("featured", true);

  query = options?.newestFirst
    ? query.order("created_at", { ascending: false })
    : query.order("sort_order", { ascending: true }).order("created_at", { ascending: false });

  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(normalize);
}

export async function searchProducts(term: string, limit = 20): Promise<StoreProduct[]> {
  const q = term.trim();
  if (!q) return [];
  const like = `%${q}%`;

  const [brandRes, variantRes] = await Promise.all([
    supabase.from("brands").select("id").ilike("name", like),
    supabase.from("product_variants").select("product_id").ilike("size", q),
  ]);

  const brandIds = (brandRes.data || []).map((b) => b.id);
  const variantProductIds = (variantRes.data || []).map((v) => v.product_id);

  const filters = [
    `name.ilike.${like}`,
    `description.ilike.${like}`,
    `category.ilike.${like}`,
    `color.ilike.${like}`,
    `material.ilike.${like}`,
    `sku.ilike.${like}`,
  ];
  if (brandIds.length) filters.push(`brand_id.in.(${brandIds.join(",")})`);
  if (variantProductIds.length) filters.push(`id.in.(${variantProductIds.join(",")})`);

  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .or(filters.join(","))
    .limit(limit);
  if (error) throw error;
  return (data || []).map(normalize);
}

/** IDs of the newest N products — used for the "New" badge. */
export async function fetchNewestIds(limit = 5): Promise<string[]> {
  const { data } = await supabase
    .from("products")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data || []).map((r) => r.id);
}


const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function fetchProduct(idOrSlug: string): Promise<StoreProduct | null> {
  const column = UUID_RE.test(idOrSlug) ? "id" : "slug";
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq(column, idOrSlug)
    .maybeSingle();
  if (error) throw error;
  return data ? normalize(data) : null;
}

/* ---------- pricing ---------- */

export function isDiscountActive(p: {
  discount_enabled?: boolean | null;
  discount_start?: string | null;
  discount_end?: string | null;
}) {
  if (!p.discount_enabled) return false;
  const now = Date.now();
  if (p.discount_start && new Date(p.discount_start).getTime() > now) return false;
  if (p.discount_end && new Date(p.discount_end).getTime() < now) return false;
  return true;
}

export function finalPrice(p: {
  price: number;
  discount_enabled?: boolean | null;
  discount_type?: string | null;
  discount_value?: number | null;
  discount_start?: string | null;
  discount_end?: string | null;
}) {
  if (!isDiscountActive(p) || !p.discount_value) return p.price;
  if (p.discount_type === "percentage")
    return Math.round((p.price - (p.price * p.discount_value) / 100) * 100) / 100;
  if (p.discount_type === "fixed")
    return Math.max(0, Math.round((p.price - p.discount_value) * 100) / 100);
  if (p.discount_type === "override") return Math.round(p.discount_value * 100) / 100;
  return p.price;
}

export function money(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function productUrl(p: { id: string; slug: string | null }) {
  return `/product/${p.slug || p.id}`;
}

export function primaryImage(p: StoreProduct) {
  return p.product_images?.[0]?.url || "";
}

export function secondaryImage(p: StoreProduct) {
  return p.product_images?.[1]?.url;
}

export function totalStock(p: StoreProduct) {
  if (!p.product_variants?.length) return p.sold_out ? 0 : 99;
  return p.product_variants.reduce((s, v) => s + (v.quantity || 0), 0);
}

/** Break a description into list rows (Justin Reed / Matt Archive style spec list). */
export function descriptionLines(description?: string | null): string[] {
  if (!description) return [];
  return description
    .split(/\r?\n|•|·|\u2022/)
    .map((l) => l.replace(/^[-–—*\s]+/, "").trim())
    .filter(Boolean);
}
