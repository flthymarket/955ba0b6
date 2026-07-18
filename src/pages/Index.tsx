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
      {/* Infinite logo marquee — never stops */}
      <section className="marquee-wrap border-b border-foreground/10 py-5 bg-background">
        <div className="marquee">
          {[0, 1].map(i => (
            <div key={i} className="marquee-track" aria-hidden={i === 1}>
              {Array.from({ length: 6 }).map((_, j) => (
                <span key={j} className="font-akira text-[11vw] leading-none px-8 select-none">
                  FLTHYMRKT
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Hero */}
      <section className="relative w-full">
        {hero?.display_type === "image" && hero.image_url ? (
          <div className="relative w-full h-[70vh] overflow-hidden">
            <img src={hero.image_url} alt={hero.title || ""} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-end pb-16">
              {hero.title && <h1 className="font-akira text-[7vw] text-white drop-shadow-lg">{hero.title}</h1>}
              <Link to={hero.link_url || "/collection"} className="mt-6 text-xs tracking-[0.3em] uppercase font-mono-ui px-8 py-3.5 bg-background text-foreground hover-invert border border-background">
                {hero.button_text || "Shop Now"}
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-24 text-center">
            <p className="editorial-heading text-muted-foreground mb-6">CURRENT COLLECTION</p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[0.95] max-w-3xl mx-auto mb-8">
              {hero?.title || "Archival grails. Held to a higher standard."}
            </h1>
            {hero?.subtitle && (
              <p className="text-base text-muted-foreground max-w-xl mx-auto mb-8">{hero.subtitle}</p>
            )}
            <Link to={hero?.link_url || "/collection"} className="inline-block text-xs tracking-[0.3em] uppercase font-mono-ui px-10 py-4 bg-foreground text-background hover-invert border border-foreground">
              {hero?.button_text || "Enter the Market"}
            </Link>
          </div>
        )}
      </section>

      {/* Announcement ticker */}
      <section className="border-y border-foreground bg-foreground text-background py-3">
        <div className="marquee-wrap">
          <div className="marquee marquee-fast">
            {[0, 1].map(i => (
              <div key={i} className="marquee-track" aria-hidden={i === 1}>
                {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, j) => (
                  <span key={j} className="font-mono-ui text-[11px] tracking-[0.25em] uppercase px-8">
                    {item} <span className="opacity-40 ml-6">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category collection grid */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6 py-16">
        <div className="flex items-baseline justify-between mb-8 px-2">
          <h2 className="font-display text-2xl md:text-3xl">Shop by Category</h2>
          <Link to="/collection" className="editorial-heading hover:opacity-60 transition-opacity">View All →</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {CATEGORY_TILES.map(tile => (
            <Link
              key={tile.label}
              to={tile.href}
              className="group relative aspect-[4/5] bg-secondary overflow-hidden block"
            >
              <div className="absolute inset-0 bg-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="absolute inset-0 flex items-end p-5 md:p-6">
                <div className="w-full flex items-center justify-between">
                  <span className="font-display text-xl md:text-2xl text-foreground group-hover:text-background transition-colors duration-200">
                    {tile.label}
                  </span>
                  <span className="font-mono-ui text-xs text-foreground group-hover:text-background transition-colors duration-200">→</span>
                </div>
              </div>
              <div className="absolute top-4 left-5 font-mono-ui text-[10px] tracking-[0.25em] uppercase text-muted-foreground group-hover:text-background/60 transition-colors duration-200">
                0{CATEGORY_TILES.indexOf(tile) + 1}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals — max 4 uniform letterbox */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6 py-16 border-t border-border">
        <div className="flex items-baseline justify-between mb-8 px-2">
          <h2 className="font-display text-2xl md:text-3xl">New Arrivals</h2>
          <Link to="/collection?filter=new" className="editorial-heading hover:opacity-60 transition-opacity">See All →</Link>
        </div>

        {loading ? (
          <div className="text-center py-20 editorial-heading text-muted-foreground">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 editorial-heading text-muted-foreground">No products yet</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => {
              const img = product.node.images.edges[0]?.node;
              const hoverImg = product.node.images.edges[1]?.node;
              const price = product.node.priceRange.minVariantPrice;
              return (
                <div key={product.node.id} className="group">
                  <Link to={`/product/${product.node.handle}`} className="block">
                    <div className="product-frame mb-3">
                      {img && (
                        <img
                          src={img.url}
                          alt={img.altText || product.node.title}
                          className={`absolute inset-0 ${hoverImg ? 'group-hover:opacity-0' : ''}`}
                          loading="lazy"
                        />
                      )}
                      {hoverImg && (
                        <img
                          src={hoverImg.url}
                          alt={product.node.title}
                          className="absolute inset-0 opacity-0 group-hover:opacity-100"
                          loading="lazy"
                        />
                      )}
                      <button
                        onClick={(e) => { e.preventDefault(); handleQuickAdd(product); }}
                        className="absolute bottom-2 right-2 w-9 h-9 flex items-center justify-center bg-foreground text-background opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        aria-label="Quick add"
                      >+</button>
                    </div>
                    <div className="px-0.5">
                      <p className="editorial-heading text-muted-foreground mb-1">
                        {product.node.vendor || "FLTHYMRKT"}
                      </p>
                      <p className="product-title mb-1.5">{product.node.title}</p>
                      <p className="product-price">
                        ${parseFloat(price.amount).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default Index;
