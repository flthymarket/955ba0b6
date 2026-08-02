import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import ImageUpload from "@/components/ImageUpload";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

const CATEGORIES = ["Tops", "Bottoms", "Bags", "Jewelry", "Accessories", "All"];
const CONDITIONS = ["Pristine", "Excellent", "Very Good", "Good", "Fair"];

interface Brand {
  id: string;
  name: string;
}

interface VariantRow {
  id?: string;
  size: string;
  quantity: number;
}

interface ImageRow {
  id?: string;
  url: string;
  sort_order: number;
}

interface ProductRow {
  id: string;
  name: string;
  brand_id: string | null;
  category: string;
  price: number;
  sku: string | null;
  description: string | null;
  condition: string | null;
  condition_description: string | null;
  color: string | null;
  material: string | null
  featured: boolean;
  sold_out: boolean;
  size_guide: string | null;
  created_at?: string;
  brands?: { name: string } | null;
}

const blank = (): ProductRow => ({
  id: "",
  name: "",
  brand_id: null,
  category: "Tops",
  price: 0,
  sku: "",
  description: "",
  condition: "Excellent",
  condition_description: "",
  color: "",
  material: "",
  featured: false,
  sold_out: false,
  size_guide: "",
});

const AdminProducts = () => {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [images, setImages] = useState<ImageRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    const [prodRes, brandRes] = await Promise.all([
      supabase
        .from("products")
        .select("*, brands(name)")
        .order("created_at", { ascending: false }),
      supabase.from("brands").select("id, name").order("name"),
    ]);
    setProducts((prodRes.data as ProductRow[]) || []);
    setBrands((brandRes.data as Brand[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(blank());
    setVariants([{ size: "OS", quantity: 1 }]);
    setImages([]);
  };

  const openEdit = async (p: ProductRow) => {
    const [v, i] = await Promise.all([
      supabase.from("product_variants").select("id, size, quantity").eq("product_id", p.id),
      supabase.from("product_images").select("id, url, sort_order").eq("product_id", p.id).order("sort_order"),
    ]);
    setEditing(p);
    setVariants((v.data as VariantRow[]) || []);
    setImages((i.data as ImageRow[]) || []);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      name: editing.name.trim(),
      brand_id: editing.brand_id || null,
      category: editing.category,
      price: Number(editing.price) || 0,
      sku: editing.sku || null,
      description: editing.description || null,
      condition: editing.condition || null,
      condition_description: editing.condition_description || null,
      color: editing.color || null,
      material: editing.material || null,
      featured: editing.featured,
      sold_out: editing.sold_out,
      size_guide: editing.size_guide || null,
      slug: editing.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    };

    let productId = editing.id;

    if (productId) {
      const { error } = await supabase.from("products").update(payload).eq("id", productId);
      if (error) {
        toast({ title: "Save failed", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error || !data) {
        toast({ title: "Save failed", description: error?.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      productId = data.id;
    }

    // Replace variants + images
    await supabase.from("product_variants").delete().eq("product_id", productId);
    const cleanVariants = variants.filter((v) => v.size.trim());
    if (cleanVariants.length) {
      await supabase.from("product_variants").insert(
        cleanVariants.map((v) => ({
          product_id: productId,
          size: v.size.trim(),
          quantity: Math.max(0, Number(v.quantity) || 0),
        }))
      );
    }

    await supabase.from("product_images").delete().eq("product_id", productId);
    const cleanImages = images.filter((i) => i.url);
    if (cleanImages.length) {
      await supabase.from("product_images").insert(
        cleanImages.map((img, idx) => ({ product_id: productId, url: img.url, sort_order: idx }))
      );
    }

    toast({ title: editing.id ? "Product updated" : "Product created" });
    setSaving(false);
    setEditing(null);
    load();
  };

  const remove = async (p: ProductRow) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    await supabase.from("product_variants").delete().eq("product_id", p.id);
    await supabase.from("product_images").delete().eq("product_id", p.id);
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Product deleted" });
    load();
  };

  const inputCls = "w-full border border-border bg-transparent px-3 py-2 text-[12px] outline-none";
  const labelCls = "text-[9px] tracking-widest uppercase text-muted-foreground block mb-1";

  if (editing) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[14px] tracking-[0.3em] uppercase font-extralight">
            {editing.id ? "Edit Product" : "New Product"}
          </h1>
          <button onClick={() => setEditing(null)} className="nav-link text-[9px] text-muted-foreground">
            ← Back
          </button>
        </div>

        <div className="max-w-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Name</label>
              <input className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Brand</label>
              <select
                className={inputCls}
                value={editing.brand_id || ""}
                onChange={(e) => setEditing({ ...editing, brand_id: e.target.value || null })}
              >
                <option value="">— None —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select className={inputCls} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Price (USD)</label>
              <input
                type="number"
                step="0.01"
                className={inputCls}
                value={editing.price}
                onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelCls}>SKU</label>
              <input className={inputCls} value={editing.sku || ""} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Color</label>
              <input className={inputCls} value={editing.color || ""} onChange={(e) => setEditing({ ...editing, color: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Material</label>
              <input className={inputCls} value={editing.material || ""} onChange={(e) => setEditing({ ...editing, material: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Condition</label>
              <select className={inputCls} value={editing.condition || ""} onChange={(e) => setEditing({ ...editing, condition: e.target.value })}>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Description (one detail per line — shown as a list)</label>
            <textarea
              className={`${inputCls} min-h-[140px] resize-none`}
              value={editing.description || ""}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
          </div>

          <div>
            <label className={labelCls}>Condition Notes</label>
            <textarea
              className={`${inputCls} min-h-[80px] resize-none`}
              value={editing.condition_description || ""}
              onChange={(e) => setEditing({ ...editing, condition_description: e.target.value })}
            />
          </div>

          <div>
            <label className={labelCls}>Size Guide / Measurements</label>
            <textarea
              className={`${inputCls} min-h-[80px] resize-none`}
              value={editing.size_guide || ""}
              onChange={(e) => setEditing({ ...editing, size_guide: e.target.value })}
            />
          </div>

          <div className="flex gap-8">
            <label className="flex items-center gap-2 text-[11px]">
              <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-[11px]">
              <input type="checkbox" checked={editing.sold_out} onChange={(e) => setEditing({ ...editing, sold_out: e.target.checked })} />
              Sold Out
            </label>
          </div>

          {/* Sizes / inventory */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="editorial-heading text-[10px]">Sizes & Inventory</h2>
              <button
                onClick={() => setVariants([...variants, { size: "", quantity: 1 }])}
                className="nav-link text-[9px] flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add size
              </button>
            </div>
            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    className={inputCls}
                    placeholder="Size (S, M, L, OS...)"
                    value={v.size}
                    onChange={(e) =>
                      setVariants(variants.map((x, i) => (i === idx ? { ...x, size: e.target.value } : x)))
                    }
                  />
                  <input
                    type="number"
                    min={0}
                    className={`${inputCls} max-w-[110px]`}
                    value={v.quantity}
                    onChange={(e) =>
                      setVariants(variants.map((x, i) => (i === idx ? { ...x, quantity: Number(e.target.value) } : x)))
                    }
                  />
                  <button onClick={() => setVariants(variants.filter((_, i) => i !== idx))} aria-label="Remove size">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <h2 className="editorial-heading text-[10px] mb-3">Images (first is the main image)</h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <div key={idx}>
                  <ImageUpload
                    bucket="product-images"
                    currentUrl={img.url}
                    onUpload={(url) =>
                      setImages(
                        url
                          ? images.map((x, i) => (i === idx ? { ...x, url } : x))
                          : images.filter((_, i) => i !== idx)
                      )
                    }
                  />
                </div>
              ))}
              <ImageUpload
                bucket="product-images"
                onUpload={(url) => url && setImages([...images, { url, sort_order: images.length }])}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Images are displayed uncropped in a uniform frame — any aspect ratio is safe to upload.
            </p>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="bg-primary text-primary-foreground px-8 py-3 editorial-heading text-[11px] min-h-[48px] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[14px] tracking-[0.3em] uppercase font-extralight">Products ({products.length})</h1>
        <button onClick={openNew} className="bg-primary text-primary-foreground px-5 py-2.5 editorial-heading text-[10px] flex items-center gap-2">
          <Plus className="w-3 h-3" /> New Product
        </button>
      </div>

      {loading ? (
        <p className="editorial-heading text-[10px] text-muted-foreground py-16 text-center">Loading...</p>
      ) : products.length === 0 ? (
        <p className="editorial-heading text-[10px] text-muted-foreground py-16 text-center">No products yet</p>
      ) : (
        <div className="border border-border">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border last:border-b-0">
              <div className="min-w-0">
                <p className="text-[9px] tracking-widest uppercase text-muted-foreground">{p.brands?.name || "—"}</p>
                <p className="text-[12px] font-light truncate">{p.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {p.category} · ${Number(p.price).toLocaleString()} {p.sold_out ? "· SOLD OUT" : ""}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <button onClick={() => openEdit(p)} className="nav-link text-[9px]">
                  Edit
                </button>
                <button onClick={() => remove(p)} aria-label="Delete product">
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
