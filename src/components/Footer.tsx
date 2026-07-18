import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    if (!email.trim()) return;
    setSubmitting(true);
    await supabase.from("newsletter_subscribers").insert({ email: email.trim() });
    localStorage.setItem("newsletter_subscribed", "true");
    toast({ title: "Subscribed", description: "You're on the list." });
    setEmail("");
    setSubmitting(false);
  };

  return (
    <footer className="mt-24" style={{ backgroundColor: 'hsl(var(--footer-bg))', color: 'hsl(var(--footer-fg))' }}>
      <div className="kill-bar" style={{ background: 'hsl(var(--footer-fg))' }} />

      {/* Big brand marquee */}
      <div className="marquee-wrap py-6 border-b" style={{ borderColor: 'hsl(var(--footer-fg) / 0.15)' }}>
        <div className="marquee marquee-slow">
          {[0,1].map(i => (
            <div key={i} className="marquee-track">
              {Array.from({ length: 8 }).map((_, j) => (
                <span key={j} className="font-akira text-[9vw] leading-none px-8 opacity-90">FLTHYMRKT</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-14">

          <div>
            <h4 className="editorial-heading mb-6 opacity-90">Customer Care</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/help#contact" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Contact Us</Link>
              <a href="mailto:flthymarket@gmail.com" className="text-sm opacity-70 hover:opacity-100 transition-opacity">flthymarket@gmail.com</a>
              <Link to="/account" className="text-sm opacity-70 hover:opacity-100 transition-opacity">My Account</Link>
              <Link to="/help#orders" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Order Status</Link>
              <a href="https://instagram.com/flthymrkt" target="_blank" rel="noopener noreferrer" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Instagram</a>
              <a href="https://tiktok.com/@flthymrkt" target="_blank" rel="noopener noreferrer" className="text-sm opacity-70 hover:opacity-100 transition-opacity">TikTok</a>
            </nav>
          </div>

          <div>
            <h4 className="editorial-heading mb-6 opacity-90">Newsletter</h4>
            <p className="text-sm opacity-70 mb-5 max-w-xs">
              Early access to drops, exclusives, and restocks. No spam.
            </p>
            <div className="flex border-b" style={{ borderColor: 'hsl(var(--footer-fg) / 0.3)' }}>
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm tracking-[0.15em] py-3 placeholder:opacity-40 min-h-[44px] font-mono-ui"
                style={{ color: 'hsl(var(--footer-fg))' }}
              />
              <button
                onClick={handleSubscribe}
                disabled={submitting}
                className="text-sm px-3 opacity-70 hover:opacity-100 transition-opacity disabled:opacity-30 font-mono-ui"
              >SUBSCRIBE →</button>
            </div>
          </div>

          <div>
            <h4 className="editorial-heading mb-6 opacity-90">Help & Policies</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/help#shipping-policy" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Shipping</Link>
              <Link to="/help#refund-policy" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Returns & Refunds</Link>
              <Link to="/help#privacy-policy" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Privacy</Link>
              <Link to="/help#terms-of-service" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Terms of Service</Link>
              <Link to="/help#faq" className="text-sm opacity-70 hover:opacity-100 transition-opacity">FAQ</Link>
            </nav>
          </div>

        </div>

        <div className="mt-16 pt-6 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: '1px solid hsl(var(--footer-fg) / 0.15)' }}>
          <p className="text-[11px] opacity-50 tracking-[0.2em] uppercase font-mono-ui">
            © {new Date().getFullYear()} FLTHYMRKT — All Rights Reserved
          </p>
          <p className="text-[11px] opacity-50 tracking-[0.2em] uppercase font-mono-ui">
            Card · BTC · ETH · SOL
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
