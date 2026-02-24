import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  brand_id: string | null;
  brands?: { name: string } | null;
}

interface ProductImage {
  product_id: string;
  url: string;
}

interface Brand {
  id: string;
  name: string;
  featured?: boolean;
}

const Index = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    // Fetch featured products from DB
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, brand_id, brands(name), featured")
        .eq("featured", true)
        .limit(8);

      if (data && data.length > 0) {
        // Fetch images for these products
        const productIds = data.map((p) => p.id);
        const { data: images } = await supabase
          .from("product_images")
          .select("product_id, url")
          .in("product_id", productIds)
          .order("sort_order");

        const imageMap: Record<string, string> = {};
        images?.forEach((img) => {
          if (!imageMap[img.product_id]) imageMap[img.product_id] = img.url;
        });

        setProducts(
          data.map((p) => ({
            id: p.id,
            name: p.name,
            brand: (p.brands as any)?.name || "",
            price: p.price,
            image: imageMap[p.id] || "/placeholder.svg",
          }))
        );
      }
    };

    // Fetch featured brands from DB
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
      <section className="relative h-screen">
        <img src={heroImage} alt="Campaign" className="w-full h-full object-cover grayscale" />
        <div className="absolute inset-0 bg-foreground/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground">
          <h1 className="text-[13px] md:text-[15px] tracking-[0.5em] font-extralight mb-6">NEW ARRIVALS</h1>
          <Link to="/collection" className="border border-primary-foreground px-8 py-3 text-[10px] tracking-[0.3em] font-light hover:bg-primary-foreground hover:text-primary transition-all duration-500">
            SHOP NOW
          </Link>
        </div>
      </section>

      {/* Curated Drops - from DB featured products */}
      {products.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 py-24">
          <h2 className="section-title">Curated Drops</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Brands - from DB */}
      {brands.length > 0 && (
        <section className="border-t border-b border-border py-20">
          <div className="max-w-[1400px] mx-auto px-6">
            <h2 className="section-title">Featured Brands</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/collection?brand=${encodeURIComponent(brand.name)}`}
                  className="flex items-center justify-center py-6 border border-border hover:bg-foreground hover:text-background transition-all duration-500"
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
