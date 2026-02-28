import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import ImageUpload from "@/components/ImageUpload";
import { Plus, Pencil, Trash2, Search, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const allCategories = ["All", "Tops", "Bottoms", "Outerwear", "Accessories", "Bags", "Jewelry", "Dresses"];
const conditionLevels = ["Fair", "Good", "Great", "Excellent", "Pristine"];

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  featured: boolean | null;
  brand_id: string | null;
  brands?: { name: string } | null;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "", brand_id: "", category: "All", price: "", sku: "",
    description: "", condition: "Good", color: "", material: "",
    featured: false, condition_description: "",
    discount_enabled: false, discount_type: "percentage", discount_value: "",
    discount_start: "", discount_end: "", is_flash_sale: false,
  });
  const [variants, setVariants] = useState<{ size: string; quantity: string }[]>([{ size: "", quantity: "1" }]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [productImages, setProductImages] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    supabase.from("brands").select("id, name").order("name").then(({ data }) => {
      if (data) setBrands(data);
    });
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, price, category, featured, brand_id, brands(name)")
      .order("created_at", { ascending: false });
    if (data) setProducts(data as any);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("product_variants").delete().eq("product_id", id);
    await supabase.from("product_images").delete().eq("product_id", id);
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "Product deleted" });
    fetchProducts();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData: any = {
      name: form.name, brand_id: form.brand_id || null, category: form.category,
      price: parseFloat(form.price), sku: form.sku || null, description: form.description || null,
      condition: form.condition, condition_description: form.condition_description || null,
      color: form.color || null, material: form.material || null, featured: form.featured,
      discount_enabled: form.discount_enabled, discount_type: form.discount_type,
      discount_value: form.discount_value ? parseFloat(form.discount_value) : 0,
      discount_start: form.discount_start ? new Date(form.discount_start).toISOString() : null,
      discount_end: form.discount_end ? new Date(form.discount_end).toISOString() : null,
      is_flash_sale: form.is_flash_sale,
    };

    let productId = editing;

    if (editing) {
      await supabase.from("products").update(productData).eq("id", editing);
      await supabase.from("product_variants").delete().eq("product_id", editing);
      await supabase.from("product_images").delete().eq("product_id", editing);
    } else {
      const { data } = await supabase.from("products").insert(productData).select("id").single();
      if (data) productId = data.id;
    }

    if (productId) {
      const variantData = variants.filter((v) => v.size)
        .map((v) => ({ product_id: productId!, size: v.size, quantity: parseInt(v.quantity) || 0 }));
      if (variantData.length > 0) await supabase.from("product_variants").insert(variantData);

      const imageData = productImages.filter(Boolean)
        .map((url, i) => ({ product_id: productId!, url, sort_order: i }));
      if (imageData.length > 0) await supabase.from("product_images").insert(imageData);
    }

    toast({ title: editing ? "Product updated" : "Product created" });
    resetForm();
    fetchProducts();
  };

  const startEdit = async (id: string) => {
    const { data: product } = await supabase.from("products").select("*").eq("id", id).single();
    const { data: pvariants } = await supabase.from("product_variants").select("*").eq("product_id", id);
    const { data: imgs } = await supabase.from("product_images").select("url").eq("product_id", id).order("sort_order");

    if (product) {
      setForm({
        name: product.name, brand_id: product.brand_id || "", category: product.category,
        price: String(product.price), sku: product.sku || "", description: product.description || "",
        condition: product.condition || "Good", condition_description: product.condition_description || "",
        color: product.color || "", material: product.material || "", featured: product.featured || false,
        discount_enabled: product.discount_enabled || false, discount_type: product.discount_type || "percentage",
        discount_value: product.discount_value ? String(product.discount_value) : "",
        discount_start: product.discount_start ? new Date(product.discount_start).toISOString().slice(0, 16) : "",
        discount_end: product.discount_end ? new Date(product.discount_end).toISOString().slice(0, 16) : "",
        is_flash_sale: product.is_flash_sale || false,
      });
      setVariants(pvariants?.length ? pvariants.map((v: any) => ({ size: v.size, quantity: String(v.quantity) })) : [{ size: "", quantity: "1" }]);
      setProductImages(imgs?.map((i: any) => i.url) || []);
      setEditing(id);
      setShowForm(true);
    }
  };

  const resetForm = () => {
    setForm({ name: "", brand_id: "", category: "All", price: "", sku: "", description: "", condition: "Good", color: "", material: "", featured: false, condition_description: "", discount_enabled: false, discount_type: "percentage", discount_value: "", discount_start: "", discount_end: "", is_flash_sale: false });
    setVariants([{ size: "", quantity: "1" }]);
    setProductImages([]);
    setEditing(null);
    setShowForm(false);
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const inputCls = "w-full border border-border bg-transparent px-3 py-2.5 text-[11px] outline-none focus:border-foreground transition-colors duration-150";
  const labelCls = "text-[9px] tracking-widest uppercase text-muted-foreground block mb-1";
  const toggleCls = (on: boolean) => `relative w-10 h-5 rounded-full transition-colors duration-150 cursor-pointer ${on ? "bg-[hsl(352,82%,38%)]" : "bg-border"}`;
  const knobCls = (on: boolean) => `absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform duration-150 ${on ? "translate-x-5" : "translate-x-0.5"}`;

  if (showForm) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[13px] tracking-[0.3em] uppercase font-extralight">
            {editing ? "Edit Product" : "Add Product"}
          </h1>
          <button onClick={resetForm} className="nav-link text-[9px] text-muted-foreground">← Back</button>
        </div>

        <form onSubmit={handleSave} className="max-w-2xl space-y-6">
          {/* General */}
          <div className="border border-border p-5 space-y-3">
            <h3 className="editorial-heading text-[10px] mb-3">General</h3>
            <div>
              <label className={labelCls}>Product Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Brand</label>
                <select value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })} className={inputCls}>
                  <option value="">Select brand</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                  {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Price *</label>
                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>SKU</label>
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Pricing & Discount */}
          <div className={`border p-5 space-y-3 transition-all duration-150 ${form.discount_enabled ? "border-l-2 border-l-[hsl(352,82%,38%)] border-border" : "border-border"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="editorial-heading text-[10px]">Discount Settings</h3>
                {form.discount_enabled && form.is_flash_sale && (
                  <span className="text-[9px] tracking-[0.1em] uppercase font-light px-2 py-0.5 border border-[hsl(352,82%,38%)] text-[hsl(352,82%,38%)] rounded-full">Flash Active</span>
                )}
              </div>
              <button type="button" onClick={() => setForm({ ...form, discount_enabled: !form.discount_enabled })} className={toggleCls(form.discount_enabled)}>
                <div className={knobCls(form.discount_enabled)} />
              </button>
            </div>
            {form.discount_enabled && (
              <div className="space-y-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Discount Type</label>
                    <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className={inputCls}>
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                      <option value="override">Override Price</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Discount Value</label>
                    <input type="number" step="0.01" min="0" value={form.discount_value}
                      onChange={(e) => setForm({ ...form, discount_value: e.target.value })} className={inputCls}
                      placeholder={form.discount_type === "percentage" ? "25" : "50.00"} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Start Date</label>
                    <input type="datetime-local" value={form.discount_start} onChange={(e) => setForm({ ...form, discount_start: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>End Date</label>
                    <input type="datetime-local" value={form.discount_end} onChange={(e) => setForm({ ...form, discount_end: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button type="button" onClick={() => setForm({ ...form, is_flash_sale: !form.is_flash_sale })} className={toggleCls(form.is_flash_sale)}>
                    <div className={knobCls(form.is_flash_sale)} />
                  </button>
                  <span className="text-[10px] tracking-widest uppercase">Flash Sale</span>
                </label>
              </div>
            )}
          </div>

          {/* Media */}
          <div className="border border-border p-5 space-y-3">
            <h3 className="editorial-heading text-[10px] mb-3">Media</h3>
            <div className="grid grid-cols-4 gap-3">
              {productImages.map((url, i) => (
                <ImageUpload key={i} bucket="product-images" currentUrl={url}
                  onUpload={(newUrl) => {
                    const imgs = [...productImages];
                    if (newUrl) { imgs[i] = newUrl; } else { imgs.splice(i, 1); }
                    setProductImages(imgs);
                  }} />
              ))}
              <ImageUpload bucket="product-images" onUpload={(url) => {
                if (url) setProductImages([...productImages, url]);
              }} />
            </div>
          </div>

          {/* Inventory */}
          <div className="border border-border p-5 space-y-3">
            <h3 className="editorial-heading text-[10px] mb-3">Inventory</h3>
            {variants.map((v, i) => (
              <div key={i} className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className={labelCls}>Size</label>
                  <input value={v.size} onChange={(e) => { const n = [...variants]; n[i].size = e.target.value; setVariants(n); }} className={inputCls} />
                </div>
                <div className="w-20">
                  <label className={labelCls}>Qty</label>
                  <input type="number" min="0" value={v.quantity} onChange={(e) => { const n = [...variants]; n[i].quantity = e.target.value; setVariants(n); }} className={inputCls} />
                </div>
                {variants.length > 1 && (
                  <button type="button" onClick={() => setVariants(variants.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-foreground pb-2"><Trash2 className="w-3 h-3" /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setVariants([...variants, { size: "", quantity: "1" }])}
              className="nav-link text-[9px] text-muted-foreground flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add Size
            </button>
          </div>

          {/* Details */}
          <div className="border border-border p-5 space-y-3">
            <h3 className="editorial-heading text-[10px] mb-3">Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Color</label>
                <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Material</label>
                <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Condition</label>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className={inputCls}>
                {conditionLevels.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Condition Description</label>
              <textarea value={form.condition_description} onChange={(e) => setForm({ ...form, condition_description: e.target.value })}
                className={`${inputCls} min-h-[60px] resize-none`} placeholder="Describe specific wear, flaws, or highlights..." />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${inputCls} min-h-[80px] resize-none`} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-4 h-4 border flex items-center justify-center transition-all duration-150 ${
                form.featured ? "bg-foreground border-foreground" : "border-foreground"
              }`} onClick={() => setForm({ ...form, featured: !form.featured })}>
                {form.featured && <Check className="w-3 h-3 text-background" />}
              </div>
              <span className="text-[10px] tracking-widest uppercase">Featured Product</span>
            </label>
          </div>

          {/* Save */}
          <div className="flex gap-3 lg:static fixed bottom-0 left-0 right-0 bg-background border-t border-border lg:border-0 p-4 lg:p-0 z-30">
            <button type="submit" className="flex-1 lg:flex-none bg-primary text-primary-foreground px-8 py-3 editorial-heading text-[10px] hover:opacity-80 transition-opacity duration-150 min-h-[44px]">
              {editing ? "Update Product" : "Create Product"}
            </button>
            <button type="button" onClick={resetForm} className="flex-1 lg:flex-none border border-border px-8 py-3 editorial-heading text-[10px] hover:border-foreground transition-all duration-150 min-h-[44px]">
              Cancel
            </button>
          </div>
        </form>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[13px] tracking-[0.3em] uppercase font-extralight">Products</h1>
        <button onClick={() => setShowForm(true)}
          className="bg-primary text-primary-foreground px-5 py-2 editorial-heading text-[9px] flex items-center gap-2 hover:opacity-80 transition-opacity duration-150 min-h-[36px]">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      <div className="flex items-center border border-border px-3 py-2 mb-6 max-w-md">
        <Search className="w-3 h-3 text-muted-foreground mr-2" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
          className="bg-transparent outline-none text-[11px] tracking-widest flex-1 placeholder:text-muted-foreground" />
      </div>

      <div className="border border-border overflow-x-auto">
        <div className="min-w-[500px]">
          <div className="grid grid-cols-[1fr_1fr_80px_80px_80px] gap-3 px-4 py-2.5 border-b border-border bg-muted">
            <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Name</span>
            <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Brand</span>
            <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Category</span>
            <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Price</span>
            <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Actions</span>
          </div>
          {filtered.map((p) => (
            <div key={p.id} className="grid grid-cols-[1fr_1fr_80px_80px_80px] gap-3 px-4 py-3 border-b border-border last:border-b-0 items-center hover:bg-muted/50 transition-colors duration-150">
              <span className="text-[11px] font-light truncate">{p.name}</span>
              <span className="text-[11px] font-light text-muted-foreground truncate">{(p.brands as any)?.name || "—"}</span>
              <span className="text-[9px] font-light text-muted-foreground">{p.category}</span>
              <span className="text-[11px] font-light">${p.price.toLocaleString()}</span>
              <div className="flex gap-3">
                <button onClick={() => startEdit(p.id)} className="text-muted-foreground hover:text-foreground transition-colors duration-150"><Pencil className="w-3 h-3" /></button>
                <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive transition-colors duration-150"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-muted-foreground text-xs tracking-widest uppercase">No products</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
