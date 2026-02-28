import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";

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
  const [products, setProducts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [heroImage, setHeroImage] = useState("/placeholder.svg");
  const productsReveal = useScrollReveal();
  const storiesReveal = useScrollReveal();

  useEffect(() => {
    // Fetch featured products
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, brand_id, brands(name), featured, discount_enabled, discount_type, discount_value, discount_start, discount_end, is_flash_sale")
        .eq("featured", true)
        .limit(8);

      if (data && data.length > 0) {
        const productIds = data.map((p) => p.id);
        const { data: images } = await supabase
          .from("product_images")
          .select("product_id, url")
          .in("product_id", productIds)
          .order("sort_order");

        const imageMap: Record<string, string> = {};
        images?.forEach((img) => { if (!imageMap[img.product_id]) imageMap[img.product_id] = img.url; });

        setProducts(
          data.map((p) => ({
            id: p.id, name: p.name, brand: (p.brands as any)?.name || "", price: p.price,
            image: imageMap[p.id] || "/placeholder.svg",
            discount_enabled: p.discount_enabled, discount_type: p.discount_type,
            discount_value: p.discount_value, discount_start: p.discount_start,
            discount_end: p.discount_end, is_flash_sale: p.is_flash_sale,
          }))
        );

        // Use the first product image as hero
        if (Object.values(imageMap).length > 0) {
          setHeroImage(Object.values(imageMap)[0]);
        }
      }
    };

    // Fetch published stories
    const fetchStories = async () => {
      const { data } = await supabase
        .from("stories")
        .select("id, title, image_url, publish_date")
        .eq("published", true)
        .order("publish_date", { ascending: false })
        .limit(2);
      if (data) setStories(data);
    };

    fetchProducts();
    fetchStories();
  }, []);

  return (
    <main>
      {/* Dual Hero — Justin Reed Style */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-140px)]">
        {/* Shop Side */}
        <Link to="/collection" className="relative group overflow-hidden cursor-pointer">
          <div className="absolute inset-0 bg-foreground/10 z-10 group-hover:bg-foreground/20 transition-all duration-500" />
          <img
            src={heroImage}
            alt="Shop Collection"
            className="w-full h-full object-cover min-h-[50vh] md:min-h-full transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-12 md:pb-16">
            <h2 className="text-primary-foreground text-[11px] md:text-[13px] tracking-[0.5em] font-extralight mb-4 animate-fade-in">
              SHOP
            </h2>
            <span className="text-primary-foreground/80 text-[9px] tracking-[0.3em] font-extralight border border-primary-foreground/40 px-6 py-2 group-hover:bg-primary-foreground/10 transition-all duration-300">
              VIEW COLLECTION
            </span>
          </div>
        </Link>

        {/* Stories Side */}
        <Link
          to="/stories"
          className="relative group overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-foreground/10 z-10 group-hover:bg-foreground/20 transition-all duration-500" />
          <img
            src={stories[0]?.image_url || "/placeholder.svg"}
            alt="Stories"
            className="w-full h-full object-cover min-h-[50vh] md:min-h-full transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-12 md:pb-16">
            <h2 className="text-primary-foreground text-[11px] md:text-[13px] tracking-[0.5em] font-extralight mb-4 animate-fade-in">
              STORIES
            </h2>
            <span className="text-primary-foreground/80 text-[9px] tracking-[0.3em] font-extralight border border-primary-foreground/40 px-6 py-2 group-hover:bg-primary-foreground/10 transition-all duration-300">
              READ MORE
            </span>
          </div>
        </Link>
      </section>

      {/* Curated Drops */}
      {products.length > 0 && (
        <section ref={productsReveal.ref} className={`max-w-[1400px] mx-auto px-6 py-20 transition-all duration-700 ${productsReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="section-title">Curated Drops</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, i) => (
              <div key={product.id} className="transition-all duration-500" style={{ transitionDelay: `${i * 80}ms` }}>
                <ProductCard {...product} />
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/collection" className="editorial-heading text-[10px] border border-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-all duration-300">
              View All
            </Link>
          </div>
        </section>
      )}

      {/* Stories Section */}
      {stories.length > 0 && (
        <section ref={storiesReveal.ref} className={`border-t border-border py-20 transition-all duration-700 ${storiesReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="max-w-[1400px] mx-auto px-6">
            <h2 className="section-title">FlthyMrkt Presents</h2>
            <p className="text-center text-[10px] text-muted-foreground tracking-[0.2em] font-light -mt-8 mb-12">
              FASHION HISTORY · NEW STORIES EVERY WEEK
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Link to="/stories" className="editorial-heading text-[10px] border border-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-all duration-300">
                All Stories
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default Index;
