import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export interface CartItem {
  id: string; // Helper ID
  productId: string; // Product UUID
  name: string;
  price: number;
  image_url?: string;
  quantity: number;
  description?: string;
  category?: string;
  metadata?: Record<string, any>;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  toggleCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  totalItems: () => number;
  subtotal: () => number;
  syncWithUser: () => Promise<void>;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: true,
      setLoading: (isLoading) => set({ isLoading }),

      addItem: async (newItem) => {
        // Optimistic Update
        const state = get();
        const existingItemIndex = state.items.findIndex(
          (item) => item.id === newItem.id
        );

        let updatedItems = [...state.items];
        if (existingItemIndex > -1) {
          updatedItems[existingItemIndex].quantity += newItem.quantity;
        } else {
          updatedItems.push(newItem);
        }

        set({ items: updatedItems, isOpen: true });

        // DB Sync
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            const { data: existingRows } = await supabase
              .from('cart_items')
              .select('*')
              .eq('user_id', user.id)
              .eq('product_id', newItem.productId);

            // Filter by metadata match in JS
            const match = existingRows?.find(row =>
              JSON.stringify(row.metadata) === JSON.stringify(newItem.metadata)
            );

            if (match) {
              // Update quantity
              const newQty = match.quantity + newItem.quantity;
              await supabase
                .from('cart_items')
                .update({ quantity: newQty })
                .eq('id', match.id);
            } else {
              // Insert
              await supabase.from('cart_items').insert({
                user_id: user.id,
                product_id: newItem.productId,
                quantity: newItem.quantity,
                unit_price: newItem.price,
                metadata: newItem.metadata || {}
              });
            }

            // Fresh sync to normalize IDs
            await get().syncWithUser();

          } catch (error) {
            console.error("Cart sync error:", error);
          }
        }
      },

      removeItem: async (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('cart_items').delete().eq('id', itemId);
        }
      },

      updateQuantity: async (itemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== itemId) };
          }
          return {
            items: state.items.map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            ),
          };
        });

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (quantity <= 0) {
            await supabase.from('cart_items').delete().eq('id', itemId);
          } else {
            await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
          }
        }
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      setIsOpen: (isOpen) => set({ isOpen }),

      totalItems: () => {
        const state = get();
        return state.items.length;
      },

      subtotal: () => {
        const state = get();
        return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      syncWithUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: cartItems, error } = await supabase
          .from('cart_items')
          .select('*, products(*)')
          .eq('user_id', user.id);

        if (error) {
          console.error("Error fetching cart (sync):", error);
          return;
        }

        if (cartItems) {
          const items: CartItem[] = cartItems.map((row: any) => {
            return {
              id: row.id,
              productId: row.product_id,
              name: row.products.name,
              price: row.unit_price,
              image_url: row.products.image_url,
              quantity: row.quantity,
              description: row.products.description,
              category: row.products.product_type,
              metadata: row.metadata
            };
          });
          set({ items });
        }
      }
    }),
    {
      name: 'sai-bakery-cart',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        console.log('Hydration finished');
        state?.setLoading(false);
      }
    }
  )
);
