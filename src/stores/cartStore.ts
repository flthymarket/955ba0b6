import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  key: string;
  productId: string;
  slug: string | null;
  name: string;
  image: string;
  size: string | null;
  variantId: string | null;
  price: number;
  quantity: number;
  maxQuantity: number;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  addItem: (item: Omit<CartItem, "key" | "quantity"> & { quantity?: number }) => { ok: boolean; message: string };
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  count: () => number;
}

export const cartKey = (productId: string, size: string | null) => `${productId}::${size ?? "os"}`;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (item) => {
        const key = cartKey(item.productId, item.size);
        const qty = item.quantity ?? 1;
        const existing = get().items.find((i) => i.key === key);
        const max = Math.max(0, item.maxQuantity);

        if (max <= 0) return { ok: false, message: "Out of stock" };

        const currentQty = existing?.quantity ?? 0;
        if (currentQty + qty > max) {
          return {
            ok: false,
            message: currentQty >= max ? `Only ${max} available` : `Only ${max - currentQty} more available`,
          };
        }

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + qty, maxQuantity: max, price: item.price } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, key, quantity: qty, maxQuantity: max }] });
        }
        return { ok: true, message: "Added to bag" };
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) return get().removeItem(key);
        set({
          items: get().items.map((i) =>
            i.key === key ? { ...i, quantity: Math.min(quantity, i.maxQuantity) } : i
          ),
        });
      },

      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),
      clearCart: () => set({ items: [] }),
      subtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    {
      name: "flthy-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
