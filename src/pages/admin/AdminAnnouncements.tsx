import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Announcement {
  id: string;
  banner_text: string;
  subtext: string | null;
  text_alignment: string | null;
  background_style: string | null;
  enabled: boolean | null;
  start_date: string | null;
  end_date: string | null;
  show_countdown: boolean | null;
  link_url: string | null;
  priority: number | null;
  banner_type: string | null;
}

const AdminAnnouncements = () => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    banner_text: "", subtext: "", text_alignment: "center", background_style: "dark",
    enabled: true, start_date: "", end_date: "", show_countdown: false, link_url: "",
    priority: 0, banner_type: "informational",
  });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from("announcements").select("*").order("priority", { ascending: false });
    if (data) setItems(data as any);
  };

  const handleSave = async () => {
    const payload: any = {
      banner_text: form.banner_text, subtext: form.subtext || null,
      text_alignment: form.text_alignment, background_style: form.background_style,
      enabled: form.enabled, show_countdown: form.show_countdown,
      link_url: form.link_url || null, priority: Number(form.priority) || 0,
      banner_type: form.banner_type,
      start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
    };
    if (editing) {
      await supabase.from("announcements").update(payload).eq("id", editing);
      toast({ title: "Announcement updated" });
    } else {
      await supabase.from("announcements").insert(payload);
      toast({ title: "Announcement created" });
    }
    resetForm();
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    await supabase.from("announcements").delete().eq("id", id);
    toast({ title: "Deleted" });
    fetchItems();
  };

  const startEdit = (a: Announcement) => {
    setForm({
      banner_text: a.banner_text, subtext: a.subtext || "", text_alignment: a.text_alignment || "center",
      background_style: a.background_style || "dark", enabled: a.enabled ?? true,
      start_date: a.start_date ? new Date(a.start_date).toISOString().slice(0, 16) : "",
      end_date: a.end_date ? new Date(a.end_date).toISOString().slice(0, 16) : "",
      show_countdown: a.show_countdown ?? false, link_url: a.link_url || "",
      priority: a.priority ?? 0, banner_type: a.banner_type || "informational",
    });
    setEditing(a.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ banner_text: "", subtext: "", text_alignment: "center", background_style: "dark", enabled: true, start_date: "", end_date: "", show_countdown: false, link_url: "", priority: 0, banner_type: "informational" });
    setEditing(null);
    setShowForm(false);
  };

  const inputCls = "w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground transition-colors";
  const labelCls = "text-xs tracking-widest uppercase text-muted-foreground block mb-2";

  if (showForm) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-base tracking-[0.3em] uppercase font-extralight">{editing ? "Edit" : "Add"} Announcement</h1>
          <button onClick={resetForm} className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:opacity-50">← Back</button>
        </div>
        <div className="max-w-2xl space-y-6">
          <div>
            <label className={labelCls}>Banner Text *</label>
            <input value={form.banner_text} onChange={(e) => setForm({ ...form, banner_text: e.target.value })} className={inputCls} placeholder="FREE SHIPPING ON ALL ORDERS" />
          </div>
          <div>
            <label className={labelCls}>Subtext</label>
            <input value={form.subtext} onChange={(e) => setForm({ ...form, subtext: e.target.value })} className={inputCls} placeholder="Limited time only" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Style</label>
              <select value={form.background_style} onChange={(e) => setForm({ ...form, background_style: e.target.value })} className={inputCls}>
                <option value="dark">Dark (Black bg)</option>
                <option value="light">Light (Gray bg)</option>
                <option value="accent">Accent (Red bg)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Priority</label>
              <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Start Date</label>
              <input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End Date</label>
              <input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Link URL</label>
            <input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} className={inputCls} placeholder="/collection" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.enabled ? "bg-foreground" : "bg-border"}`}
                onClick={() => setForm({ ...form, enabled: !form.enabled })}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-background transition-transform ${form.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm">Enabled</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.show_countdown ? "bg-foreground" : "bg-border"}`}
                onClick={() => setForm({ ...form, show_countdown: !form.show_countdown })}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-background transition-transform ${form.show_countdown ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm">Countdown</span>
            </label>
          </div>
          <button onClick={handleSave} className="bg-foreground text-background px-8 py-4 text-sm tracking-[0.15em] uppercase font-light hover:opacity-80 min-h-[48px]">
            {editing ? "Update" : "Create"}
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-base tracking-[0.3em] uppercase font-extralight">Announcements</h1>
        <button onClick={() => setShowForm(true)}
          className="bg-foreground text-background px-6 py-3 text-xs tracking-[0.15em] uppercase font-light flex items-center gap-2 hover:opacity-80 min-h-[44px]">
          <Plus className="w-4 h-4" /> Add Announcement
        </button>
      </div>
      <p className="text-sm text-muted-foreground font-light mb-6">Announcement banners appear as a scrolling marquee at the top of every page. The highest priority enabled banner is shown.</p>
      <div className="space-y-4">
        {items.map((a) => (
          <div key={a.id} className="border border-border p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-light">{a.banner_text}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Style: {a.background_style} · Priority: {a.priority} · {a.enabled ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => startEdit(a)} className="text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(a.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No announcements yet</p>}
      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
