import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { storefrontApiRequest, PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

const sortOptions = ["Newest", "Price: Low to High", "Price: High to Low"];

const Collection = () => {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");
  const [sortOpen, setSortOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState("Newest");
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Build query filter if needed
        let queryFilter: string | undefined;
        if (filter && filter !== "new" && filter !== "all") {
          queryFilter = `product_type:${filter}`;
        }
        const data = await storefrontApiRequest(PRODUCTS_QUERY, { first: 50, query: queryFilter });
        if (data?.data?.products?.edges) {
          let items = data.data.products.edges as ShopifyProduct[];
          // Sort
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
    <main className="pt-28 md:pt-32 pb-24 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <h1 className="text-[14px] md:text-[16px] tracking-[0.3em] font-extralight uppercase text-center mb-8">
          {pageTitle}
        </h1>

        <div className="flex items-center justify-between mb-8 border-b border-border pb-3">
          <span className="text-[9px] text-muted-foreground tracking-widest">{products.length} ITEMS</span>
          <div className="relative">
            <button onClick={() => setSortOpen(!sortOpen)} className="nav-link text-[9px] flex items-center gap-2">
              Sort <ChevronDown className="w-3 h-3" />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 bg-background border border-border py-2 px-4 min-w-[160px] z-10 animate-fade-in">
                {sortOptions.map((opt) => (
                  <button key={opt} onClick={() => { setCurrentSort(opt); setSortOpen(false); }}
                    className={`block w-full text-left py-2 nav-link text-[9px] ${currentSort === opt ? "opacity-100" : "opacity-50"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-xs tracking-widest uppercase">Loading...</p>
          </div>
        ) : products.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground text-xs tracking-widest uppercase">No products found</p>
        ) : (
          <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const img = product.node.images.edges[0]?.node;
              const price = product.node.priceRange.minVariantPrice;
              return (
                <div key={product.node.id} className="group">
                  <Link to={`/product/${product.node.handle}`} className="block">
                    <div className="aspect-[3/4] overflow-hidden mb-4 bg-secondary">
                      {img ? (
                        <img
                          src={img.url}
                          alt={img.altText || product.node.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                      )}
                    </div>
                    <p className="product-title text-[10px] mb-1">{product.node.title}</p>
                    <p className="product-price text-[10px]">
                      {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
                    </p>
                  </Link>
                  <button
                    onClick={() => handleQuickAdd(product)}
                    disabled={isLoading}
                    className="mt-2 w-full text-[9px] tracking-[0.2em] uppercase font-light border border-border py-2 hover:bg-foreground hover:text-background transition-all duration-300 opacity-0 group-hover:opacity-100"
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
