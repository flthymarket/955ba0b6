import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore } from "@/stores/cartStore";

/** Re-validate cart items against the live database (price, stock, availability). */
export const useCartSync = () => {
  useEffect(() => {
    const sync = async () => {
      const items = useCartStore.getState().items;
      if (items.length === 0) return;

      const ids = Array.from(new Set(items.map((i) => i.productId)));
      const { data } = await supabase
        .from("products")
        .select("id, name, price, sold_out, product_variants ( size, quantity )")
        .in("id", ids);
      if (!data) return;

      const map = new Map(data.map((p) => [p.id, p]));
      const next = items
        .map((item) => {
          const p = map.get(item.productId);
          if (!p || p.sold_out) return null;
          const variants = (p.product_variants || []) as { size: string; quantity: number }[];
          const max = item.size
            ? variants.find((v) => v.size === item.size)?.quantity ?? 0
            : variants.reduce((s, v) => s + (v.quantity || 0), 0) || 99;
          if (max <= 0) return null;
          return { ...item, price: Number(p.price), maxQuantity: max, quantity: Math.min(item.quantity, max) };
        })
        .filter(Boolean) as typeof items;

      const changed =
        next.length !== items.length ||
        next.some((n, i) => n.quantity !== items[i].quantity || n.price !== items[i].price);
      if (changed) useCartStore.setState({ items: next });
    };

    sync();
  }, []);
};
