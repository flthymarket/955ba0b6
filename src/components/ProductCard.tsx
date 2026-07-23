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
  id, name, price, image, hoverImage,
  discount_enabled, discount_type, discount_value, discount_start, discount_end,
  soldOut,
}: ProductCardProps) => {
  const [hovered, setHovered] = useState(false);

  const active = isDiscountActive(discount_enabled, discount_start, discount_end);
  const finalPrice = active ? calcFinalPrice(price, discount_type, discount_value) : price;

  return (
    <Link
      to={`/product/${id}`}
      className="block group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="product-frame mb-5">
        <img
          src={image}
          alt={name}
          className={hovered && hoverImage ? 'opacity-0 absolute inset-0 m-auto' : 'opacity-100'}
          loading="lazy"
        />
        {hoverImage && (
          <img
            src={hoverImage}
            alt={name}
            className={`absolute inset-0 m-auto ${hovered ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
          />
        )}

        {soldOut && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pointer-events-none pb-2">
            <span className="font-mono-ui text-[11px] px-3 py-1 bg-foreground text-background">SOLD OUT</span>
          </div>
        )}
      </div>

      <p className="product-title max-w-[75%] mx-auto pb-1">{name}</p>
      {active && finalPrice < price ? (
        <p className="product-price">
          <span className="line-through opacity-50 mr-2">${price.toLocaleString()}</span>
          <span style={{ color: 'hsl(var(--sale))' }}>${finalPrice.toLocaleString()}</span>
        </p>
      ) : (
        <p className="product-price">${price.toLocaleString()}</p>
      )}
    </Link>
  );
};

export default ProductCard;
