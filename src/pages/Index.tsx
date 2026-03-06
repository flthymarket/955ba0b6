import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { storefrontApiRequest, PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import heroImage from "@/assets/hero-sale.jpg";
import { supabase } from "@/integrations/supabase/client";

const useScrollReveal = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
};

const Index = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const productsReveal = useScrollReveal();
  const newsletterReveal = useScrollReveal();
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await storefrontApiRequest(PRODUCTS_QUERY, { first: 8 });
        if (data?.data?.products?.edges) {
          setProducts(data.data.products.edges);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

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

  const handleNewsletter = async () => {
    if (!newsletterEmail.trim()) return;
    await supabase.from("newsletter_subscribers").insert({ email: newsletterEmail.trim() });
    localStorage.setItem("newsletter_subscribed", "true");
    toast.success("Subscribed!");
    setNewsletterEmail("");
  };

  return (
    <main>
      {/* Full-width Hero Banner */}
      <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
        <img
          src={heroImage}
          alt="FLTHY MRKT Collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 md:pb-24 px-6">
          <Link
            to="/collection"
            className="text-foreground text-sm md:text-base tracking-[0.35em] uppercase font-light border-2 border-foreground px-10 py-4 bg-background/80 hover:bg-foreground hover:text-background transition-all duration-300"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* New Arrivals / Product Grid */}
      <section
        ref={productsReveal.ref}
        className={`max-w-[1400px] mx-auto px-4 md:px-8 py-20 md:py-28 transition-all duration-1000 ease-out ${productsReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <h2 className="text-base md:text-lg tracking-[0.35em] uppercase font-extralight mb-14 text-center">New Arrivals</h2>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm tracking-widest uppercase">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm tracking-widest uppercase mb-4">No products found</p>
            <p className="text-muted-foreground text-xs tracking-wide font-light">
              Products will appear here once added to the store.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
              {products.map((product, i) => {
                const img = product.node.images.edges[0]?.node;
                const price = product.node.priceRange.minVariantPrice;
                return (
                  <div
                    key={product.node.id}
                    className="group transition-all duration-700 ease-out"
                    style={{
                      transitionDelay: `${i * 100}ms`,
                      opacity: productsReveal.visible ? 1 : 0,
                      transform: productsReveal.visible ? 'translateY(0)' : 'translateY(20px)',
                    }}
                  >
                    <Link to={`/product/${product.node.handle}`} className="block">
                      <div className="aspect-[3/4] overflow-hidden mb-4 bg-secondary relative">
                        {img ? (
                          <img
                            src={img.url}
                            alt={img.altText || product.node.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                            No Image
                          </div>
                        )}
                      </div>
                      <p className="text-xs md:text-sm tracking-[0.15em] uppercase font-light text-muted-foreground mb-1">
                        {product.node.vendor || "FLTHY MRKT"}
                      </p>
                      <p className="text-sm md:text-base tracking-[0.1em] font-light mb-1 leading-tight">
                        {product.node.title}
                      </p>
                      <p className="text-xs md:text-sm tracking-[0.1em] font-light text-muted-foreground">
                        ${parseFloat(price.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </Link>
                    <button
                      onClick={() => handleQuickAdd(product)}
                      disabled={isLoading}
                      className="mt-3 w-full text-xs tracking-[0.2em] uppercase font-light border border-border py-3 hover:bg-foreground hover:text-background transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      Quick Add
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-14">
              <Link
                to="/collection"
                className="text-sm tracking-[0.25em] uppercase font-light border border-foreground px-10 py-4 hover:bg-foreground hover:text-background transition-all duration-300"
              >
                View All
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Newsletter / CTA Section */}
      <section
        ref={newsletterReveal.ref}
        className={`border-t border-border py-20 md:py-28 transition-all duration-1000 ease-out ${newsletterReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-lg md:text-xl tracking-[0.3em] font-extralight uppercase mb-4">
            Everybody Can't Have Limited Items..
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground tracking-[0.2em] font-light mb-8 uppercase">
            Join our email list to find out about the new drop and never miss it again
          </p>
          <div className="flex border border-foreground max-w-md mx-auto">
            <input
              type="email"
              placeholder="YOUR EMAIL"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm tracking-widest py-4 px-4 placeholder:text-muted-foreground"
            />
            <button
              onClick={handleNewsletter}
              className="bg-foreground text-background px-8 py-4 text-sm tracking-[0.2em] uppercase font-light hover:opacity-80 transition-opacity"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
