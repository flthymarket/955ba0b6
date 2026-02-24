import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Story {
  id: string;
  title: string;
  image_url: string | null;
  content: string | null;
  publish_date: string | null;
  published: boolean | null;
}

const AdminStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", image_url: "", content: "", published: false });
  const { toast } = useToast();

  useEffect(() => { fetchStories(); }, []);

  const fetchStories = async () => {
    const { data } = await supabase.from("stories").select("*").order("created_at", { ascending: false });
    if (data) setStories(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: form.title,
      image_url: form.image_url || null,
      content: form.content || null,
      published: form.published,
      publish_date: new Date().toISOString(),
    };
    if (editing) {
      await supabase.from("stories").update(data).eq("id", editing);
    } else {
      await supabase.from("stories").insert(data);
    }
    toast({ title: editing ? "Story updated" : "Story created" });
    setShowForm(false); setEditing(null);
    setForm({ title: "", image_url: "", content: "", published: false });
    fetchStories();
  };

  const startEdit = (s: Story) => {
    setForm({ title: s.title, image_url: s.image_url || "", content: s.content || "", published: s.published || false });
    setEditing(s.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this story?")) return;
    await supabase.from("stories").delete().eq("id", id);
    toast({ title: "Story deleted" });
    fetchStories();
  };

  if (showForm) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[14px] tracking-[0.3em] uppercase font-extralight">{editing ? "Edit Story" : "Add Story"}</h1>
          <button onClick={() => { setShowForm(false); setEditing(null); }} className="nav-link text-[9px] text-muted-foreground">← Back</button>
        </div>
        <form onSubmit={handleSave} className="max-w-lg space-y-6">
          <div>
            <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
              className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none" />
          </div>
          <div>
            <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">Image URL</label>
            <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none" />
          </div>
          <div>
            <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">Content</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none min-h-[200px] resize-none" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4 appearance-none border border-foreground checked:bg-foreground cursor-pointer" />
            <span className="text-[10px] tracking-widest uppercase">Published</span>
          </label>
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
        <h1 className="text-[14px] tracking-[0.3em] uppercase font-extralight">Stories</h1>
        <button onClick={() => { setForm({ title: "", image_url: "", content: "", published: false }); setShowForm(true); }}
          className="bg-primary text-primary-foreground px-6 py-2 editorial-heading text-[10px] flex items-center gap-2 hover:opacity-80 min-h-[40px]">
          <Plus className="w-3 h-3" /> Add Story
        </button>
      </div>
      <div className="border border-border">
        <div className="grid grid-cols-[1fr_100px_80px_100px] gap-4 px-6 py-3 border-b border-border bg-muted">
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Title</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Date</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Status</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Actions</span>
        </div>
        {stories.map((s) => (
          <div key={s.id} className="grid grid-cols-[1fr_100px_80px_100px] gap-4 px-6 py-4 border-b border-border last:border-b-0 items-center">
            <span className="text-[11px] font-light">{s.title}</span>
            <span className="text-[10px] text-muted-foreground">{s.publish_date ? new Date(s.publish_date).toLocaleDateString() : "—"}</span>
            <span className={`text-[9px] tracking-widest uppercase ${s.published ? "text-foreground" : "text-muted-foreground"}`}>
              {s.published ? "Live" : "Draft"}
            </span>
            <div className="flex gap-3">
              <button onClick={() => startEdit(s)} className="text-muted-foreground hover:text-foreground"><Pencil className="w-3 h-3" /></button>
              <button onClick={() => handleDelete(s.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
        {stories.length === 0 && <p className="px-6 py-8 text-center text-muted-foreground text-xs tracking-widest uppercase">No stories</p>}
      </div>
    </AdminLayout>
  );
};

export default AdminStories;
