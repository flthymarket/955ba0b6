import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import OfferModal from "@/components/OfferModal";
import { useCart } from "@/components/CartDrawer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const conditionLevels = ["Fair", "Good", "Great", "Excellent", "Pristine"];

const calcFinalPrice = (price: number, type?: string, value?: number) => {
  if (!type || !value) return price;
  if (type === "percentage") return Math.round((price - price * value / 100) * 100) / 100;
  if (type === "fixed") return Math.max(0, Math.round((price - value) * 100) / 100);
  if (type === "override") return Math.round(value * 100) / 100;
  return price;
};

const isDiscountActive = (enabled?: boolean, start?: string | null, end?: string | null) => {
  if (!enabled) return false;
  const now = Date.now();
  if (start && new Date(start).getTime() > now) return false;
  if (end && new Date(end).getTime() < now) return false;
  return true;
};

const ProductPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [related, setRelated] = useState<any[]>([]);
  const [offerOpen, setOfferOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flashTimeLeft, setFlashTimeLeft] = useState("");
  const [viewEnhanced, setViewEnhanced] = useState(false);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [enhancing, setEnhancing] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      setViewEnhanced(false);
      setEnhancedUrl(null);
      const { data: p } = await supabase.from("products").select("*, brands(name)").eq("id", id).single();

      if (p) {
        setProduct(p);
        const [{ data: v }, { data: img }, { data: rel }] = await Promise.all([
          supabase.from("product_variants").select("*").eq("product_id", id),
          supabase.from("product_images").select("url, sort_order").eq("product_id", id).order("sort_order"),
          supabase.from("products").select("id, name, price, brands(name), discount_enabled, discount_type, discount_value, discount_start, discount_end, is_flash_sale").neq("id", id).limit(4),
        ]);
        if (v) setVariants(v);
        if (img) setImages(img);
        if (rel) {
          const relIds = rel.map((r) => r.id);
          const { data: relImgs } = await supabase.from("product_images").select("product_id, url").in("product_id", relIds);
          const imgMap: Record<string, string> = {};
          relImgs?.forEach((ri) => { if (!imgMap[ri.product_id]) imgMap[ri.product_id] = ri.url; });
          setRelated(rel.map((r) => ({
            id: r.id, name: r.name, brand: (r.brands as any)?.name || "", price: r.price,
            image: imgMap[r.id] || "/placeholder.svg",
            discount_enabled: r.discount_enabled, discount_type: r.discount_type,
            discount_value: r.discount_value, discount_start: r.discount_start,
            discount_end: r.discount_end, is_flash_sale: r.is_flash_sale,
          })));
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  // Flash sale countdown
  useEffect(() => {
    if (!product?.is_flash_sale || !product?.discount_end || !isDiscountActive(product.discount_enabled, product.discount_start, product.discount_end)) return;
    const interval = setInterval(() => {
      const diff = new Date(product.discount_end).getTime() - Date.now();
      if (diff <= 0) { setFlashTimeLeft(""); clearInterval(interval); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setFlashTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [product]);

  const handleEnhance = async () => {
    const imgUrl = images[currentImage]?.url;
    if (!imgUrl || enhancing) return;
    setEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-image", { body: { imageUrl: imgUrl } });
      if (error) throw error;
      if (data?.enhancedUrl) {
        setEnhancedUrl(data.enhancedUrl);
        setViewEnhanced(true);
        toast({ title: "Image enhanced!" });
      }
    } catch (err: any) {
      toast({ title: "Enhancement failed", description: err.message, variant: "destructive" });
    }
    setEnhancing(false);
  };

  if (loading) {
    return (
      <main className="pt-32 pb-24 text-center">
        <p className="text-muted-foreground text-xs tracking-widest uppercase">Loading...</p>
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

  const selectedVariant = variants.find((v: any) => v.size === selectedSize);
  const maxQty = selectedVariant?.quantity || 1;
  const conditionIndex = conditionLevels.indexOf(product.condition || "Good");
  const totalStock = variants.reduce((sum: number, v: any) => sum + v.quantity, 0);
  const isSoldOut = variants.length > 0 && totalStock === 0;
  const mainImage = viewEnhanced && enhancedUrl ? enhancedUrl : (images[currentImage]?.url || "/placeholder.svg");
  const brandName = (product.brands as any)?.name || "";

  const discountActive = isDiscountActive(product.discount_enabled, product.discount_start, product.discount_end);
  const finalPrice = discountActive ? calcFinalPrice(product.price, product.discount_type, product.discount_value) : product.price;
  const pct = discountActive && product.discount_type === "percentage" && product.discount_value ? product.discount_value :
    discountActive && finalPrice < product.price ? Math.round((1 - finalPrice / product.price) * 100) : 0;

  const handleAddToCart = () => {
    if (variants.length > 0 && !selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
    addToCart({
      product_id: product.id, name: product.name, brand: brandName,
      price: finalPrice, size: selectedSize || null, quantity,
      image: images[0]?.url || "/placeholder.svg", maxQty,
    });
    toast({ title: "Added to bag" });
  };

  return (
    <main className="pt-28 md:pt-32 pb-24 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <nav className="mb-6 md:mb-10">
          <span className="text-[9px] tracking-widest text-muted-foreground font-light">
            <Link to="/" className="hover:opacity-50 transition-opacity duration-150">HOME</Link>{" / "}
            <Link to="/collection" className="hover:opacity-50 transition-opacity duration-150">COLLECTION</Link>{" / "}
            <span className="text-foreground">{product.name.toUpperCase()}</span>
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div>
            <div className="aspect-[3/4] bg-secondary overflow-hidden mb-3 relative group">
              <img src={mainImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]" />
              {/* Enhanced/Original toggle */}
              {enhancedUrl && (
                <div className="absolute top-3 left-3 flex gap-1 z-10">
                  <button onClick={() => setViewEnhanced(false)}
                    className={`text-[8px] tracking-[0.1em] uppercase px-2 py-1 transition-all ${!viewEnhanced ? "bg-foreground text-background" : "bg-background/80 text-foreground"}`}>
                    Original
                  </button>
                  <button onClick={() => setViewEnhanced(true)}
                    className={`text-[8px] tracking-[0.1em] uppercase px-2 py-1 transition-all ${viewEnhanced ? "bg-foreground text-background" : "bg-background/80 text-foreground"}`}>
                    Enhanced
                  </button>
                </div>
              )}
              {!enhancedUrl && images.length > 0 && (
                <button onClick={handleEnhance} disabled={enhancing}
                  className="absolute bottom-3 left-3 text-[8px] tracking-[0.1em] uppercase px-3 py-1.5 bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:opacity-50">
                  {enhancing ? "Enhancing..." : "✨ Enhance"}
                </button>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => { setCurrentImage(i); setViewEnhanced(false); }}
                    className={`aspect-square overflow-hidden border transition-all duration-150 ${currentImage === i ? "border-foreground" : "border-border hover:border-foreground/50"}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:pt-2">
            <p className="editorial-heading text-[9px] text-muted-foreground mb-1">{brandName}</p>
            <h1 className="text-[14px] md:text-lg tracking-[0.15em] font-extralight mb-2 uppercase">{product.name}</h1>

            {/* Price */}
            <div className="mb-6">
              {discountActive && finalPrice < product.price ? (
                <div className="space-y-1">
                  <p className="text-[12px] tracking-[0.1em] font-light text-muted-foreground line-through">${product.price.toLocaleString()}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-[16px] tracking-[0.1em] font-light">${finalPrice.toLocaleString()}</p>
                    {pct > 0 && (
                      <span className="text-[11px] font-light text-[hsl(352,82%,38%)] border border-[hsl(352,82%,38%)] px-2 py-0.5 rounded-full">-{pct}%</span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-[14px] tracking-[0.1em] font-light">${product.price.toLocaleString()}</p>
              )}
              {discountActive && product.is_flash_sale && (
                <div className="mt-2">
                  <p className="text-[9px] tracking-[0.15em] uppercase font-light text-[hsl(352,82%,38%)]">Flash Sale</p>
                  {flashTimeLeft && (
                    <p className="text-[11px] font-light mt-1">Ends in <span className="font-mono tabular-nums text-[hsl(352,82%,38%)]">{flashTimeLeft}</span></p>
                  )}
                </div>
              )}
            </div>

            {isSoldOut && (
              <div className="mb-6 border border-border p-3 text-center">
                <span className="text-[10px] tracking-widest uppercase text-muted-foreground">Sold Out</span>
              </div>
            )}

            {variants.length > 0 && !isSoldOut && (
              <div className="mb-5">
                <p className="editorial-heading text-[9px] mb-2">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {variants.map((v: any) => (
                    <button key={v.id} onClick={() => { setSelectedSize(v.size); setQuantity(1); }} disabled={v.quantity === 0}
                      className={`min-w-[40px] h-9 border text-[10px] tracking-widest font-light transition-all duration-150 px-2 ${
                        selectedSize === v.size ? "bg-foreground text-background border-foreground"
                          : v.quantity === 0 ? "border-border text-muted-foreground/30 line-through cursor-not-allowed"
                          : "border-border hover:border-foreground"
                      }`}>{v.size}</button>
                  ))}
                </div>
              </div>
            )}

            {!isSoldOut && (
              <div className="mb-6">
                <p className="editorial-heading text-[9px] mb-2">Quantity</p>
                <div className="flex items-center border border-border w-fit">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 flex items-center justify-center hover:opacity-50 transition-opacity duration-150">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 h-9 flex items-center justify-center text-[11px] tracking-widest border-x border-border">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(maxQty, quantity + 1))} className="w-9 h-9 flex items-center justify-center hover:opacity-50 transition-opacity duration-150">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {!isSoldOut && (
              <div className="flex flex-col gap-2 mb-8">
                <button onClick={handleAddToCart} className="w-full bg-primary text-primary-foreground py-3 editorial-heading text-[10px] hover:opacity-80 transition-opacity duration-150 min-h-[44px]">
                  Add to Cart
                </button>
                <button className="w-full border border-foreground py-3 editorial-heading text-[10px] hover:bg-foreground hover:text-background transition-all duration-300 min-h-[44px]">
                  Buy Now
                </button>
                <button onClick={() => setOfferOpen(true)} className="w-full border border-border py-3 editorial-heading text-[10px] hover:border-foreground transition-all duration-150 min-h-[44px]">
                  Make an Offer
                </button>
              </div>
            )}

            {/* Product details */}
            <div className="border-t border-border pt-6 mb-6 space-y-2">
              <p className="editorial-heading text-[9px] mb-3">Product Details</p>
              {product.description && (
                <p className="text-[11px] font-light leading-relaxed text-muted-foreground mb-3">{product.description}</p>
              )}
              <div className="grid grid-cols-2 gap-y-2 text-[10px] font-light">
                {product.color && (<><span className="text-muted-foreground tracking-wide">Color</span><span className="tracking-wide">{product.color}</span></>)}
                {product.material && (<><span className="text-muted-foreground tracking-wide">Material</span><span className="tracking-wide">{product.material}</span></>)}
                {product.measurements && typeof product.measurements === "object" &&
                  Object.entries(product.measurements).map(([key, val]) => (
                    <span key={key} className="contents">
                      <span className="text-muted-foreground tracking-wide capitalize">{key}</span>
                      <span className="tracking-wide">{String(val)}</span>
                    </span>
                  ))}
              </div>
            </div>

            {product.condition && (
              <div className="border-t border-border pt-6 mb-6">
                <p className="editorial-heading text-[9px] mb-3">Condition</p>
                <div className="flex gap-1 mb-2 flex-wrap">
                  {conditionLevels.map((level, i) => (
                    <span key={level} className={`text-[7px] tracking-[0.12em] uppercase px-2 py-0.5 border transition-colors duration-150 ${
                      i <= conditionIndex ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground"
                    }`}>{level}</span>
                  ))}
                </div>
                <p className="text-[11px] font-light text-muted-foreground">
                  <span className="text-foreground">{product.condition} Overall Condition</span>
                  {product.condition_description && <><br />{product.condition_description}</>}
                </p>
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

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="section-title">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => <ProductCard key={p.id} {...p} />)}
            </div>
          </section>
        )}
      </div>

      <OfferModal isOpen={offerOpen} onClose={() => setOfferOpen(false)}
        productId={product.id} productName={product.name} productPrice={product.price} />
    </main>
  );
};

export default ProductPage;
