import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Brand {
  id: string;
  name: string;
}

const BrandsPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("brands").select("id, name").order("name");
      if (error) console.error("Error fetching brands:", error);
      setBrands(
        (data || [])
          .map((b) => ({ ...b, name: b.name.trim() }))
          .filter((b) => b.name)
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
      );
      setLoading(false);
    })();
  }, []);

  // Group alphabetically, skipping letters with no brands
  const groups = brands.reduce<Record<string, Brand[]>>((acc, b) => {
    const letter = /[a-z]/i.test(b.name[0]) ? b.name[0].toUpperCase() : "#";
    (acc[letter] ||= []).push(b);
    return acc;
  }, {});
  const letters = Object.keys(groups).sort();

  return (
    <main className="pt-10 pb-20 animate-fade-in">
      <div className="max-w-[1500px] mx-auto px-5 md:px-8">
        <h1 className="editorial-heading text-[11px] underline underline-offset-4 mb-10">Brands</h1>

        {loading ? (
          <p className="editorial-heading text-muted-foreground py-16">Loading...</p>
        ) : brands.length === 0 ? (
          <p className="editorial-heading text-muted-foreground py-16">No brands yet</p>
        ) : (
          <div className="space-y-10">
            {letters.map((letter) => (
              <section key={letter}>
                <p className="editorial-heading text-[10px] text-muted-foreground border-b border-border pb-2 mb-4">
                  {letter}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-2.5">
                  {groups[letter].map((brand) => (
                    <Link
                      key={brand.id}
                      to={`/collection?brand=${encodeURIComponent(brand.name)}`}
                      className="text-[14px] leading-6 text-muted-foreground hover:text-foreground hover:underline transition-colors"
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default BrandsPage;
