import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import logo from "@/assets/logo.png";

const Account = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ name: string; email: string }>({ name: "", email: "" });
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "offers">("profile");
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

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
    supabase.from("offers").select("*, products(name, price)").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setOffers(data as any);
    });
  }, [user]);

  const openOfferChat = async (offer: any) => {
    setSelectedOffer(offer);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("offer_id", offer.id)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);

    const channel = supabase
      .channel(`user-offer-${offer.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `offer_id=eq.${offer.id}` },
        (payload) => setMessages((prev) => [...prev, payload.new as any])
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedOffer || !user) return;
    await supabase.from("chat_messages").insert({
      offer_id: selectedOffer.id,
      sender_id: user.id,
      message: newMessage.trim(),
    });
    setNewMessage("");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || !user) return null;

  const statusColors: Record<string, string> = {
    pending: "text-yellow-600",
    countered: "text-blue-600",
    accepted: "text-green-600",
    declined: "text-destructive",
  };

  // Offer chat view
  if (selectedOffer) {
    return (
      <main className="pt-28 md:pt-32 pb-24 animate-fade-in">
        <div className="max-w-[680px] mx-auto px-4 md:px-6">
          <button onClick={() => setSelectedOffer(null)} className="nav-link text-[9px] text-muted-foreground mb-6">← Back</button>

          <div className="border border-border p-4 mb-4 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-light">{(selectedOffer.products as any)?.name}</p>
              <p className="text-[10px] text-muted-foreground">Listed: ${(selectedOffer.products as any)?.price?.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Your offer: ${selectedOffer.offered_price.toLocaleString()}</p>
              <p className={`text-[10px] tracking-widest uppercase ${statusColors[selectedOffer.status || "pending"]}`}>{selectedOffer.status}</p>
            </div>
          </div>

          <div className="border border-border h-[350px] overflow-y-auto p-4 space-y-3 mb-4">
            {messages.map((m) => {
              const isMe = m.sender_id === user.id;
              return (
                <div key={m.id} className={`flex gap-3 ${isMe ? "justify-end" : ""}`}>
                  {!isMe && <img src={logo} alt="FLTHYMRKT" className="w-5 h-5 object-contain flex-shrink-0" />}
                  <div className={`max-w-[75%] p-3 ${isMe ? "bg-foreground text-background" : "bg-muted"}`}>
                    <p className="text-[11px] font-light">{m.message}</p>
                    <p className="text-[8px] opacity-50 mt-1">{m.created_at ? new Date(m.created_at).toLocaleTimeString() : ""}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 border border-border bg-transparent px-3 py-2 text-[11px] outline-none focus:border-foreground transition-colors" />
            <button onClick={sendMessage} className="bg-primary text-primary-foreground px-4 py-2 min-h-[40px]">
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 md:pt-32 pb-24 animate-fade-in">
      <div className="max-w-[680px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[14px] md:text-lg tracking-[0.3em] font-extralight uppercase">My Account</h1>
          <button onClick={handleSignOut} className="nav-link text-[9px] text-muted-foreground">Sign Out</button>
        </div>

        {isAdmin && (
          <Link to="/admin" className="block mb-8 border border-border p-3 text-center editorial-heading text-[10px] hover:bg-foreground hover:text-background transition-all duration-300">
            Admin Dashboard →
          </Link>
        )}

        {/* Tabs */}
        <div className="flex gap-6 border-b border-border mb-8">
          {(["profile", "orders", "offers"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`editorial-heading text-[10px] pb-3 transition-opacity ${activeTab === tab ? "opacity-100 border-b border-foreground" : "opacity-40 hover:opacity-70"}`}>
              {tab === "profile" ? "Profile" : tab === "orders" ? "Orders" : "My Offers"}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <div className="space-y-4 text-[11px] font-light">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground tracking-wide">Name</span>
              <span>{profile.name || "—"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground tracking-wide">Email</span>
              <span className="text-right break-all">{profile.email || user.email}</span>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            {orders.length === 0 ? (
              <p className="text-[11px] text-muted-foreground font-light py-8 text-center">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between text-[11px] font-light border-b border-border pb-3">
                    <span className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</span>
                    <span>${o.total}</span>
                    <span className="text-muted-foreground uppercase text-[9px] tracking-widest">{o.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "offers" && (
          <div>
            {offers.length === 0 ? (
              <p className="text-[11px] text-muted-foreground font-light py-8 text-center">No offers yet. Make an offer on any product.</p>
            ) : (
              <div className="space-y-3">
                {offers.map((o) => (
                  <div key={o.id} className="border border-border p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors duration-150"
                    onClick={() => openOfferChat(o)}>
                    <div>
                      <p className="text-[11px] font-light">{(o.products as any)?.name || "Product"}</p>
                      <p className="text-[10px] text-muted-foreground">Offered: ${o.offered_price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-[10px] tracking-widest uppercase ${statusColors[o.status || "pending"]}`}>{o.status}</p>
                      <p className="text-[9px] text-muted-foreground">View Chat →</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Account;
