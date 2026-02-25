import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  brand: string;
  price: number;
  size: string | null;
  quantity: number;
  image: string;
  maxQty: number;
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const STORAGE_KEY = "flthymrkt_cart";

const getGuestCart = (): CartItem[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
};

const saveGuestCart = (items: CartItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const useCart = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setItems(getGuestCart());
      return;
    }
    setLoading(true);
    const { data } = await supabase.from("cart_items").select("*").eq("user_id", user.id);
    if (data && data.length > 0) {
      const productIds = [...new Set(data.map((d) => d.product_id))];
      const [{ data: products }, { data: images }, { data: variants }] = await Promise.all([
        supabase.from("products").select("id, name, price, brands(name)").in("id", productIds),
        supabase.from("product_images").select("product_id, url").in("product_id", productIds),
        supabase.from("product_variants").select("product_id, size, quantity").in("product_id", productIds),
      ]);

      const imgMap: Record<string, string> = {};
      images?.forEach((i) => { if (!imgMap[i.product_id]) imgMap[i.product_id] = i.url; });
      const prodMap: Record<string, any> = {};
      products?.forEach((p) => { prodMap[p.id] = p; });
      const varMap: Record<string, number> = {};
      variants?.forEach((v) => { varMap[`${v.product_id}_${v.size}`] = v.quantity; });

      setItems(data.map((d) => ({
        id: d.id,
        product_id: d.product_id,
        name: prodMap[d.product_id]?.name || "",
        brand: (prodMap[d.product_id]?.brands as any)?.name || "",
        price: prodMap[d.product_id]?.price || 0,
        size: d.size,
        quantity: d.quantity,
        image: imgMap[d.product_id] || "/placeholder.svg",
        maxQty: varMap[`${d.product_id}_${d.size}`] || 1,
      })));
    } else {
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (item: Omit<CartItem, "id">) => {
    if (!user) {
      const cart = getGuestCart();
      const existing = cart.find((c) => c.product_id === item.product_id && c.size === item.size);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + item.quantity, item.maxQty);
      } else {
        cart.push({ ...item, id: `guest_${Date.now()}` });
      }
      saveGuestCart(cart);
      setItems(cart);
      return;
    }

    const { data: existing } = await supabase.from("cart_items")
      .select("id, quantity").eq("user_id", user.id).eq("product_id", item.product_id).eq("size", item.size || "").single();

    if (existing) {
      await supabase.from("cart_items").update({ quantity: Math.min(existing.quantity + item.quantity, item.maxQty) }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        user_id: user.id, product_id: item.product_id, size: item.size, quantity: item.quantity,
      });
    }
    fetchCart();
  };

  const updateQuantity = async (cartItemId: string, qty: number) => {
    if (!user) {
      const cart = getGuestCart();
      const item = cart.find((c) => c.id === cartItemId);
      if (item) item.quantity = qty;
      saveGuestCart(cart);
      setItems([...cart]);
      return;
    }
    await supabase.from("cart_items").update({ quantity: qty }).eq("id", cartItemId);
    fetchCart();
  };

  const removeItem = async (cartItemId: string) => {
    if (!user) {
      const cart = getGuestCart().filter((c) => c.id !== cartItemId);
      saveGuestCart(cart);
      setItems(cart);
      return;
    }
    await supabase.from("cart_items").delete().eq("id", cartItemId);
    fetchCart();
  };

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return { items, cartCount, subtotal, addToCart, updateQuantity, removeItem, loading, fetchCart };
};

const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[55] bg-foreground/20" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md z-[60] bg-background border-l border-border animate-slide-in-right">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <span className="editorial-heading">Shopping Bag ({items.length})</span>
            <button onClick={onClose}><X className="w-4 h-4" /></button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground text-xs tracking-widest uppercase">Your bag is empty</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-24 bg-secondary flex-shrink-0 overflow-hidden">
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-muted-foreground tracking-widest uppercase">{item.brand}</p>
                    <p className="text-[11px] font-light tracking-wide truncate">{item.name}</p>
                    {item.size && <p className="text-[9px] text-muted-foreground tracking-widest mt-1">Size: {item.size}</p>}
                    <p className="text-[11px] font-light mt-1">${item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-border">
                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 flex items-center justify-center"><Minus className="w-2.5 h-2.5" /></button>
                        <span className="w-7 h-7 flex items-center justify-center text-[10px] border-x border-border">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, Math.min(item.maxQty, item.quantity + 1))}
                          className="w-7 h-7 flex items-center justify-center"><Plus className="w-2.5 h-2.5" /></button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-foreground">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-border pt-4 mt-4 space-y-4">
            {items.length > 0 && (
              <>
                <div className="flex justify-between text-[11px] tracking-widest uppercase font-light">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <button className="w-full bg-primary text-primary-foreground py-4 editorial-heading text-[11px] hover:opacity-80 transition-opacity min-h-[48px]">
                  Checkout
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
