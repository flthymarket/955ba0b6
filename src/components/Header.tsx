import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import SearchOverlay from "./SearchOverlay";
import CartDrawer from "./CartDrawer";
import AnnouncementBanner from "./AnnouncementBanner";
import { useCartStore } from "@/stores/cartStore";

const navLinks = [
  { label: "Shop", href: "/collection" },
  { label: "New", href: "/collection?filter=new" },
  { label: "Tops", href: "/collection?filter=tops" },
  { label: "Bottoms", href: "/collection?filter=bottoms" },
  { label: "Accessories", href: "/collection?filter=accessories" },
  { label: "Brands", href: "/brands" },
];

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const totalItems = useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0));

  return (
    <>
      <div className="w-full z-[60] relative">
        <AnnouncementBanner />
      </div>

      <header className="sticky top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="flex items-center py-5">
            {/* Left nav */}
            <nav className="hidden lg:flex items-center gap-4 flex-1">
              {navLinks.map((link) => (
                <Link key={link.label} to={link.href} className="nav-link">
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile burger */}
            <button
              className="lg:hidden flex-1 text-left"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>

            {/* Centered logo */}
            <Link to="/" className="flex-shrink-0 mx-auto lg:mx-4">
              <img src={logo} alt="FLTHYMRKT" className="h-16 md:h-20 lg:h-24 w-auto" />
            </Link>

            {/* Right */}
            <div className="flex items-center gap-4 md:gap-5 flex-1 justify-end">
              <button
                onClick={() => setSearchOpen(true)}
                className="nav-link hidden md:inline"
                aria-label="Search"
              >
                <Search className="w-5 h-5 inline" />
              </button>
              <Link to={user ? "/account" : "/auth"} className="nav-link hidden md:inline">
                Account
              </Link>
              <button onClick={() => setCartOpen(true)} className="nav-link">
                Cart ({totalItems})
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-28 px-6 animate-fade-in overflow-y-auto">
          <nav className="flex flex-col gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="nav-link text-2xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to={user ? "/account" : "/auth"}
              className="nav-link text-2xl"
              onClick={() => setMobileMenuOpen(false)}
            >
              Account
            </Link>
          </nav>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Header;
