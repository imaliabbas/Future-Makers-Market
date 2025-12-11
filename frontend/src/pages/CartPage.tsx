"use client";

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ThemedCard, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ThemedCard"; // Use ThemedCard
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const CartPage = () => {
  const { cartItems, cartTotal, cartItemCount, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (productId: string, newQuantity: string) => {
    const quantity = parseInt(newQuantity, 10);
    if (!isNaN(quantity)) {
      updateQuantity(productId, quantity);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    // For MVP, this is a mock checkout. In a real app, this would lead to a checkout process.
    toast.success("Proceeding to mock checkout! (Not implemented in MVP)");
    console.log("Mock Checkout initiated with items:", cartItems);
    // clearCart(); // Optionally clear cart after mock checkout
    // navigate("/checkout-success"); // Or to a mock success page
  };

  return (
    <div className="container mx-auto max-w-6xl p-8 bg-background min-h-[calc(100vh-64px)] text-foreground">
      <h1 className="text-4xl font-extrabold mb-4 text-center text-foreground">Your Shopping Cart</h1>
      <p className="text-xl text-center text-muted-foreground mb-10">
        You have {cartItemCount} item{cartItemCount !== 1 ? "s" : ""} in your cart.
      </p>

      {cartItems.length === 0 ? (
        <ThemedCard className="w-full max-w-2xl mx-auto text-center py-10"> {/* Use ThemedCard here */}
          <CardTitle className="mb-4 text-foreground">Your cart is empty!</CardTitle>
          <CardDescription className="mb-6 text-muted-foreground">
            Looks like you haven't added anything to your cart yet.
          </CardDescription>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg text-base font-semibold">
            <Link to="/marketplace">Start Shopping</Link>
          </Button>
        </ThemedCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <ThemedCard key={item.product_id} className="flex items-center p-4"> {/* Use ThemedCard here */}
                <img
                  src={item.photo_url.startsWith('http') || item.photo_url === "/placeholder.svg" ? item.photo_url : `http://localhost:8000${item.photo_url}`}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-md mr-4"
                />
                <div className="flex-grow grid gap-1">
                  <Link to={`/product/${item.product_id}`} className="font-semibold text-lg hover:underline text-foreground">
                    {item.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">By {item.storefront_display_name}</p>
                  <p className="text-md font-bold text-primary">${item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Label htmlFor={`quantity-${item.product_id}`} className="sr-only">Quantity</Label>
                    <Input
                      id={`quantity-${item.product_id}`}
                      type="number"
                      min="1"
                      max={item.max_quantity}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.product_id, e.target.value)}
                      className="w-20"
                    />
                    <Button variant="destructive" size="icon" onClick={() => removeFromCart(item.product_id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                </div>
                <div className="text-right font-bold text-lg text-foreground">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </ThemedCard>
            ))}
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          </div>

          <ThemedCard className="lg:col-span-1 h-fit sticky top-20"> {/* Use ThemedCard here */}
            <CardHeader>
              <CardTitle className="text-foreground">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Subtotal ({cartItemCount} items)</p>
                <p className="text-foreground">${cartTotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Shipping (Mock)</p>
                <p className="text-foreground">$0.00</p>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-xl">
                <p className="text-foreground">Total</p>
                <p className="text-primary">${cartTotal.toFixed(2)}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </CardFooter>
          </ThemedCard>
        </div>
      )}
    </div>
  );
};

export default CartPage;