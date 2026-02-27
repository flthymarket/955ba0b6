import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X } from "lucide-react";
import {
  LayoutDashboard, Package, Tags, BookOpen, MessageSquare,
  ShoppingCart, Users, Mail, Settings, Percent, Megaphone,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Products", icon: Package, href: "/admin/products" },
  { label: "Brands", icon: Tags, href: "/admin/brands" },
  { label: "Stories", icon: BookOpen, href: "/admin/stories" },
  { label: "Discounts", icon: Percent, href: "/admin/discounts" },
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
      {/* Desktop Sidebar */}
      <aside className="w-60 border-r border-border bg-background fixed top-0 left-0 bottom-0 z-40 hidden lg:flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/" className="text-[10px] tracking-[0.2em] uppercase font-light text-muted-foreground hover:text-foreground transition-colors duration-150">
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
                className={`flex items-center gap-3 px-6 py-3 text-[10px] tracking-[0.15em] uppercase font-light transition-all duration-150 ${
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

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b border-border z-40 flex items-center px-4">
        <button onClick={() => setMobileNavOpen(!mobileNavOpen)}>
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="text-[11px] tracking-[0.2em] uppercase font-light mx-auto">Admin</span>
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <>
          <div className="fixed inset-0 bg-foreground/40 z-40 lg:hidden" onClick={() => setMobileNavOpen(false)} />
          <aside className="fixed top-0 left-0 bottom-0 w-[80%] max-w-[300px] bg-background z-50 lg:hidden animate-slide-in-right flex flex-col">
            <div className="p-6 border-b border-border">
              <Link to="/" className="text-[10px] tracking-[0.2em] uppercase font-light text-muted-foreground">← Back to Store</Link>
              <h2 className="text-[12px] tracking-[0.25em] uppercase font-light mt-3">Admin</h2>
            </div>
            <nav className="flex-1 py-4">
              {navItems.map((item) => {
                const active = location.pathname === item.href;
                return (
                  <Link key={item.href} to={item.href} onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-3 px-6 py-3 text-[10px] tracking-[0.15em] uppercase font-light transition-all duration-150 ${
                      active ? "border-l-2 border-l-[hsl(352,82%,38%)] bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-60 p-8 pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
