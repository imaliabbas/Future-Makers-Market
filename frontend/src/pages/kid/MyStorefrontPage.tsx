"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemedCard, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ThemedCard";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Storefront } from "@/types/app";
import { MadeWithDyad } from "@/components/made-with-dyad";
import api from "@/lib/api";
import axios from "axios";

const MyStorefrontPage = () => {
  const { currentUser, isKidSeller } = useAuth();
  const navigate = useNavigate();

  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isKidSeller) {
       // Assuming auth context handles redirection or we wait for it to load
       // If isKidSeller is false but we are logged in, we might want to redirect.
       // But useEffect deps include isKidSeller, so this runs when it changes.
    }

    if (currentUser && isKidSeller) {
        fetchStorefront();
    } else {
        setIsLoading(false);
    }
  }, [currentUser, isKidSeller, navigate]);

  const fetchStorefront = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/storefronts/mine');
        const data = response.data;
        
        // Map API response to Storefront type
        const mappedStorefront: Storefront = {
            storefront_id: data._id || data.id,
            kid_seller_id: data.kid_id,
            display_name: data.display_name,
            description: data.description,
            status: data.status,
            shareable_url: `/store/${data._id || data.id}`, // Construct URL based on ID
            created_date: new Date().toISOString(), // Mock as API doesn't return yet
            last_modified_date: new Date().toISOString() // Mock as API doesn't return yet
        };

        setStorefront(mappedStorefront);
        setDisplayName(data.display_name);
        setDescription(data.description);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
            // No storefront found, which is fine for a new user
            setStorefront(null);
        } else {
            console.error("Failed to fetch storefront:", error);
            // Don't toast on 404
        }
      } finally {
        setIsLoading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    try {
      if (storefront) {
        // Update existing storefront
        const response = await api.patch(`/storefronts/${storefront.storefront_id}`, {
            display_name: displayName,
            description: description,
            status: storefront.status
        });
        
        const data = response.data;
        const updatedStorefront: Storefront = {
            ...storefront,
            display_name: data.display_name,
            description: data.description,
            status: data.status
        };
        
        setStorefront(updatedStorefront);
        toast.success("Storefront updated successfully!");
      } else {
        // Create new storefront
        const response = await api.post('/storefronts/', {
            display_name: displayName,
            description: description
        });

        const data = response.data;
        const newStorefront: Storefront = {
            storefront_id: data._id || data.id,
            kid_seller_id: data.kid_id,
            display_name: data.display_name,
            description: data.description,
            status: data.status,
            shareable_url: `/store/${data._id || data.id}`,
            created_date: new Date().toISOString(),
            last_modified_date: new Date().toISOString()
        };

        setStorefront(newStorefront);
        toast.success("Storefront created successfully!");
      }
      setIsEditing(false);
    } catch (error) {
        console.error("Error saving storefront:", error);
        toast.error("Failed to save storefront. Please try again.");
    }
  };

  if (!isKidSeller || !currentUser) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="container mx-auto max-w-6xl p-8 bg-background min-h-[calc(100vh-64px)] text-foreground">
      <h1 className="text-4xl font-extrabold mb-4 text-center text-foreground">My Storefront</h1>
      <p className="text-xl text-center text-muted-foreground mb-10">
        {storefront ? "Manage your online shop's details." : "Create your very own online shop!"}
      </p>

      <ThemedCard className="w-full max-w-2xl mx-auto"> {/* Use ThemedCard here */}
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">{storefront ? "Edit Storefront" : "Create New Storefront"}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {storefront ? "Update your storefront's name and description." : "Give your shop a unique name and tell buyers what you sell."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Storefront Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="e.g., Maya's Handmade Bracelets"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                disabled={!isEditing && storefront !== null}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell buyers about your amazing products!"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
                disabled={!isEditing && storefront !== null}
              />
            </div>
            <div className="flex justify-end gap-2">
              {storefront && !isEditing && (
                <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Storefront
                </Button>
              )}
              {(isEditing || storefront === null) && (
                <>
                  <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {storefront ? "Save Changes" : "Create Storefront"}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="ghost" onClick={() => {
                      setIsEditing(false);
                      if (storefront) {
                        setDisplayName(storefront.display_name);
                        setDescription(storefront.description);
                      }
                    }}>
                      Cancel
                    </Button>
                  )}
                </>
              )}
            </div>
          </form>
          {storefront && (
            <div className="mt-6 p-4 border rounded-md bg-muted/50">
              <h3 className="font-semibold mb-2 text-foreground">Current Storefront Status:</h3>
              <p className="text-muted-foreground">Status: <span className="font-medium capitalize">{storefront.status.replace('_', ' ')}</span></p>
              <p className="text-muted-foreground">Shareable URL: <a href={storefront.shareable_url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">{storefront.shareable_url}</a></p>
              {storefront.status === "draft" && (
                <p className="text-sm text-orange-600 mt-2">Your storefront is currently a draft. It is not yet visible to buyers.</p>
              )}
            </div>
          )}
        </CardContent>
      </ThemedCard>
      <MadeWithDyad />
    </div>
  );
};

export default MyStorefrontPage;