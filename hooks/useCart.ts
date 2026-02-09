import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  addItems: (items: CartItem[]) => Promise<void>;
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

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            const { data: existingRows } = await (supabase as any)
              .from('cart_items')
              .select('*')
              .eq('user_id', user.id)
              .eq('product_id', newItem.productId);

            // strict comparison for metadata
            const match = existingRows?.find((row: any) =>
              JSON.stringify(row.metadata) === JSON.stringify(newItem.metadata)
            );

            if (match) {
              const newQty = match.quantity + newItem.quantity;
              await (supabase as any)
                .from('cart_items')
                .update({ quantity: newQty })
                .eq('id', match.id);
            } else {
              await (supabase as any).from('cart_items').insert({
                user_id: user.id,
                product_id: newItem.productId,
                quantity: newItem.quantity,
                unit_price: newItem.price,
                metadata: newItem.metadata || {}
              });
            }

            await get().syncWithUser();

          } catch (error) {
            console.error("Cart sync error:", error);
          }
        }
      },

      addItems: async (newItems) => {
        const state = get();
        let updatedItems = [...state.items];

        for (const newItem of newItems) {
          const existingItemIndex = updatedItems.findIndex(
            (item) => item.id === newItem.id
          );

          if (existingItemIndex > -1) {
            updatedItems[existingItemIndex].quantity += newItem.quantity;
          } else {
            updatedItems.push(newItem);
          }
        }

        set({ items: updatedItems, isOpen: true });

        // sync to DB but don't refetch - we have the data locally already
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            for (const newItem of newItems) {
              const { data: existingRows } = await (supabase as any)
                .from('cart_items')
                .select('*')
                .eq('user_id', user.id)
                .eq('product_id', newItem.productId);

              const match = existingRows?.find((row: any) =>
                JSON.stringify(row.metadata) === JSON.stringify(newItem.metadata)
              );

              if (match) {
                const newQty = match.quantity + newItem.quantity;
                await (supabase as any)
                  .from('cart_items')
                  .update({ quantity: newQty })
                  .eq('id', match.id);
              } else {
                await (supabase as any).from('cart_items').insert({
                  user_id: user.id,
                  product_id: newItem.productId,
                  quantity: newItem.quantity,
                  unit_price: newItem.price,
                  metadata: newItem.metadata || {}
                });
              }
            }
            // don't call syncWithUser here - it overwrites our local state
          } catch (error) {
            console.error("Cart sync error (bulk):", error);
          }
        }
      },

      removeItem: async (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await (supabase as any).from('cart_items').delete().eq('id', itemId);
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
            await (supabase as any).from('cart_items').delete().eq('id', itemId);
          } else {
            await (supabase as any).from('cart_items').update({ quantity }).eq('id', itemId);
          }
        }
      },

      clearCart: async () => {
        set({ items: [] });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await (supabase as any).from('cart_items').delete().eq('user_id', user.id);
        }
      },

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
          const items: CartItem[] = cartItems
            .filter((row: any) => row.products !== null)
            .map((row: any) => ({
              id: row.id,
              productId: row.product_id,
              name: row.products.name,
              price: row.unit_price,
              image_url: row.products.image_url,
              quantity: row.quantity,
              description: row.products.description,
              category: row.products.product_type,
              metadata: row.metadata
            }));
          set({ items });
        }
      }
    }),
    {
      name: 'sai-bakery-cart',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
      }
    }
  )
);
