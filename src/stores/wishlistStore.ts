import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

interface WishlistStore {
  ids: string[];
  loaded: boolean;
  load: (userId: string | null) => Promise<void>;
  has: (productId: string) => boolean;
  toggle: (userId: string, productId: string) => Promise<boolean>;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  ids: [],
  loaded: false,

  load: async (userId) => {
    if (!userId) {
      set({ ids: [], loaded: true });
      return;
    }
    const { data } = await supabase.from("wishlist").select("product_id").eq("user_id", userId);
    set({ ids: (data || []).map((r) => r.product_id), loaded: true });
  },

  has: (productId) => get().ids.includes(productId),

  toggle: async (userId, productId) => {
    const saved = get().ids.includes(productId);
    if (saved) {
      set({ ids: get().ids.filter((id) => id !== productId) });
      await supabase.from("wishlist").delete().eq("user_id", userId).eq("product_id", productId);
      return false;
    }
    set({ ids: [...get().ids, productId] });
    await supabase.from("wishlist").insert({ user_id: userId, product_id: productId });
    return true;
  },
}));
