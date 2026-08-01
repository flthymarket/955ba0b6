import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { Package, ShoppingCart, Users, Tags } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, brands: 0, revenue: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const [products, orders, users, brands, orderTotals] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("brands").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
      ]);
      const revenue = (orderTotals.data || []).reduce((s, o: { total: number }) => s + Number(o.total || 0), 0);
      setStats({
        products: products.count || 0,
        orders: orders.count || 0,
        users: users.count || 0,
        brands: brands.count || 0,
        revenue,
      });
    })();
  }, []);

  const cards = [
    { label: "Products", value: stats.products, icon: Package, href: "/admin/products" },
    { label: "Orders", value: stats.orders, icon: ShoppingCart, href: "/admin/orders" },
    { label: "Customers", value: stats.users, icon: Users, href: "/admin/users" },
    { label: "Brands", value: stats.brands, icon: Tags, href: "/admin/brands" },
  ];

  return (
    <AdminLayout>
      <h1 className="text-lg tracking-[0.25em] uppercase mb-8">Dashboard</h1>

      <div className="border border-border p-6 mb-8">
        <p className="editorial-heading text-muted-foreground">Total Revenue</p>
        <p className="font-display text-3xl mt-2">${stats.revenue.toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => navigate(c.href)}
            className="border border-border p-6 text-left hover:bg-muted transition-colors"
          >
            <c.icon className="w-5 h-5 mb-4 text-muted-foreground" />
            <p className="font-display text-2xl">{c.value}</p>
            <p className="editorial-heading text-muted-foreground mt-1">{c.label}</p>
          </button>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/admin/products" className="nav-link border border-foreground px-6 py-3 hover:bg-foreground hover:text-background transition-colors">
          Add Product
        </Link>
        <Link to="/admin/content" className="nav-link border border-foreground px-6 py-3 hover:bg-foreground hover:text-background transition-colors">
          Edit About Page
        </Link>
        <Link to="/admin/settings" className="nav-link border border-foreground px-6 py-3 hover:bg-foreground hover:text-background transition-colors">
          Crypto Wallets
        </Link>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
