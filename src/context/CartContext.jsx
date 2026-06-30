import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("lady_barber_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("lady_barber_cart", JSON.stringify(cart));
  }, [cart]);

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

  const clearCart = () => {
    setCart([]);
  };

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
