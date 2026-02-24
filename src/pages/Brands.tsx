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
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

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

  const filteredLetters = activeLetter ? [activeLetter] : alphabet.filter((l) => grouped[l]);

  return (
    <main className="pt-36 pb-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <h1 className="text-lg tracking-[0.3em] font-extralight uppercase text-center mb-12">Designers</h1>

        {/* A-Z Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={() => setActiveLetter(null)}
            className={`w-8 h-8 flex items-center justify-center text-[10px] tracking-widest border transition-all ${
              !activeLetter ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"
            }`}
          >
            All
          </button>
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => setActiveLetter(activeLetter === letter ? null : letter)}
              disabled={!grouped[letter]}
              className={`w-8 h-8 flex items-center justify-center text-[10px] tracking-widest border transition-all ${
                activeLetter === letter
                  ? "bg-foreground text-background border-foreground"
                  : grouped[letter]
                  ? "border-border hover:border-foreground"
                  : "border-border text-muted-foreground/30 cursor-not-allowed"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Brand Grid */}
        {filteredLetters.length === 0 ? (
          <p className="text-center text-muted-foreground text-xs tracking-widest uppercase py-20">
            No brands available yet.
          </p>
        ) : (
          filteredLetters.map((letter) => (
            <div key={letter} className="mb-10">
              <h2 className="text-[14px] tracking-[0.3em] font-extralight uppercase border-b border-border pb-3 mb-6">
                {letter}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {grouped[letter]?.map((brand) => (
                  <Link
                    key={brand.id}
                    to={`/collection?brand=${encodeURIComponent(brand.name)}`}
                    className="flex items-center justify-center py-6 border border-border hover:bg-foreground hover:text-background transition-all duration-500 text-center px-3"
                  >
                    <span className="text-[10px] tracking-[0.15em] font-extralight uppercase">
                      {brand.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
};

export default BrandsPage;
