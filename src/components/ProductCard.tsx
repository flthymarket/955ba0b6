import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  finalPrice,
  isDiscountActive,
  money,
  primaryImage,
  productUrl,
  secondaryImage,
  totalStock,
  type StoreProduct,
} from "@/lib/store";
import { useCartStore } from "@/stores/cartStore";

interface ProductCardProps {
  product: StoreProduct;
  showQuickAdd?: boolean;
}

const ProductCard = ({ product, showQuickAdd = true }: ProductCardProps) => {
  const [hovered, setHovered] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const image = primaryImage(product);
  const hoverImage = secondaryImage(product);
  const active = isDiscountActive(product);
  const price = finalPrice(product);
  const stock = totalStock(product);
  const soldOut = product.sold_out || stock <= 0;
  const singleVariant = product.product_variants.length <= 1;

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.product_variants[0];
    const result = addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image,
      size: variant?.size ?? null,
      variantId: variant?.id ?? null,
      price,
      maxQuantity: variant ? variant.quantity : stock,
    });
    result.ok ? toast.success(result.message) : toast.error(result.message);
  };

  return (
    <Link
      to={productUrl(product)}
      className="block group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="product-frame mb-5">
        {image && (
          <img
            src={image}
            alt={product.name}
            className={hovered && hoverImage ? "opacity-0" : "opacity-100"}
            loading="lazy"
          />
        )}
        {hoverImage && (
          <img
            src={hoverImage}
            alt={product.name}
            className={`absolute inset-0 m-auto ${hovered ? "opacity-100" : "opacity-0"}`}
            loading="lazy"
          />
        )}

        {soldOut && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pointer-events-none pb-2">
            <span className="font-mono-ui text-[11px] px-3 py-1 bg-foreground text-background">SOLD OUT</span>
          </div>
        )}

        {!soldOut && showQuickAdd && singleVariant && (
          <button
            onClick={quickAdd}
            className="absolute inset-x-3 bottom-3 nav-link text-[12px] py-2.5 bg-background border border-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-foreground hover:text-background"
          >
            Quick Add
          </button>
        )}
      </div>

      <p className="product-title max-w-[80%] mx-auto pb-1">{product.name}</p>
      {active && price < product.price ? (
        <p className="product-price">
          <span className="line-through opacity-50 mr-2">{money(product.price)}</span>
          <span style={{ color: "hsl(var(--sale))" }}>{money(price)}</span>
        </p>
      ) : (
        <p className="product-price">{money(product.price)}</p>
      )}
    </Link>
  );
};

export default ProductCard;
