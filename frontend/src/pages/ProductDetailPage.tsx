"use client";

import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemedCard, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ThemedCard";
import { toast } from "sonner";
import { ProductListing, Storefront } from "@/types/app";
import { ShoppingCart } from "lucide-react";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isBuyer, isParentGuardian, isKidSeller } = useAuth();

  const { data: product, isLoading: isLoadingProduct, error: productError } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
        if (!productId) return null;
        try {
            const res = await api.get(`/products/${productId}`);
            const p = res.data;
            return {
                product_id: p._id || p.id,
                storefront_id: p.storefront_id,
                name: p.name,
                description: p.description,
                price: p.price,
                quantity_available: p.quantity,
                photo_urls: p.images || [],
                created_date: new Date().toISOString(),
                last_modified_date: new Date().toISOString(),
                status: p.status,
                parent_approval_status: p.status === 'pending_approval' ? 'pending' : (p.status === 'active' ? 'approved' : 'rejected'),
                size: p.size,
                materials: p.materials,
                time_required: p.time_required
            } as ProductListing;
        } catch (error) {
             if (axios.isAxiosError(error) && error.response?.status === 404) {
                 return null;
             }
             throw error;
        }
    },
    enabled: !!productId,
  });

  const { data: storefront, isLoading: isLoadingStorefront } = useQuery({
    queryKey: ['storefront', product?.storefront_id],
    queryFn: async () => {
        if (!product?.storefront_id) return null;
        const res = await api.get(`/storefronts/${product.storefront_id}`);
        const data = res.data;
        return {
            storefront_id: data._id || data.id,
            kid_seller_id: data.kid_id,
            display_name: data.display_name,
            description: data.description,
            status: data.status,
            shareable_url: `/store/${data._id || data.id}`,
            created_date: new Date().toISOString(),
            last_modified_date: new Date().toISOString()
        } as Storefront;
    },
    enabled: !!product?.storefront_id,
  });

  useEffect(() => {
      if (productError) {
          toast.error("Failed to load product details.");
          navigate("/marketplace");
      }
      if (product === null && !isLoadingProduct) {
           toast.error("Product not found.");
           navigate("/marketplace");
      }
      
      // Access Control Logic
      if (product && !isLoadingProduct) {
          const isActive = product.status === "active";
          // Allow access if active OR if user is parent/kid seller (likely checking their own/child's items)
          if (!isActive && !isParentGuardian && !isKidSeller) {
              toast.error("Product is not available for sale.");
              navigate("/marketplace");
          }
      }
  }, [product, productError, isLoadingProduct, navigate, isParentGuardian, isKidSeller]);


  const handleAddToCart = () => {
    if (product && storefront) {
      addToCart(product, storefront.display_name);
    }
  };

  if (isLoadingProduct || isLoadingStorefront) {
    return (
      <div className="container mx-auto max-w-6xl p-8 bg-background min-h-[calc(100vh-64px)] text-foreground text-center">
        Loading product details...
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container mx-auto max-w-6xl p-8 bg-background min-h-[calc(100vh-64px)] text-foreground">
      <ThemedCard className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-foreground">{product.name}</CardTitle>
          {storefront && (
            <CardDescription className="text-lg text-muted-foreground">
              By <span className="font-semibold">{storefront.display_name}</span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            {product.photo_urls && product.photo_urls.length > 0 ? (
              <img
                src={product.photo_urls[0]}
                alt={product.name}
                className="w-full max-h-96 object-contain rounded-lg shadow-md"
              />
            ) : (
              <div className="w-full max-h-96 bg-muted flex items-center justify-center rounded-lg text-muted-foreground">
                No Image
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</h3>
              <p className="text-muted-foreground text-sm">
                {product.quantity_available > 0 ? `${product.quantity_available} in stock` : "Sold Out"}
              </p>
              {product.status !== "active" && (
                  <p className="text-amber-600 font-medium mt-2">
                      Status: {product.status.replace('_', ' ')}
                  </p>
              )}
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2 text-foreground">Description</h4>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {(product.size || product.materials || product.time_required) && (
              <div>
                <h4 className="text-lg font-semibold mb-2 text-foreground">Product Details</h4>
                {product.size && <p className="text-muted-foreground">Size: {product.size}</p>}
                {product.materials && <p className="text-muted-foreground">Materials: {product.materials}</p>}
                {product.time_required && <p className="text-muted-foreground">Time/Shipping: {product.time_required}</p>}
              </div>
            )}

            {isBuyer && product.status === "active" && (
              <Button
                className="w-full flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleAddToCart}
                disabled={product.quantity_available <= 0}
              >
                <ShoppingCart className="h-5 w-5" />
                {product.quantity_available > 0 ? "Add to Cart" : "Sold Out"}
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={() => navigate("/marketplace")}>
              Back to Marketplace
            </Button>
          </div>
        </CardContent>
      </ThemedCard>
    </div>
  );
};

export default ProductDetailPage;