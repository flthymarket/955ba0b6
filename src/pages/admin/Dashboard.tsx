import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeOffers: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    newsletterSubs: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [products, offers, orders, newsletter] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("offers").select("id", { count: "exact", head: true }).in("status", ["pending", "countered"]),
        supabase.from("orders").select("id, total", { count: "exact" }).eq("status", "processing"),
        supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      ]);

      const revenue = orders.data?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

      setStats({
        totalProducts: products.count || 0,
        activeOffers: offers.count || 0,
        pendingOrders: orders.count || 0,
        totalRevenue: revenue,
        newsletterSubs: newsletter.count || 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Products", value: stats.totalProducts },
    { label: "Active Offers", value: stats.activeOffers },
    { label: "Pending Orders", value: stats.pendingOrders },
    { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}` },
    { label: "Newsletter Subscribers", value: stats.newsletterSubs },
  ];

  return (
    <AdminLayout>
      <h1 className="text-[14px] tracking-[0.3em] uppercase font-extralight mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="border border-border p-6">
            <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-2">{card.label}</p>
            <p className="text-xl font-extralight">{card.value}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
