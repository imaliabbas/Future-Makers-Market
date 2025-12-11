"use client";

import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { ThemedCard, CardContent, CardHeader, CardTitle } from "@/components/ThemedCard";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Hourglass, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const ParentDashboardPage = () => {
  const { currentUser, isParentGuardian } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isParentGuardian || !currentUser) {
      navigate("/login");
    }
  }, [isParentGuardian, currentUser, navigate]);

  const { data: stats } = useQuery({
    queryKey: ['parent', 'stats'],
    queryFn: async () => {
        const res = await api.get("/parent/stats");
        return res.data;
    },
    enabled: !!isParentGuardian && !!currentUser,
    initialData: {
        linked_kid_sellers: 0,
        pending_approvals_count: 0,
        total_child_earnings: 0
    }
  });

  const { linked_kid_sellers, pending_approvals_count, total_child_earnings } = stats;

  if (!isParentGuardian || !currentUser) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-6xl p-8 bg-background min-h-[calc(100vh-64px)] text-foreground">
      <h1 className="text-4xl font-extrabold mb-4 text-foreground">
        Hello, {currentUser.display_name}!
      </h1>
      <p className="text-xl text-muted-foreground mb-10">
        Your hub for nurturing young entrepreneurs.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <ThemedCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-foreground">Children Linked</CardTitle>
            <Users className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-foreground">{linked_kid_sellers}</p>
            <p className="text-muted-foreground mt-2">Active Kid Sellers</p>
          </CardContent>
        </ThemedCard>

        <ThemedCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-foreground">Pending Approvals</CardTitle>
            <Hourglass className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-foreground">{pending_approvals_count}</p>
            <p className="text-muted-foreground mt-2">Listings awaiting your review</p>
            {pending_approvals_count > 0 && (
              <Button
                variant="link"
                className="p-0 h-auto mt-4 text-primary hover:text-primary/80 flex items-center font-medium"
                onClick={() => navigate("/parent/pending-approvals")}
              >
                <span>View all <ArrowRight className="ml-1 h-4 w-4" /></span>
              </Button>
            )}
          </CardContent>
        </ThemedCard>

        <ThemedCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-foreground">Total Child Earnings</CardTitle>
            <DollarSign className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-foreground">${total_child_earnings.toFixed(2)}</p>
            <p className="text-muted-foreground mt-2">Across all linked children</p>
          </CardContent>
        </ThemedCard>
      </div>

      <div className="mt-8">
        <h2 className="text-3xl font-bold mb-6 text-foreground">Manage Payouts</h2>
        <ThemedCard className="p-8">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 p-0">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold text-sm">
                Stripe
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">Payout Method</p>
                <p className="text-muted-foreground">Connect your Stripe account to receive earnings.</p>
              </div>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg text-base font-semibold">
              Connect Stripe Account
            </Button>
          </CardContent>
        </ThemedCard>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default ParentDashboardPage;