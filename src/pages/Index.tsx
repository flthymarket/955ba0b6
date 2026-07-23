import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { storefrontApiRequest, PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

const TICKER_ITEMS = [
  "FREE SHIPPING OVER $250",
  "NEW DROP EVERY FRIDAY",
  "NOW ACCEPTING BTC · ETH · SOL",
  "AUTHENTICITY GUARANTEED",
  "MAKE AN OFFER ON ANY PIECE",
];

const CATEGORY_TILES = [
  { label: "Tops", href: "/collection?filter=tops" },
  { label: "Bottoms", href: "/collection?filter=bottoms" },
  { label: "Accessories", href: "/collection?filter=accessories" },
  { label: "New Arrivals", href: "/collection?filter=new" },
];

const Index = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState<HeroBanner | null>(null);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    (async () => {
      try {
        const [prodData, heroData] = await Promise.all([
          storefrontApiRequest(PRODUCTS_QUERY, { first: 4 }),
          supabase.from("hero_banners").select("*").eq("enabled", true).order("sort_order").limit(1).maybeSingle(),
        ]);
        if (prodData?.data?.products?.edges) setProducts(prodData.data.products.edges.slice(0, 4));
        if (heroData.data) setHero(heroData.data as any);
      } catch (err) {
        console.error("Failed to fetch:", err);
      }
      setLoading(false);
    })();
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

  return (
    <main>
      {/* Optional hero image */}
      {hero?.display_type === "image" && hero.image_url && (
        <section className="relative w-full h-[70vh] overflow-hidden">
          <img src={hero.image_url} alt={hero.title || ""} className="w-full h-full object-cover" />
          {(hero.title || hero.button_text) && (
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 bg-black/10">
              {hero.title && <h1 className="font-akira text-[7vw] text-white drop-shadow-lg">{hero.title}</h1>}
              {hero.button_text && (
                <Link to={hero.link_url || "/collection"} className="mt-6 nav-link px-8 py-3.5 border border-white text-white hover:bg-white hover:text-black transition-colors">
                  {hero.button_text}
                </Link>
              )}
            </div>
          )}
        </section>
      )}

      {/* Marquee */}
      <section className="marquee-wrap border-b border-border py-3">
        <div className="marquee marquee-fast">
          {[0, 1].map(i => (
            <div key={i} className="marquee-track" aria-hidden={i === 1}>
              {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, j) => (
                <span key={j} className="font-mono-ui text-[12px] px-6">
                  {item} <span className="opacity-40 mx-3">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Featured collection — EYEZY 3-col grid, centered names, no brand label */}
      <section className="max-w-[1600px] mx-auto px-6 md:px-10 py-16">
        {loading ? (
          <div className="text-center py-20 editorial-heading text-muted-foreground">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 editorial-heading text-muted-foreground">No products yet</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-16">
            {products.map((product) => {
              const img = product.node.images.edges[0]?.node;
              const hoverImg = product.node.images.edges[1]?.node;
              const price = product.node.priceRange.minVariantPrice;
              return (
                <Link key={product.node.id} to={`/product/${product.node.handle}`} className="block group">
                  <div className="product-frame mb-5">
                    {img && (
                      <img
                        src={img.url}
                        alt={img.altText || product.node.title}
                        className={hoverImg ? 'group-hover:opacity-0' : ''}
                        loading="lazy"
                      />
                    )}
                    {hoverImg && (
                      <img
                        src={hoverImg.url}
                        alt={product.node.title}
                        className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <p className="product-title max-w-[75%] mx-auto pb-1">{product.node.title}</p>
                  <p className="product-price">
                    ${parseFloat(price.amount).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex justify-center mt-16">
          <Link to="/collection" className="nav-link border border-foreground px-10 py-3 hover:bg-foreground hover:text-background transition-colors">
            Shop All
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Index;
