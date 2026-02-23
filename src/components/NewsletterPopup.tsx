import { useState, useEffect } from "react";
import { X } from "lucide-react";

const NewsletterPopup = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("newsletter-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setShow(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("newsletter-dismissed", "true");
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
          <h3 className="text-lg tracking-[0.3em] uppercase font-extralight mb-3">
            Join our Newsletter
          </h3>
          <p className="text-[11px] text-muted-foreground tracking-wide font-light mb-8">
            Early access to drops & exclusives.
          </p>
          <div className="flex border-b border-foreground mb-6">
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              className="flex-1 bg-transparent outline-none text-[10px] tracking-widest py-3 placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={dismiss}
            className="w-full bg-primary text-primary-foreground py-3 editorial-heading text-[11px] hover:opacity-80 transition-opacity"
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsletterPopup;
