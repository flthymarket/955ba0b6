import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import storyImage from "@/assets/story-image.jpg";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

const brands = ["SAINT LAURENT", "BALENCIAGA", "BOTTEGA VENETA", "TOM FORD", "GUCCI", "PRADA"];

const Index = () => {
  return (
    <main>
      {/* Hero */}
      <section className="relative h-screen">
        <img
          src={heroImage}
          alt="Campaign"
          className="w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-foreground/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground">
          <h1 className="text-[13px] md:text-[15px] tracking-[0.5em] font-extralight mb-6">
            NEW ARRIVALS
          </h1>
          <Link
            to="/collection"
            className="border border-primary-foreground px-8 py-3 text-[10px] tracking-[0.3em] font-light hover:bg-primary-foreground hover:text-primary transition-all duration-500"
          >
            SHOP NOW
          </Link>
        </div>
      </section>

      {/* Curated Drops */}
      <section className="max-w-[1400px] mx-auto px-6 py-24">
        <h2 className="section-title">Curated Drops</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* Featured Brands */}
      <section className="border-t border-b border-border py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="section-title">Featured Brands</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {brands.map((brand) => (
              <Link
                key={brand}
                to={`/collection?brand=${brand}`}
                className="flex items-center justify-center py-6 border border-border hover:bg-foreground hover:text-background transition-all duration-500"
              >
                <span className="text-[10px] tracking-[0.2em] font-extralight">{brand}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="max-w-[1400px] mx-auto px-6 py-24">
        <h2 className="section-title">Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="aspect-square overflow-hidden">
            <img
              src={storyImage}
              alt="Editorial"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
          <div className="flex flex-col justify-center p-12 md:p-20">
            <span className="editorial-heading text-[9px] text-muted-foreground mb-4">Archive 001</span>
            <h3 className="text-xl md:text-2xl tracking-[0.2em] font-extralight mb-6">
              The Art of Preservation
            </h3>
            <p className="text-[11px] leading-relaxed text-muted-foreground font-light mb-8 max-w-sm">
              How luxury garments transcend seasons and become artifacts worthy of archival. An exploration of craft, care, and timeless design.
            </p>
            <Link
              to="/stories"
              className="editorial-heading text-[10px] border-b border-foreground self-start pb-1 hover:opacity-50 transition-opacity"
            >
              Read More
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
