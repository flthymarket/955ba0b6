import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const BrandsPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    supabase.from("brands").select("*").order("name").then(({ data }) => {
      if (data) setBrands(data);
    });
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, Brand[]> = {};
    brands.forEach((b) => {
      const letter = b.name[0]?.toUpperCase() || "#";
      if (!map[letter]) map[letter] = [];
      map[letter].push(b);
    });
    return map;
  }, [brands]);

  return (
    <main className="pt-36 pb-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <h1 className="text-lg tracking-[0.3em] font-extralight uppercase text-center mb-16">Designers</h1>

        {/* Alphabetical scroll-through grid */}
        <div className="space-y-12">
          {alphabet.map((letter) => (
            <div key={letter}>
              <h2 className="text-[14px] tracking-[0.3em] font-extralight uppercase border-b border-border pb-3 mb-6">
                {letter}
              </h2>
              {grouped[letter] && grouped[letter].length > 0 ? (
                <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                  {grouped[letter].map((brand) => (
                    <Link
                      key={brand.id}
                      to={`/collection?brand=${encodeURIComponent(brand.name)}`}
                      className="text-[11px] tracking-[0.1em] font-light hover:opacity-50 transition-opacity duration-300 py-1"
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="h-6" />
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default BrandsPage;
