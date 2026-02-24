import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { useToast } from "@/hooks/use-toast";

interface Policy {
  id: string;
  slug: string;
  title: string;
  content: string;
}

const AdminSettings = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [editing, setEditing] = useState<Policy | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("policies").select("*").order("title").then(({ data }) => {
      if (data) setPolicies(data);
    });
  }, []);

  const handleSave = async () => {
    if (!editing) return;
    await supabase.from("policies").update({ content: editing.content, title: editing.title }).eq("id", editing.id);
    toast({ title: "Policy updated" });
    setPolicies((prev) => prev.map((p) => (p.id === editing.id ? editing : p)));
    setEditing(null);
  };

  if (editing) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[14px] tracking-[0.3em] uppercase font-extralight">Edit Policy</h1>
          <button onClick={() => setEditing(null)} className="nav-link text-[9px] text-muted-foreground">← Back</button>
        </div>
        <div className="max-w-2xl space-y-6">
          <div>
            <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">Title</label>
            <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none" />
          </div>
          <div>
            <label className="text-[9px] tracking-widest uppercase text-muted-foreground block mb-1">Content (Markdown)</label>
            <textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              className="w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none min-h-[400px] resize-none font-mono" />
          </div>
          <button onClick={handleSave}
            className="bg-primary text-primary-foreground px-8 py-3 editorial-heading text-[11px] min-h-[48px]">Save</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-[14px] tracking-[0.3em] uppercase font-extralight mb-8">Settings</h1>

      <h2 className="editorial-heading text-[10px] mb-4">Policies</h2>
      <div className="border border-border">
        {policies.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-6 py-4 border-b border-border last:border-b-0">
            <span className="text-[11px] font-light">{p.title}</span>
            <button onClick={() => setEditing(p)} className="nav-link text-[9px]">Edit</button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
