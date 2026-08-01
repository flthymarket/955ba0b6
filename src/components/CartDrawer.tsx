import { Link, useNavigate } from "react-router-dom";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { money } from "@/lib/store";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const { items, updateQuantity, removeItem } = useCartStore();
  const navigate = useNavigate();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[55] bg-foreground/20" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md z-[60] bg-background border-l border-border animate-slide-in-right">
        <div className="p-5 sm:p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <span className="editorial-heading">Bag ({totalItems})</span>
            <button onClick={onClose} aria-label="Close"><X className="w-4 h-4" /></button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="editorial-heading text-muted-foreground">Your bag is empty</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-6">
              {items.map((item) => (
                <div key={item.key} className="flex gap-4">
                  <Link to={`/product/${item.slug || item.productId}`} onClick={onClose} className="w-24 flex-shrink-0">
                    <div className="product-frame">
                      {item.image && <img src={item.image} alt={item.name} />}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="product-title text-left">{item.name}</p>
                    {item.size && <p className="editorial-heading text-muted-foreground mt-1">Size {item.size}</p>}
                    <p className="font-mono-ui text-[13px] mt-1">{money(item.price)}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-border">
                        <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-9 h-9 flex items-center justify-center text-xs border-x border-border">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          disabled={item.quantity >= item.maxQuantity}
                          className="w-9 h-9 flex items-center justify-center disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.key)} className="text-muted-foreground hover:text-foreground">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {item.quantity >= item.maxQuantity && (
                      <p className="editorial-heading text-muted-foreground mt-2">Max {item.maxQuantity} available</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-border pt-4 mt-4 space-y-3">
            {items.length > 0 && (
              <>
                <div className="flex justify-between editorial-heading">
                  <span>Subtotal</span>
                  <span>{money(totalPrice)}</span>
                </div>
                <button
                  onClick={() => { onClose(); navigate("/checkout"); }}
                  className="nav-link w-full bg-foreground text-background py-4 min-h-[48px] hover:opacity-80 transition-opacity"
                >
                  Checkout
                </button>
              </>
            )}
            <Link to="/collection" onClick={onClose} className="nav-link block w-full border border-border text-center py-3.5 min-h-[48px] hover:border-foreground transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
