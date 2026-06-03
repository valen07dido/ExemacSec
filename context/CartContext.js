'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('genesis_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart from localStorage:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('genesis_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      // Check if product is already in cart
      if (prevCart.some((item) => item.Codigo === product.Codigo)) {
        return prevCart; // Avoid duplicates
      }
      return [...prevCart, product];
    });
  };

  const removeFromCart = (codigo) => {
    setCart((prevCart) => prevCart.filter((item) => item.Codigo !== codigo));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, isLoaded }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
