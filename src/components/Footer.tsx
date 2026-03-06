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
    toast({ title: "Subscribed!", description: "Welcome to our newsletter." });
    setEmail("");
    setSubmitting(false);
  };

  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-14">
          <div>
            <h4 className="text-sm tracking-[0.2em] uppercase font-light mb-6">Shop</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/collection?filter=new" className="text-sm text-muted-foreground font-light hover:opacity-50 transition-opacity">New Arrivals</Link>
              <Link to="/collection" className="text-sm text-muted-foreground font-light hover:opacity-50 transition-opacity">All</Link>
              <Link to="/collection?filter=tops" className="text-sm text-muted-foreground font-light hover:opacity-50 transition-opacity">Tops</Link>
              <Link to="/collection?filter=bottoms" className="text-sm text-muted-foreground font-light hover:opacity-50 transition-opacity">Bottoms</Link>
              <Link to="/collection?filter=outerwear" className="text-sm text-muted-foreground font-light hover:opacity-50 transition-opacity">Outerwear</Link>
              <Link to="/collection?filter=accessories" className="text-sm text-muted-foreground font-light hover:opacity-50 transition-opacity">Accessories</Link>
            </nav>
          </div>
          <div>
            <h4 className="text-sm tracking-[0.2em] uppercase font-light mb-6">Information</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/help#shipping-policy" className="text-sm text-muted-foreground font-light hover:opacity-50 transition-opacity">Shipping Policy</Link>
              <Link to="/help#refund-policy" className="text-sm text-muted-foreground font-light hover:opacity-50 transition-opacity">Refund Policy</Link>
              <Link to="/help#privacy-policy" className="text-sm text-muted-foreground font-light hover:opacity-50 transition-opacity">Privacy Policy</Link>
              <Link to="/help#terms-of-service" className="text-sm text-muted-foreground font-light hover:opacity-50 transition-opacity">Terms of Service</Link>
            </nav>
          </div>
          <div>
            <h4 className="text-sm tracking-[0.2em] uppercase font-light mb-6">Connect</h4>
            <nav className="flex flex-col gap-3">
              <a href="https://instagram.com/flthymrkt" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground font-light hover:opacity-50 transition-opacity">Instagram</a>
              <a href="https://tiktok.com/@flthymrkt" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground font-light hover:opacity-50 transition-opacity">TikTok</a>
              <a href="mailto:flthymarket@gmail.com" className="text-sm text-muted-foreground font-light hover:opacity-50 transition-opacity">Email Us</a>
              <Link to="/help#contact" className="text-sm text-muted-foreground font-light hover:opacity-50 transition-opacity">Contact</Link>
            </nav>
          </div>
          <div>
            <h4 className="text-sm tracking-[0.2em] uppercase font-light mb-6">Newsletter</h4>
            <p className="text-sm text-muted-foreground tracking-wide mb-4 font-light">
              Early access to drops & exclusives.
            </p>
            <div className="flex border-b border-foreground">
              <input type="email" placeholder="EMAIL ADDRESS" value={email} onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm tracking-widest py-3 placeholder:text-muted-foreground" />
              <button onClick={handleSubscribe} disabled={submitting}
                className="text-sm px-2 hover:opacity-50 transition-opacity duration-150 disabled:opacity-30">→</button>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase font-light">
            © {new Date().getFullYear()} FLTHY MRKT. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
