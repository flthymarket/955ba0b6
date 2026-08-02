import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchProducts, fetchNewestIds, finalPrice, type StoreProduct } from "@/lib/store";
import ProductCard from "@/components/ProductCard";

const sortOptions = ["Featured", "Newest", "Price: Low to High", "Price: High to Low"];

const categoryFilters = [
  { label: "All", value: "all" },
  { label: "New Arrivals", value: "new" },
  { label: "Tops", value: "tops" },
  { label: "Bottoms", value: "bottoms" },
  { label: "Bags", value: "bags" },
  { label: "Jewelry", value: "jewelry" },
  { label: "Accessories", value: "accessories" },
];

const Collection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("filter") || "all";
  const brandParam = searchParams.get("brand") || "";

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [newIds, setNewIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState("Featured");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [openPanel, setOpenPanel] = useState<"category" | "brand" | "color" | null>("category");

  useEffect(() => {
    if (brandParam) {
      setSelectedBrands([brandParam]);
      setOpenPanel("brand");
    }
  }, [brandParam]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [all, newest] = await Promise.all([fetchProducts({}), fetchNewestIds(5)]);
        setProducts(all);
        setNewIds(newest);
      } catch (err) {
        console.error("Failed to load products:", err);
      }
      setLoading(false);
    })();
  }, []);

  const availableBrands = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.brands?.name?.trim()).filter((b): b is string => !!b))).sort(),
    [products]
  );

  const availableColors = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.color?.trim()).filter((c): c is string => !!c))).sort(),
    [products]
  );

  const visible = useMemo(() => {
    let items = [...products];

    if (filter === "new") {
      items = items
        .slice()
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .slice(0, 10);
    } else if (filter !== "all") {
      items = items.filter((p) => p.category?.toLowerCase() === filter.toLowerCase());
    }

    if (selectedBrands.length) {
      items = items.filter((p) =>
        selectedBrands.some((b) => p.brands?.name?.toLowerCase() === b.toLowerCase())
      );
    }
    if (selectedColors.length) {
      items = items.filter((p) =>
        selectedColors.some((c) => p.color?.toLowerCase() === c.toLowerCase())
      );
    }

    if (currentSort === "Price: Low to High") items.sort((a, b) => finalPrice(a) - finalPrice(b));
    else if (currentSort === "Price: High to Low") items.sort((a, b) => finalPrice(b) - finalPrice(a));
    else if (currentSort === "Newest")
      items.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return items;
  }, [products, filter, selectedBrands, selectedColors, currentSort]);

  const pageTitle =
    filter === "all" ? "Shop All" : filter === "new" ? "New Arrivals" : filter.charAt(0).toUpperCase() + filter.slice(1);

  const Checkbox = ({ checked, label, onClick }: { checked: boolean; label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full text-left py-1.5 text-[13px] transition-colors ${
        checked ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span
        className={`w-[14px] h-[14px] border flex items-center justify-center flex-shrink-0 ${
          checked ? "border-foreground bg-foreground" : "border-border"
        }`}
      >
        {checked && <span className="text-background text-[9px] leading-none">✓</span>}
      </span>
      {label}
    </button>
  );

  const Panel = ({
    title,
    id,
    children,
  }: {
    title: string;
    id: "category" | "brand" | "color";
    children: React.ReactNode;
  }) => {
    const open = openPanel === id;
    return (
      <div className="border-b border-border pb-3 mb-4">
        <button
          onClick={() => setOpenPanel(open ? null : id)}
          className="flex items-center justify-between w-full editorial-heading text-[10px] py-1"
        >
          {title}
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
        {open && <div className="pt-2">{children}</div>}
      </div>
    );
  };

  return (
    <main className="pt-8 md:pt-10 pb-24 animate-fade-in">
      <div className="max-w-[1500px] mx-auto px-5 md:px-8">
        <div className="flex items-baseline justify-between mb-8">
          <h1 className="section-title !text-left">
            {pageTitle} <span className="text-muted-foreground">({visible.length})</span>
          </h1>
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="editorial-heading text-[10px] flex items-center gap-2"
            >
              Sort: {currentSort} <ChevronDown className="w-3 h-3" />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 bg-background border border-border py-2 min-w-[200px] z-20 animate-fade-in">
                {sortOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setCurrentSort(opt);
                      setSortOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2.5 text-[13px] hover-gray ${
                      currentSort === opt ? "" : "text-muted-foreground"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-10">
          <aside className="hidden lg:block w-[180px] flex-shrink-0">
            <div className="sticky top-28">
              <Panel title="Category" id="category">
                {categoryFilters.map((c) => (
                  <Checkbox
                    key={c.value}
                    label={c.label}
                    checked={filter === c.value}
                    onClick={() => setSearchParams(c.value === "all" ? {} : { filter: c.value })}
                  />
                ))}
              </Panel>

              {availableBrands.length > 0 && (
                <Panel title="Brand" id="brand">
                  {availableBrands.map((b) => (
                    <Checkbox
                      key={b}
                      label={b}
                      checked={selectedBrands.includes(b)}
                      onClick={() =>
                        setSelectedBrands((prev) =>
                          prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
                        )
                      }
                    />
                  ))}
                </Panel>
              )}

              {availableColors.length > 0 && (
                <Panel title="Color" id="color">
                  {availableColors.map((c) => (
                    <Checkbox
                      key={c}
                      label={c}
                      checked={selectedColors.includes(c)}
                      onClick={() =>
                        setSelectedColors((prev) =>
                          prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                        )
                      }
                    />
                  ))}
                </Panel>
              )}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-4 -mx-5 px-5">
              {categoryFilters.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setSearchParams(c.value === "all" ? {} : { filter: c.value })}
                  className={`editorial-heading text-[10px] whitespace-nowrap px-3 py-2 border min-h-[40px] ${
                    filter === c.value ? "bg-foreground text-background border-foreground" : "border-border"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="editorial-heading text-center text-muted-foreground py-24">Loading...</p>
            ) : visible.length === 0 ? (
              <p className="editorial-heading text-center text-muted-foreground py-24">No products found</p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                {visible.map((p) => (
                  <ProductCard key={p.id} product={p} isNew={newIds.includes(p.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Collection;
