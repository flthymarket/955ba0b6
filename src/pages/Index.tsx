import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
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
  const [brands, setBrands] = useState<any[]>([]);
  const productsReveal = useScrollReveal();
  const brandsReveal = useScrollReveal();

  useEffect(() => {
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
      }
    };

    const fetchBrands = async () => {
      const { data } = await supabase.from("brands").select("id, name").order("name").limit(12);
      if (data) setBrands(data);
    };

    fetchProducts();
    fetchBrands();
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="relative h-screen overflow-hidden">
        <img src={heroImage} alt="Campaign" className="w-full h-full object-cover grayscale scale-105 animate-[scale-in_1.2s_ease-out_forwards]" />
        <div className="absolute inset-0 bg-foreground/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground">
          <h1 className="text-[13px] md:text-[15px] tracking-[0.5em] font-extralight mb-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>NEW ARRIVALS</h1>
          <Link to="/collection" className="border border-primary-foreground px-8 py-3 text-[10px] tracking-[0.3em] font-light hover:bg-primary-foreground hover:text-primary transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            SHOP NOW
          </Link>
        </div>
      </section>

      {/* Curated Drops */}
      {products.length > 0 && (
        <section ref={productsReveal.ref} className={`max-w-[1400px] mx-auto px-6 py-24 transition-all duration-700 ${productsReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="section-title">Curated Drops</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <div key={product.id} className="transition-all duration-500" style={{ transitionDelay: `${i * 100}ms` }}>
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Brands */}
      {brands.length > 0 && (
        <section ref={brandsReveal.ref} className={`border-t border-b border-border py-20 transition-all duration-700 ${brandsReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="max-w-[1400px] mx-auto px-6">
            <h2 className="section-title">Featured Brands</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/collection?brand=${encodeURIComponent(brand.name)}`}
                  className="flex items-center justify-center py-6 border border-border hover:bg-foreground hover:text-background transition-all duration-300"
                >
                  <span className="text-[10px] tracking-[0.2em] font-extralight">{brand.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default Index;
