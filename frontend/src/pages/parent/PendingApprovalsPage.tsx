"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; // Corrected import path
import { ThemedCard, CardContent, CardHeader, CardTitle } from "@/components/ThemedCard"; // Use ThemedCard
import { Button } from "@/components/ui/button";
import { ProductListing } from "@/types/app";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

const PendingApprovalsPage = () => {
  const { currentUser, isParentGuardian } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [pendingApprovals, setPendingApprovals] = useState<ProductListing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await api.get("/parent/approvals");
      // Backend returns ProductResponse which has 'images' instead of 'photo_urls'
      // and 'quantity' instead of 'quantity_available'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedProducts = response.data.map((p: any) => ({
        ...p,
        product_id: p._id, // Ensure ID mapping if needed, though usually handled
        photo_urls: p.images || [],
        quantity_available: p.quantity
      }));
      setPendingApprovals(mappedProducts);
    } catch (error) {
      console.error("Failed to fetch approvals:", error);
      toast.error("Failed to load pending approvals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isParentGuardian || !currentUser) {
      toast.error("Access Denied: You must be a Parent/Guardian to view this page.");
      navigate("/login");
      return;
    }

    fetchApprovals();
  }, [currentUser, isParentGuardian, navigate]);

  const handleApprove = async (productId: string) => {
    try {
      await api.post(`/parent/approvals/${productId}`, { action: "approve" });
      toast.success("Product approved!");
      
      // Refresh local list
      fetchApprovals();
      
      // Invalidate relevant queries to ensure UI updates across the app
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'products'] }); // Refresh marketplace
      queryClient.invalidateQueries({ queryKey: ['parent', 'stats'] }); // Refresh dashboard stats
      
    } catch (error) {
      console.error("Approval failed:", error);
      toast.error("Failed to approve product.");
    }
  };

  const handleReject = async (productId: string) => {
    try {
      await api.post(`/parent/approvals/${productId}`, { action: "reject" });
      toast.info("Product rejected.");
      
      // Refresh local list
      fetchApprovals();
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['parent', 'stats'] }); // Refresh dashboard stats
      
    } catch (error) {
      console.error("Rejection failed:", error);
      toast.error("Failed to reject product.");
    }
  };

  if (!isParentGuardian || !currentUser) {
    return null; // Redirect handled by useEffect
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-8 bg-background min-h-[calc(100vh-64px)] text-foreground"> {/* Wider container, increased padding, eco-green background */}
      <h1 className="text-4xl font-extrabold mb-4 text-foreground">Pending Approvals</h1> {/* Larger, bolder greeting */}
      <p className="text-xl text-muted-foreground mb-10"> {/* Slightly larger typography */}
        Review and approve your child's product listings before they go live.
      </p>

      <ThemedCard> {/* Use ThemedCard here */}
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">Listings Awaiting Your Review ({pendingApprovals.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {pendingApprovals.length === 0 ? (
            <p className="text-muted-foreground text-lg">No listings currently awaiting your approval. Great job!</p>
          ) : (
            <div className="grid gap-6"> {/* Increased gap for better spacing */}
              {pendingApprovals.map((product) => (
                <div key={product.product_id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-muted-foreground/20 pb-4 last:border-b-0 last:pb-0"> {/* Subtle divider */}
                  <div className="mb-3 sm:mb-0 flex items-center gap-4">
                    <img
                      src={product.photo_urls[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg shadow-sm"
                    />
                    <div>
                      <p className="font-semibold text-lg text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">${product.price.toFixed(2)} - Qty: {product.quantity_available}</p>
                      <p className="text-xs text-muted-foreground">
                        From Store: {product.storefront_name || 'Loading...'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleApprove(product.product_id)}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(product.product_id)}>
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </ThemedCard>
    </div>
  );
};

export default PendingApprovalsPage;