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

const CONTENT_FIELDS = [
  { slug: "about", title: "About", label: "About Page Content", multiline: true },
  { slug: "crypto-btc", title: "BTC Wallet", label: "Bitcoin (BTC) Wallet Address", multiline: false },
  { slug: "crypto-eth", title: "ETH Wallet", label: "Ethereum (ETH) Wallet Address", multiline: false },
  { slug: "crypto-sol", title: "SOL Wallet", label: "Solana (SOL) Wallet Address", multiline: false },
];

const AdminSettings = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [editing, setEditing] = useState<Policy | null>(null);
  const [content, setContent] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("policies").select("*").order("title").then(({ data }) => {
      if (data) setPolicies(data);
    });
    supabase
      .from("site_content")
      .select("slug, body")
      .in("slug", CONTENT_FIELDS.map((f) => f.slug))
      .then(({ data }) => {
        const map: Record<string, string> = {};
        (data || []).forEach((r) => (map[r.slug] = r.body || ""));
        setContent(map);
      });
  }, []);

  const handleSave = async () => {
    if (!editing) return;
    await supabase.from("policies").update({ content: editing.content, title: editing.title }).eq("id", editing.id);
    toast({ title: "Policy updated" });
    setPolicies((prev) => prev.map((p) => (p.id === editing.id ? editing : p)));
    setEditing(null);
  };

  const saveContent = async () => {
    setSaving(true);
    for (const field of CONTENT_FIELDS) {
      const body = content[field.slug] ?? "";
      const { data: existing } = await supabase
        .from("site_content")
        .select("id")
        .eq("slug", field.slug)
        .maybeSingle();
      if (existing) {
        await supabase.from("site_content").update({ body, title: field.title }).eq("id", existing.id);
      } else {
        await supabase.from("site_content").insert({ slug: field.slug, title: field.title, body });
      }
    }
    setSaving(false);
    toast({ title: "Settings saved" });
  };

  const inputCls = "w-full border border-border bg-transparent px-3 py-2 text-[11px] outline-none";
  const labelCls = "text-[9px] tracking-widest uppercase text-muted-foreground block mb-1";

  if (editing) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[14px] tracking-[0.3em] uppercase font-extralight">Edit Policy</h1>
          <button onClick={() => setEditing(null)} className="nav-link text-[9px] text-muted-foreground">← Back</button>
        </div>
        <div className="max-w-2xl space-y-6">
          <div>
            <label className={labelCls}>Title</label>
            <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Content (Markdown)</label>
            <textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              className={`${inputCls} min-h-[400px] resize-none font-mono`} />
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

      <div className="max-w-2xl space-y-6 mb-14">
        <h2 className="editorial-heading text-[10px]">Crypto Wallets & About</h2>
        {CONTENT_FIELDS.map((field) => (
          <div key={field.slug}>
            <label className={labelCls}>{field.label}</label>
            {field.multiline ? (
              <textarea
                value={content[field.slug] || ""}
                onChange={(e) => setContent({ ...content, [field.slug]: e.target.value })}
                className={`${inputCls} min-h-[160px] resize-none`}
              />
            ) : (
              <input
                value={content[field.slug] || ""}
                onChange={(e) => setContent({ ...content, [field.slug]: e.target.value })}
                className={`${inputCls} font-mono`}
                placeholder="Paste wallet address"
              />
            )}
          </div>
        ))}
        <p className="text-[10px] text-muted-foreground">
          Wallet addresses shown here are used at crypto checkout. Leave a field blank to hide that currency.
        </p>
        <button onClick={saveContent} disabled={saving}
          className="bg-primary text-primary-foreground px-8 py-3 editorial-heading text-[11px] min-h-[48px] disabled:opacity-50">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

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
