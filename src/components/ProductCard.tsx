import { useState } from "react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  hoverImage?: string;
}

const ProductCard = ({ id, name, brand, price, image, hoverImage }: ProductCardProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/product/${id}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="aspect-[3/4] overflow-hidden mb-4 bg-secondary">
        <img
          src={hovered && hoverImage ? hoverImage : image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <p className="editorial-heading text-[9px] text-muted-foreground mb-1">{brand}</p>
      <p className="product-title text-[10px] mb-1">{name}</p>
      <p className="product-price text-[10px]">${price.toLocaleString()}</p>
    </Link>
  );
};

export default ProductCard;
