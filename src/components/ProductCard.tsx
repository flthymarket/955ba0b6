import { useState } from "react";
import { Link } from "react-router-dom";

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
}: ProductCardProps) => {
  const [hovered, setHovered] = useState(false);

  const active = isDiscountActive(discount_enabled, discount_start, discount_end);
  const finalPrice = active ? calcFinalPrice(price, discount_type, discount_value) : price;
  const pct = active && discount_type === "percentage" && discount_value ? discount_value : 
    active && finalPrice < price ? Math.round((1 - finalPrice / price) * 100) : 0;

  return (
    <Link
      to={`/product/${id}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="aspect-[3/4] overflow-hidden mb-4 bg-secondary relative">
        <img
          src={hovered && hoverImage ? hoverImage : image}
          alt={name}
          className="w-full h-full object-cover transition-opacity duration-500"
          loading="lazy"
        />
        {active && is_flash_sale && (
          <span className="absolute top-3 right-3 text-[10px] tracking-[0.1em] uppercase font-light px-2.5 py-1 border border-[hsl(352,82%,38%)] text-[hsl(352,82%,38%)] bg-background/80 rounded-full">
            Flash
          </span>
        )}
      </div>
      <p className="editorial-heading text-[9px] text-muted-foreground mb-1">{brand}</p>
      <p className="product-title text-[10px] mb-1">{name}</p>
      <div className="flex items-center gap-2">
        {active && finalPrice < price ? (
          <>
            <span className="text-[10px] tracking-[0.1em] font-light text-muted-foreground line-through">${price.toLocaleString()}</span>
            <span className="product-price text-[10px]">${finalPrice.toLocaleString()}</span>
            {pct > 0 && <span className="text-[10px] text-[hsl(352,82%,38%)] font-light">-{pct}%</span>}
          </>
        ) : (
          <span className="product-price text-[10px]">${price.toLocaleString()}</span>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
