import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import ImageUpload from "@/components/ImageUpload";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
}

const AdminBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", logo_url: "", description: "" });
  const { toast } = useToast();

  useEffect(() => { fetchBrands(); }, []);

  const fetchBrands = async () => {
    const { data } = await supabase.from("brands").select("*").order("name");
    if (data) setBrands(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: form.name, logo_url: form.logo_url || null, description: form.description || null };
    if (editing) {
      await supabase.from("brands").update(data).eq("id", editing);
    } else {
      await supabase.from("brands").insert(data);
    }
    toast({ title: editing ? "Brand updated" : "Brand created" });
    setShowForm(false); setEditing(null);
    setForm({ name: "", logo_url: "", description: "" });
    fetchBrands();
  };

  const startEdit = (b: Brand) => {
    setForm({ name: b.name, logo_url: b.logo_url || "", description: b.description || "" });
    setEditing(b.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this brand?")) return;
    await supabase.from("brands").delete().eq("id", id);
    toast({ title: "Brand deleted" });
    fetchBrands();
  };

  if (showForm) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[14px] tracking-[0.3em] uppercase font-extralight">{editing ? "Edit Brand" : "Add Brand"}</h1>
          <button onClick={() => { setShowForm(false); setEditing(null); }} className="nav-link text-[9px] text-muted-foreground">← Back</button>
        </div>
        <form onSubmit={handleSave} className="max-w-lg space-y-6">
          <div>
            <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">Brand Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none focus:border-foreground" />
          </div>
          <div>
            <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-2">Logo</label>
            <ImageUpload bucket="brand-logos" currentUrl={form.logo_url}
              onUpload={(url) => setForm({ ...form, logo_url: url })} className="w-32" />
          </div>
          <div>
            <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none min-h-[80px] resize-none" />
          </div>
          <button type="submit" className="bg-primary text-primary-foreground px-8 py-3 editorial-heading text-[11px] min-h-[48px]">
            {editing ? "Update" : "Create"}
          </button>
        </form>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[14px] tracking-[0.3em] uppercase font-extralight">Brands</h1>
        <button onClick={() => { setForm({ name: "", logo_url: "", description: "" }); setShowForm(true); }}
          className="bg-primary text-primary-foreground px-6 py-2 editorial-heading text-[10px] flex items-center gap-2 hover:opacity-80 min-h-[40px]">
          <Plus className="w-3 h-3" /> Add Brand
        </button>
      </div>
      <div className="border border-border">
        <div className="grid grid-cols-[40px_1fr_120px] gap-4 px-6 py-3 border-b border-border bg-muted">
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Logo</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Brand Name</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Actions</span>
        </div>
        {brands.map((b) => (
          <div key={b.id} className="grid grid-cols-[40px_1fr_120px] gap-4 px-6 py-4 border-b border-border last:border-b-0 items-center">
            <div className="w-8 h-8 bg-secondary overflow-hidden flex items-center justify-center">
              {b.logo_url ? <img src={b.logo_url} alt="" className="w-full h-full object-contain" /> : <span className="text-[8px] text-muted-foreground">—</span>}
            </div>
            <span className="text-[11px] font-light">{b.name}</span>
            <div className="flex gap-3">
              <button onClick={() => startEdit(b)} className="text-muted-foreground hover:text-foreground"><Pencil className="w-3 h-3" /></button>
              <button onClick={() => handleDelete(b.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
        {brands.length === 0 && <p className="px-6 py-8 text-center text-muted-foreground text-xs tracking-widest uppercase">No brands</p>}
      </div>
    </AdminLayout>
  );
};

export default AdminBrands;
