import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronDown, Bookmark } from "lucide-react";
import { storefrontApiRequest, PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low"];
const categoryFilters = [
  { label: "All", value: "all" },
  { label: "New Arrivals", value: "new" },
  { label: "Tops", value: "tops" },
  { label: "Bottoms", value: "bottoms" },
  { label: "Bags", value: "bags" },
  { label: "Jewelry", value: "jewelry" },
  { label: "Dresses", value: "dresses" },
  { label: "Accessories", value: "accessories" },
];

const colorFilters = [
  { label: "Black", value: "black" },
  { label: "White", value: "white" },
  { label: "Blue", value: "blue" },
  { label: "Red", value: "red" },
  { label: "Green", value: "green" },
  { label: "Brown", value: "brown" },
  { label: "Gray", value: "gray" },
  { label: "Pink", value: "pink" },
];

const brandFilters = [
  { label: "Nike", value: "nike" },
  { label: "Adidas", value: "adidas" },
  { label: "Puma", value: "puma" },
  { label: "Vans", value: "vans" },
  { label: "Converse", value: "converse" },
  { label: "New Balance", value: "new-balance" },
];

const Collection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("filter") || "all";
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(true);
  const [currentSort, setCurrentSort] = useState("Featured");
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridVisible, setGridVisible] = useState(false);

  useEffect(() => {
    if (!gridRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGridVisible(true); obs.disconnect(); } }, { threshold: 0.05 });
    obs.observe(gridRef.current);
    return () => obs.disconnect();
  }, [products]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setGridVisible(false);
      try {
        let queryFilter: string | undefined;
        if (filter && filter !== "new" && filter !== "all") {
          queryFilter = `product_type:${filter}`;
        }
        const data = await storefrontApiRequest(PRODUCTS_QUERY, { first: 50, query: queryFilter });
        if (data?.data?.products?.edges) {
          let items = data.data.products.edges as ShopifyProduct[];
          if (currentSort === "Price: Low to High") {
            items = [...items].sort((a, b) => parseFloat(a.node.priceRange.minVariantPrice.amount) - parseFloat(b.node.priceRange.minVariantPrice.amount));
          } else if (currentSort === "Price: High to Low") {
            items = [...items].sort((a, b) => parseFloat(b.node.priceRange.minVariantPrice.amount) - parseFloat(a.node.priceRange.minVariantPrice.amount));
          }
          setProducts(items);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [filter, currentSort]);

  const pageTitle = filter && filter !== "all"
    ? filter === "new" ? "New Arrivals" : filter.charAt(0).toUpperCase() + filter.slice(1)
    : "All";

  return (
    <main className="pt-6 sm:pt-8 md:pt-12 pb-20 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Page title + count */}
        <div className="flex items-baseline justify-between mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-lg sm:text-xl md:text-2xl tracking-[0.25em] font-extralight uppercase">
            {pageTitle} <span className="text-muted-foreground text-sm font-light">({products.length})</span>
          </h1>
          <div className="relative">
            <button onClick={() => setSortOpen(!sortOpen)} className="text-sm tracking-[0.1em] uppercase font-light flex items-center gap-2 hover-gray px-2 py-1 transition-all">
              Sort by: {currentSort} <ChevronDown className="w-3 h-3" />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 bg-background border border-border py-3 px-5 min-w-[220px] z-10 animate-fade-in">
                {sortOptions.map((opt) => (
                  <button key={opt} onClick={() => { setCurrentSort(opt); setSortOpen(false); }}
                    className={`block w-full text-left py-2.5 text-sm tracking-[0.1em] uppercase font-light transition-all hover-gray px-2 -mx-2 min-h-[40px] ${currentSort === opt ? "opacity-100" : "opacity-50 hover:opacity-80"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Left sidebar filters - desktop only */}
          <aside className="hidden lg:block w-[200px] flex-shrink-0">
            <div className="sticky top-32">
              <div className="mb-6">
                <button onClick={() => setFilterOpen(!filterOpen)} className="flex items-center justify-between w-full text-sm tracking-[0.1em] uppercase font-light border-b border-foreground pb-2 mb-3">
                  Category <ChevronDown className={`w-3 h-3 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
                </button>
                {filterOpen && (
                  <div className="space-y-1">
                    {categoryFilters.map((cat) => (
                      <button key={cat.value}
                        onClick={() => setSearchParams(cat.value === "all" ? {} : { filter: cat.value })}
                        className={`flex items-center gap-2 w-full text-left py-1.5 text-sm font-light transition-all ${filter === cat.value ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                        <span className={`w-4 h-4 border flex items-center justify-center ${filter === cat.value ? "border-foreground bg-foreground" : "border-border"}`}>
                          {filter === cat.value && <span className="text-background text-[10px]">✓</span>}
                        </span>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Mobile filter bar */}
          <div className="lg:hidden w-full mb-4">
            <div className="flex items-center gap-4 overflow-x-auto pb-2 -mx-4 px-4">
              {categoryFilters.map((cat) => (
                <button key={cat.value}
                  onClick={() => setSearchParams(cat.value === "all" ? {} : { filter: cat.value })}
                  className={`text-xs tracking-[0.1em] uppercase font-light whitespace-nowrap px-3 py-2 border transition-all min-h-[36px] ${
                    filter === cat.value ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"
                  }`}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-sm tracking-widest uppercase">Loading...</p>
              </div>
            ) : products.length === 0 ? (
              <p className="text-center py-20 text-muted-foreground text-sm tracking-widest uppercase">No products found</p>
            ) : (
              <div ref={gridRef} className="grid gap-x-8 gap-y-12 sm:gap-x-10 sm:gap-y-14 md:gap-x-12 md:gap-y-16 grid-cols-2 lg:grid-cols-3">
                {products.map((product, i) => {
                  const img = product.node.images.edges[0]?.node;
                  const hoverImg = product.node.images.edges[1]?.node;
                  const price = product.node.priceRange.minVariantPrice;
                  return (
                    <div key={product.node.id} className="group"
                      style={{
                        transitionDelay: `${i * 60}ms`,
                        opacity: gridVisible ? 1 : 0,
                        transform: gridVisible ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'all 0.6s ease-out',
                      }}>
                      <Link to={`/product/${product.node.handle}`} className="block">
                        <div className="aspect-[3/4] overflow-hidden mb-3 bg-transparent relative p-4">
                          {img ? (
                            <img
                              src={img.url}
                              alt={img.altText || product.node.title}
                              className="w-full h-full object-contain"
                              loading="lazy"
                              onMouseEnter={(e) => { if (hoverImg) (e.target as HTMLImageElement).src = hoverImg.url; }}
                              onMouseLeave={(e) => { if (hoverImg) (e.target as HTMLImageElement).src = img.url; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Image</div>
                          )}
                          <button className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Bookmark className="w-5 h-5 text-foreground" />
                          </button>
                        </div>
                        <div className="px-1 pt-3 pb-2">
                          <p className="text-sm sm:text-base font-bold mb-1 leading-tight text-foreground" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                            {product.node.title}
                          </p>
                          <p className="text-xs sm:text-sm tracking-[0.1em] font-light text-muted-foreground">
                            ${parseFloat(price.amount).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                          </p>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Collection;
