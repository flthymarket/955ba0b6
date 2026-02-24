import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  created_at: string | null;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<Profile[]>([]);

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setUsers(data);
    });
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-[14px] tracking-[0.3em] uppercase font-extralight mb-8">Users</h1>
      <div className="border border-border">
        <div className="grid grid-cols-[1fr_1fr_120px] gap-4 px-6 py-3 border-b border-border bg-muted">
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Name</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Email</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Joined</span>
        </div>
        {users.map((u) => (
          <div key={u.id} className="grid grid-cols-[1fr_1fr_120px] gap-4 px-6 py-4 border-b border-border last:border-b-0 items-center">
            <span className="text-[11px] font-light">{u.name || "—"}</span>
            <span className="text-[11px] font-light text-muted-foreground">{u.email || "—"}</span>
            <span className="text-[10px] text-muted-foreground">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</span>
          </div>
        ))}
        {users.length === 0 && <p className="px-6 py-8 text-center text-muted-foreground text-xs tracking-widest uppercase">No users</p>}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
