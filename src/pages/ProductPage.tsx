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

interface ProductData {
  id: string;
  name: string;
  price: number;
  description: string | null;
  condition: string | null;
  condition_description: string | null;
  color: string | null;
  material: string | null;
  measurements: any;
  category: string;
  brands?: { name: string } | null;
}

interface Variant {
  id: string;
  size: string;
  quantity: number;
}

interface ProductImage {
  url: string;
  sort_order: number | null;
}

const ProductPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [related, setRelated] = useState<any[]>([]);
  const [offerOpen, setOfferOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setLoading(true);
      const { data: p } = await supabase.from("products").select("*, brands(name)").eq("id", id).single();

      if (p) {
        setProduct(p as any);
        const [{ data: v }, { data: img }, { data: rel }] = await Promise.all([
          supabase.from("product_variants").select("*").eq("product_id", id),
          supabase.from("product_images").select("url, sort_order").eq("product_id", id).order("sort_order"),
          supabase.from("products").select("id, name, price, brands(name)").neq("id", id).limit(4),
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
          })));
        }
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <main className="pt-40 pb-24 text-center">
        <p className="text-muted-foreground text-xs tracking-widest uppercase">Loading...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pt-40 pb-24 text-center">
        <p className="editorial-heading">Product not found</p>
      </main>
    );
  }

  const selectedVariant = variants.find((v) => v.size === selectedSize);
  const maxQty = selectedVariant?.quantity || 1;
  const conditionIndex = conditionLevels.indexOf(product.condition || "Good");
  const totalStock = variants.reduce((sum, v) => sum + v.quantity, 0);
  const isSoldOut = variants.length > 0 && totalStock === 0;
  const mainImage = images[currentImage]?.url || "/placeholder.svg";
  const brandName = (product.brands as any)?.name || "";

  const handleAddToCart = () => {
    if (variants.length > 0 && !selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
    addToCart({
      product_id: product.id,
      name: product.name,
      brand: brandName,
      price: product.price,
      size: selectedSize || null,
      quantity,
      image: images[0]?.url || "/placeholder.svg",
      maxQty,
    });
    toast({ title: "Added to bag" });
  };

  return (
    <main className="pt-36 lg:pt-44 pb-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <nav className="mb-10">
          <span className="text-[9px] tracking-widest text-muted-foreground font-light">
            <Link to="/" className="hover:opacity-50 transition-opacity">HOME</Link>{" / "}
            <Link to="/collection" className="hover:opacity-50 transition-opacity">COLLECTION</Link>{" / "}
            <span className="text-foreground">{product.name.toUpperCase()}</span>
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <div className="aspect-[3/4] bg-secondary overflow-hidden mb-4">
              <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setCurrentImage(i)}
                    className={`aspect-square overflow-hidden border ${currentImage === i ? "border-foreground" : "border-border"}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:pt-4">
            <p className="editorial-heading text-[9px] text-muted-foreground mb-2">{brandName}</p>
            <h1 className="text-lg md:text-xl tracking-[0.15em] font-extralight mb-2">{product.name.toUpperCase()}</h1>
            <p className="text-sm tracking-[0.1em] font-light mb-8">${product.price.toLocaleString()}</p>

            {isSoldOut && (
              <div className="mb-6 border border-border p-3 text-center">
                <span className="text-[11px] tracking-widest uppercase text-muted-foreground">Sold Out</span>
              </div>
            )}

            {variants.length > 0 && !isSoldOut && (
              <div className="mb-6">
                <p className="editorial-heading text-[9px] mb-3">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {variants.map((v) => (
                    <button key={v.id} onClick={() => { setSelectedSize(v.size); setQuantity(1); }} disabled={v.quantity === 0}
                      className={`min-w-[44px] h-10 border text-[10px] tracking-widest font-light transition-all ${
                        selectedSize === v.size ? "bg-foreground text-background border-foreground"
                          : v.quantity === 0 ? "border-border text-muted-foreground/30 line-through cursor-not-allowed"
                          : "border-border hover:border-foreground"
                      }`}>
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isSoldOut && (
              <div className="mb-8">
                <p className="editorial-heading text-[9px] mb-3">Quantity</p>
                <div className="flex items-center border border-border w-fit">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:opacity-50 transition-opacity">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-[11px] tracking-widest border-x border-border">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:opacity-50 transition-opacity">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {!isSoldOut && (
              <div className="flex flex-col gap-3 mb-10">
                <button onClick={handleAddToCart}
                  className="w-full bg-primary text-primary-foreground py-4 editorial-heading text-[11px] hover:opacity-80 transition-opacity min-h-[48px]">
                  Add to Cart
                </button>
                <button className="w-full border border-foreground py-4 editorial-heading text-[11px] hover:bg-foreground hover:text-background transition-all duration-300 min-h-[48px]">
                  Buy Now
                </button>
                <button onClick={() => setOfferOpen(true)}
                  className="w-full border border-border py-4 editorial-heading text-[11px] hover:border-foreground transition-all duration-300 min-h-[48px]">
                  Make an Offer
                </button>
              </div>
            )}

            {/* Product details */}
            <div className="border-t border-border pt-8 mb-8 space-y-3">
              <p className="editorial-heading text-[9px] mb-4">Product Details</p>
              {product.description && (
                <p className="text-[11px] font-light leading-relaxed text-muted-foreground mb-4">{product.description}</p>
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
              <div className="border-t border-border pt-8 mb-8">
                <p className="editorial-heading text-[9px] mb-4">Condition</p>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {conditionLevels.map((level, i) => (
                    <span key={level} className={`text-[8px] tracking-[0.15em] uppercase px-3 py-1 border ${
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

            <div className="border-t border-border pt-8">
              <p className="editorial-heading text-[9px] mb-4">Guaranteed Authenticity</p>
              <p className="text-[11px] font-light leading-relaxed text-muted-foreground">
                Every item is rigorously authenticated by our experts. All photos are of the actual product you will receive.
              </p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="section-title">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
