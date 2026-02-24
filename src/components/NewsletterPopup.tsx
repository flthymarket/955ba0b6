import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const NewsletterPopup = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Don't show if logged in
    if (user) return;

    // Don't show if cookie set
    const subscribed = localStorage.getItem("newsletter_subscribed");
    const dismissed = sessionStorage.getItem("newsletter-dismissed");
    if (subscribed || dismissed) return;

    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, [user]);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("newsletter-dismissed", "true");
  };

  const handleSubscribe = async () => {
    if (!email.trim()) return;
    setSubmitting(true);
    
    await supabase.from("newsletter_subscribers").insert({ email: email.trim() });
    localStorage.setItem("newsletter_subscribed", "true");
    
    setSubmitting(false);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/30" onClick={dismiss} />
      <div className="relative bg-background border border-border p-12 max-w-md w-full mx-6 animate-fade-in">
        <button onClick={dismiss} className="absolute top-4 right-4">
          <X className="w-4 h-4" />
        </button>
        <div className="text-center">
          <h3 className="text-lg tracking-[0.3em] uppercase font-extralight mb-3">Join our Newsletter</h3>
          <p className="text-[11px] text-muted-foreground tracking-wide font-light mb-8">Early access to drops & exclusives.</p>
          <div className="flex border-b border-foreground mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="EMAIL ADDRESS"
              className="flex-1 bg-transparent outline-none text-[10px] tracking-widest py-3 placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={handleSubscribe}
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground py-3 editorial-heading text-[11px] hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {submitting ? "..." : "Subscribe"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsletterPopup;
