import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Account = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ name: string; email: string }>({ name: "", email: "" });

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("name, email").eq("user_id", user.id).single().then(({ data }) => {
      if (data) setProfile({ name: data.name || "", email: data.email || "" });
    });
    supabase.from("orders").select("id, total, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setOrders(data);
    });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || !user) return null;

  return (
    <main className="pt-40 pb-24">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-lg tracking-[0.3em] font-extralight uppercase">My Account</h1>
          <button onClick={handleSignOut} className="nav-link text-[9px] text-muted-foreground">
            Sign Out
          </button>
        </div>

        {isAdmin && (
          <Link to="/admin" className="block mb-8 border border-border p-4 text-center editorial-heading text-[10px] hover:bg-foreground hover:text-background transition-all duration-300">
            Admin Dashboard →
          </Link>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Profile */}
          <div>
            <h2 className="editorial-heading text-[10px] mb-6 border-b border-border pb-3">Profile</h2>
            <div className="space-y-3 text-[11px] font-light">
              <div className="flex justify-between">
                <span className="text-muted-foreground tracking-wide">Name</span>
                <span>{profile.name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground tracking-wide">Email</span>
                <span>{profile.email || user.email}</span>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div>
            <h2 className="editorial-heading text-[10px] mb-6 border-b border-border pb-3">Orders</h2>
            {orders.length === 0 ? (
              <p className="text-[11px] text-muted-foreground font-light">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="flex justify-between text-[11px] font-light border-b border-border pb-2">
                    <span className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</span>
                    <span>${o.total}</span>
                    <span className="text-muted-foreground uppercase text-[9px] tracking-widest">{o.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Account;
