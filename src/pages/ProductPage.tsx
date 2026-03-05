import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Minus, Plus, Loader2 } from "lucide-react";
import { storefrontApiRequest, PRODUCT_BY_HANDLE_QUERY, PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

const ProductPage = () => {
  const { id: handle } = useParams();
  const [product, setProduct] = useState<ShopifyProduct["node"] | null>(null);
  const [related, setRelated] = useState<ShopifyProduct[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);
  const cartLoading = useCartStore(state => state.isLoading);

  useEffect(() => {
    if (!handle) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
        const p = data?.data?.productByHandle;
        if (p) {
          setProduct(p);
          // Select first available variant
          const firstAvailable = p.variants.edges.find((v: any) => v.node.availableForSale);
          if (firstAvailable) setSelectedVariantId(firstAvailable.node.id);
          else if (p.variants.edges[0]) setSelectedVariantId(p.variants.edges[0].node.id);
        }
        // Fetch related
        const relData = await storefrontApiRequest(PRODUCTS_QUERY, { first: 4 });
        if (relData?.data?.products?.edges) {
          setRelated(relData.data.products.edges.filter((rp: ShopifyProduct) => rp.node.handle !== handle).slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      }
      setLoading(false);
    };
    fetchProduct();
    setCurrentImage(0);
    setQuantity(1);
  }, [handle]);

  if (loading) {
    return (
      <main className="pt-32 pb-24 text-center">
        <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pt-32 pb-24 text-center">
        <p className="editorial-heading">Product not found</p>
      </main>
    );
  }

  const selectedVariant = product.variants.edges.find(v => v.node.id === selectedVariantId)?.node;
  const images = product.images.edges;
  const mainImage = images[currentImage]?.node;
  const price = selectedVariant?.price || product.priceRange.minVariantPrice;
  const hasOptions = product.options.some(o => o.name !== "Title" || o.values.length > 1);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error("Please select an option");
      return;
    }
    await addItem({
      product: { node: product } as ShopifyProduct,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success("Added to bag");
  };

  return (
    <main className="pt-28 md:pt-32 pb-24 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <nav className="mb-6 md:mb-10">
          <span className="text-[9px] tracking-widest text-muted-foreground font-light">
            <Link to="/" className="hover:opacity-50 transition-opacity duration-150">HOME</Link>{" / "}
            <Link to="/collection" className="hover:opacity-50 transition-opacity duration-150">COLLECTION</Link>{" / "}
            <span className="text-foreground">{product.title.toUpperCase()}</span>
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <div>
            <div className="aspect-[3/4] bg-secondary overflow-hidden mb-3">
              {mainImage ? (
                <img src={mainImage.url} alt={mainImage.altText || product.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setCurrentImage(i)}
                    className={`aspect-square overflow-hidden border transition-all duration-150 ${currentImage === i ? "border-foreground" : "border-border hover:border-foreground/50"}`}>
                    <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:pt-2">
            <h1 className="text-[14px] md:text-lg tracking-[0.15em] font-extralight mb-2 uppercase">{product.title}</h1>
            <p className="text-[14px] tracking-[0.1em] font-light mb-6">
              {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
            </p>

            {/* Variant selection */}
            {hasOptions && product.options.map((option) => (
              <div key={option.name} className="mb-5">
                <p className="editorial-heading text-[9px] mb-2">{option.name}</p>
                <div className="flex gap-2 flex-wrap">
                  {option.values.map((val) => {
                    const matchingVariant = product.variants.edges.find(v =>
                      v.node.selectedOptions.some(so => so.name === option.name && so.value === val)
                    );
                    const isSelected = selectedVariant?.selectedOptions.some(
                      so => so.name === option.name && so.value === val
                    );
                    const isAvailable = matchingVariant?.node.availableForSale;
                    return (
                      <button
                        key={val}
                        onClick={() => matchingVariant && setSelectedVariantId(matchingVariant.node.id)}
                        disabled={!isAvailable}
                        className={`min-w-[40px] h-9 border text-[10px] tracking-widest font-light transition-all duration-150 px-3 ${
                          isSelected ? "bg-foreground text-background border-foreground"
                            : !isAvailable ? "border-border text-muted-foreground/30 line-through cursor-not-allowed"
                            : "border-border hover:border-foreground"
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="mb-6">
              <p className="editorial-heading text-[9px] mb-2">Quantity</p>
              <div className="flex items-center border border-border w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 flex items-center justify-center hover:opacity-50 transition-opacity duration-150">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-10 h-9 flex items-center justify-center text-[11px] tracking-widest border-x border-border">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 flex items-center justify-center hover:opacity-50 transition-opacity duration-150">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex flex-col gap-2 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={cartLoading || !selectedVariant?.availableForSale}
                className="w-full bg-primary text-primary-foreground py-3 editorial-heading text-[10px] hover:opacity-80 transition-opacity duration-150 min-h-[44px] flex items-center justify-center disabled:opacity-50"
              >
                {cartLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : selectedVariant?.availableForSale ? "Add to Cart" : "Sold Out"}
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-border pt-6 mb-6">
                <p className="editorial-heading text-[9px] mb-3">Description</p>
                <p className="text-[11px] font-light leading-relaxed text-muted-foreground">{product.description}</p>
              </div>
            )}

            <div className="border-t border-border pt-6">
              <p className="editorial-heading text-[9px] mb-3">Guaranteed Authenticity</p>
              <p className="text-[10px] font-light leading-relaxed text-muted-foreground">
                Every item is rigorously authenticated by our experts. All photos are of the actual product you will receive.
              </p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="section-title">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {related.map((rp) => {
                const img = rp.node.images.edges[0]?.node;
                const rpPrice = rp.node.priceRange.minVariantPrice;
                return (
                  <Link key={rp.node.id} to={`/product/${rp.node.handle}`} className="group block">
                    <div className="aspect-[3/4] overflow-hidden mb-4 bg-secondary">
                      {img && <img src={img.url} alt={img.altText || rp.node.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" loading="lazy" />}
                    </div>
                    <p className="product-title text-[10px] mb-1">{rp.node.title}</p>
                    <p className="product-price text-[10px]">{rpPrice.currencyCode} {parseFloat(rpPrice.amount).toFixed(2)}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductPage;
