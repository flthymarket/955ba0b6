import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, User, ShoppingBag, ChevronDown, X, Menu } from "lucide-react";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "New Arrivals", href: "/collection?filter=new" },
  { label: "Brands", href: "/brands" },
  { label: "All", href: "/collection" },
  { label: "Footwear", href: "/collection?filter=footwear" },
  { label: "Accessories", href: "/collection?filter=accessories" },
  { label: "Stories", href: "/stories" },
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/95 backdrop-blur-sm border-b border-border"
            : "bg-background"
        }`}
      >
        {/* Top bar */}
        <div className="border-b border-border">
          <div className="max-w-[1400px] mx-auto px-6 py-2 flex justify-between items-center">
            <span className="text-[9px] tracking-[0.2em] uppercase font-light">
              FLTHYMRKT
            </span>
            <div className="flex items-center gap-6">
              <div className="relative">
                <button
                  onClick={() => setHelpOpen(!helpOpen)}
                  className="nav-link text-[9px] flex items-center gap-1 text-muted-foreground"
                >
                  Help <ChevronDown className="w-3 h-3" />
                </button>
                {helpOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-background border border-border py-3 px-6 min-w-[200px] z-50">
                    {helpLinks.map((link) => (
                      <Link
                        key={link.label}
                        to={link.href}
                        className="block py-2 nav-link text-[9px]"
                        onClick={() => setHelpOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main header - Logo centered, nav below */}
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Top row: mobile menu + logo centered + icons */}
          <div className="relative flex items-center justify-center py-4">
            {/* Mobile menu toggle - absolute left */}
            <button
              className="lg:hidden absolute left-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Center logo - larger */}
            <Link to="/" className="flex-shrink-0">
              <img src={logo} alt="FLTHY MRKT" className="h-14 md:h-16 lg:h-20 w-auto" />
            </Link>

            {/* Right icons - absolute right */}
            <div className="flex items-center gap-5 absolute right-0">
              <button
                onClick={() => setSearchOpen(true)}
                className="transition-opacity duration-300 hover:opacity-50"
              >
                <Search className="w-4 h-4" />
              </button>
              <Link
                to="/account"
                className="transition-opacity duration-300 hover:opacity-50"
              >
                <User className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setCartOpen(!cartOpen)}
                className="transition-opacity duration-300 hover:opacity-50 relative"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-foreground text-background text-[7px] flex items-center justify-center">
                  0
                </span>
              </button>
            </div>
          </div>

          {/* Desktop navigation below logo */}
          <nav className="hidden lg:flex items-center justify-center gap-8 pb-4 border-b border-border">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.href} className="nav-link">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-36 px-6">
          <nav className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="nav-link text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-background flex items-start justify-center pt-32">
          <div className="w-full max-w-xl px-6">
            <div className="flex items-center border-b border-foreground pb-3">
              <Search className="w-4 h-4 mr-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="SEARCH"
                autoFocus
                className="flex-1 bg-transparent outline-none editorial-heading text-sm placeholder:text-muted-foreground"
              />
              <button onClick={() => setSearchOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart slide-out */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 z-[55] bg-foreground/20"
            onClick={() => setCartOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md z-[60] bg-background border-l border-border animate-slide-in-right">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <span className="editorial-heading">Shopping Bag</span>
                <button onClick={() => setCartOpen(false)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground text-xs tracking-widest uppercase">
                  Your bag is empty
                </p>
              </div>
              <Link
                to="/collection"
                className="block w-full bg-primary text-primary-foreground text-center py-3 editorial-heading text-[11px] hover:opacity-80 transition-opacity"
                onClick={() => setCartOpen(false)}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
