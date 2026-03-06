import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Send, Clock, CheckCircle2, DollarSign, XCircle, Link as LinkIcon } from "lucide-react";
import logo from "@/assets/logo.png";

interface Offer {
  id: string;
  offered_price: number;
  counter_price: number | null;
  status: string | null;
  created_at: string | null;
  product_id: string;
  user_id: string;
  checkout_url: string | null;
  expires_at: string | null;
  products?: { name: string; price: number } | null;
  profiles?: { email: string | null; name: string | null } | null;
}

interface ChatMessage {
  id: string;
  message: string;
  sender_id: string;
  created_at: string | null;
}

const statusColors: Record<string, string> = {
  pending: "text-yellow-600 bg-yellow-50",
  countered: "text-blue-600 bg-blue-50",
  accepted: "text-green-600 bg-green-50",
  declined: "text-red-600 bg-red-50",
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  countered: DollarSign,
  accepted: CheckCircle2,
  declined: XCircle,
};

const AdminOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [counterPrice, setCounterPrice] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => { fetchOffers(); }, []);

  const fetchOffers = async () => {
    const { data } = await supabase
      .from("offers")
      .select("*, products(name, price)")
      .order("created_at", { ascending: false });
    if (data) setOffers(data as any);
  };

  const openChat = async (offer: Offer) => {
    setSelectedOffer(offer);
    setCheckoutUrl(offer.checkout_url || "");
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("offer_id", offer.id)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);

    const channel = supabase
      .channel(`offer-${offer.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `offer_id=eq.${offer.id}` },
        (payload) => setMessages((prev) => [...prev, payload.new as ChatMessage])
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

  const handleAction = async (action: "accept" | "counter" | "decline") => {
    if (!selectedOffer) return;

    if (action === "accept") {
      const finalPrice = selectedOffer.counter_price || selectedOffer.offered_price;
      await supabase.from("offers").update({ status: "accepted" }).eq("id", selectedOffer.id);
      await supabase.from("chat_messages").insert({
        offer_id: selectedOffer.id, sender_id: user!.id,
        message: `✅ Offer accepted at $${finalPrice.toLocaleString()}. ${checkoutUrl ? "A checkout link has been provided." : "A checkout link will be sent shortly."}`,
      });
      if (checkoutUrl) {
        await supabase.from("offers").update({ checkout_url: checkoutUrl }).eq("id", selectedOffer.id);
      }
      toast({ title: "Offer accepted" });
    } else if (action === "counter") {
      const price = parseFloat(counterPrice);
      if (isNaN(price) || price <= 0) { toast({ title: "Enter a valid counter price", variant: "destructive" }); return; }
      await supabase.from("offers").update({ status: "countered", counter_price: price }).eq("id", selectedOffer.id);
      await supabase.from("chat_messages").insert({
        offer_id: selectedOffer.id, sender_id: user!.id,
        message: `💰 Counter offer: $${price.toLocaleString()}`,
      });
      setCounterPrice("");
      toast({ title: "Counter offer sent" });
    } else {
      await supabase.from("offers").update({ status: "declined" }).eq("id", selectedOffer.id);
      await supabase.from("chat_messages").insert({
        offer_id: selectedOffer.id, sender_id: user!.id,
        message: "❌ Offer declined.",
      });
      toast({ title: "Offer declined" });
    }
    fetchOffers();
    openChat({ ...selectedOffer, status: action === "counter" ? "countered" : action === "accept" ? "accepted" : "declined" });
  };

  const handleSendCheckoutLink = async () => {
    if (!checkoutUrl.trim() || !selectedOffer) return;
    await supabase.from("offers").update({ checkout_url: checkoutUrl, status: "accepted" }).eq("id", selectedOffer.id);
    await supabase.from("chat_messages").insert({
      offer_id: selectedOffer.id, sender_id: user!.id,
      message: `🔗 Here's your checkout link: ${checkoutUrl}`,
    });
    toast({ title: "Checkout link sent to customer" });
    fetchOffers();
  };

  const filtered = statusFilter === "all" ? offers : offers.filter((o) => o.status === statusFilter);

  if (selectedOffer) {
    const StatusIcon = statusIcons[selectedOffer.status || "pending"] || Clock;
    return (
      <AdminLayout>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-base tracking-[0.3em] uppercase font-extralight">Offer Negotiation</h1>
          <button onClick={() => setSelectedOffer(null)} className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:opacity-50 transition-opacity">← Back</button>
        </div>

        {/* Product Info */}
        <div className="border border-border p-5 mb-5 flex flex-wrap justify-between items-center gap-4">
          <div>
            <p className="text-sm font-light">{(selectedOffer.products as any)?.name}</p>
            <p className="text-xs text-muted-foreground mt-1">Listed: ${(selectedOffer.products as any)?.price?.toLocaleString()}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs text-muted-foreground">Offered: ${selectedOffer.offered_price.toLocaleString()}</p>
            {selectedOffer.counter_price && <p className="text-xs text-blue-600">Counter: ${selectedOffer.counter_price.toLocaleString()}</p>}
            <p className={`text-xs tracking-widest uppercase px-3 py-1 inline-block ${statusColors[selectedOffer.status || "pending"]}`}>
              <StatusIcon className="w-3 h-3 inline mr-1" />
              {selectedOffer.status}
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="border border-border h-[400px] overflow-y-auto p-5 space-y-4 mb-5">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground text-xs py-8">No messages yet.</p>
          )}
          {messages.map((m) => {
            const isAdmin = m.sender_id === user?.id;
            return (
              <div key={m.id} className={`flex gap-3 ${isAdmin ? "justify-end" : ""}`}>
                {!isAdmin && <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs flex-shrink-0">C</div>}
                <div className={`max-w-[70%] p-4 ${isAdmin ? "bg-foreground text-background" : "bg-muted"}`}>
                  <p className="text-sm font-light leading-relaxed">{m.message}</p>
                  <p className="text-[9px] opacity-50 mt-2">
                    {m.created_at ? new Date(m.created_at).toLocaleTimeString() : ""}
                  </p>
                </div>
                {isAdmin && <img src={logo} alt="Admin" className="w-7 h-7 object-contain flex-shrink-0 mt-1" />}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {/* Message input always visible */}
          <div className="flex gap-2">
            <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground transition-colors" />
            <button onClick={sendMessage} className="bg-primary text-primary-foreground px-5 py-3 min-h-[48px] hover:opacity-80 transition-opacity">
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons for pending/countered */}
          {(selectedOffer.status === "pending" || selectedOffer.status === "countered") && (
            <div className="flex flex-wrap gap-3 items-end">
              <button onClick={() => handleAction("accept")}
                className="bg-foreground text-background px-6 py-3 text-xs tracking-[0.2em] uppercase font-light min-h-[48px] hover:opacity-80 transition-opacity flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Accept
              </button>
              <div className="flex gap-2">
                <input value={counterPrice} onChange={(e) => setCounterPrice(e.target.value)}
                  placeholder="Counter $" className="border border-border bg-transparent px-3 py-3 text-sm outline-none w-28 focus:border-foreground transition-colors" />
                <button onClick={() => handleAction("counter")}
                  className="border border-border px-5 py-3 text-xs tracking-[0.2em] uppercase font-light hover:border-foreground min-h-[48px] transition-all flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Counter
                </button>
              </div>
              <button onClick={() => handleAction("decline")}
                className="border border-destructive text-destructive px-5 py-3 text-xs tracking-[0.2em] uppercase font-light min-h-[48px] hover:bg-destructive hover:text-destructive-foreground transition-all flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Decline
              </button>
            </div>
          )}

          {/* Checkout URL for accepted offers */}
          {selectedOffer.status === "accepted" && (
            <div className="border border-green-200 bg-green-50/50 p-5 space-y-3">
              <p className="text-sm font-light flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Send checkout link to customer</p>
              <div className="flex gap-2">
                <input value={checkoutUrl} onChange={(e) => setCheckoutUrl(e.target.value)}
                  placeholder="Paste checkout URL..." className="flex-1 border border-border bg-transparent px-3 py-3 text-sm outline-none focus:border-foreground transition-colors" />
                <button onClick={handleSendCheckoutLink}
                  className="bg-foreground text-background px-5 py-3 text-xs tracking-[0.2em] uppercase font-light min-h-[48px] hover:opacity-80 transition-opacity">
                  Send Link
                </button>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-base tracking-[0.3em] uppercase font-extralight mb-8">Offers</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {["all", "pending", "countered", "accepted", "declined"].map((s) => {
          const Icon = statusIcons[s] || null;
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-5 py-3 text-xs tracking-widest uppercase border transition-all flex items-center gap-2 ${
                statusFilter === s ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"
              }`}>
              {Icon && <Icon className="w-3 h-3" />}
              {s}
            </button>
          );
        })}
      </div>

      <div className="border border-border">
        <div className="grid grid-cols-[1fr_120px_120px_80px] gap-4 px-6 py-4 border-b border-border bg-muted">
          <span className="text-xs tracking-widest uppercase text-muted-foreground">Product</span>
          <span className="text-xs tracking-widest uppercase text-muted-foreground">Offered</span>
          <span className="text-xs tracking-widest uppercase text-muted-foreground">Status</span>
          <span className="text-xs tracking-widest uppercase text-muted-foreground">Action</span>
        </div>
        {filtered.map((o) => {
          const StatusIcon = statusIcons[o.status || "pending"] || Clock;
          return (
            <div key={o.id} className="grid grid-cols-[1fr_120px_120px_80px] gap-4 px-6 py-5 border-b border-border last:border-b-0 items-center hover:bg-muted/30 transition-colors">
              <div>
                <span className="text-sm font-light">{(o.products as any)?.name || "—"}</span>
                {o.counter_price && <p className="text-xs text-blue-600 mt-0.5">Counter: ${o.counter_price.toLocaleString()}</p>}
              </div>
              <span className="text-sm font-light">${o.offered_price.toLocaleString()}</span>
              <span className={`text-xs tracking-widest uppercase inline-flex items-center gap-1 ${statusColors[o.status || "pending"]} px-2 py-1 w-fit`}>
                <StatusIcon className="w-3 h-3" />
                {o.status}
              </span>
              <button onClick={() => openChat(o)} className="text-xs tracking-[0.15em] uppercase hover:opacity-50 transition-opacity">View</button>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="px-6 py-10 text-center text-muted-foreground text-sm tracking-widest uppercase">No offers</p>}
      </div>
    </AdminLayout>
  );
};

export default AdminOffers;
