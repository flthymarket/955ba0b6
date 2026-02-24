import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  total: number;
  status: string | null;
  tracking: string | null;
  created_at: string | null;
  user_id: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("orders").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setOrders(data);
    });
  }, []);

  const updateTracking = async (id: string, tracking: string) => {
    await supabase.from("orders").update({ tracking }).eq("id", id);
    toast({ title: "Tracking updated" });
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    toast({ title: "Status updated" });
  };

  return (
    <AdminLayout>
      <h1 className="text-[14px] tracking-[0.3em] uppercase font-extralight mb-8">Orders</h1>
      <div className="border border-border">
        <div className="grid grid-cols-[120px_100px_100px_1fr_120px] gap-4 px-6 py-3 border-b border-border bg-muted">
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Order ID</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Total</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Status</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Tracking</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Date</span>
        </div>
        {orders.map((o) => (
          <div key={o.id} className="grid grid-cols-[120px_100px_100px_1fr_120px] gap-4 px-6 py-4 border-b border-border last:border-b-0 items-center">
            <span className="text-[10px] font-light truncate">{o.id.slice(0, 8)}</span>
            <span className="text-[11px] font-light">${o.total.toLocaleString()}</span>
            <select value={o.status || "processing"} onChange={(e) => updateStatus(o.id, e.target.value)}
              className="text-[10px] bg-transparent border border-border px-1 py-1 outline-none">
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
            </select>
            <input defaultValue={o.tracking || ""} onBlur={(e) => updateTracking(o.id, e.target.value)}
              placeholder="Enter tracking"
              className="text-[10px] bg-transparent border border-border px-2 py-1 outline-none" />
            <span className="text-[10px] text-muted-foreground">{o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}</span>
          </div>
        ))}
        {orders.length === 0 && <p className="px-6 py-8 text-center text-muted-foreground text-xs tracking-widest uppercase">No orders</p>}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
