import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";
import { Plus, Trash2, Pencil } from "lucide-react";

interface HeroBanner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  button_text: string | null;
  display_type: string | null;
  enabled: boolean | null;
  sort_order: number | null;
}

const AdminHero = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [editing, setEditing] = useState<HeroBanner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "FLTHYMRKT", subtitle: "", image_url: "", link_url: "/collection",
    button_text: "Shop Now", display_type: "text", enabled: true, sort_order: 0,
  });

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    const { data } = await supabase.from("hero_banners").select("*").order("sort_order");
    if (data) setBanners(data as any);
  };

  const handleSave = async () => {
    const payload: any = { ...form, sort_order: Number(form.sort_order) || 0 };
    if (editing) {
      await supabase.from("hero_banners").update(payload).eq("id", editing.id);
      toast({ title: "Hero banner updated" });
    } else {
      await supabase.from("hero_banners").insert(payload);
      toast({ title: "Hero banner created" });
    }
    setShowForm(false);
    setEditing(null);
    fetchBanners();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this hero banner?")) return;
    await supabase.from("hero_banners").delete().eq("id", id);
    toast({ title: "Deleted" });
    fetchBanners();
  };

  const startEdit = (b: HeroBanner) => {
    setForm({
      title: b.title || "", subtitle: b.subtitle || "", image_url: b.image_url || "",
      link_url: b.link_url || "/collection", button_text: b.button_text || "Shop Now",
      display_type: b.display_type || "text", enabled: b.enabled ?? true, sort_order: b.sort_order ?? 0,
    });
    setEditing(b);
    setShowForm(true);
  };

  const inputCls = "w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground transition-colors";
  const labelCls = "text-xs tracking-widest uppercase text-muted-foreground block mb-2";

  if (showForm) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-base tracking-[0.3em] uppercase font-extralight">{editing ? "Edit" : "Add"} Hero Banner</h1>
          <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:opacity-50">← Back</button>
        </div>
        <div className="max-w-2xl space-y-6">
          <div>
            <label className={labelCls}>Display Type</label>
            <select value={form.display_type} onChange={(e) => setForm({ ...form, display_type: e.target.value })} className={inputCls}>
              <option value="text">Text Only (Large title)</option>
              <option value="image">Image with overlay text</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="FLTHYMRKT" />
          </div>
          <div>
            <label className={labelCls}>Subtitle</label>
            <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={inputCls} placeholder="Optional subtitle" />
          </div>
          {(form.display_type === "image" || form.display_type === "both") && (
            <div>
              <label className={labelCls}>Hero Image</label>
              <ImageUpload bucket="hero-images" currentUrl={form.image_url || undefined}
                onUpload={(url) => setForm({ ...form, image_url: url || "" })} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Button Text</label>
              <input value={form.button_text} onChange={(e) => setForm({ ...form, button_text: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Button Link</label>
              <input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Enabled</label>
              <label className="flex items-center gap-3 cursor-pointer mt-2">
                <div className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.enabled ? "bg-foreground" : "bg-border"}`}
                  onClick={() => setForm({ ...form, enabled: !form.enabled })}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-background transition-transform ${form.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm">{form.enabled ? "Active" : "Inactive"}</span>
              </label>
            </div>
          </div>
          <button onClick={handleSave} className="bg-foreground text-background px-8 py-4 text-sm tracking-[0.15em] uppercase font-light hover:opacity-80 min-h-[48px]">
            {editing ? "Update" : "Create"} Banner
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-base tracking-[0.3em] uppercase font-extralight">Hero Banners</h1>
        <button onClick={() => { setForm({ title: "FLTHYMRKT", subtitle: "", image_url: "", link_url: "/collection", button_text: "Shop Now", display_type: "text", enabled: true, sort_order: 0 }); setShowForm(true); }}
          className="bg-foreground text-background px-6 py-3 text-xs tracking-[0.15em] uppercase font-light flex items-center gap-2 hover:opacity-80 min-h-[44px]">
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>
      <p className="text-sm text-muted-foreground font-light mb-6">Configure the hero banner at the top of your homepage. The first enabled banner will be displayed.</p>
      <div className="space-y-4">
        {banners.map((b) => (
          <div key={b.id} className="border border-border p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-light">{b.title || "Untitled"}</p>
              <p className="text-xs text-muted-foreground mt-1">Type: {b.display_type} · {b.enabled ? "Active" : "Inactive"}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => startEdit(b)} className="text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(b.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {banners.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No hero banners configured</p>}
      </div>
    </AdminLayout>
  );
};

export default AdminHero;
