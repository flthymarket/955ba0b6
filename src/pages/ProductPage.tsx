import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const conditionLevels = ["Fair", "Good", "Great", "Excellent", "Pristine"];

const ProductPage = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <main className="pt-40 pb-24 text-center">
        <p className="editorial-heading">Product not found</p>
      </main>
    );
  }

  const related = products.filter((p) => p.id !== product.id).slice(0, 4);
  const conditionIndex = conditionLevels.indexOf(product.condition);

  return (
    <main className="pt-36 lg:pt-44 pb-24">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="mb-10">
          <span className="text-[9px] tracking-widest text-muted-foreground font-light">
            <Link to="/" className="hover:opacity-50 transition-opacity">HOME</Link>
            {" / "}
            <Link to="/collection" className="hover:opacity-50 transition-opacity">COLLECTION</Link>
            {" / "}
            <span className="text-foreground">{product.name.toUpperCase()}</span>
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left - Image */}
          <div>
            <div className="aspect-[3/4] bg-secondary overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right - Details */}
          <div className="lg:pt-4">
            <p className="editorial-heading text-[9px] text-muted-foreground mb-2">
              {product.brand}
            </p>
            <h1 className="text-lg md:text-xl tracking-[0.15em] font-extralight mb-2">
              {product.name.toUpperCase()}
            </h1>
            <p className="text-sm tracking-[0.1em] font-light mb-8">
              ${product.price.toLocaleString()}
            </p>

            {/* Size selector */}
            <div className="mb-6">
              <p className="editorial-heading text-[9px] mb-3">Size</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[44px] h-10 border text-[10px] tracking-widest font-light transition-all ${
                      selectedSize === size
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="editorial-heading text-[9px] mb-3">Quantity</p>
              <div className="flex items-center border border-border w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:opacity-50 transition-opacity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-12 h-10 flex items-center justify-center text-[11px] tracking-widest border-x border-border">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:opacity-50 transition-opacity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 mb-10">
              <button className="w-full bg-primary text-primary-foreground py-4 editorial-heading text-[11px] hover:opacity-80 transition-opacity min-h-[48px]">
                Add to Cart
              </button>
              <button className="w-full border border-foreground py-4 editorial-heading text-[11px] hover:bg-foreground hover:text-background transition-all duration-300 min-h-[48px]">
                Buy Now
              </button>
              <button className="w-full border border-border py-4 editorial-heading text-[11px] hover:border-foreground transition-all duration-300 min-h-[48px]">
                Make an Offer
              </button>
            </div>

            {/* Product details */}
            <div className="border-t border-border pt-8 mb-8 space-y-3">
              <p className="editorial-heading text-[9px] mb-4">Product Details</p>
              <p className="text-[11px] font-light leading-relaxed text-muted-foreground mb-4">
                {product.description}
              </p>
              <div className="grid grid-cols-2 gap-y-2 text-[10px] font-light">
                <span className="text-muted-foreground tracking-wide">Color</span>
                <span className="tracking-wide">{product.color}</span>
                <span className="text-muted-foreground tracking-wide">Material</span>
                <span className="tracking-wide">{product.material}</span>
                <span className="text-muted-foreground tracking-wide">Length</span>
                <span className="tracking-wide">{product.measurements.length}</span>
                <span className="text-muted-foreground tracking-wide">Width</span>
                <span className="tracking-wide">{product.measurements.width}</span>
              </div>
            </div>

            {/* Condition */}
            <div className="border-t border-border pt-8 mb-8">
              <p className="editorial-heading text-[9px] mb-4">Condition</p>
              <div className="flex gap-2 mb-3">
                {conditionLevels.map((level, i) => (
                  <span
                    key={level}
                    className={`text-[8px] tracking-[0.15em] uppercase px-3 py-1 border ${
                      i <= conditionIndex
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {level}
                  </span>
                ))}
              </div>
              <p className="text-[11px] font-light text-muted-foreground">
                <span className="text-foreground">{product.condition} Overall Condition</span>
                <br />
                {product.conditionDescription}
              </p>
            </div>

            {/* Authenticity */}
            <div className="border-t border-border pt-8">
              <p className="editorial-heading text-[9px] mb-4">Guaranteed Authenticity</p>
              <p className="text-[11px] font-light leading-relaxed text-muted-foreground">
                Every item is rigorously authenticated by our experts. All photos are of the actual product you will receive. We stand behind the authenticity of each item sold.
              </p>
            </div>
          </div>
        </div>

        {/* You May Also Like */}
        <section className="mt-24">
          <h2 className="section-title">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProductPage;
