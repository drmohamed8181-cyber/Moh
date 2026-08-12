"use client";

import { create } from "zustand";

interface WishlistStore {
  ids: string[];
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  reset: () => void;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => Promise<boolean>;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  ids: [],
  loaded: false,
  loading: false,

  load: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      set({ ids: data.ids ?? [], loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  reset: () => set({ ids: [], loaded: false }),

  isWishlisted: (productId) => get().ids.includes(productId),

  toggle: async (productId) => {
    const wasWishlisted = get().ids.includes(productId);
    // Optimistic update
    set((state) => ({
      ids: wasWishlisted ? state.ids.filter((id) => id !== productId) : [...state.ids, productId],
    }));

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) {
        // Revert on failure
        set((state) => ({
          ids: wasWishlisted ? [...state.ids, productId] : state.ids.filter((id) => id !== productId),
        }));
        return res.status === 401 ? false : wasWishlisted;
      }
      const data = await res.json();
      return data.wishlisted;
    } catch {
      set((state) => ({
        ids: wasWishlisted ? [...state.ids, productId] : state.ids.filter((id) => id !== productId),
      }));
      return wasWishlisted;
    }
  },
}));
