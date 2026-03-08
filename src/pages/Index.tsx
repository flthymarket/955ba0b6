import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { storefrontApiRequest, PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Bookmark } from "lucide-react";

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

interface HeroBanner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  button_text: string | null;
  display_type: string | null;
  enabled: boolean | null;
}

const Index = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState<HeroBanner | null>(null);
  const productsReveal = useScrollReveal();
  const newsletterReveal = useScrollReveal();
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [prodData, heroData] = await Promise.all([
          storefrontApiRequest(PRODUCTS_QUERY, { first: 4 }),
          supabase.from("hero_banners").select("*").eq("enabled", true).order("sort_order").limit(1).single(),
        ]);
        if (prodData?.data?.products?.edges) setProducts(prodData.data.products.edges);
        if (heroData.data) setHero(heroData.data as any);
      } catch (err) {
        console.error("Failed to fetch:", err);
      }
      setLoading(false);
    };
    fetchAll();
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

  const renderHero = () => {
    if (!hero) {
      // Default text hero
      return (
        <section className="relative w-full h-[40vh] sm:h-[45vh] md:h-[50vh] overflow-hidden flex flex-col items-center justify-center bg-background">
        <h1 className="font-akira text-[22vw] sm:text-[20vw] md:text-[18vw] lg:text-[16vw] leading-[0.8] text-foreground select-none translate-y-[15%]" style={{ letterSpacing: '-0.03em' }}>
            FLTHYMRKT
          </h1>
          <Link to="/collection" className="absolute bottom-6 sm:bottom-8 md:bottom-12 text-sm md:text-base tracking-[0.35em] uppercase font-light border-2 border-foreground px-8 sm:px-10 py-3 sm:py-4 bg-background hover-gray hover:border-foreground transition-all duration-300 z-10">
            Shop Now
          </Link>
        </section>
      );
    }

    if (hero.display_type === "image" && hero.image_url) {
      return (
        <section className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] overflow-hidden">
          <img src={hero.image_url} alt={hero.title || ""} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {hero.title && <h1 className="font-akira text-[8vw] sm:text-[6vw] text-white drop-shadow-lg">{hero.title}</h1>}
            <Link to={hero.link_url || "/collection"} className="mt-6 text-sm tracking-[0.35em] uppercase font-light border-2 border-white text-white px-10 py-4 hover:bg-white hover:text-black transition-all duration-300">
              {hero.button_text || "Shop Now"}
            </Link>
          </div>
        </section>
      );
    }

    // Default: text display
    return (
      <section className="relative w-full h-[40vh] sm:h-[45vh] md:h-[50vh] overflow-hidden flex flex-col items-center justify-center bg-background">
        <h1 className="font-akira text-[16vw] sm:text-[14vw] md:text-[12vw] lg:text-[10vw] leading-[0.85] text-foreground select-none translate-y-[20%]" style={{ letterSpacing: '-0.02em' }}>
          {hero.title || "FLTHYMRKT"}
        </h1>
        {hero.subtitle && <p className="text-sm sm:text-base tracking-[0.3em] uppercase font-light text-muted-foreground mt-4">{hero.subtitle}</p>}
        <Link to={hero.link_url || "/collection"} className="absolute bottom-6 sm:bottom-8 md:bottom-12 text-sm md:text-base tracking-[0.35em] uppercase font-light border-2 border-foreground px-8 sm:px-10 py-3 sm:py-4 bg-background hover-gray hover:border-foreground transition-all duration-300 z-10">
          {hero.button_text || "Shop Now"}
        </Link>
      </section>
    );
  };

  return (
    <main>
      {renderHero()}

      {/* New Arrivals / Product Grid */}
      <section
        ref={productsReveal.ref}
        className={`max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-24 transition-all duration-1000 ease-out ${productsReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <h2 className="text-base sm:text-lg md:text-xl tracking-[0.35em] uppercase font-extralight mb-8 sm:mb-12 text-center">New Arrivals</h2>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm tracking-widest uppercase">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm tracking-widest uppercase mb-4">No products found</p>
            <p className="text-muted-foreground text-xs tracking-wide font-light">Products will appear here once added to the store.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {products.map((product, i) => {
                const img = product.node.images.edges[0]?.node;
                const hoverImg = product.node.images.edges[1]?.node;
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
                      <div className="aspect-[3/4] overflow-hidden mb-3 bg-secondary relative">
                        {img ? (
                          <img
                            src={img.url}
                            alt={img.altText || product.node.title}
                            className="w-full h-full object-cover transition-opacity duration-500"
                            loading="lazy"
                            style={{ opacity: 1 }}
                            onMouseEnter={(e) => {
                              if (hoverImg) (e.target as HTMLImageElement).src = hoverImg.url;
                            }}
                            onMouseLeave={(e) => {
                              if (hoverImg) (e.target as HTMLImageElement).src = img.url;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Image</div>
                        )}
                        <button className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Bookmark className="w-5 h-5 text-foreground" />
                        </button>
                      </div>
                      <div className="px-1 pb-2">
                        <p className="text-xs sm:text-sm tracking-[0.15em] uppercase font-light text-muted-foreground mb-0.5">
                          {product.node.vendor || "FLTHY MRKT"}
                        </p>
                        <p className="text-sm sm:text-base tracking-[0.05em] font-normal mb-1 leading-tight text-foreground">
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
            <div className="text-center mt-10 sm:mt-12">
              <Link
                to="/collection"
                className="text-sm tracking-[0.25em] uppercase font-light border border-foreground px-8 sm:px-10 py-3 sm:py-4 hover:bg-foreground hover:text-background transition-all duration-300 inline-block min-h-[48px] leading-[48px]"
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
        className={`border-t border-border py-12 sm:py-16 md:py-24 transition-all duration-1000 ease-out ${newsletterReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-base sm:text-lg md:text-xl tracking-[0.3em] font-extralight uppercase mb-4">
            Everybody Can't Have Limited Items..
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground tracking-[0.15em] font-light mb-6 sm:mb-8 uppercase">
            Join our email list for new drops & exclusives
          </p>
          <div className="flex border border-foreground max-w-md mx-auto">
            <input
              type="email"
              placeholder="YOUR EMAIL"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm tracking-widest py-3 sm:py-4 px-4 placeholder:text-muted-foreground min-h-[48px]"
            />
            <button
              onClick={handleNewsletter}
              className="bg-foreground text-background px-6 sm:px-8 py-3 sm:py-4 text-sm tracking-[0.2em] uppercase font-light hover:opacity-80 transition-opacity min-h-[48px]"
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
