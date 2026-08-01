import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Heart } from "lucide-react";
import {
  descriptionLines,
  fetchProduct,
  fetchProducts,
  finalPrice,
  isDiscountActive,
  money,
  type StoreProduct,
} from "@/lib/store";
import { useCartStore } from "@/stores/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [related, setRelated] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      try {
        const p = await fetchProduct(id);
        setProduct(p);
        setActiveImage(0);
        setSelectedSize(p && p.product_variants.length === 1 ? p.product_variants[0].size : null);
        if (p) {
          const rel = await fetchProducts({ category: p.category, limit: 3 });
          setRelated(rel.filter((r) => r.id !== p.id).slice(0, 2));
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, [id]);

  const price = product ? finalPrice(product) : 0;
  const discounted = product ? isDiscountActive(product) && price < product.price : false;
  const variants = product?.product_variants || [];
  const selectedVariant = variants.find((v) => v.size === selectedSize);
  const stockForSelection = variants.length
    ? selectedVariant?.quantity ?? 0
    : product?.sold_out
      ? 0
      : 99;
  const soldOut = !product || product.sold_out || variants.reduce((s, v) => s + v.quantity, 0) === 0;

  const handleAdd = (thenCheckout = false) => {
    if (!product) return;
    if (variants.length > 1 && !selectedSize) {
      toast.error("Select a size");
      return;
    }
    const result = addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.product_images[0]?.url || "",
      size: selectedSize,
      variantId: selectedVariant?.id ?? null,
      price,
      maxQuantity: stockForSelection,
    });
    if (!result.ok) return toast.error(result.message);
    toast.success(result.message);
    if (thenCheckout) navigate("/checkout");
  };

  const addToWishlist = async () => {
    if (!user) return navigate("/auth");
    if (!product) return;
    const { error } = await supabase.from("wishlist").insert({ user_id: user.id, product_id: product.id });
    error ? toast.error("Already in your wishlist") : toast.success("Saved to wishlist");
  };

  if (loading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <p className="editorial-heading text-muted-foreground">Product not found</p>
        <Link to="/collection" className="nav-link border border-foreground px-8 py-3">Shop All</Link>
      </main>
    );
  }

  const categorySlug = product.category?.toLowerCase() || "all";
  const specs = descriptionLines(product.description);

  return (
    <main className="max-w-[1600px] mx-auto px-6 md:px-10 py-10 animate-fade-in">
      {/* Breadcrumb → category, not generic collection */}
      <nav className="editorial-heading text-muted-foreground mb-8 flex flex-wrap gap-2">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link to={`/collection?filter=${categorySlug}`} className="hover:text-foreground">{product.category}</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery — uncropped, uniform frames */}
        <div>
          <div className="product-frame border border-border">
            {product.product_images[activeImage]?.url && (
              <img src={product.product_images[activeImage].url} alt={product.name} />
            )}
          </div>
          {product.product_images.length > 1 && (
            <div className="grid grid-cols-5 gap-3 mt-3">
              {product.product_images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`product-frame border ${i === activeImage ? "border-foreground" : "border-border"}`}
                >
                  <img src={img.url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="md:pt-4">
          {product.brands?.name && (
            <p className="editorial-heading text-muted-foreground mb-3">{product.brands.name}</p>
          )}
          <h1 className="font-display text-xl md:text-2xl leading-tight">{product.name}</h1>

          <p className="font-mono-ui text-[15px] mt-4">
            {discounted ? (
              <>
                <span className="line-through opacity-50 mr-2">{money(product.price)}</span>
                <span style={{ color: "hsl(var(--sale))" }}>{money(price)}</span>
              </>
            ) : (
              money(product.price)
            )}
          </p>

          {/* Sizes */}
          {variants.length > 0 && (
            <div className="mt-8">
              <p className="editorial-heading mb-3">Size</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    disabled={v.quantity <= 0}
                    onClick={() => setSelectedSize(v.size)}
                    className={`nav-link min-w-[56px] min-h-[48px] px-4 border transition-colors ${
                      selectedSize === v.size
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:border-foreground"
                    } disabled:opacity-30 disabled:line-through`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
              {selectedVariant && (
                <p className="editorial-heading text-muted-foreground mt-3">{selectedVariant.quantity} available</p>
              )}
            </div>
          )}

          <div className="mt-8 space-y-3">
            <button
              onClick={() => handleAdd(false)}
              disabled={soldOut}
              className="nav-link w-full bg-foreground text-background py-4 min-h-[48px] hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              {soldOut ? "Sold Out" : "Add To Bag"}
            </button>
            <button
              onClick={() => handleAdd(true)}
              disabled={soldOut}
              className="nav-link w-full border border-foreground py-4 min-h-[48px] hover:bg-foreground hover:text-background transition-colors disabled:opacity-40"
            >
              Buy Now
            </button>
            <button onClick={addToWishlist} className="nav-link w-full flex items-center justify-center gap-2 py-3 text-muted-foreground hover:text-foreground transition-colors">
              <Heart className="w-3.5 h-3.5" /> Save
            </button>
          </div>

          {/* Description as spec list */}
          {(specs.length > 0 || product.condition || product.color || product.material) && (
            <div className="mt-10 border-t border-border pt-6">
              <p className="editorial-heading mb-4">Details</p>
              <ul className="space-y-2">
                {product.brands?.name && <SpecRow label="Brand" value={product.brands.name} />}
                {product.condition && <SpecRow label="Condition" value={product.condition} />}
                {product.color && <SpecRow label="Color" value={product.color} />}
                {product.material && <SpecRow label="Material" value={product.material} />}
                {product.sku && <SpecRow label="SKU" value={product.sku} />}
                {specs.map((line, i) => (
                  <li key={i} className="text-[13px] text-muted-foreground leading-relaxed flex gap-3">
                    <span className="opacity-40">—</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.size_guide && (
            <div className="mt-8 border-t border-border pt-6">
              <p className="editorial-heading mb-3">Size Guide</p>
              <p className="text-[13px] text-muted-foreground whitespace-pre-line leading-relaxed">{product.size_guide}</p>
            </div>
          )}

          <div className="mt-8 border-t border-border pt-6 space-y-2">
            <p className="editorial-heading">Shipping</p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Orders ship within 10 business days. All sales are final — no returns or exchanges.
            </p>
          </div>
        </div>
      </div>

      {/* You may also like — max 2 */}
      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="editorial-heading text-center mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-x-6 max-w-md mx-auto">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} showQuickAdd={false} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

const SpecRow = ({ label, value }: { label: string; value: string }) => (
  <li className="flex justify-between gap-4 text-[13px] border-b border-border pb-2">
    <span className="editorial-heading">{label}</span>
    <span className="text-muted-foreground text-right">{value}</span>
  </li>
);

export default ProductPage;
