import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";

interface Subscriber {
  id: string;
  email: string;
  user_id: string | null;
  created_at: string | null;
}

const AdminNewsletter = () => {
  const [subs, setSubs] = useState<Subscriber[]>([]);

  useEffect(() => {
    supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setSubs(data);
    });
  }, []);

  const exportCSV = () => {
    const csv = "Email,Date Subscribed,Linked Account\n" +
      subs.map((s) => `${s.email},${s.created_at || ""},${s.user_id ? "Yes" : "No"}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "newsletter_subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[14px] tracking-[0.3em] uppercase font-extralight">Newsletter</h1>
        <button onClick={exportCSV}
          className="border border-border px-6 py-2 editorial-heading text-[10px] hover:border-foreground min-h-[40px]">
          Export CSV
        </button>
      </div>
      <div className="border border-border">
        <div className="grid grid-cols-[1fr_120px_100px] gap-4 px-6 py-3 border-b border-border bg-muted">
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Email</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Date</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Account</span>
        </div>
        {subs.map((s) => (
          <div key={s.id} className="grid grid-cols-[1fr_120px_100px] gap-4 px-6 py-4 border-b border-border last:border-b-0 items-center">
            <span className="text-[11px] font-light">{s.email}</span>
            <span className="text-[10px] text-muted-foreground">{s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}</span>
            <span className="text-[10px] text-muted-foreground">{s.user_id ? "Yes" : "No"}</span>
          </div>
        ))}
        {subs.length === 0 && <p className="px-6 py-8 text-center text-muted-foreground text-xs tracking-widest uppercase">No subscribers</p>}
      </div>
    </AdminLayout>
  );
};

export default AdminNewsletter;
