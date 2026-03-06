import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, User, ShoppingBag, ChevronDown, Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import SearchOverlay from "./SearchOverlay";
import CartDrawer from "./CartDrawer";
import AnnouncementBanner from "./AnnouncementBanner";
import { useCartStore } from "@/stores/cartStore";

const navLinks = [
  { label: "New Arrivals", href: "/collection?filter=new" },
  { label: "Brands", href: "/brands" },
  { label: "All", href: "/collection" },
  { label: "Tops", href: "/collection?filter=tops" },
  { label: "Bottoms", href: "/collection?filter=bottoms" },
  { label: "Outerwear", href: "/collection?filter=outerwear" },
  { label: "Accessories", href: "/collection?filter=accessories" },
];

const helpLinks = [
  { label: "Contact Support", href: "/help#contact" },
  { label: "Shipping Policy", href: "/help#shipping-policy" },
  { label: "Refund Policy", href: "/help#refund-policy" },
  { label: "Privacy Policy", href: "/help#privacy-policy" },
  { label: "Terms of Service", href: "/help#terms-of-service" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const totalItems = useCartStore(state => state.items.reduce((sum, i) => sum + i.quantity, 0));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <AnnouncementBanner />
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-background/95 backdrop-blur-sm border-b border-border" : "bg-background"
        }`}
      >
        <div className="border-b border-border">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-2 flex justify-between items-center">
            <span className="text-xs tracking-[0.2em] uppercase font-light">FLTHYMRKT</span>
            <div className="flex items-center gap-6">
              <div className="relative">
                <button onClick={() => setHelpOpen(!helpOpen)}
                  className="text-xs tracking-[0.2em] uppercase font-light text-muted-foreground hover:opacity-50 transition-opacity flex items-center gap-1">
                  Help <ChevronDown className="w-3 h-3" />
                </button>
                {helpOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-background border border-border py-3 px-6 min-w-[220px] z-50 animate-fade-in">
                    {helpLinks.map((link) => (
                      <Link key={link.label} to={link.href}
                        className="block py-2 text-xs tracking-[0.15em] uppercase font-light hover:opacity-50 transition-opacity" onClick={() => setHelpOpen(false)}>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="relative flex items-center justify-center py-4">
            <button className="lg:hidden absolute left-0" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/" className="flex-shrink-0">
              <img src={logo} alt="FLTHY MRKT" className="h-12 md:h-16 lg:h-20 w-auto" />
            </Link>

            <div className="flex items-center gap-5 md:gap-6 absolute right-0">
              <button onClick={() => setSearchOpen(true)} className="transition-opacity duration-150 hover:opacity-50">
                <Search className="w-5 h-5" />
              </button>
              <Link to={user ? "/account" : "/auth"} className="transition-opacity duration-150 hover:opacity-50">
                <User className="w-5 h-5" />
              </Link>
              <button onClick={() => setCartOpen(true)} className="transition-opacity duration-150 hover:opacity-50 relative">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-foreground text-background text-[9px] flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          <nav className="hidden lg:flex items-center justify-center gap-8 pb-4 border-b border-border">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.href} className="text-xs tracking-[0.2em] uppercase font-light hover:opacity-50 transition-opacity duration-300">{link.label}</Link>
            ))}
          </nav>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-32 px-6 animate-fade-in">
          <nav className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.href} className="text-base tracking-[0.2em] uppercase font-light" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Header;
