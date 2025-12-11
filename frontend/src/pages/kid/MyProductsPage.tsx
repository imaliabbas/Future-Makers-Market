"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
// import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { ThemedCard, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ThemedCard";
import { toast } from "sonner";
import { ProductListing, Storefront } from "@/types/app";
import { PlusCircle, Edit, Trash2, Send, Loader2 } from "lucide-react";
import api from "@/lib/api";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MadeWithDyad } from "@/components/made-with-dyad";

const MyProductsPage = () => {
  const { currentUser, isKidSeller } = useAuth();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isKidSeller || !currentUser) {
      toast.error("Access Denied: You must be a Kid Seller to view this page.");
      navigate("/login");
    }
  }, [currentUser, isKidSeller, navigate]);

  const { data: myStorefront, isLoading: isStorefrontLoading } = useQuery({
    queryKey: ['storefront', 'mine'],
    queryFn: async () => {
      try {
        const sfResponse = await api.get('/storefronts/mine');
        const storefrontData = sfResponse.data;
        return {
            storefront_id: storefrontData._id || storefrontData.id,
            kid_seller_id: storefrontData.kid_id,
            display_name: storefrontData.display_name,
            description: storefrontData.description,
            status: storefrontData.status,
            shareable_url: `/store/${storefrontData._id || storefrontData.id}`,
            created_date: new Date().toISOString(), // Mock
            last_modified_date: new Date().toISOString() // Mock
        } as Storefront;
      } catch (err) {
         if (axios.isAxiosError(err) && err.response && err.response.status === 404) {
             return null;
         }
         throw err;
      }
    },
    enabled: !!isKidSeller,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const { data: myProducts = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', 'mine'],
    queryFn: async () => {
        const prodResponse = await api.get('/products/mine');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return prodResponse.data.map((p: any) => ({
            product_id: p._id || p.id,
            storefront_id: p.storefront_id,
            name: p.name,
            description: p.description,
            price: p.price,
            quantity_available: p.quantity,
            photo_urls: (p.images || []).map((url: string) =>
                url.startsWith('http') ? url : `https://future-makers-market-backend.onrender.com${url}`
            ),
            // Mapping extra fields if backend returns them, or defaults
            created_date: new Date().toISOString(),
            last_modified_date: new Date().toISOString(),
            status: p.status,
            parent_approval_status: p.status === 'pending_approval' ? 'pending' : (p.status === 'active' ? 'approved' : 'rejected'),
        })) as ProductListing[];
    },
    enabled: !!isKidSeller && !!myStorefront,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
        await api.delete(`/products/${productId}`);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products', 'mine'] });
        toast.success("Product deleted successfully.");
    },
    onError: (error) => {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product.");
    }
  });

  const submitForApprovalMutation = useMutation({
    mutationFn: async (product: ProductListing) => {
        await api.patch(`/products/${product.product_id}`, {
            status: "pending_approval"
        });
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products', 'mine'] });
        toast.success("Product submitted for parent approval!");
    },
    onError: (error) => {
        console.error("Error submitting product:", error);
        toast.error("Failed to submit product.");
    }
  });

  const handleDeleteClick = (productId: string) => {
      deleteProductMutation.mutate(productId);
  };

  const handleSubmitForApproval = (product: ProductListing) => {
      submitForApprovalMutation.mutate(product);
  };

  const isLoading = isStorefrontLoading || isProductsLoading;

  if (!isKidSeller || !currentUser) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-8 bg-background min-h-[calc(100vh-64px)] text-foreground">
      <h1 className="text-4xl font-extrabold mb-4 text-center text-foreground">
        My Products {myStorefront ? `for "${myStorefront.display_name}"` : ""}
      </h1>
      <p className="text-xl text-center text-muted-foreground mb-10">
        Create, edit, and manage your amazing handmade products.
      </p>

      {!myStorefront ? (
        <ThemedCard className="w-full max-w-2xl mx-auto text-center py-10">
          <CardTitle className="mb-4 text-foreground">You don't have a storefront yet!</CardTitle>
          <CardDescription className="mb-6 text-muted-foreground">
            You need to create a storefront before you can add products.
          </CardDescription>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg text-base font-semibold">
            <Link to="/kid/my-storefront">Create My Storefront</Link>
          </Button>
        </ThemedCard>
      ) : (
        <>
          <div className="mb-8 flex justify-center">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg text-base font-semibold">
              <Link to="/kid/products/new">
                <span className="flex items-center justify-center gap-2">
                  <PlusCircle className="h-4 w-4" /> Add New Product
                </span>
              </Link>
            </Button>
          </div>

          <h2 className="text-3xl font-bold mb-6 text-foreground text-center">Your Current Listings</h2>
          {myProducts.length === 0 ? (
            <ThemedCard className="w-full max-w-2xl mx-auto text-center py-10">
              <CardTitle className="mb-4 text-foreground">No products added yet!</CardTitle>
              <CardDescription className="mb-6 text-muted-foreground">
                Click "Add New Product" above to get started.
              </CardDescription>
            </ThemedCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myProducts.map((product) => (
                <ThemedCard key={product.product_id} className="flex flex-col h-full">
                  <CardHeader className="p-0">
                    <img src={product.photo_urls[0]} alt={product.name} className="w-full h-48 object-cover rounded-t-2xl" />
                  </CardHeader>
                  <CardContent className="flex-grow p-4">
                    <CardTitle className="text-xl font-semibold mb-2 line-clamp-1 text-foreground">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                    <p className="text-lg font-bold mb-2 text-primary">${product.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {product.quantity_available}</p>
                    {product.size && <p className="text-sm text-muted-foreground">Size: {product.size}</p>}
                    {product.materials && <p className="text-sm text-muted-foreground">Materials: {product.materials}</p>}
                    {product.time_required && <p className="text-sm text-muted-foreground">Time/Shipping: {product.time_required}</p>}
                    <p className="text-sm font-medium mt-2">Status: <span className={`capitalize ${product.status === "active" ? "text-green-600" : product.status === "pending_approval" ? "text-orange-600" : product.status === "rejected" ? "text-red-600" : "text-gray-500"}`}>{product.status.replace('_', ' ')}</span></p>
                  </CardContent>
                  <div className="p-4 pt-0 flex flex-col gap-2">
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/kid/products/edit/${product.product_id}`}>
                        <span className="flex items-center justify-center gap-2">
                          <Edit className="h-4 w-4" /> Edit
                        </span>
                      </Link>
                    </Button>
                    {product.status === "draft" && (
                      <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => handleSubmitForApproval(product)}
                        disabled={!myStorefront || myStorefront.status === "inactive"}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Send className="h-4 w-4" /> Submit for Parent Approval
                        </span>
                      </Button>
                    )}
                    {product.status === "pending_approval" && (
                      <p className="text-sm text-orange-600 text-center">Awaiting parent approval.</p>
                    )}
                    {product.status === "rejected" && (
                      <p className="text-sm text-red-600 text-center">Rejected by parent. Please edit and resubmit.</p>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <span className="flex items-center justify-center gap-2">
                            <Trash2 className="h-4 w-4" /> Delete
                          </span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your product listing.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteClick(product.product_id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </ThemedCard>
              ))}
            </div>
          )}
        </>
      )}
      <MadeWithDyad />
    </div>
  );
};

export default MyProductsPage;