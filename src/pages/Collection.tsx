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
      let query = supabase.from("products").select("id, name, price, category, brand_id, brands(name), created_at, discount_enabled, discount_type, discount_value, discount_start, discount_end, is_flash_sale");

      if (filter === "accessories") query = query.eq("category", "Accessories");
      else if (filter === "new") query = query.order("created_at", { ascending: false });

      const { data } = await query;

      if (data) {
        const ids = data.map((p) => p.id);
        const { data: images } = await supabase.from("product_images").select("product_id, url").in("product_id", ids);
        const imgMap: Record<string, string> = {};
        images?.forEach((img) => { if (!imgMap[img.product_id]) imgMap[img.product_id] = img.url; });

        const { data: variants } = await supabase.from("product_variants").select("product_id, size, quantity").in("product_id", ids);
        const sizeSet = new Set<string>();
        variants?.forEach((v) => sizeSet.add(v.size));
        setAllSizes(Array.from(sizeSet).sort());

        let filtered = data;
        if (selectedBrands.length > 0) {
          filtered = filtered.filter((p) => selectedBrands.includes((p.brands as any)?.name));
        }

        if (currentSort === "Price: Low to High") filtered.sort((a, b) => a.price - b.price);
        else if (currentSort === "Price: High to Low") filtered.sort((a, b) => b.price - a.price);

        setProducts(filtered.map((p) => ({
          id: p.id, name: p.name, brand: (p.brands as any)?.name || "", price: p.price,
          image: imgMap[p.id] || "/placeholder.svg",
          discount_enabled: p.discount_enabled, discount_type: p.discount_type,
          discount_value: p.discount_value, discount_start: p.discount_start,
          discount_end: p.discount_end, is_flash_sale: p.is_flash_sale,
        })));
      }
    };

    supabase.from("brands").select("id, name").order("name").then(({ data }) => {
      if (data) setBrands(data);
    });

    fetchData();
  }, [filter, selectedBrands, currentSort, brandParam]);

  const toggleBrand = (name: string) => {
    setSelectedBrands((prev) => prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]);
  };

  return (
    <main className="pt-32 pb-24 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-6">
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
              <div className="absolute right-0 top-full mt-2 bg-background border border-border py-2 px-4 min-w-[180px] z-10 animate-fade-in">
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
          {filtersOpen && (
            <aside className="w-60 flex-shrink-0 hidden md:block animate-fade-in">
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
