"use client";

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedCard, CardContent, CardHeader, CardTitle } from "@/components/ThemedCard"; 
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { ProductListing, Storefront } from "@/types/app";
import api from "@/lib/api";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const KidDashboardPage = () => {
  const { currentUser, isKidSeller } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isKidSeller || !currentUser) {
      navigate("/login");
    }
  }, [isKidSeller, currentUser, navigate]);

  const { data: storefrontData, isLoading: isLoadingStorefront } = useQuery({
    queryKey: ['storefronts', 'mine'],
    queryFn: async () => {
        try {
            const res = await api.get('/storefronts/mine');
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
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },
    enabled: !!isKidSeller && !!currentUser,
  });

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', 'mine'],
    queryFn: async () => {
        const res = await api.get('/products/mine');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return res.data.map((p: any) => ({
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
        })) as ProductListing[];
    },
    enabled: !!isKidSeller && !!currentUser && !!storefrontData,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: async () => {
        const res = await api.get('/orders/mine');
        return res.data;
    },
    enabled: !!isKidSeller && !!currentUser && !!storefrontData,
    initialData: []
  });

  if (!isKidSeller || !currentUser) {
    return null;
  }
  
  if (isLoadingStorefront || (storefrontData && isLoadingProducts)) {
      return (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
  }

  const myStorefronts = storefrontData ? [storefrontData] : [];
  const myProducts = productsData || [];

  // Calculate Revenue
  let totalRevenue = 0;
  const myStorefrontId = storefrontData?.storefront_id;
  if (myStorefrontId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orders.forEach((order: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        order.items.forEach((item: any) => {
            if (item.storefront_id === myStorefrontId) {
                totalRevenue += (item.price * item.quantity);
            }
        });
    });
  }

  const activeListingsCount = myProducts.filter((p) => p.status === "active").length;
  const pendingApprovalsCount = myProducts.filter((p) => p.status === "pending_approval").length;
  const totalQuantityInStock = myProducts
    .filter((p) => p.status === "active")
    .reduce((sum, p) => sum + p.quantity_available, 0);
  
  const hasStorefront = !!storefrontData;

  return (
    <div className="container mx-auto max-w-6xl p-8 bg-background min-h-[calc(100vh-64px)] text-foreground">
      <h1 className="text-4xl font-extrabold mb-4 text-center text-foreground">Welcome, {currentUser.display_name}!</h1>
      <p className="text-xl text-center text-muted-foreground mb-10">Your entrepreneurial journey starts here.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ThemedCard>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">${totalRevenue.toFixed(2)}</p>
            <p className="text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </ThemedCard>

        <ThemedCard>
          <CardHeader>
            <CardTitle>Active Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{activeListingsCount}</p>
            <p className="text-muted-foreground">Products currently for sale</p>
          </CardContent>
        </ThemedCard>

        <ThemedCard>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{pendingApprovalsCount}</p>
            <p className="text-muted-foreground">Listings awaiting parent review</p>
          </CardContent>
        </ThemedCard>

        <ThemedCard>
          <CardHeader>
            <CardTitle>Total Items in Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalQuantityInStock}</p>
            <p className="text-muted-foreground">Across all active products</p>
          </CardContent>
        </ThemedCard>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Your Storefront & Products</h2>
        <ThemedCard>
          <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {hasStorefront ? (
              <p className="text-muted-foreground">
                You have {myStorefronts.length} storefront(s) and {myProducts.length} product(s).
              </p>
            ) : (
              <p className="text-muted-foreground">You haven't created a storefront yet.</p>
            )}
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <Button asChild variant="outline" className="w-full md:w-auto">
                <Link to="/kid/my-storefront">Manage Storefront</Link>
              </Button>
              <Button asChild className="w-full md:w-auto">
                <Link to="/kid/my-products">Manage Products</Link>
              </Button>
            </div>
          </CardContent>
        </ThemedCard>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Order History</h2>
        <ThemedCard>
          <CardContent className="p-4">
            {orders.length === 0 ? (
                <p className="text-muted-foreground">No orders yet. Keep selling!</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="p-2 border-b">Order ID</th>
                                <th className="p-2 border-b">Date</th>
                                <th className="p-2 border-b">Item</th>
                                <th className="p-2 border-b">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {orders.map((order: any) => (
                                <tr key={order.order_id || order._id}>
                                    <td className="p-2 border-b text-sm font-mono">{(order.order_id || order._id).substring(0, 8)}...</td>
                                    <td className="p-2 border-b text-sm">{new Date(order.created_at || order.order_date).toLocaleDateString()}</td>
                                    <td className="p-2 border-b text-sm">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {order.items.map((item: any, idx: number) => (
                                            <div key={idx}>
                                                {item.quantity}x {item.product_name}
                                            </div>
                                        ))}
                                    </td>
                                    <td className="p-2 border-b font-semibold">${order.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
          </CardContent>
        </ThemedCard>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default KidDashboardPage;