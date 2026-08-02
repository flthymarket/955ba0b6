import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import SearchOverlay from "./SearchOverlay";
import CartDrawer from "./CartDrawer";
import AnnouncementBanner from "./AnnouncementBanner";
import { useCartStore } from "@/stores/cartStore";

const categoryLinks = [
  { label: "Shop All", href: "/collection" },
  { label: "New Arrivals", href: "/collection?filter=new" },
  { label: "Tops", href: "/collection?filter=tops" },
  { label: "Bottoms", href: "/collection?filter=bottoms" },
  { label: "Bags", href: "/collection?filter=bags" },
  { label: "Jewelry", href: "/collection?filter=jewelry" },
  { label: "Accessories", href: "/collection?filter=accessories" },
  { label: "Brands", href: "/brands" },
  { label: "About", href: "/help#about" },
  { label: "FAQ", href: "/help#faq" },
];

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const totalItems = useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0));

  return (
    <>
      <div className="w-full z-[60] relative">
        <AnnouncementBanner />
      </div>

      <header className="sticky top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="max-w-[1600px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center py-4">
            {/* Left: menu + search */}
            <div className="flex items-center gap-4">
              <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <button onClick={() => setSearchOpen(true)} aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Center: logo */}
            <Link to="/" className="flex-shrink-0 justify-self-center">
              <img src={logo} alt="FLTHYMRKT" className="h-14 md:h-20 w-auto" />
            </Link>

            {/* Right: account + cart */}
            <div className="flex items-center gap-4 md:gap-6 justify-end">
              <Link to={user ? "/account" : "/auth"} className="nav-link">
                Account
              </Link>
              <button onClick={() => setCartOpen(true)} className="nav-link">
                Cart ({totalItems})
              </button>
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[55] bg-background pt-24 px-8 animate-fade-in overflow-y-auto">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-6 right-6"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
          <nav className="flex flex-col gap-5 max-w-md">
            {categoryLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="nav-link text-[20px]"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to={user ? "/account" : "/auth"}
              className="nav-link text-[20px]"
              onClick={() => setMenuOpen(false)}
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
