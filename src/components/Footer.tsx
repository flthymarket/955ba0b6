import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h4 className="editorial-heading text-[10px] mb-6">Shop</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/collection?filter=new" className="nav-link text-[9px] text-muted-foreground">New Arrivals</Link>
              <Link to="/collection?filter=clothing" className="nav-link text-[9px] text-muted-foreground">Clothing</Link>
              <Link to="/collection?filter=footwear" className="nav-link text-[9px] text-muted-foreground">Footwear</Link>
              <Link to="/collection?filter=accessories" className="nav-link text-[9px] text-muted-foreground">Accessories</Link>
            </nav>
          </div>
          <div>
            <h4 className="editorial-heading text-[10px] mb-6">Information</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/help#shipping" className="nav-link text-[9px] text-muted-foreground">Shipping Policy</Link>
              <Link to="/help#refund" className="nav-link text-[9px] text-muted-foreground">Refund Policy</Link>
              <Link to="/help#privacy" className="nav-link text-[9px] text-muted-foreground">Privacy Policy</Link>
              <Link to="/help#terms" className="nav-link text-[9px] text-muted-foreground">Terms of Service</Link>
            </nav>
          </div>
          <div>
            <h4 className="editorial-heading text-[10px] mb-6">Connect</h4>
            <nav className="flex flex-col gap-3">
              <a href="#" className="nav-link text-[9px] text-muted-foreground">Instagram</a>
              <a href="#" className="nav-link text-[9px] text-muted-foreground">Twitter</a>
              <Link to="/help#contact" className="nav-link text-[9px] text-muted-foreground">Contact</Link>
            </nav>
          </div>
          <div>
            <h4 className="editorial-heading text-[10px] mb-6">Newsletter</h4>
            <p className="text-[10px] text-muted-foreground tracking-wide mb-4 font-light">
              Early access to drops & exclusives.
            </p>
            <div className="flex border-b border-foreground">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                className="flex-1 bg-transparent outline-none text-[10px] tracking-widest py-2 placeholder:text-muted-foreground"
              />
              <button className="editorial-heading text-[9px] px-2 hover:opacity-50 transition-opacity">
                →
              </button>
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
