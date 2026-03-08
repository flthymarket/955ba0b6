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
  const [submitted, setSubmitted] = useState(false);
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
    // Store the Shopify GID as-is (product_id is now text type)
    const { error } = await supabase.from("offers").insert({
      product_id: productId,
      user_id: user.id,
      offered_price: price,
      status: "pending",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center">
        <div className="absolute inset-0 bg-foreground/30" onClick={() => { setSubmitted(false); onClose(); }} />
        <div className="relative bg-background border border-border p-8 sm:p-10 max-w-md w-full mx-4 sm:mx-6 animate-fade-in text-center">
          <button onClick={() => { setSubmitted(false); onClose(); }} className="absolute top-4 right-4 hover:opacity-50 transition-opacity">
            <X className="w-5 h-5" />
          </button>
          <div className="mb-6">
            <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-lg">✓</span>
            </div>
            <h3 className="text-base sm:text-lg tracking-[0.15em] uppercase font-light mb-3">Offer Submitted!</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed mb-2">
              Your offer has been sent to our team for review.
            </p>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Please go to your <strong>Profile → My Offers</strong> to continue the conversation with our staff. Response times may vary.
            </p>
          </div>
          <button
            onClick={() => { setSubmitted(false); onClose(); navigate("/account"); }}
            className="w-full bg-foreground text-background py-4 text-sm tracking-[0.2em] uppercase font-light hover:opacity-80 transition-opacity min-h-[52px]"
          >
            Go to My Offers
          </button>
          <button
            onClick={() => { setSubmitted(false); onClose(); }}
            className="w-full text-sm text-muted-foreground font-light mt-3 py-2 hover:underline"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/30" onClick={onClose} />
      <div className="relative bg-background border border-border p-8 sm:p-10 max-w-md w-full mx-4 sm:mx-6 animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 hover:opacity-50 transition-opacity">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-base sm:text-lg tracking-[0.2em] uppercase font-light mb-3">Make an Offer</h3>
        <p className="text-sm text-muted-foreground tracking-wide mb-1 font-light">{productName}</p>
        <p className="text-sm tracking-wide mb-8 font-light">Listed at ${productPrice.toLocaleString()}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm tracking-[0.1em] uppercase font-light block mb-3">Your Offer Price ($)</label>
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
            className="w-full bg-foreground text-background py-4 text-sm tracking-[0.2em] uppercase font-light hover:opacity-80 transition-opacity min-h-[52px] disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Offer"}
          </button>
          <p className="text-xs text-muted-foreground text-center font-light leading-relaxed">
            After submitting, go to <strong>Profile → My Offers</strong> to chat with our team. Please allow some time for staff to respond.
          </p>
        </form>
      </div>
    </div>
  );
};

export default OfferModal;
