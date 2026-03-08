import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Loader2, ChevronDown, Bookmark } from "lucide-react";
import { storefrontApiRequest, PRODUCT_BY_HANDLE_QUERY, PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import OfferModal from "@/components/OfferModal";

const ProductPage = () => {
  const { id: handle } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ShopifyProduct["node"] | null>(null);
  const [related, setRelated] = useState<ShopifyProduct[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [returnsOpen, setReturnsOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const cartLoading = useCartStore((state) => state.isLoading);
  const getCheckoutUrl = useCartStore((state) => state.getCheckoutUrl);
  const relatedRef = useRef<HTMLDivElement>(null);
  const [relatedVisible, setRelatedVisible] = useState(false);

  useEffect(() => {
    if (!relatedRef.current) return;
    const obs = new IntersectionObserver(([e]) => {if (e.isIntersecting) {setRelatedVisible(true);obs.disconnect();}}, { threshold: 0.1 });
    obs.observe(relatedRef.current);
    return () => obs.disconnect();
  }, [related]);

  useEffect(() => {
    if (!handle) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
        const p = data?.data?.productByHandle;
        if (p) {
          setProduct(p);
          const firstAvailable = p.variants.edges.find((v: any) => v.node.availableForSale);
          if (firstAvailable) setSelectedVariantId(firstAvailable.node.id);else
          if (p.variants.edges[0]) setSelectedVariantId(p.variants.edges[0].node.id);
        }
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
    setRelatedVisible(false);
  }, [handle]);

  if (loading) {
    return (
      <main className="pt-28 sm:pt-32 md:pt-36 pb-24 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
      </main>);

  }

  if (!product) {
    return (
      <main className="pt-28 sm:pt-32 md:pt-36 pb-24 text-center">
        <p className="text-lg tracking-[0.2em] uppercase font-light">Product not found</p>
      </main>);

  }

  const selectedVariant = product.variants.edges.find((v) => v.node.id === selectedVariantId)?.node;
  const images = product.images.edges;
  const mainImage = images[currentImage]?.node;
  const price = selectedVariant?.price || product.priceRange.minVariantPrice;
  const hasOptions = product.options.some((o) => o.name !== "Title" || o.values.length > 1);

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
      selectedOptions: selectedVariant.selectedOptions || []
    });
    toast.success("Added to bag");
  };

  const handleBuyNow = async () => {
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
      selectedOptions: selectedVariant.selectedOptions || []
    });
    // Wait a tick for state to update then redirect
    setTimeout(() => {
      const checkoutUrl = getCheckoutUrl();
      if (checkoutUrl) window.open(checkoutUrl, '_blank');
    }, 500);
  };

  // Extract Shopify numeric ID from GID for offers (store full GID as text)
  const shopifyProductId = product.id;

  return (
    <main className="pt-8 sm:pt-12 md:pt-16 pb-20 md:pb-24 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-6 md:mb-8">
          <span className="text-xs sm:text-sm tracking-widest text-muted-foreground font-light">
            <Link to="/" className="hover-gray px-1 py-0.5 transition-all">HOME</Link>{" / "}
            <Link to={`/collection?filter=${product.productType?.toLowerCase() || 'all'}`} className="hover-gray px-1 py-0.5 transition-all">
              {(product.productType || "COLLECTION").toUpperCase()}
            </Link>{" / "}
            <span className="text-foreground">{product.title.toUpperCase()}</span>
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 lg:gap-16">
          {/* Images */}
          <div>
            <div className="aspect-[3/4] bg-secondary overflow-hidden mb-3 relative">
              {mainImage ?
              <img src={mainImage.url} alt={mainImage.altText || product.title} className="w-full h-full object-cover" /> :

              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Image</div>
              }
              <button className="absolute top-4 right-4 p-2 hover-gray transition-all">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
            {images.length > 1 &&
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {images.map((img, i) =>
              <button key={i} onClick={() => setCurrentImage(i)}
              className={`aspect-square overflow-hidden border transition-all duration-150 ${currentImage === i ? "border-foreground" : "border-border hover:border-foreground/50"}`}>
                    <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                  </button>
              )}
              </div>
            }
          </div>

          {/* Details - formatted like Justin Reed / Sheng Li */}
          <div className="lg:pt-4">
            {/* Brand/Vendor in gray */}
            

            
            {/* Vendor in gray */}
            {product.vendor && (
              <p className="text-sm tracking-[0.15em] uppercase font-light text-muted-foreground mb-1">{product.vendor}</p>
            )}
            {/* Product title - bold Arial */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 leading-tight text-foreground" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>{product.title}</h1>
            {/* Price */}
            <p className="text-base sm:text-lg tracking-[0.05em] font-light text-foreground mb-8">
              ${parseFloat(price.amount).toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </p>

            {/* Variant selection */}
            {hasOptions && product.options.map((option) =>
            <div key={option.name} className="mb-6">
                <p className="text-sm tracking-[0.1em] font-light mb-3">{option.name}</p>
                <div className="flex gap-2 flex-wrap">
                  {option.values.map((val) => {
                  const matchingVariant = product.variants.edges.find((v) =>
                  v.node.selectedOptions.some((so) => so.name === option.name && so.value === val)
                  );
                  const isSelected = selectedVariant?.selectedOptions.some(
                    (so) => so.name === option.name && so.value === val
                  );
                  const isAvailable = matchingVariant?.node.availableForSale;
                  return (
                    <button
                      key={val}
                      onClick={() => matchingVariant && setSelectedVariantId(matchingVariant.node.id)}
                      disabled={!isAvailable}
                      className={`min-w-[48px] h-11 border text-sm tracking-widest font-light transition-all duration-150 px-4 rounded-full ${
                      isSelected ? "bg-foreground text-background border-foreground" :
                      !isAvailable ? "border-border text-muted-foreground/30 line-through cursor-not-allowed" :
                      "border-border hover:border-foreground"}`
                      }>
                      
                        {val}
                      </button>);

                })}
                </div>
              </div>
            )}

            {/* Quantity - no limit */}
            <div className="mb-8">
              <p className="text-sm tracking-[0.1em] font-light mb-3">Quantity</p>
              <div className="flex items-center border border-border w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 flex items-center justify-center hover:opacity-50 transition-opacity duration-150">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 h-11 flex items-center justify-center text-sm tracking-widest border-x border-border">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-11 h-11 flex items-center justify-center hover:opacity-50 transition-opacity duration-150">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-10">
              {/* Add to Cart - full width black */}
              <button
                onClick={handleAddToCart}
                disabled={cartLoading || !selectedVariant?.availableForSale}
                className="w-full bg-foreground text-background py-4 text-sm sm:text-base tracking-[0.15em] uppercase font-light hover:opacity-90 transition-opacity duration-150 min-h-[52px] flex items-center justify-center disabled:opacity-50">
                
                {cartLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : selectedVariant?.availableForSale ? "Add to Cart" : "Sold Out"}
              </button>
              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={cartLoading || !selectedVariant?.availableForSale}
                className="w-full border-2 border-foreground py-4 text-sm sm:text-base tracking-[0.15em] uppercase font-light hover:bg-foreground hover:text-background transition-all duration-300 min-h-[52px] disabled:opacity-50">
                
                Buy Now
              </button>
              {/* Make an Offer */}
              <button
                onClick={() => setOfferOpen(true)}
                className="w-full border border-border py-4 text-sm tracking-[0.15em] uppercase font-light hover:border-foreground transition-all duration-300 min-h-[52px] text-muted-foreground hover:text-foreground">
                
                Make an Offer
              </button>
            </div>

            {/* Description - list format */}
            {product.description &&
            <div className="border-t border-border pt-6 mb-6">
                <ul className="text-sm font-light leading-relaxed text-muted-foreground space-y-2 list-disc list-inside">
                  {product.description.split(/[.\n]+/).filter((s: string) => s.trim()).map((line: string, i: number) => (
                    <li key={i}>{line.trim()}</li>
                  ))}
                </ul>
              </div>
            }

            {/* Shipping Dropdown */}
            <div className="border-t border-border">
              <button
                onClick={() => setShippingOpen(!shippingOpen)}
                className="w-full flex items-center justify-between py-5 text-sm tracking-[0.1em] uppercase font-light">
                
                Shipping
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${shippingOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${shippingOpen ? "max-h-[500px] pb-6" : "max-h-0"}`}>
                <div className="text-sm font-light leading-relaxed text-muted-foreground space-y-4">
                  <p>Usually your order will be shipped within 10 days after your payment has been confirmed.</p>
                  <div>
                    <p className="font-medium text-foreground mb-1">International Shipping:</p>
                    <p>We ship all international orders via express shipping. Carrier depends on the region.</p>
                  </div>
                  <p>Delivery times are estimated based on your region. Once your order has been processed, you'll receive a tracking number to monitor its progress.</p>
                  <p>If you have any questions, please feel free to contact our customer support team at <a href="mailto:flthymrkt@gmail.com" className="underline hover:opacity-50 transition-opacity">flthymrkt@gmail.com</a></p>
                </div>
              </div>
            </div>

            {/* Returns Dropdown */}
            <div className="border-t border-border">
              <button
                onClick={() => setReturnsOpen(!returnsOpen)}
                className="w-full flex items-center justify-between py-5 text-sm tracking-[0.1em] uppercase font-light">
                
                Returns & Exchanges
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${returnsOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${returnsOpen ? "max-h-[300px] pb-6" : "max-h-0"}`}>
                <div className="text-sm font-light leading-relaxed text-muted-foreground space-y-3">
                  <p className="font-medium text-foreground">All sales are final.</p>
                  <p>No returns or exchanges.</p>
                  <p>Once the item has been delivered, we do not accept any bank chargebacks.</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <p className="text-sm tracking-[0.1em] uppercase font-light mb-3">Guaranteed Authenticity</p>
              <p className="text-sm font-light leading-relaxed text-muted-foreground">
                Every item is rigorously authenticated by our experts. All photos are of the actual product you will receive.
              </p>
            </div>
          </div>
        </div>

        {/* Subscribe CTA sidebar-style banner */}
        <div className="mt-16 sm:mt-20 md:mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 md:gap-8">
            <div className="bg-foreground text-background p-8 sm:p-10 flex flex-col justify-center">
              <p className="text-xs tracking-[0.2em] uppercase mb-3 opacity-70">Don't miss out</p>
              <h3 className="text-lg sm:text-xl tracking-[0.1em] font-light mb-4 leading-snug">
                Never Miss a New Arrival!
              </h3>
              <p className="text-sm font-light opacity-80 mb-6 leading-relaxed">
                Subscribe now and be the first to know about exclusive drops, limited pieces, and member-only discounts. Stay ahead of the curve with FLTHYMRKT.
              </p>
              <Link to="/collection?filter=new" className="inline-block border border-background px-6 py-3 text-xs tracking-[0.2em] uppercase font-light hover:bg-background hover:text-foreground transition-all duration-300 text-center">
                Shop New Arrivals
              </Link>
            </div>

            {/* Related Products inline */}
            {related.length > 0 &&
            <div ref={relatedRef} className={`transition-all duration-1000 ease-out ${relatedVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                <h2 className="text-sm sm:text-base tracking-[0.25em] uppercase font-extralight mb-6">You May Also Like</h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  {related.slice(0, 2).map((rp, i) => {
                  const img = rp.node.images.edges[0]?.node;
                  const hoverImg = rp.node.images.edges[1]?.node;
                  const rpPrice = rp.node.priceRange.minVariantPrice;
                  return (
                    <Link key={rp.node.id} to={`/product/${rp.node.handle}`} className="group block"
                    style={{
                      transitionDelay: `${i * 100}ms`,
                      opacity: relatedVisible ? 1 : 0,
                      transform: relatedVisible ? 'translateY(0)' : 'translateY(20px)',
                      transition: 'all 0.7s ease-out'
                    }}>
                        <div className="aspect-[3/4] overflow-hidden mb-3 bg-secondary relative">
                          {img &&
                        <img
                          src={img.url}
                          alt={img.altText || rp.node.title}
                          className="w-full h-full object-cover transition-opacity duration-500"
                          loading="lazy"
                          onMouseEnter={(e) => {if (hoverImg) (e.target as HTMLImageElement).src = hoverImg.url;}}
                          onMouseLeave={(e) => {if (hoverImg) (e.target as HTMLImageElement).src = img.url;}} />

                        }
                          <button className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Bookmark className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs tracking-[0.15em] uppercase font-light text-muted-foreground mb-0.5">{rp.node.vendor || ""}</p>
                        <p className="text-sm tracking-[0.05em] font-normal mb-1">{rp.node.title}</p>
                        <p className="text-xs tracking-[0.1em] font-light text-muted-foreground">
                          ${parseFloat(rpPrice.amount).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </p>
                      </Link>);

                })}
                </div>
              </div>
            }
          </div>

          {/* More related products */}
          {related.length > 2 &&
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8">
              {related.slice(2).map((rp, i) => {
              const img = rp.node.images.edges[0]?.node;
              const hoverImg = rp.node.images.edges[1]?.node;
              const rpPrice = rp.node.priceRange.minVariantPrice;
              return (
                <Link key={rp.node.id} to={`/product/${rp.node.handle}`} className="group block"
                style={{
                  transitionDelay: `${(i + 2) * 100}ms`,
                  opacity: relatedVisible ? 1 : 0,
                  transform: relatedVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.7s ease-out'
                }}>
                    <div className="aspect-[3/4] overflow-hidden mb-3 bg-secondary relative">
                      {img &&
                    <img
                      src={img.url}
                      alt={img.altText || rp.node.title}
                      className="w-full h-full object-cover transition-opacity duration-500"
                      loading="lazy"
                      onMouseEnter={(e) => {if (hoverImg) (e.target as HTMLImageElement).src = hoverImg.url;}}
                      onMouseLeave={(e) => {if (hoverImg) (e.target as HTMLImageElement).src = img.url;}} />

                    }
                      <button className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs tracking-[0.15em] uppercase font-light text-muted-foreground mb-0.5">{rp.node.vendor || ""}</p>
                    <p className="text-sm tracking-[0.05em] font-normal mb-1">{rp.node.title}</p>
                    <p className="text-xs tracking-[0.1em] font-light text-muted-foreground">
                      ${parseFloat(rpPrice.amount).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </p>
                  </Link>);

            })}
            </div>
          }
        </div>
      </div>

      <OfferModal
        isOpen={offerOpen}
        onClose={() => setOfferOpen(false)}
        productId={shopifyProductId}
        productName={product.title}
        productPrice={parseFloat(price.amount)} />
      
    </main>);

};

export default ProductPage;