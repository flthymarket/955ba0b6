import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { money, productUrl } from "@/lib/store";
import { Loader2, LogOut, Package, User, Heart, MapPin } from "lucide-react";

interface OrderRow {
  id: string;
  order_number: string | null;
  total: number;
  status: string | null;
  payment_method: string;
  payment_status: string;
  tracking: string | null;
  created_at: string | null;
}

interface WishRow {
  id: string;
  product_id: string;
  products: {
    id: string;
    name: string;
    slug: string | null;
    price: number;
    product_images: { url: string; sort_order: number | null }[];
  } | null;
}

interface AddressRow {
  id: string;
  label: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  is_default: boolean | null;
}

type Tab = "orders" | "profile" | "wishlist" | "addresses";

const TABS: { key: Tab; label: string; icon: typeof Package }[] = [
  { key: "orders", label: "Orders", icon: Package },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "profile", label: "Profile", icon: User },
];

const inputCls =
  "w-full border border-border bg-transparent px-3 py-3 text-[13px] outline-none focus:border-foreground transition-colors min-h-[48px]";

const Account = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>("orders");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [wishlist, setWishlist] = useState<WishRow[]>([]);
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });

  const [newAddr, setNewAddr] = useState({
    label: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [ordersRes, wishRes, addrRes, profileRes] = await Promise.all([
      supabase
        .from("orders")
        .select("id, order_number, total, status, payment_method, payment_status, tracking, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("wishlist")
        .select("id, product_id, products ( id, name, slug, price, product_images ( url, sort_order ) )")
        .eq("user_id", user.id),
      supabase.from("saved_addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }),
      supabase.from("profiles").select("name, email, phone").eq("user_id", user.id).maybeSingle(),
    ]);

    setOrders((ordersRes.data as OrderRow[]) || []);
    setWishlist((wishRes.data as unknown as WishRow[]) || []);
    setAddresses((addrRes.data as AddressRow[]) || []);
    setProfile({
      name: profileRes.data?.name || "",
      email: profileRes.data?.email || user.email || "",
      phone: profileRes.data?.phone || "",
    });
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: profile.name, phone: profile.phone })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Saved", description: "Your profile has been updated." });
  };

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("saved_addresses").insert({
      ...newAddr,
      user_id: user.id,
      is_default: addresses.length === 0,
    });
    setSaving(false);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    setNewAddr({ label: "", address_line1: "", address_line2: "", city: "", state: "", postal_code: "", country: "US" });
    load();
  };

  const removeAddress = async (id: string) => {
    await supabase.from("saved_addresses").delete().eq("id", id);
    load();
  };

  const removeWish = async (id: string) => {
    await supabase.from("wishlist").delete().eq("id", id);
    load();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (authLoading || !user) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin" />
      </main>
    );
  }

  return (
    <main className="max-w-[1200px] mx-auto px-6 md:px-10 py-14 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6 mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl">Account</h1>
          <p className="editorial-heading text-muted-foreground mt-2">{profile.email}</p>
        </div>
        <button onClick={signOut} className="nav-link flex items-center gap-2 border border-foreground px-5 py-2.5 hover:bg-foreground hover:text-background transition-colors">
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      <div className="grid md:grid-cols-[200px_1fr] gap-10">
        {/* Side nav */}
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible border-b md:border-b-0 border-border pb-2 md:pb-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`nav-link flex items-center gap-2 px-4 py-3 whitespace-nowrap text-left transition-colors ${
                tab === t.key ? "bg-foreground text-background" : "hover:bg-muted"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </nav>

        <section>
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : tab === "orders" ? (
            orders.length === 0 ? (
              <EmptyState text="No orders yet" cta />
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="border border-border p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-mono-ui text-[13px]">{o.order_number || o.id.slice(0, 8)}</p>
                        <p className="editorial-heading text-muted-foreground mt-1">
                          {o.created_at ? new Date(o.created_at).toLocaleDateString() : ""} · {o.payment_method}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono-ui text-[13px]">{money(Number(o.total))}</p>
                        <p className="editorial-heading text-muted-foreground mt-1">{o.status}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
                      <span className="editorial-heading">
                        Payment: <span className="text-muted-foreground">{o.payment_status}</span>
                      </span>
                      <span className="editorial-heading">
                        Tracking: <span className="text-muted-foreground">{o.tracking || "Pending"}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : tab === "wishlist" ? (
            wishlist.length === 0 ? (
              <EmptyState text="Your wishlist is empty" cta />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {wishlist.map((w) =>
                  w.products ? (
                    <div key={w.id}>
                      <Link to={productUrl(w.products)} className="block">
                        <div className="product-frame mb-3">
                          {w.products.product_images?.[0]?.url && (
                            <img src={w.products.product_images[0].url} alt={w.products.name} loading="lazy" />
                          )}
                        </div>
                        <p className="product-title">{w.products.name}</p>
                        <p className="product-price">{money(Number(w.products.price))}</p>
                      </Link>
                      <button onClick={() => removeWish(w.id)} className="editorial-heading text-muted-foreground hover:text-foreground mt-2 mx-auto block">
                        Remove
                      </button>
                    </div>
                  ) : null
                )}
              </div>
            )
          ) : tab === "addresses" ? (
            <div className="space-y-8">
              {addresses.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {addresses.map((a) => (
                    <div key={a.id} className="border border-border p-5">
                      <p className="font-mono-ui text-[13px]">{a.label || "Address"}{a.is_default ? " · Default" : ""}</p>
                      <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed">
                        {a.address_line1}{a.address_line2 ? `, ${a.address_line2}` : ""}<br />
                        {a.city}{a.state ? `, ${a.state}` : ""} {a.postal_code}<br />
                        {a.country}
                      </p>
                      <button onClick={() => removeAddress(a.id)} className="editorial-heading text-muted-foreground hover:text-foreground mt-4">
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={addAddress} className="border border-border p-5 space-y-3 max-w-xl">
                <p className="editorial-heading mb-2">Add Address</p>
                <input className={inputCls} placeholder="Label (Home, Work)" value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} />
                <input className={inputCls} placeholder="Address line 1" required value={newAddr.address_line1} onChange={(e) => setNewAddr({ ...newAddr, address_line1: e.target.value })} />
                <input className={inputCls} placeholder="Address line 2" value={newAddr.address_line2} onChange={(e) => setNewAddr({ ...newAddr, address_line2: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputCls} placeholder="City" required value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} />
                  <input className={inputCls} placeholder="State" value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} />
                  <input className={inputCls} placeholder="ZIP" required value={newAddr.postal_code} onChange={(e) => setNewAddr({ ...newAddr, postal_code: e.target.value })} />
                  <input className={inputCls} placeholder="Country" required value={newAddr.country} onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })} />
                </div>
                <button disabled={saving} className="nav-link w-full bg-foreground text-background py-3.5 min-h-[48px] hover:opacity-80 transition-opacity">
                  {saving ? "Saving..." : "Save Address"}
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={saveProfile} className="max-w-xl space-y-4">
              <div>
                <label className="editorial-heading block mb-2">Name</label>
                <input className={inputCls} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div>
                <label className="editorial-heading block mb-2">Email</label>
                <input className={inputCls + " opacity-60"} value={profile.email} disabled />
              </div>
              <div>
                <label className="editorial-heading block mb-2">Phone</label>
                <input className={inputCls} type="tel" placeholder="+1 555 000 0000" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <button disabled={saving} className="nav-link w-full bg-foreground text-background py-3.5 min-h-[48px] hover:opacity-80 transition-opacity">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
};

const EmptyState = ({ text, cta }: { text: string; cta?: boolean }) => (
  <div className="border border-border py-20 text-center">
    <p className="editorial-heading text-muted-foreground">{text}</p>
    {cta && (
      <Link to="/collection" className="nav-link inline-block mt-6 border border-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-colors">
        Shop Now
      </Link>
    )}
  </div>
);

export default Account;
