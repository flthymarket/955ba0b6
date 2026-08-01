import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/stores/cartStore";
import { money } from "@/lib/store";
import { toast } from "sonner";
import { Loader2, Copy } from "lucide-react";

const CRYPTO = [
  { code: "BTC", label: "Bitcoin", slug: "crypto-btc" },
  { code: "ETH", label: "Ethereum", slug: "crypto-eth" },
  { code: "SOL", label: "Solana", slug: "crypto-sol" },
];

const inputCls =
  "w-full border border-border bg-transparent px-3 py-3 text-[13px] outline-none focus:border-foreground transition-colors min-h-[48px]";

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const [method, setMethod] = useState<"crypto" | "card">("crypto");
  const [crypto, setCrypto] = useState("BTC");
  const [wallets, setWallets] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<{ number: string; address: string | null; currency: string | null } | null>(null);

  const [form, setForm] = useState({
    email: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_content")
        .select("slug, body")
        .in("slug", CRYPTO.map((c) => c.slug));
      const map: Record<string, string> = {};
      (data || []).forEach((row: { slug: string; body: string }) => {
        const match = CRYPTO.find((c) => c.slug === row.slug);
        if (match && row.body?.trim()) map[match.code] = row.body.trim();
      });
      setWallets(map);
      if (!map["BTC"]) {
        const first = Object.keys(map)[0];
        if (first) setCrypto(first);
      }
    })();
  }, []);

  useEffect(() => {
    if (user?.email) setForm((f) => ({ ...f, email: f.email || user.email || "" }));
  }, [user]);

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);

    const address = wallets[crypto] || null;
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        is_guest: !user,
        email: form.email,
        phone: form.phone,
        total: subtotal,
        status: "processing",
        payment_method: method,
        payment_status: "pending",
        crypto_currency: method === "crypto" ? crypto : null,
        crypto_address: method === "crypto" ? address : null,
        shipping_address: {
          address_line1: form.address_line1,
          address_line2: form.address_line2,
          city: form.city,
          state: form.state,
          postal_code: form.postal_code,
          country: form.country,
        },
      })
      .select("id, order_number")
      .maybeSingle();

    if (error || !order) {
      setSubmitting(false);
      return toast.error(error?.message || "Could not place order");
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
      }))
    );
    setSubmitting(false);
    if (itemsError) return toast.error(itemsError.message);

    clearCart();
    setPlaced({
      number: order.order_number || order.id.slice(0, 8),
      address: method === "crypto" ? address : null,
      currency: method === "crypto" ? crypto : null,
    });
  };

  if (placed) {
    return (
      <main className="max-w-xl mx-auto px-6 py-20 animate-fade-in text-center">
        <h1 className="font-display text-2xl">Order Placed</h1>
        <p className="editorial-heading text-muted-foreground mt-4">Order {placed.number}</p>

        {placed.address ? (
          <div className="border border-border p-6 mt-8 text-left">
            <p className="editorial-heading mb-3">Send exactly {money(subtotal)} in {placed.currency}</p>
            <p className="font-mono-ui text-[12px] break-all normal-case">{placed.address}</p>
            <button
              onClick={() => { navigator.clipboard.writeText(placed.address || ""); toast.success("Address copied"); }}
              className="nav-link mt-4 flex items-center gap-2 border border-foreground px-5 py-2.5 hover:bg-foreground hover:text-background transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Address
            </button>
            <p className="text-[12px] text-muted-foreground mt-4 leading-relaxed">
              Your order ships once the transaction confirms on-chain. We email you at {form.email} when it clears.
            </p>
          </div>
        ) : (
          <p className="text-[13px] text-muted-foreground mt-6 leading-relaxed">
            We emailed you a payment link at {form.email}. Your order ships once payment clears.
          </p>
        )}

        <div className="flex flex-col gap-3 mt-10">
          <Link to="/account" className="nav-link border border-foreground py-3.5 hover:bg-foreground hover:text-background transition-colors">Track Order</Link>
          <Link to="/collection" className="nav-link py-3 text-muted-foreground hover:text-foreground">Continue Shopping</Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <p className="editorial-heading text-muted-foreground">Your bag is empty</p>
        <Link to="/collection" className="nav-link border border-foreground px-8 py-3">Shop All</Link>
      </main>
    );
  }

  const availableCrypto = CRYPTO.filter((c) => wallets[c.code]);

  return (
    <main className="max-w-[1200px] mx-auto px-6 md:px-10 py-14 animate-fade-in">
      <h1 className="font-display text-2xl mb-10">Checkout</h1>

      <div className="grid md:grid-cols-[1fr_360px] gap-12">
        <form onSubmit={placeOrder} className="space-y-8">
          <section className="space-y-3">
            <p className="editorial-heading">Contact</p>
            <input className={inputCls} type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className={inputCls} type="tel" required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            {!user && (
              <p className="editorial-heading text-muted-foreground">
                <Link to="/auth" className="underline">Create an account</Link> to track this order.
              </p>
            )}
          </section>

          <section className="space-y-3">
            <p className="editorial-heading">Shipping Address</p>
            <input className={inputCls} required placeholder="Address line 1" value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} />
            <input className={inputCls} placeholder="Address line 2" value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className={inputCls} required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <input className={inputCls} placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              <input className={inputCls} required placeholder="ZIP" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
              <input className={inputCls} required placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
          </section>

          <section className="space-y-3">
            <p className="editorial-heading">Payment</p>
            <div className="grid grid-cols-2 gap-3">
              {(["crypto", "card"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`nav-link py-3.5 min-h-[48px] border transition-colors ${
                    method === m ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"
                  }`}
                >
                  {m === "crypto" ? "Crypto" : "Card"}
                </button>
              ))}
            </div>

            {method === "crypto" && (
              availableCrypto.length === 0 ? (
                <p className="editorial-heading text-muted-foreground">No crypto wallets configured yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-2">
                  {availableCrypto.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setCrypto(c.code)}
                      className={`nav-link px-5 py-3 min-h-[48px] border transition-colors ${
                        crypto === c.code ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"
                      }`}
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              )
            )}

            {method === "card" && (
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Card orders are placed as pending — we send a secure payment link by email.
              </p>
            )}
          </section>

          <button
            disabled={submitting || (method === "crypto" && availableCrypto.length === 0)}
            className="nav-link w-full bg-foreground text-background py-4 min-h-[48px] hover:opacity-80 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : `Place Order · ${money(subtotal)}`}
          </button>
        </form>

        <aside className="border border-border p-6 h-fit space-y-5">
          <p className="editorial-heading">Order Summary</p>
          {items.map((i) => (
            <div key={i.key} className="flex gap-3">
              <div className="w-16 flex-shrink-0"><div className="product-frame">{i.image && <img src={i.image} alt={i.name} />}</div></div>
              <div className="flex-1 min-w-0">
                <p className="product-title text-left text-[12px]">{i.name}</p>
                <p className="editorial-heading text-muted-foreground mt-1">
                  {i.size ? `Size ${i.size} · ` : ""}Qty {i.quantity}
                </p>
              </div>
              <p className="font-mono-ui text-[12px]">{money(i.price * i.quantity)}</p>
            </div>
          ))}
          <div className="border-t border-border pt-4 flex justify-between editorial-heading">
            <span>Total</span>
            <span>{money(subtotal)}</span>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Checkout;
