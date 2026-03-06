import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Send, Clock, CheckCircle2, DollarSign } from "lucide-react";
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

  const handleAcceptCounter = async () => {
    if (!selectedOffer || !user) return;
    await supabase.from("offers").update({ status: "accepted" }).eq("id", selectedOffer.id);
    await supabase.from("chat_messages").insert({
      offer_id: selectedOffer.id,
      sender_id: user.id,
      message: `I accept the counter offer of $${selectedOffer.counter_price?.toLocaleString()}.`,
    });
    toast({ title: "Offer accepted! Staff will send you a checkout link." });
    setSelectedOffer({ ...selectedOffer, status: "accepted" });
    // Refresh offers
    const { data } = await supabase.from("offers").select("*, products(name, price)").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setOffers(data as any);
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

  const statusIcons: Record<string, any> = {
    pending: Clock,
    countered: DollarSign,
    accepted: CheckCircle2,
  };

  // Offer chat view
  if (selectedOffer) {
    const StatusIcon = statusIcons[selectedOffer.status] || Clock;
    return (
      <main className="pt-32 md:pt-36 pb-24 animate-fade-in">
        <div className="max-w-[720px] mx-auto px-4 md:px-8">
          <button onClick={() => setSelectedOffer(null)} className="text-sm tracking-[0.15em] uppercase font-light text-muted-foreground mb-8 hover:opacity-50 transition-opacity">← Back to Offers</button>

          {/* Product Info Card */}
          <div className="border border-border p-6 mb-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-light">{(selectedOffer.products as any)?.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Listed: ${(selectedOffer.products as any)?.price?.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Your offer: ${selectedOffer.offered_price.toLocaleString()}</p>
              {selectedOffer.counter_price && (
                <p className="text-xs text-blue-600 mt-0.5">Counter: ${selectedOffer.counter_price.toLocaleString()}</p>
              )}
              <p className={`text-xs tracking-widest uppercase mt-1 ${statusColors[selectedOffer.status || "pending"]}`}>
                <StatusIcon className="w-3 h-3 inline mr-1" />
                {selectedOffer.status}
              </p>
            </div>
          </div>

          {/* Response time notice */}
          <div className="bg-muted/50 border border-border p-4 mb-6 text-center">
            <p className="text-xs text-muted-foreground tracking-wide font-light">
              <Clock className="w-3 h-3 inline mr-1.5" />
              Please allow some time for our staff to review and respond to your offer.
            </p>
          </div>

          {/* Counter Offer Action */}
          {selectedOffer.status === "countered" && selectedOffer.counter_price && (
            <div className="border border-blue-200 bg-blue-50/50 p-5 mb-6 text-center space-y-3">
              <p className="text-sm font-light">Staff countered with <strong>${selectedOffer.counter_price.toLocaleString()}</strong></p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleAcceptCounter}
                  className="bg-foreground text-background px-6 py-3 text-xs tracking-[0.2em] uppercase font-light hover:opacity-80 transition-opacity min-h-[44px]"
                >
                  Accept & Pay
                </button>
                <button
                  onClick={() => {/* just continue chatting */}}
                  className="border border-border px-6 py-3 text-xs tracking-[0.2em] uppercase font-light hover:border-foreground transition-all min-h-[44px]"
                >
                  Negotiate
                </button>
              </div>
            </div>
          )}

          {/* Checkout Link */}
          {selectedOffer.status === "accepted" && selectedOffer.checkout_url && (
            <div className="border border-green-200 bg-green-50/50 p-5 mb-6 text-center">
              <p className="text-sm font-light mb-3">Your offer has been accepted!</p>
              <a
                href={selectedOffer.checkout_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-foreground text-background px-8 py-3 text-xs tracking-[0.2em] uppercase font-light hover:opacity-80 transition-opacity min-h-[44px]"
              >
                Pay Now →
              </a>
            </div>
          )}

          {/* Chat Messages */}
          <div className="border border-border h-[400px] overflow-y-auto p-5 space-y-4 mb-4">
            {messages.length === 0 && (
              <p className="text-center text-muted-foreground text-xs py-8">No messages yet. Start the conversation!</p>
            )}
            {messages.map((m) => {
              const isMe = m.sender_id === user.id;
              return (
                <div key={m.id} className={`flex gap-3 ${isMe ? "justify-end" : ""}`}>
                  {!isMe && <img src={logo} alt="FLTHYMRKT" className="w-7 h-7 object-contain flex-shrink-0 mt-1" />}
                  <div className={`max-w-[75%] p-4 ${isMe ? "bg-foreground text-background" : "bg-muted"}`}>
                    <p className="text-sm font-light leading-relaxed">{m.message}</p>
                    <p className="text-[9px] opacity-50 mt-2">{m.created_at ? new Date(m.created_at).toLocaleTimeString() : ""}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground transition-colors" />
            <button onClick={sendMessage} className="bg-primary text-primary-foreground px-5 py-3 min-h-[48px] hover:opacity-80 transition-opacity">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-32 md:pt-36 pb-24 animate-fade-in">
      <div className="max-w-[720px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-lg md:text-xl tracking-[0.3em] font-extralight uppercase">My Account</h1>
          <button onClick={handleSignOut} className="text-xs tracking-[0.2em] uppercase font-light text-muted-foreground hover:opacity-50 transition-opacity">Sign Out</button>
        </div>

        {isAdmin && (
          <Link to="/admin" className="block mb-10 border border-border p-4 text-center text-sm tracking-[0.15em] uppercase font-light hover:bg-foreground hover:text-background transition-all duration-300">
            Admin Dashboard →
          </Link>
        )}

        {/* Tabs */}
        <div className="flex gap-8 border-b border-border mb-10">
          {(["profile", "orders", "offers"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`text-sm tracking-[0.15em] uppercase font-light pb-4 transition-opacity ${activeTab === tab ? "opacity-100 border-b-2 border-foreground" : "opacity-40 hover:opacity-70"}`}>
              {tab === "profile" ? "Profile" : tab === "orders" ? "Orders" : "My Offers"}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <div className="space-y-5 text-sm font-light">
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-muted-foreground tracking-wide">Name</span>
              <span>{profile.name || "—"}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-muted-foreground tracking-wide">Email</span>
              <span className="text-right break-all">{profile.email || user.email}</span>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground font-light py-10 text-center">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between text-sm font-light border-b border-border pb-4">
                    <span className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</span>
                    <span>${o.total}</span>
                    <span className="text-muted-foreground uppercase text-xs tracking-widest">{o.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "offers" && (
          <div>
            {offers.length === 0 ? (
              <p className="text-sm text-muted-foreground font-light py-10 text-center">No offers yet. Make an offer on any product.</p>
            ) : (
              <div className="space-y-4">
                {offers.map((o) => {
                  const StatusIcon = statusIcons[o.status] || Clock;
                  return (
                    <div key={o.id} className="border border-border p-5 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-all duration-200"
                      onClick={() => openOfferChat(o)}>
                      <div>
                        <p className="text-sm font-light">{(o.products as any)?.name || "Product"}</p>
                        <p className="text-xs text-muted-foreground mt-1">Offered: ${o.offered_price.toLocaleString()}</p>
                        {o.counter_price && <p className="text-xs text-blue-600 mt-0.5">Counter: ${o.counter_price.toLocaleString()}</p>}
                      </div>
                      <div className="text-right">
                        <p className={`text-xs tracking-widest uppercase ${statusColors[o.status || "pending"]}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {o.status}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">View Chat →</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Account;
