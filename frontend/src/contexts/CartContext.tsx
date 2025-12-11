"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, ProductListing } from "@/types/app";
import { toast } from "sonner";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: ProductListing, storefrontDisplayName: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const storedCart = localStorage.getItem("cartItems");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: ProductListing, storefrontDisplayName: string) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product_id === product.product_id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        if (newQuantity > product.quantity_available) {
          toast.error(`Cannot add more than ${product.quantity_available} of "${product.name}" to cart.`);
          return prevItems;
        }
        toast.success(`Added another "${product.name}" to cart.`);
        return prevItems.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        if (product.quantity_available === 0) {
          toast.error(`"${product.name}" is sold out.`);
          return prevItems;
        }
        toast.success(`Added "${product.name}" to cart.`);
        return [
          ...prevItems,
          {
            product_id: product.product_id,
            name: product.name,
            price: product.price,
            quantity: 1,
            photo_url: product.photo_urls[0] || "/placeholder.svg",
            storefront_display_name: storefrontDisplayName,
            max_quantity: product.quantity_available,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => {
      const removedItem = prevItems.find(item => item.product_id === productId);
      if (removedItem) {
        toast.info(`Removed "${removedItem.name}" from cart.`);
      }
      return prevItems.filter((item) => item.product_id !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        if (item.product_id === productId) {
          // Check against the max_quantity stored in the item itself (snapshot at add time)
          // In a real app, you might want to fetch the fresh available quantity here to be safe
          if (quantity > item.max_quantity) {
            toast.error(`Cannot add more than ${item.max_quantity} of "${item.name}" to cart.`);
            return { ...item, quantity: item.max_quantity }; // Cap at max available
          }
          if (quantity < 1) {
            toast.info(`Removed "${item.name}" from cart.`);
            return null; // Remove item if quantity is 0 or less
          }
          return { ...item, quantity };
        }
        return item;
      }).filter(Boolean) as CartItem[]; // Filter out nulls (removed items)
      return updatedItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    toast.info("Your cart has been cleared.");
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);


  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};