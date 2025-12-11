// src/pages/AdminDashboardPage.tsx
"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext"; // Corrected import path
import { ThemedCard, CardContent, CardHeader, CardTitle } from "@/components/ThemedCard"; // Use ThemedCard
import { MadeWithDyad } from "@/components/made-with-dyad";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const AdminDashboardPage = () => {
  const { currentUser } = useAuth();

  // Fetch Users
  const { data: users = [] } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data;
    },
    enabled: currentUser?.role === 'admin'
  });

  // Fetch Storefronts
  const { data: storefronts = [] } = useQuery({
    queryKey: ['admin', 'storefronts'],
    queryFn: async () => {
      const res = await api.get('/admin/storefronts');
      return res.data;
    },
    enabled: currentUser?.role === 'admin'
  });

  // Fetch Products
  const { data: products = [] } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: async () => {
      const res = await api.get('/admin/products');
      return res.data;
    },
    enabled: currentUser?.role === 'admin'
  });

  const activeStorefrontsCount = storefronts.filter((s: { status: string }) => s.status === 'active').length;
  const pendingListingsCount = products.filter((p: { status: string }) => p.status === 'pending_approval').length;

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        Access Denied: You must be an Admin to view this page.
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-8 bg-background min-h-[calc(100vh-64px)] text-foreground">
      <h1 className="text-4xl font-extrabold mb-4 text-foreground">Admin Dashboard</h1>
      <p className="text-xl text-muted-foreground mb-10">Platform oversight and moderation.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <ThemedCard> {/* Use ThemedCard here */}
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-foreground">{users.length}</p>
            <p className="text-muted-foreground mt-2">Registered accounts</p>
          </CardContent>
        </ThemedCard>

        <ThemedCard> {/* Use ThemedCard here */}
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Active Storefronts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-foreground">{activeStorefrontsCount}</p>
            <p className="text-muted-foreground mt-2">Live kid seller stores</p>
          </CardContent>
        </ThemedCard>

        <ThemedCard> {/* Use ThemedCard here */}
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Listings for Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-foreground">{pendingListingsCount}</p>
            <p className="text-muted-foreground mt-2">Pending content moderation</p>
          </CardContent>
        </ThemedCard>
      </div>

      <div className="mt-8">
        <h2 className="text-3xl font-bold mb-6 text-foreground">All Product Listings</h2>
        <ThemedCard> {/* Use ThemedCard here */}
          <CardContent className="p-4">
            {products.length === 0 ? (
                <p className="text-muted-foreground">No product listings found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="p-2 border-b">Name</th>
                                <th className="p-2 border-b">Price</th>
                                <th className="p-2 border-b">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.slice(0, 10).map((product: { id: string; _id?: string; name: string; price: number; status: string }) => (
                                <tr key={product.id || product._id}>
                                    <td className="p-2 border-b">{product.name}</td>
                                    <td className="p-2 border-b">${product.price}</td>
                                    <td className="p-2 border-b">{product.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.length > 10 && <p className="text-sm text-muted-foreground mt-2">Showing 10 of {products.length} products</p>}
                </div>
            )}
          </CardContent>
        </ThemedCard>
      </div>

      <div className="mt-8">
        <h2 className="text-3xl font-bold mb-6 text-foreground">User Management</h2>
        <ThemedCard> {/* Use ThemedCard here */}
          <CardContent className="p-4">
            {users.length === 0 ? (
                 <p className="text-muted-foreground">No users found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="p-2 border-b">Email</th>
                                <th className="p-2 border-b">Role</th>
                                <th className="p-2 border-b">Display Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.slice(0, 10).map((user: { id: string; _id?: string; email: string; role: string; display_name: string }) => (
                                <tr key={user.id || user._id}>
                                    <td className="p-2 border-b">{user.email}</td>
                                    <td className="p-2 border-b capitalize">{user.role.replace('_', ' ')}</td>
                                    <td className="p-2 border-b">{user.display_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {users.length > 10 && <p className="text-sm text-muted-foreground mt-2">Showing 10 of {users.length} users</p>}
                </div>
            )}
          </CardContent>
        </ThemedCard>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default AdminDashboardPage;