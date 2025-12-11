"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ProductListing } from "@/types/app";
import { ThemedCard, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ThemedCard";
import { Button } from "@/components/ui/button";
import { FancyButton } from "@/components/FancyButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
// import { useDebounce } from "use-debounce";

const MarketplacePage = () => {
  const { addToCart } = useCart();
  const { isBuyer } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: activeProducts, isLoading } = useQuery({
    queryKey: ['marketplace', 'products', debouncedSearchTerm],
    queryFn: async () => {
        const response = await api.get("/products/marketplace", {
            params: { search: debouncedSearchTerm }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return response.data.map((p: any) => ({
          ...p,
          product_id: p._id,
          photo_urls: (p.images || []).map((url: string) =>
            url.startsWith('http') ? url : `http://localhost:8000${url}`
          ),
          quantity_available: p.quantity,
          storefront_name: p.storefront_name
        })) as ProductListing[];
    },
    // Keep previous data while fetching new search results to avoid flickering
    placeholderData: (previousData) => previousData,
    // Add caching strategy to persist data and reduce loading times
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const handleAddToCart = (product: ProductListing) => {
    if (product.storefront_name) {
      addToCart(product, product.storefront_name);
    } else {
      toast.error("Could not find storefront details for this product.");
    }
  };

  const filteredProducts = activeProducts || [];

  return (
    <div className="container mx-auto max-w-6xl p-8 bg-background min-h-[calc(100vh-64px)] text-foreground">
      <h1 className="text-4xl font-extrabold mb-4 text-center text-foreground">Welcome to the Future Makers Market!</h1>
      <p className="text-xl text-center text-muted-foreground mb-10">
        Browse amazing handmade creations from our talented kid sellers.
      </p>

      {/* Search Bar */}
      <div className="mb-8 max-w-xl mx-auto relative">
        <Label htmlFor="search" className="sr-only">Search products</Label>
        <Input
          id="search"
          type="text"
          placeholder="Search products by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <ThemedCard className="w-full max-w-2xl mx-auto text-center py-10">
          <CardTitle className="mb-4 text-foreground">
            {searchTerm ? "No products found matching your search." : "No products are currently available."}
          </CardTitle>
          <CardDescription className="mb-6 text-muted-foreground">
            {searchTerm ? "Try a different search term or check back later." : "Check back soon for new and exciting creations!"}
          </CardDescription>
          {!searchTerm && (
            <FancyButton onClick={() => navigate("/marketplace")}>
              <span>Start Shopping</span>
            </FancyButton>
          )}
        </ThemedCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            return (
              <ThemedCard key={product.product_id} className="flex flex-col h-full">
                <CardHeader className="p-0">
                  <Link to={`/product/${product.product_id}`}>
                    <img
                      src={product.photo_urls[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-2xl"
                    />
                  </Link>
                </CardHeader>
                <CardContent className="flex-grow p-4">
                  <CardTitle className="text-xl font-semibold mb-2 line-clamp-1 text-foreground">
                    <Link to={`/product/${product.product_id}`} className="hover:underline">
                      {product.name}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2 mb-2 text-muted-foreground">
                    {product.description}
                  </CardDescription>
                  <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
                  {product.storefront_name && (
                    <p className="text-xs text-muted-foreground mt-1">
                      By <span className="font-medium">{product.storefront_name}</span>
                    </p>
                  )}
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                  {isBuyer && (
                    <Button
                      className="w-full flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.quantity_available <= 0}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {product.quantity_available > 0 ? "Add to Cart" : "Sold Out"}
                    </Button>
                  )}
                  <Button variant="outline" className="w-full">
                    <Link to={`/product/${product.product_id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </ThemedCard>
            );
          })}
        </div>
      )}
      <MadeWithDyad />
    </div>
  );
};

export default MarketplacePage;