import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { fetchProducts, fetchNewestIds, type StoreProduct } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import editorialNew from "@/assets/editorial-new.jpg.asset.json";
import editorialShop from "@/assets/editorial-shop.jpg.asset.json";

interface HeroBanner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  button_text: string | null;
  display_type: string | null;
}

interface CategoryTile {
  id: string;
  label: string;
  image_url: string | null;
  link_url: string;
}

const TICKER_ITEMS = [
  "FREE SHIPPING OVER $250",
  "NEW DROP EVERY FRIDAY",
  "NOW ACCEPTING BTC · ETH · SOL",
  "AUTHENTICITY GUARANTEED",
  "WORLDWIDE SHIPPING",
];

const Index = () => {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [newArrivals, setNewArrivals] = useState<StoreProduct[]>([]);
  const [newIds, setNewIds] = useState<string[]>([]);
  const [tiles, setTiles] = useState<CategoryTile[]>([]);
  const [hero, setHero] = useState<HeroBanner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [all, newest, ids, heroRes, tilesRes] = await Promise.all([
          fetchProducts({ limit: 12 }),
          fetchProducts({ limit: 4, newestFirst: true }),
          fetchNewestIds(5),
          supabase.from("hero_banners").select("*").eq("enabled", true).order("sort_order").limit(1).maybeSingle(),
          supabase.from("category_tiles").select("id, label, image_url, link_url").eq("enabled", true).order("sort_order"),
        ]);
        setProducts(all);
        setNewArrivals(newest);
        setNewIds(ids);
        if (heroRes.data) setHero(heroRes.data as HeroBanner);
        setTiles((tilesRes.data as CategoryTile[]) || []);
      } catch (err) {
        console.error("Failed to load homepage:", err);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <main>
      {hero?.display_type === "image" && hero.image_url && (
        <section className="relative w-full h-[70vh] overflow-hidden">
          <img src={hero.image_url} alt={hero.title || "FLTHYMRKT"} className="w-full h-full object-cover" />
          {(hero.title || hero.button_text) && (
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 bg-black/10">
              {hero.title && <h1 className="font-display text-[7vw] text-white drop-shadow-lg">{hero.title}</h1>}
              {hero.button_text && (
                <Link to={hero.link_url || "/collection"} className="mt-6 nav-link px-8 py-3.5 border border-white text-white hover:bg-white hover:text-black transition-colors">
                  {hero.button_text}
                </Link>
              )}
            </div>
          )}
        </section>
      )}

      {/* Ticker */}
      <section className="marquee-wrap border-b border-border py-3">
        <div className="marquee marquee-fast">
          {[0, 1].map((i) => (
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

      {/* Category tiles */}
      {tiles.length > 0 && (
        <section className="max-w-[1600px] mx-auto px-6 md:px-10 pt-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tiles.map((t) => (
              <Link key={t.id} to={t.link_url} className="group block border border-border hover-gray">
                {t.image_url && (
                  <div className="product-frame">
                    <img src={t.image_url} alt={t.label} className="pf-img" loading="lazy" />
                  </div>
                )}
                <p className="section-title py-4">{t.label}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Editorial banner → New Arrivals */}
      <section className="max-w-[1600px] mx-auto px-6 md:px-10 pt-16">
        <Link to="/collection?filter=new" className="group block relative">
          <div className="w-full h-[46vh] md:h-[62vh] overflow-hidden bg-secondary">
            <img
              src={editorialNew.url}
              alt="Archive rack of rare streetwear"
              className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90"
              loading="lazy"
            />
          </div>
          <p className="editorial-heading text-[13px] md:text-[16px] text-center underline underline-offset-[6px] pt-5">
            New Arrivals
          </p>
        </Link>
      </section>

      {/* New arrivals — max 4 */}
      {newArrivals.length > 0 && (
        <section className="max-w-[1600px] mx-auto px-6 md:px-10 pt-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} isNew={newIds.includes(p.id)} />
            ))}
          </div>
        </section>
      )}

      {/* Editorial banner → Shop */}
      <section className="max-w-[1600px] mx-auto px-6 md:px-10 pt-20">
        <Link to="/collection" className="group block relative">
          <div className="w-full h-[46vh] md:h-[62vh] overflow-hidden bg-secondary">
            <img
              src={editorialShop.url}
              alt="Flat lay of vintage tees, chains and denim"
              className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90"
              loading="lazy"
            />
          </div>
          <p className="editorial-heading text-[13px] md:text-[16px] text-center underline underline-offset-[6px] pt-5">
            Shop
          </p>
        </Link>
      </section>

      {/* Featured grid */}
      <section className="max-w-[1600px] mx-auto px-6 md:px-10 py-16">
        {loading ? (
          <div className="text-center py-20 editorial-heading text-muted-foreground">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 editorial-heading text-muted-foreground">No products yet</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-16">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} isNew={newIds.includes(p.id)} />
            ))}
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
