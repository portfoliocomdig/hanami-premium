import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);
export const TAXA_ENTREGA = 7.9;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // { product, quantity }
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeItem = (productId) => setItems((prev) => prev.filter((i) => i.product.id !== productId));

  const changeQuantity = (productId, delta) => {
    setItems((prev) =>
      prev
        .map((i) => (i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const clear = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0),
    [items]
  );
  const total = subtotal + (items.length ? TAXA_ENTREGA : 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, changeQuantity, clear, subtotal, total, count, isOpen, setIsOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de <CartProvider>');
  return ctx;
}
