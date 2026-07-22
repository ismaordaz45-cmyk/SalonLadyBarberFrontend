import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getStoredUser } from "../auth/session";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());

  // Detectar cambios en el usuario logueado en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const current = getStoredUser();
      const currentId = current ? current.id : null;
      const userId = user ? user.id : null;
      if (currentId !== userId) {
        setUser(current);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [user]);

  const [cart, setCart] = useState(() => {
    const activeUser = getStoredUser();
    const cartKey = activeUser ? `lady_barber_cart_${activeUser.id}` : "lady_barber_cart_guest";
    const savedCart = localStorage.getItem(cartKey);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const lastUserIdRef = useRef(user ? user.id : null);

  // Sincronizar el carrito del usuario de forma independiente
  useEffect(() => {
    const userId = user ? user.id : null;
    if (userId !== lastUserIdRef.current) {
      lastUserIdRef.current = userId;
      const cartKey = user ? `lady_barber_cart_${user.id}` : "lady_barber_cart_guest";
      const savedCart = localStorage.getItem(cartKey);
      setCart(savedCart ? JSON.parse(savedCart) : []);
    } else {
      const cartKey = user ? `lady_barber_cart_${user.id}` : "lady_barber_cart_guest";
      localStorage.setItem(cartKey, JSON.stringify(cart));
    }
  }, [cart, user]);

  const addToCart = (product) => {
    // Normalizar el precio: los insumos vienen con precioUnitario, el carrito/MP necesita precioVenta
    const normalizedProduct = {
      ...product,
      precioVenta: Number(product.precioVenta ?? product.precioUnitario ?? 0)
    };
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === normalizedProduct.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === normalizedProduct.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prevCart, { ...normalizedProduct, cantidad: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, cantidad: quantity } : item
      )
    );
  };

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.cantidad * (item.precioVenta || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
