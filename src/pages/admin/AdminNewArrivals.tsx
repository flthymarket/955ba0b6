import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Search } from "lucide-react";

interface NewArrival {
  id: string;
  shopify_handle: string;
  product_title: string | null;
  added_at: string | null;
}

const AdminNewArrivals = () => {
  const [items, setItems] = useState<NewArrival[]>([]);
  const [handle, setHandle] = useState("");
  const [title, setTitle] = useState("");
  const { toast } = useToast();

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from("new_arrivals").select("*").order("added_at", { ascending: false });
    if (data) setItems(data as any);
  };

  const handleAdd = async () => {
    if (!handle.trim()) return;
    const { error } = await supabase.from("new_arrivals").insert({
      shopify_handle: handle.trim(),
      product_title: title.trim() || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Added to New Arrivals" });
      setHandle("");
      setTitle("");
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("new_arrivals").delete().eq("id", id);
    toast({ title: "Removed" });
    fetchItems();
  };

  const inputCls = "w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground transition-colors";

  return (
    <AdminLayout>
      <h1 className="text-base tracking-[0.3em] uppercase font-extralight mb-8">New Arrivals</h1>
      <p className="text-sm text-muted-foreground font-light mb-6">
        Add Shopify product handles to mark them as "New Arrivals" on the homepage. The handle is the URL slug of the product in Shopify (e.g., "chrome-hearts-jeans").
      </p>

      <div className="max-w-lg mb-10 space-y-4">
        <div>
          <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">Product Handle *</label>
          <input value={handle} onChange={(e) => setHandle(e.target.value)} className={inputCls} placeholder="chrome-hearts-jeans" />
        </div>
        <div>
          <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">Product Title (for reference)</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Chrome Hearts Jeans" />
        </div>
        <button onClick={handleAdd}
          className="bg-foreground text-background px-6 py-3 text-xs tracking-[0.15em] uppercase font-light flex items-center gap-2 hover:opacity-80 min-h-[44px]">
          <Plus className="w-4 h-4" /> Add to New Arrivals
        </button>
      </div>

      <div className="border border-border">
        <div className="grid grid-cols-[1fr_1fr_80px] gap-4 px-6 py-4 border-b border-border bg-muted">
          <span className="text-xs tracking-widest uppercase text-muted-foreground">Handle</span>
          <span className="text-xs tracking-widest uppercase text-muted-foreground">Title</span>
          <span className="text-xs tracking-widest uppercase text-muted-foreground">Action</span>
        </div>
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-[1fr_1fr_80px] gap-4 px-6 py-4 border-b border-border last:border-b-0 items-center">
            <span className="text-sm font-light">{item.shopify_handle}</span>
            <span className="text-sm text-muted-foreground">{item.product_title || "—"}</span>
            <button onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="px-6 py-10 text-center text-muted-foreground text-sm">No new arrivals configured</p>}
      </div>
    </AdminLayout>
  );
};

export default AdminNewArrivals;
