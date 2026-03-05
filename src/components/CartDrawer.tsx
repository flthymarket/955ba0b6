import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Minus, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);

  useEffect(() => { if (open) syncCart(); }, [open, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
      onClose();
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[55] bg-foreground/20" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md z-[60] bg-background border-l border-border animate-slide-in-right">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <span className="editorial-heading">Shopping Bag ({totalItems})</span>
            <button onClick={onClose}><X className="w-4 h-4" /></button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground text-xs tracking-widest uppercase">Your bag is empty</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-6">
              {items.map((item) => {
                const img = item.product.node.images?.edges?.[0]?.node;
                return (
                  <div key={item.variantId} className="flex gap-4">
                    <div className="w-20 h-24 bg-secondary flex-shrink-0 overflow-hidden">
                      {img && <img src={img.url} alt={item.product.node.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-light tracking-wide truncate">{item.product.node.title}</p>
                      <p className="text-[9px] text-muted-foreground tracking-widest mt-0.5">
                        {item.selectedOptions.map(o => o.value).join(' · ')}
                      </p>
                      <p className="text-[11px] font-light mt-1">
                        {item.price.currencyCode} {parseFloat(item.price.amount).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-border">
                          <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center"><Minus className="w-2.5 h-2.5" /></button>
                          <span className="w-7 h-7 flex items-center justify-center text-[10px] border-x border-border">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center"><Plus className="w-2.5 h-2.5" /></button>
                        </div>
                        <button onClick={() => removeItem(item.variantId)} className="text-muted-foreground hover:text-foreground">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-border pt-4 mt-4 space-y-4">
            {items.length > 0 && (
              <>
                <div className="flex justify-between text-[11px] tracking-widest uppercase font-light">
                  <span>Subtotal</span>
                  <span>{items[0]?.price.currencyCode || 'USD'} {totalPrice.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isLoading || isSyncing}
                  className="w-full bg-primary text-primary-foreground py-4 editorial-heading text-[11px] hover:opacity-80 transition-opacity min-h-[48px] flex items-center justify-center gap-2"
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="w-3.5 h-3.5" />
                      Checkout
                    </>
                  )}
                </button>
              </>
            )}
            <Link to="/collection" onClick={onClose}
              className="block w-full border border-border text-center py-3 editorial-heading text-[11px] hover:border-foreground transition-all">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
