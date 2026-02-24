import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import logo from "@/assets/logo.png";

interface Offer {
  id: string;
  offered_price: number;
  counter_price: number | null;
  status: string | null;
  created_at: string | null;
  product_id: string;
  user_id: string;
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
  pending: "text-yellow-600",
  countered: "text-blue-600",
  accepted: "text-green-600",
  declined: "text-destructive",
};

const AdminOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [counterPrice, setCounterPrice] = useState("");
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
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("offer_id", offer.id)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);

    // Subscribe to realtime
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
      await supabase.from("offers").update({ status: "accepted" }).eq("id", selectedOffer.id);
      await supabase.from("chat_messages").insert({
        offer_id: selectedOffer.id, sender_id: user!.id,
        message: `Offer accepted at $${selectedOffer.counter_price || selectedOffer.offered_price}. A checkout link will be generated.`,
      });
      toast({ title: "Offer accepted" });
    } else if (action === "counter") {
      const price = parseFloat(counterPrice);
      if (isNaN(price)) return;
      await supabase.from("offers").update({ status: "countered", counter_price: price }).eq("id", selectedOffer.id);
      await supabase.from("chat_messages").insert({
        offer_id: selectedOffer.id, sender_id: user!.id,
        message: `Counter offer: $${price.toLocaleString()}`,
      });
      setCounterPrice("");
      toast({ title: "Counter offer sent" });
    } else {
      await supabase.from("offers").update({ status: "declined" }).eq("id", selectedOffer.id);
      await supabase.from("chat_messages").insert({
        offer_id: selectedOffer.id, sender_id: user!.id,
        message: "Offer declined.",
      });
      toast({ title: "Offer declined" });
    }
    fetchOffers();
    openChat({ ...selectedOffer, status: action === "counter" ? "countered" : action === "accept" ? "accepted" : "declined" });
  };

  const filtered = statusFilter === "all" ? offers : offers.filter((o) => o.status === statusFilter);

  if (selectedOffer) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[14px] tracking-[0.3em] uppercase font-extralight">Offer Chat</h1>
          <button onClick={() => setSelectedOffer(null)} className="nav-link text-[9px] text-muted-foreground">← Back</button>
        </div>

        {/* Product Info */}
        <div className="border border-border p-4 mb-4 flex justify-between items-center">
          <div>
            <p className="text-[11px] font-light">{(selectedOffer.products as any)?.name}</p>
            <p className="text-[10px] text-muted-foreground">Listed: ${(selectedOffer.products as any)?.price?.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Offered: ${selectedOffer.offered_price.toLocaleString()}</p>
            <p className={`text-[10px] tracking-widest uppercase ${statusColors[selectedOffer.status || "pending"]}`}>
              {selectedOffer.status}
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="border border-border h-[400px] overflow-y-auto p-4 space-y-4 mb-4">
          {messages.map((m) => {
            const isAdmin = m.sender_id === user?.id;
            return (
              <div key={m.id} className={`flex gap-3 ${isAdmin ? "justify-end" : ""}`}>
                {!isAdmin && <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[8px]">C</div>}
                <div className={`max-w-[70%] p-3 ${isAdmin ? "bg-foreground text-background" : "bg-muted"}`}>
                  <p className="text-[11px] font-light">{m.message}</p>
                  <p className="text-[8px] opacity-50 mt-1">
                    {m.created_at ? new Date(m.created_at).toLocaleTimeString() : ""}
                  </p>
                </div>
                {isAdmin && <img src={logo} alt="Admin" className="w-6 h-6 object-contain" />}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        {selectedOffer.status === "pending" || selectedOffer.status === "countered" ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 border border-border bg-transparent px-3 py-2 text-[11px] outline-none" />
              <button onClick={sendMessage} className="bg-primary text-primary-foreground px-4 py-2 min-h-[40px]">
                <Send className="w-3 h-3" />
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAction("accept")}
                className="bg-foreground text-background px-4 py-2 text-[10px] tracking-widest uppercase min-h-[40px]">Accept</button>
              <div className="flex gap-1">
                <input value={counterPrice} onChange={(e) => setCounterPrice(e.target.value)}
                  placeholder="Counter $" className="border border-border bg-transparent px-2 py-2 text-[11px] outline-none w-24" />
                <button onClick={() => handleAction("counter")}
                  className="border border-border px-4 py-2 text-[10px] tracking-widest uppercase hover:border-foreground min-h-[40px]">Counter</button>
              </div>
              <button onClick={() => handleAction("decline")}
                className="border border-destructive text-destructive px-4 py-2 text-[10px] tracking-widest uppercase min-h-[40px]">Decline</button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 border border-border bg-transparent px-3 py-2 text-[11px] outline-none" />
            <button onClick={sendMessage} className="bg-primary text-primary-foreground px-4 py-2 min-h-[40px]">
              <Send className="w-3 h-3" />
            </button>
          </div>
        )}
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-[14px] tracking-[0.3em] uppercase font-extralight mb-8">Offers</h1>

      <div className="flex gap-2 mb-6">
        {["all", "pending", "countered", "accepted", "declined"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 text-[9px] tracking-widest uppercase border transition-all ${
              statusFilter === s ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"
            }`}>
            {s}
          </button>
        ))}
      </div>

      <div className="border border-border">
        <div className="grid grid-cols-[1fr_120px_100px_80px] gap-4 px-6 py-3 border-b border-border bg-muted">
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Product</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Offered</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Status</span>
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Chat</span>
        </div>
        {filtered.map((o) => (
          <div key={o.id} className="grid grid-cols-[1fr_120px_100px_80px] gap-4 px-6 py-4 border-b border-border last:border-b-0 items-center">
            <span className="text-[11px] font-light">{(o.products as any)?.name || "—"}</span>
            <span className="text-[11px] font-light">${o.offered_price.toLocaleString()}</span>
            <span className={`text-[10px] tracking-widest uppercase ${statusColors[o.status || "pending"]}`}>{o.status}</span>
            <button onClick={() => openChat(o)} className="nav-link text-[9px]">View</button>
          </div>
        ))}
        {filtered.length === 0 && <p className="px-6 py-8 text-center text-muted-foreground text-xs tracking-widest uppercase">No offers</p>}
      </div>
    </AdminLayout>
  );
};

export default AdminOffers;
