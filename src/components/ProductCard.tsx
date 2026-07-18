import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  hoverImage?: string;
  discount_enabled?: boolean;
  discount_type?: string;
  discount_value?: number;
  discount_start?: string | null;
  discount_end?: string | null;
  is_flash_sale?: boolean;
  soldOut?: boolean;
  onQuickAdd?: () => void;
}

const calcFinalPrice = (price: number, type?: string, value?: number) => {
  if (!type || !value) return price;
  if (type === "percentage") return Math.round((price - price * value / 100) * 100) / 100;
  if (type === "fixed") return Math.max(0, Math.round((price - value) * 100) / 100);
  if (type === "override") return Math.round(value * 100) / 100;
  return price;
};

const isDiscountActive = (enabled?: boolean, start?: string | null, end?: string | null) => {
  if (!enabled) return false;
  const now = Date.now();
  if (start && new Date(start).getTime() > now) return false;
  if (end && new Date(end).getTime() < now) return false;
  return true;
};

const ProductCard = ({
  id, name, brand, price, image, hoverImage,
  discount_enabled, discount_type, discount_value, discount_start, discount_end, is_flash_sale,
  soldOut, onQuickAdd,
}: ProductCardProps) => {
  const [hovered, setHovered] = useState(false);

  const active = isDiscountActive(discount_enabled, discount_start, discount_end);
  const finalPrice = active ? calcFinalPrice(price, discount_type, discount_value) : price;
  const pct = active && discount_type === "percentage" && discount_value ? discount_value :
    active && finalPrice < price ? Math.round((1 - finalPrice / price) * 100) : 0;

  return (
    <div
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/product/${id}`} className="block">
        <div className="product-frame mb-3">
          <img
            src={image}
            alt={name}
            className={`absolute inset-0 ${hovered && hoverImage ? 'opacity-0' : 'opacity-100'}`}
            loading="lazy"
          />
          {hoverImage && (
            <img
              src={hoverImage}
              alt={name}
              className={`absolute inset-0 ${hovered ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
            />
          )}

          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="font-mono-ui text-[11px] tracking-[0.3em] px-4 py-1.5 border border-foreground bg-background/90">SOLD</span>
            </div>
          )}

          {active && !soldOut && (
            <span className="absolute top-3 left-3 text-[10px] tracking-[0.1em] uppercase px-2 py-0.5 font-mono-ui" style={{ background: 'hsl(var(--sale))', color: 'white' }}>
              {pct > 0 ? `-${pct}%` : 'SALE'}
            </span>
          )}

          {!soldOut && onQuickAdd && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickAdd(); }}
              className={`absolute bottom-2 right-2 w-9 h-9 flex items-center justify-center bg-foreground text-background transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}
              aria-label="Quick add to cart"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </Link>

      <div className="px-0.5">
        <p className="editorial-heading text-muted-foreground mb-1">{brand}</p>
        <Link to={`/product/${id}`}>
          <p className="product-title mb-1.5 hover:opacity-70 transition-opacity">{name}</p>
        </Link>
        <div className="flex items-center gap-2">
          {active && finalPrice < price ? (
            <>
              <span className="product-price text-muted-foreground line-through">${price.toLocaleString()}</span>
              <span className="product-price" style={{ color: 'hsl(var(--sale))' }}>${finalPrice.toLocaleString()}</span>
            </>
          ) : (
            <span className="product-price">${price.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
