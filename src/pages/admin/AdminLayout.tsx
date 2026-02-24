import { ReactNode, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Package, Tags, BookOpen, MessageSquare,
  ShoppingCart, Users, Mail, Settings,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Products", icon: Package, href: "/admin/products" },
  { label: "Brands", icon: Tags, href: "/admin/brands" },
  { label: "Stories", icon: BookOpen, href: "/admin/stories" },
  { label: "Offers", icon: MessageSquare, href: "/admin/offers" },
  { label: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  { label: "Users", icon: Users, href: "/admin/users" },
  { label: "Newsletter", icon: Mail, href: "/admin/newsletter" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground text-xs tracking-widest uppercase">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-background fixed top-0 left-0 bottom-0 z-40 flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/" className="text-[10px] tracking-[0.2em] uppercase font-light text-muted-foreground">
            ← Back to Store
          </Link>
          <h2 className="text-[12px] tracking-[0.25em] uppercase font-light mt-3">Admin</h2>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-6 py-3 text-[10px] tracking-[0.15em] uppercase font-light transition-all ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-60 p-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
