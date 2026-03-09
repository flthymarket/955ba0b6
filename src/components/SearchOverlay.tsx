import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";

const SEARCH_PRODUCTS_QUERY = `
  query SearchProducts($first: Int!, $query: String!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          vendor
          productType
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

interface SearchResult {
  type: "product" | "brand";
  id: string;
  name: string;
  subtitle?: string;
  url: string;
  image?: string;
  price?: number;
}

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const SearchOverlay = ({ open, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await storefrontApiRequest(SEARCH_PRODUCTS_QUERY, {
          first: 10,
          query: query.trim(),
        });

        const items: SearchResult[] = [];
        const seenBrands = new Set<string>();

        if (data?.data?.products?.edges) {
          (data.data.products.edges as ShopifyProduct[]).forEach((p) => {
            // Add brand result (deduplicated)
            const vendor = p.node.vendor;
            if (vendor && !seenBrands.has(vendor.toLowerCase()) && vendor.toLowerCase().includes(query.trim().toLowerCase())) {
              seenBrands.add(vendor.toLowerCase());
              items.push({
                type: "brand",
                id: `brand-${vendor}`,
                name: vendor,
                url: `/collection?brand=${encodeURIComponent(vendor)}`,
              });
            }

            // Add product result
            const img = p.node.images.edges[0]?.node;
            items.push({
              type: "product",
              id: p.node.id,
              name: p.node.title,
              subtitle: p.node.vendor,
              url: `/product/${p.node.handle}`,
              image: img?.url,
              price: parseFloat(p.node.priceRange.minVariantPrice.amount),
            });
          });
        }

        setResults(items);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      }
      setLoading(false);
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-6 pt-32">
        <div className="flex items-center border-b border-foreground pb-3 mb-8">
          <Search className="w-4 h-4 mr-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH PRODUCTS, BRANDS..."
            className="flex-1 bg-transparent outline-none editorial-heading text-sm placeholder:text-muted-foreground"
          />
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>

        {loading && (
          <p className="text-center text-muted-foreground text-xs tracking-widest uppercase py-6">Searching...</p>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-1">
            {results.some((r) => r.type === "brand") && (
              <div className="mb-6">
                <p className="editorial-heading text-[9px] text-muted-foreground mb-3">Brands</p>
                {results.filter((r) => r.type === "brand").map((r) => (
                  <Link key={r.id} to={r.url} onClick={onClose}
                    className="block py-2 text-[11px] tracking-[0.1em] font-light hover:opacity-50 transition-opacity">
                    {r.name}
                  </Link>
                ))}
              </div>
            )}
            {results.some((r) => r.type === "product") && (
              <div>
                <p className="editorial-heading text-[9px] text-muted-foreground mb-3">Products</p>
                <div className="space-y-4">
                  {results.filter((r) => r.type === "product").map((r) => (
                    <Link key={r.id} to={r.url} onClick={onClose}
                      className="flex items-center gap-4 group hover:opacity-70 transition-opacity">
                      {r.image && (
                        <div className="w-14 h-14 bg-secondary flex-shrink-0 overflow-hidden">
                          <img src={r.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-muted-foreground tracking-widest uppercase">{r.subtitle}</p>
                        <p className="text-[11px] font-light tracking-wide truncate">{r.name}</p>
                      </div>
                      <span className="text-[11px] font-light">${r.price?.toLocaleString()}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {query.trim() && !loading && results.length === 0 && (
          <p className="text-center text-muted-foreground text-xs tracking-widest uppercase py-12">No results found</p>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
