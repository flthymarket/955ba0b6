import { useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

const filterSections = [
  { label: "Brand", options: ["Saint Laurent", "Balenciaga", "Bottega Veneta", "Tom Ford"] },
  { label: "Category", options: ["Clothing", "Footwear", "Accessories"] },
  { label: "Condition", options: ["Pristine", "Excellent", "Great", "Good", "Fair"] },
  { label: "Size", options: ["XS", "S", "M", "L", "XL", "OS"] },
];

const sortOptions = ["Newest", "Price: Low to High", "Price: High to Low"];

const Collection = () => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [sortOpen, setSortOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState("Newest");

  const toggleSection = (label: string) => {
    setOpenSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  return (
    <main className="pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <h1 className="section-title mb-16">Collection</h1>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-10 border-b border-border pb-4">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="nav-link flex items-center gap-2"
          >
            <SlidersHorizontal className="w-3 h-3" />
            {filtersOpen ? "Hide Filters" : "Show Filters"}
          </button>
          <span className="text-[10px] text-muted-foreground tracking-widest">
            {products.length} ITEMS
          </span>
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="nav-link flex items-center gap-2"
            >
              Sort: {currentSort} <ChevronDown className="w-3 h-3" />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 bg-background border border-border py-2 px-4 min-w-[180px] z-10">
                {sortOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setCurrentSort(opt);
                      setSortOpen(false);
                    }}
                    className={`block w-full text-left py-2 nav-link text-[9px] ${
                      currentSort === opt ? "opacity-100" : "opacity-50"
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
          {/* Filters sidebar */}
          {filtersOpen && (
            <aside className="w-60 flex-shrink-0 hidden md:block">
              {filterSections.map((section) => (
                <div key={section.label} className="border-b border-border py-4">
                  <button
                    onClick={() => toggleSection(section.label)}
                    className="w-full flex items-center justify-between nav-link text-[10px]"
                  >
                    {section.label}
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        openSections.includes(section.label) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openSections.includes(section.label) && (
                    <div className="mt-3 flex flex-col gap-2">
                      {section.options.map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="w-3 h-3 appearance-none border border-foreground checked:bg-foreground cursor-pointer"
                          />
                          <span className="text-[10px] tracking-wide font-light">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </aside>
          )}

          {/* Product grid */}
          <div className="flex-1">
            <div className={`grid gap-6 ${filtersOpen ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Collection;
