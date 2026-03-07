import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { storefrontApiRequest, PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low"];
const categoryFilters = [
  { label: "All", value: "all" },
  { label: "New Arrivals", value: "new" },
  { label: "Tops", value: "tops" },
  { label: "Bottoms", value: "bottoms" },
  { label: "Outerwear", value: "outerwear" },
  { label: "Bags", value: "bags" },
  { label: "Jewelry", value: "jewelry" },
  { label: "Dresses", value: "dresses" },
  { label: "Accessories", value: "accessories" },
];

const Collection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("filter") || "all";
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
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

  const handleQuickAdd = async (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Added to bag");
  };

  const pageTitle = filter && filter !== "all"
    ? filter === "new" ? "New Arrivals" : filter.charAt(0).toUpperCase() + filter.slice(1)
    : "All";

  return (
    <main className="pt-28 sm:pt-32 md:pt-36 pb-20 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-xl md:text-2xl tracking-[0.35em] font-extralight uppercase text-center mb-8 md:mb-10">
          {pageTitle}
        </h1>

        {/* Filters & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between mb-8 md:mb-10 border-b border-border pb-4 gap-4">
          <div className="flex items-center gap-4 md:gap-6">
            <span className="text-xs sm:text-sm text-muted-foreground tracking-widest uppercase">{products.length} products</span>

            <div className="relative">
              <button onClick={() => setFilterOpen(!filterOpen)} className="text-sm tracking-[0.15em] uppercase font-light flex items-center gap-2 hover-gray px-2 py-1 transition-all">
                Categories <ChevronDown className="w-3 h-3" />
              </button>
              {filterOpen && (
                <div className="absolute left-0 top-full mt-2 bg-background border border-border py-3 px-5 min-w-[200px] z-10 animate-fade-in">
                  {categoryFilters.map((cat) => (
                    <button key={cat.value}
                      onClick={() => {
                        setSearchParams(cat.value === "all" ? {} : { filter: cat.value });
                        setFilterOpen(false);
                      }}
                      className={`block w-full text-left py-2.5 text-sm tracking-[0.1em] uppercase font-light transition-all hover-gray px-2 -mx-2 min-h-[40px] ${filter === cat.value ? "opacity-100 font-normal" : "opacity-50 hover:opacity-80"}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <button onClick={() => setSortOpen(!sortOpen)} className="text-sm tracking-[0.15em] uppercase font-light flex items-center gap-2 hover-gray px-2 py-1 transition-all">
              {currentSort} <ChevronDown className="w-3 h-3" />
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

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm tracking-widest uppercase">Loading...</p>
          </div>
        ) : products.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground text-sm tracking-widest uppercase">No products found</p>
        ) : (
          <div ref={gridRef} className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product, i) => {
              const img = product.node.images.edges[0]?.node;
              const price = product.node.priceRange.minVariantPrice;
              return (
                <div key={product.node.id} className="group"
                  style={{
                    transitionDelay: `${i * 60}ms`,
                    opacity: gridVisible ? 1 : 0,
                    transform: gridVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.6s ease-out',
                  }}>
                  <Link to={`/product/${product.node.handle}`} className="block hover-gray rounded-sm">
                    <div className="aspect-[3/4] overflow-hidden mb-3 bg-secondary">
                      {img ? (
                        <img
                          src={img.url}
                          alt={img.altText || product.node.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Image</div>
                      )}
                    </div>
                    <div className="px-1 pb-2">
                      <p className="text-xs sm:text-sm tracking-[0.15em] uppercase font-light text-muted-foreground mb-1">
                        {product.node.vendor || "FLTHY MRKT"}
                      </p>
                      <p className="text-sm sm:text-base tracking-[0.1em] font-light mb-1 leading-tight">
                        {product.node.title}
                      </p>
                      <p className="text-xs sm:text-sm tracking-[0.1em] font-light text-muted-foreground">
                        ${parseFloat(price.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleQuickAdd(product)}
                    disabled={isLoading}
                    className="mt-2 w-full text-xs sm:text-sm tracking-[0.15em] uppercase font-light border border-border py-3 hover:bg-foreground hover:text-background transition-all duration-300 opacity-0 group-hover:opacity-100 min-h-[44px]"
                  >
                    Quick Add
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default Collection;
