import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  featured: boolean | null;
  brand_id: string | null;
  brands?: { name: string } | null;
}

interface Variant {
  id: string;
  size: string;
  quantity: number;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  // Form state
  const [form, setForm] = useState({
    name: "", brand_id: "", category: "All", price: "", sku: "",
    description: "", condition: "Good", color: "", material: "",
    featured: false, condition_description: "",
  });
  const [variants, setVariants] = useState<{ size: string; quantity: string }[]>([{ size: "", quantity: "1" }]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);

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
    const productData = {
      name: form.name,
      brand_id: form.brand_id || null,
      category: form.category,
      price: parseFloat(form.price),
      sku: form.sku || null,
      description: form.description || null,
      condition: form.condition,
      condition_description: form.condition_description || null,
      color: form.color || null,
      material: form.material || null,
      featured: form.featured,
    };

    let productId = editing;

    if (editing) {
      await supabase.from("products").update(productData).eq("id", editing);
      await supabase.from("product_variants").delete().eq("product_id", editing);
    } else {
      const { data } = await supabase.from("products").insert(productData).select("id").single();
      if (data) productId = data.id;
    }

    if (productId) {
      const variantData = variants
        .filter((v) => v.size)
        .map((v) => ({ product_id: productId!, size: v.size, quantity: parseInt(v.quantity) || 0 }));
      if (variantData.length > 0) {
        await supabase.from("product_variants").insert(variantData);
      }
    }

    toast({ title: editing ? "Product updated" : "Product created" });
    resetForm();
    fetchProducts();
  };

  const startEdit = async (id: string) => {
    const { data: product } = await supabase.from("products").select("*").eq("id", id).single();
    const { data: pvariants } = await supabase.from("product_variants").select("*").eq("product_id", id);

    if (product) {
      setForm({
        name: product.name,
        brand_id: product.brand_id || "",
        category: product.category,
        price: String(product.price),
        sku: product.sku || "",
        description: product.description || "",
        condition: product.condition || "Good",
        condition_description: product.condition_description || "",
        color: product.color || "",
        material: product.material || "",
        featured: product.featured || false,
      });
      setVariants(
        pvariants && pvariants.length > 0
          ? pvariants.map((v) => ({ size: v.size, quantity: String(v.quantity) }))
          : [{ size: "", quantity: "1" }]
      );
      setEditing(id);
      setShowForm(true);
    }
  };

  const resetForm = () => {
    setForm({ name: "", brand_id: "", category: "All", price: "", sku: "", description: "", condition: "Good", color: "", material: "", featured: false, condition_description: "" });
    setVariants([{ size: "", quantity: "1" }]);
    setEditing(null);
    setShowForm(false);
  };

  const totalQty = (productId: string) => {
    // We'd need variants for this - simplified for now
    return "—";
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (showForm) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[14px] tracking-[0.3em] uppercase font-extralight">
            {editing ? "Edit Product" : "Add Product"}
          </h1>
          <button onClick={resetForm} className="nav-link text-[9px] text-muted-foreground">← Back</button>
        </div>

        <form onSubmit={handleSave} className="max-w-2xl space-y-8">
          <div className="border border-border p-6 space-y-4">
            <h3 className="editorial-heading text-[10px] mb-4">General</h3>
            <div>
              <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">Product Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none focus:border-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">Brand</label>
                <select value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                  className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none">
                  <option value="">Select brand</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none">
                  <option value="All">All</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Footwear">Footwear</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">Price *</label>
                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required
                  className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none" />
              </div>
              <div>
                <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">SKU</label>
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none" />
              </div>
            </div>
          </div>

          <div className="border border-border p-6 space-y-4">
            <h3 className="editorial-heading text-[10px] mb-4">Inventory</h3>
            {variants.map((v, i) => (
              <div key={i} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">Size</label>
                  <input value={v.size} onChange={(e) => {
                    const n = [...variants]; n[i].size = e.target.value; setVariants(n);
                  }} className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none" />
                </div>
                <div className="w-24">
                  <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">Qty</label>
                  <input type="number" min="0" value={v.quantity} onChange={(e) => {
                    const n = [...variants]; n[i].quantity = e.target.value; setVariants(n);
                  }} className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none" />
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

          <div className="border border-border p-6 space-y-4">
            <h3 className="editorial-heading text-[10px] mb-4">Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">Color</label>
                <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none" />
              </div>
              <div>
                <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">Material</label>
                <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })}
                  className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none" />
              </div>
            </div>
            <div>
              <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">Condition</label>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none">
                {["Fair", "Good", "Great", "Excellent", "Pristine"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">Condition Description</label>
              <input value={form.condition_description} onChange={(e) => setForm({ ...form, condition_description: e.target.value })}
                className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none" />
            </div>
            <div>
              <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none min-h-[100px] resize-none" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 appearance-none border border-foreground checked:bg-foreground cursor-pointer" />
              <span className="text-[10px] tracking-widest uppercase">Featured Product</span>
            </label>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="bg-primary text-primary-foreground px-8 py-3 editorial-heading text-[11px] hover:opacity-80 transition-opacity min-h-[48px]">
              {editing ? "Update Product" : "Create Product"}
            </button>
            <button type="button" onClick={resetForm} className="border border-border px-8 py-3 editorial-heading text-[11px] hover:border-foreground transition-all min-h-[48px]">
              Cancel
            </button>
          </div>
        </form>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[14px] tracking-[0.3em] uppercase font-extralight">Products</h1>
        <button onClick={() => setShowForm(true)}
          className="bg-primary text-primary-foreground px-6 py-2 editorial-heading text-[10px] flex items-center gap-2 hover:opacity-80 min-h-[40px]">
          <Plus className="w-3 h-3" /> Add Product
        </button>
      </div>

      <div className="flex items-center border border-border px-3 py-2 mb-6 max-w-md">
        <Search className="w-3 h-3 text-muted-foreground mr-2" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
          className="bg-transparent outline-none text-[11px] tracking-widest flex-1 placeholder:text-muted-foreground" />
      </div>

      <div className="border border-border">
        <div className="grid grid-cols-[1fr_1fr_100px_100px_100px] gap-4 px-6 py-3 border-b border-border bg-muted">
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Name</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Brand</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Category</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Price</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Actions</span>
        </div>
        {filtered.map((p) => (
          <div key={p.id} className="grid grid-cols-[1fr_1fr_100px_100px_100px] gap-4 px-6 py-4 border-b border-border last:border-b-0 items-center">
            <span className="text-[11px] font-light">{p.name}</span>
            <span className="text-[11px] font-light text-muted-foreground">{(p.brands as any)?.name || "—"}</span>
            <span className="text-[10px] font-light text-muted-foreground">{p.category}</span>
            <span className="text-[11px] font-light">${p.price.toLocaleString()}</span>
            <div className="flex gap-3">
              <button onClick={() => startEdit(p.id)} className="text-muted-foreground hover:text-foreground"><Pencil className="w-3 h-3" /></button>
              <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="px-6 py-8 text-center text-muted-foreground text-xs tracking-widest uppercase">No products</p>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
