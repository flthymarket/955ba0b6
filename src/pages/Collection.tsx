import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";

const sortOptions = ["Newest", "Price: Low to High", "Price: High to Low"];

const Collection = () => {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");
  const brandParam = searchParams.get("brand");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState("Newest");
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(brandParam ? [brandParam] : []);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [allSizes, setAllSizes] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      let query = supabase.from("products").select("id, name, price, category, brand_id, brands(name), created_at");

      if (filter === "accessories") query = query.eq("category", "Accessories");
      else if (filter === "new") query = query.order("created_at", { ascending: false });

      const { data } = await query;

      if (data) {
        // Get images
        const ids = data.map((p) => p.id);
        const { data: images } = await supabase.from("product_images").select("product_id, url").in("product_id", ids);
        const imgMap: Record<string, string> = {};
        images?.forEach((img) => { if (!imgMap[img.product_id]) imgMap[img.product_id] = img.url; });

        // Get variants for sizes
        const { data: variants } = await supabase.from("product_variants").select("product_id, size, quantity").in("product_id", ids);
        const sizeSet = new Set<string>();
        variants?.forEach((v) => sizeSet.add(v.size));
        setAllSizes(Array.from(sizeSet).sort());

        // Filter by brand
        let filtered = data;
        if (selectedBrands.length > 0) {
          filtered = filtered.filter((p) => selectedBrands.includes((p.brands as any)?.name));
        }

        // Sort
        if (currentSort === "Price: Low to High") filtered.sort((a, b) => a.price - b.price);
        else if (currentSort === "Price: High to Low") filtered.sort((a, b) => b.price - a.price);

        setProducts(filtered.map((p) => ({
          id: p.id, name: p.name, brand: (p.brands as any)?.name || "", price: p.price,
          image: imgMap[p.id] || "/placeholder.svg",
        })));
      }
    };

    supabase.from("brands").select("id, name").order("name").then(({ data }) => {
      if (data) setBrands(data);
    });

    fetchData();
  }, [filter, selectedBrands, currentSort, brandParam]);

  // Footwear coming soon
  if (filter === "footwear") {
    return (
      <main className="pt-32 pb-24">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-center min-h-[50vh] pt-8">
          <div className="text-center">
            <h1 className="text-lg tracking-[0.3em] font-extralight uppercase mb-4">Coming Soon</h1>
            <p className="text-[11px] text-muted-foreground tracking-wide font-light">Footwear collection launching soon.</p>
          </div>
        </div>
      </main>
    );
  }

  const toggleBrand = (name: string) => {
    setSelectedBrands((prev) => prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]);
  };

  return (
    <main className="pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-10 border-b border-border pb-4">
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="nav-link flex items-center gap-2">
            <SlidersHorizontal className="w-3 h-3" />
            {filtersOpen ? "Hide Filters" : "Show Filters"}
          </button>
          <span className="text-[10px] text-muted-foreground tracking-widest">{products.length} ITEMS</span>
          <div className="relative">
            <button onClick={() => setSortOpen(!sortOpen)} className="nav-link flex items-center gap-2">
              Sort: {currentSort} <ChevronDown className="w-3 h-3" />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 bg-background border border-border py-2 px-4 min-w-[180px] z-10">
                {sortOptions.map((opt) => (
                  <button key={opt} onClick={() => { setCurrentSort(opt); setSortOpen(false); }}
                    className={`block w-full text-left py-2 nav-link text-[9px] ${currentSort === opt ? "opacity-100" : "opacity-50"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-10">
          {/* Filters */}
          {filtersOpen && (
            <aside className="w-60 flex-shrink-0 hidden md:block">
              {/* Brand filter */}
              <div className="border-b border-border py-4">
                <p className="nav-link text-[10px] mb-3">Brand</p>
                <div className="flex flex-col gap-2">
                  {brands.map((b) => (
                    <label key={b.id} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={selectedBrands.includes(b.name)}
                        onChange={() => toggleBrand(b.name)}
                        className="w-3 h-3 appearance-none border border-foreground checked:bg-foreground cursor-pointer" />
                      <span className="text-[10px] tracking-wide font-light">{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Size filter */}
              {allSizes.length > 0 && (
                <div className="border-b border-border py-4">
                  <p className="nav-link text-[10px] mb-3">Size</p>
                  <div className="flex flex-col gap-2">
                    {allSizes.map((s) => (
                      <label key={s} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={selectedSizes.includes(s)}
                          onChange={() => setSelectedSizes((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s])}
                          className="w-3 h-3 appearance-none border border-foreground checked:bg-foreground cursor-pointer" />
                        <span className="text-[10px] tracking-wide font-light">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          )}

          {/* Product grid */}
          <div className="flex-1">
            <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 ${filtersOpen ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
            {products.length === 0 && (
              <p className="text-center py-20 text-muted-foreground text-xs tracking-widest uppercase">No products found</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Collection;
