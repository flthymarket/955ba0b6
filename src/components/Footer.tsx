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
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h4 className="editorial-heading text-[10px] mb-6">Shop</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/collection?filter=new" className="nav-link text-[9px] text-muted-foreground">New Arrivals</Link>
              <Link to="/collection" className="nav-link text-[9px] text-muted-foreground">All</Link>
              <Link to="/collection?filter=tops" className="nav-link text-[9px] text-muted-foreground">Tops</Link>
              <Link to="/collection?filter=bottoms" className="nav-link text-[9px] text-muted-foreground">Bottoms</Link>
              <Link to="/collection?filter=outerwear" className="nav-link text-[9px] text-muted-foreground">Outerwear</Link>
              <Link to="/collection?filter=accessories" className="nav-link text-[9px] text-muted-foreground">Accessories</Link>
            </nav>
          </div>
          <div>
            <h4 className="editorial-heading text-[10px] mb-6">Information</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/help#shipping-policy" className="nav-link text-[9px] text-muted-foreground">Shipping Policy</Link>
              <Link to="/help#refund-policy" className="nav-link text-[9px] text-muted-foreground">Refund Policy</Link>
              <Link to="/help#privacy-policy" className="nav-link text-[9px] text-muted-foreground">Privacy Policy</Link>
              <Link to="/help#terms-of-service" className="nav-link text-[9px] text-muted-foreground">Terms of Service</Link>
            </nav>
          </div>
          <div>
            <h4 className="editorial-heading text-[10px] mb-6">Connect</h4>
            <nav className="flex flex-col gap-3">
              <a href="https://instagram.com/flthymrkt" target="_blank" rel="noopener noreferrer" className="nav-link text-[9px] text-muted-foreground">Instagram</a>
              <a href="https://tiktok.com/@flthymrkt" target="_blank" rel="noopener noreferrer" className="nav-link text-[9px] text-muted-foreground">TikTok</a>
              <a href="mailto:flthymarket@gmail.com" className="nav-link text-[9px] text-muted-foreground">Email Us</a>
              <Link to="/help#contact" className="nav-link text-[9px] text-muted-foreground">Contact</Link>
            </nav>
          </div>
          <div>
            <h4 className="editorial-heading text-[10px] mb-6">Newsletter</h4>
            <p className="text-[10px] text-muted-foreground tracking-wide mb-4 font-light">
              Early access to drops & exclusives.
            </p>
            <div className="flex border-b border-foreground">
              <input type="email" placeholder="EMAIL ADDRESS" value={email} onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[10px] tracking-widest py-2 placeholder:text-muted-foreground" />
              <button onClick={handleSubscribe} disabled={submitting}
                className="editorial-heading text-[9px] px-2 hover:opacity-50 transition-opacity duration-150 disabled:opacity-30">→</button>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase font-light">
            © {new Date().getFullYear()} FLTHY MRKT. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
