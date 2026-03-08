import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const NewsletterPopup = () => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<"offer" | "form">("offer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) return;
    const subscribed = localStorage.getItem("newsletter_subscribed");
    const dismissed = sessionStorage.getItem("newsletter-dismissed");
    if (subscribed || dismissed) return;
    const timer = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(timer);
  }, [user]);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("newsletter-dismissed", "true");
  };

  const handleClaimOffer = () => {
    setStep("form");
  };

  const handleSubscribe = async () => {
    if (!email.trim() || !firstName.trim()) return;
    setSubmitting(true);

    await supabase.from("newsletter_subscribers").insert({
      email: email.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim() || null,
    } as any);

    localStorage.setItem("newsletter_subscribed", "true");

    try {
      await supabase.functions.invoke("newsletter-welcome", {
        body: { email: email.trim(), firstName: firstName.trim() },
      });
    } catch (err) {
      console.error("Welcome email error:", err);
    }

    setSubmitting(false);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative bg-background border border-border w-full max-w-sm animate-fade-in overflow-hidden">
        <button onClick={dismiss} className="absolute top-4 right-4 z-10 hover-gray p-1">
          <X className="w-5 h-5" />
        </button>

        {step === "offer" ? (
          <div className="text-center px-6 py-10">
            {/* Large FLTHYMRKT text clipped at bottom */}
            <div className="overflow-hidden h-24 sm:h-28 mb-6">
              <p className="font-akira text-[52px] sm:text-[64px] leading-[0.85] text-foreground select-none translate-y-[5%]">
                FLTHYMRKT
              </p>
            </div>
            <h3 className="text-lg sm:text-xl tracking-[0.15em] uppercase font-light mb-1">Subscribe and Unlock</h3>
            <p className="text-base font-semibold tracking-wide mb-1">DISCOUNTS & UPDATES.</p>
            <p className="text-sm text-muted-foreground mb-8">Unlock benefits now!</p>

            <button
              onClick={handleClaimOffer}
              className="w-full bg-foreground text-background py-4 text-sm tracking-[0.2em] uppercase font-light hover:opacity-80 transition-opacity min-h-[48px] mb-3"
            >
              Claim This Offer
            </button>
            <button
              onClick={dismiss}
              className="text-sm font-light hover:underline transition-all"
              style={{ color: 'hsl(210, 70%, 50%)' }}
            >
              No thanks
            </button>
          </div>
        ) : (
          <div className="px-6 py-8">
            <div className="overflow-hidden h-16 mb-4 mx-auto">
              <p className="font-akira text-[40px] leading-[0.85] text-foreground select-none text-center translate-y-[5%]">
                FLTHYMRKT
              </p>
            </div>
            <h3 className="text-base sm:text-lg tracking-[0.15em] uppercase font-light text-center mb-6">
              Unlock Your Benefits
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="FIRST NAME"
                  className="w-full border border-border bg-transparent px-4 py-3 text-sm tracking-widest outline-none focus:border-foreground transition-colors min-h-[44px] placeholder:text-muted-foreground"
                  required
                />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="LAST NAME"
                  className="w-full border border-border bg-transparent px-4 py-3 text-sm tracking-widest outline-none focus:border-foreground transition-colors min-h-[44px] placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS"
                  className="w-full border border-border bg-transparent px-4 py-3 text-sm tracking-widest outline-none focus:border-foreground transition-colors min-h-[44px] placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={submitting || !email.trim() || !firstName.trim()}
              className="w-full bg-foreground text-background py-4 text-sm tracking-[0.2em] uppercase font-light hover:opacity-80 transition-opacity min-h-[48px] mt-6 disabled:opacity-50"
            >
              {submitting ? "..." : "Subscribe"}
            </button>
            <button
              onClick={dismiss}
              className="w-full text-sm font-light hover:underline transition-all mt-3 py-2"
              style={{ color: 'hsl(210, 70%, 50%)' }}
            >
              No thanks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterPopup;
