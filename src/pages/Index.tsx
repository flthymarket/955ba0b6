import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { storefrontApiRequest, PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import heroImage from "@/assets/hero-image.jpg";

const useScrollReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
};

const Index = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const productsReveal = useScrollReveal();
  const storiesReveal = useScrollReveal();
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

    const fetchStories = async () => {
      const { data } = await supabase
        .from("stories")
        .select("id, title, image_url, publish_date")
        .eq("published", true)
        .order("publish_date", { ascending: false })
        .limit(3);
      if (data) setStories(data);
    };

    fetchProducts();
    fetchStories();
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
        <div className="absolute inset-0 bg-foreground/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-primary-foreground text-2xl md:text-4xl lg:text-5xl tracking-[0.4em] font-extralight uppercase mb-4 animate-fade-in">
            FLTHY MRKT
          </h1>
          <p className="text-primary-foreground/80 text-[10px] md:text-xs tracking-[0.3em] font-extralight uppercase mb-8">
            Curated Luxury · Pre-Owned & Archive
          </p>
          <Link
            to="/collection"
            className="text-primary-foreground text-[10px] tracking-[0.3em] font-extralight uppercase border border-primary-foreground/60 px-8 py-3 hover:bg-primary-foreground/10 transition-all duration-300"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* New Arrivals / Product Grid */}
      <section
        ref={productsReveal.ref}
        className={`max-w-[1400px] mx-auto px-4 md:px-6 py-16 md:py-24 transition-all duration-700 ${productsReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <h2 className="section-title">New Arrivals</h2>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-xs tracking-widest uppercase">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-xs tracking-widest uppercase mb-4">No products found</p>
            <p className="text-muted-foreground text-[10px] tracking-wide font-light">
              Products will appear here once added to the store.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, i) => {
                const img = product.node.images.edges[0]?.node;
                const price = product.node.priceRange.minVariantPrice;
                return (
                  <div
                    key={product.node.id}
                    className="group transition-all duration-500"
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <Link to={`/product/${product.node.handle}`} className="block">
                      <div className="aspect-[3/4] overflow-hidden mb-4 bg-secondary relative">
                        {img ? (
                          <img
                            src={img.url}
                            alt={img.altText || product.node.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            No Image
                          </div>
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
            <div className="text-center mt-12">
              <Link
                to="/collection"
                className="editorial-heading text-[10px] border border-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-all duration-300"
              >
                View All
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Stories Section */}
      {stories.length > 0 && (
        <section
          ref={storiesReveal.ref}
          className={`border-t border-border py-16 md:py-24 transition-all duration-700 ${storiesReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <h2 className="section-title">FlthyMrkt Presents</h2>
            <p className="text-center text-[10px] text-muted-foreground tracking-[0.2em] font-light -mt-8 mb-12">
              FASHION HISTORY · NEW STORIES EVERY WEEK
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stories.map((story) => (
                <Link key={story.id} to={`/stories?story=${story.id}`} className="group block">
                  <div className="aspect-[4/3] overflow-hidden mb-4 bg-secondary">
                    {story.image_url && (
                      <img
                        src={story.image_url}
                        alt={story.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                    )}
                  </div>
                  <h3 className="text-[11px] tracking-[0.2em] font-extralight uppercase group-hover:opacity-60 transition-opacity duration-300">
                    {story.title}
                  </h3>
                  {story.publish_date && (
                    <p className="text-[9px] text-muted-foreground tracking-widest mt-1">
                      {new Date(story.publish_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  )}
                </Link>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                to="/stories"
                className="editorial-heading text-[10px] border border-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-all duration-300"
              >
                All Stories
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter / CTA Section */}
      <section
        ref={newsletterReveal.ref}
        className={`border-t border-border py-16 md:py-24 transition-all duration-700 ${newsletterReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-lg md:text-xl tracking-[0.3em] font-extralight uppercase mb-4">
            Everybody Can't Have Limited Items..
          </h2>
          <p className="text-[10px] text-muted-foreground tracking-[0.2em] font-light mb-8 uppercase">
            Join our email list to find out about the new drop and never miss it again
          </p>
          <div className="flex border border-foreground max-w-md mx-auto">
            <input
              type="email"
              placeholder="YOUR EMAIL"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[10px] tracking-widest py-3 px-4 placeholder:text-muted-foreground"
            />
            <button
              onClick={handleNewsletter}
              className="bg-foreground text-background px-6 py-3 editorial-heading text-[9px] hover:opacity-80 transition-opacity"
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
