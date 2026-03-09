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
    const fetchBrands = async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name")
        .order("name");
      
      if (error) {
        console.error("Error fetching brands:", error);
      }
      
      if (data) {
        // Trim names and filter out empty ones
        setBrands(data.map(b => ({ ...b, name: b.name.trim() })).filter(b => b.name));
      }
      setLoading(false);
    };
    
    fetchBrands();
  }, []);

  return (
    <main className="pt-32 pb-24 min-h-screen">
      <div className="max-w-[800px] mx-auto px-6">
        {/* Header - matches reference exactly */}
        <h1 className="text-[13px] tracking-[0.25em] font-normal uppercase text-center mb-16 text-foreground">
          Brands
        </h1>

        {/* Simple centered vertical list */}
        {loading ? (
          <div className="flex flex-col items-center gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 w-32 bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-10">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                to={`/collection?brand=${encodeURIComponent(brand.name)}`}
                className="text-[13px] tracking-[0.15em] uppercase font-normal text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        )}

        {!loading && brands.length === 0 && (
          <p className="text-center text-muted-foreground text-sm tracking-widest uppercase">
            No brands available
          </p>
        )}
      </div>
    </main>
  );
};

export default BrandsPage;
