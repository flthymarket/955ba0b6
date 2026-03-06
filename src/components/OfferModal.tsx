import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productPrice: number;
}

const OfferModal = ({ isOpen, onClose, productId, productName, productPrice }: OfferModalProps) => {
  const [offerPrice, setOfferPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in", description: "You need an account to make an offer.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    const price = parseFloat(offerPrice);
    if (isNaN(price) || price <= 0) {
      toast({ title: "Invalid price", description: "Please enter a valid offer amount.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("offers").insert({
      product_id: productId,
      user_id: user.id,
      offered_price: price,
      status: "pending",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Offer Submitted", description: "Your offer has been sent. Check your account for updates. Please allow some time for staff to respond." });
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/30" onClick={onClose} />
      <div className="relative bg-background border border-border p-10 max-w-md w-full mx-6 animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 hover:opacity-50 transition-opacity">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-base tracking-[0.25em] uppercase font-light mb-3">Make an Offer</h3>
        <p className="text-sm text-muted-foreground tracking-wide mb-1 font-light">{productName}</p>
        <p className="text-sm tracking-wide mb-8 font-light">Listed at ${productPrice.toLocaleString()}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs tracking-[0.2em] uppercase font-light block mb-3">Your Offer Price ($)</label>
            <input
              type="number"
              step="0.01"
              min="1"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              className="w-full border-b border-foreground bg-transparent py-3 text-base tracking-widest outline-none placeholder:text-muted-foreground"
              placeholder="0.00"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-4 text-sm tracking-[0.2em] uppercase font-light hover:opacity-80 transition-opacity min-h-[52px] disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Offer"}
          </button>
          <p className="text-xs text-muted-foreground text-center font-light">
            Staff will review your offer and respond via chat. Please allow some time for a response.
          </p>
        </form>
      </div>
    </div>
  );
};

export default OfferModal;
