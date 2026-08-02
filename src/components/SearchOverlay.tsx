import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { searchProducts, primaryImage, productUrl, money, finalPrice, type StoreProduct } from "@/lib/store";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const SearchOverlay = ({ open, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (open) {
      setQuery("");
      setProducts([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        setProducts(await searchProducts(query.trim(), 24));
      } catch (err) {
        console.error("Search failed:", err);
        setProducts([]);
      }
      setLoading(false);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  if (!open) return null;

  const brands = Array.from(
    new Set(products.map((p) => p.brands?.name?.trim()).filter((b): b is string => !!b))
  ).filter((b) => b.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="fixed inset-0 z-[70] bg-background flex flex-col overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full px-6 pt-24 pb-20">
        <div className="flex items-center border-b border-foreground pb-3 mb-8">
          <Search className="w-4 h-4 mr-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands, sizes..."
            className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-muted-foreground"
          />
          <button onClick={onClose} aria-label="Close search">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading && <p className="editorial-heading text-center text-muted-foreground py-6">Searching...</p>}

        {!loading && brands.length > 0 && (
          <div className="mb-8">
            <p className="editorial-heading text-[9px] text-muted-foreground mb-3">Brands</p>
            {brands.map((b) => (
              <Link
                key={b}
                to={`/collection?brand=${encodeURIComponent(b)}`}
                onClick={onClose}
                className="block py-2 text-[14px] hover:underline"
              >
                {b}
              </Link>
            ))}
          </div>
        )}

        {!loading && products.length > 0 && (
          <div>
            <p className="editorial-heading text-[9px] text-muted-foreground mb-3">Products</p>
            <div className="space-y-4">
              {products.map((p) => {
                const sizes = p.product_variants.filter((v) => v.quantity > 0).map((v) => v.size);
                return (
                  <Link
                    key={p.id}
                    to={productUrl(p)}
                    onClick={onClose}
                    className="flex items-center gap-4 group hover:opacity-70 transition-opacity"
                  >
                    <div className="w-16 h-20 flex-shrink-0 flex items-center justify-center">
                      {primaryImage(p) ? (
                        <img src={primaryImage(p)} alt={p.name} className="max-w-full max-h-full object-contain" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="editorial-heading text-[9px] text-muted-foreground">{p.brands?.name || p.category}</p>
                      <p className="text-[14px] truncate">{p.name}</p>
                      {sizes.length > 0 && (
                        <p className="text-[11px] text-muted-foreground">{sizes.join(" · ")}</p>
                      )}
                    </div>
                    <span className="text-[13px] text-muted-foreground">{money(finalPrice(p))}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {query.trim() && !loading && products.length === 0 && (
          <p className="editorial-heading text-center text-muted-foreground py-12">No results found</p>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
