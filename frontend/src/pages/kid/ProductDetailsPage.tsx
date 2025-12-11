"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
// import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemedCard, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ThemedCard";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ProductListing, Storefront } from "@/types/app";
import { MadeWithDyad } from "@/components/made-with-dyad";
import api from "@/lib/api";
import axios from "axios";
import { PlusCircle, Edit, Trash2, Send, Loader2 } from "lucide-react";

const ProductDetailsPage = () => {
  const { currentUser, isKidSeller } = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId?: string }>();

  const [myStorefront, setMyStorefront] = useState<Storefront | null>(null);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState<number>(0);
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [productPhotos, setProductPhotos] = useState<string[]>(["/placeholder.svg"]);
  const [productImageNames, setProductImageNames] = useState<string[]>([]);
  const [productSize, setProductSize] = useState("");
  const [productMaterials, setProductMaterials] = useState("");
  const [productTimeRequired, setProductTimeRequired] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isKidSeller || !currentUser) {
      toast.error("Access Denied: You must be a Kid Seller to view this page.");
      navigate("/login");
      return;
    }

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Fetch Storefront
            let currentStore: Storefront | null = null;
            try {
                const sfResponse = await api.get('/storefronts/mine');
                const data = sfResponse.data;
                currentStore = {
                    storefront_id: data._id || data.id,
                    kid_seller_id: data.kid_id,
                    display_name: data.display_name,
                    description: data.description,
                    status: data.status,
                    shareable_url: `/store/${data._id || data.id}`,
                    created_date: new Date().toISOString(),
                    last_modified_date: new Date().toISOString()
                };
                setMyStorefront(currentStore);
            } catch (err) {
                if (axios.isAxiosError(err) && err.response && err.response.status === 404) {
                    toast.info("You need to create a storefront first!");
                    navigate("/kid/my-storefront");
                    return;
                }
                console.error("Error fetching storefront:", err);
            }

            // If Editing, Fetch Product
            if (productId && currentStore) {
                setIsEditing(true);
                try {
                    const prodResponse = await api.get(`/products/${productId}`);
                    const p = prodResponse.data;
                    
                    // Verify ownership
                    if (p.storefront_id !== currentStore.storefront_id) {
                         toast.error("You don't have permission to edit this product.");
                         navigate("/kid/my-products");
                         return;
                    }

                    setProductName(p.name);
                    setProductDescription(p.description);
                    setProductPrice(p.price);
                    setProductQuantity(p.quantity); // Note: backend uses 'quantity'
                    setProductPhotos((p.images || ["/placeholder.svg"]).map((url: string) =>
                        url.startsWith('http') || url === "/placeholder.svg" ? url : `http://localhost:8000${url}`
                    ));
                    setProductImageNames(p.image_names || []);
                    setProductSize(p.size || "");
                    setProductMaterials(p.materials || "");
                    setProductTimeRequired(p.time_required || "");
                } catch (err) {
                    console.error("Error fetching product:", err);
                    toast.error("Product not found.");
                    navigate("/kid/my-products");
                }
            } else {
                setIsEditing(false);
                // Reset form
                setProductName("");
                setProductDescription("");
                setProductPrice(0);
                setProductQuantity(1);
                setProductPhotos(["/placeholder.svg"]);
                setProductImageNames([]);
            }

        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    loadData();
  }, [currentUser, isKidSeller, navigate, productId]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!myStorefront) {
      toast.error("Please create your storefront first.");
      return;
    }

    if (productPrice <= 0) {
      toast.error("Product price must be greater than 0.");
      return;
    }
    if (productQuantity <= 0) {
      toast.error("Product quantity must be greater than 0.");
      return;
    }

    // Ensure at least one image is present, or use placeholder
    const finalImages = productPhotos.length > 0 && productPhotos[0].trim() !== ""
        ? productPhotos
        : ["/placeholder.svg"];

    try {
        const payload = {
            name: productName,
            description: productDescription,
            price: productPrice,
            quantity: productQuantity,
            images: finalImages,
            image_names: productImageNames,
            size: productSize,
            materials: productMaterials,
            time_required: productTimeRequired
        };

        if (isEditing && productId) {
             await api.patch(`/products/${productId}`, payload);
             toast.success("Product updated successfully!");
        } else {
             await api.post('/products/', payload);
             toast.success("New product created successfully!");
        }
        navigate("/kid/my-products");

    } catch (error) {
        console.error("Error saving product:", error);
        toast.error("Failed to save product.");
    }
  };

  if (isLoading) {
      return (
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
  }

  if (!isKidSeller || !currentUser || !myStorefront) {
    return null; 
  }

  return (
    <div className="container mx-auto max-w-6xl p-8 bg-background min-h-[calc(100vh-64px)] text-foreground">
      <h1 className="text-4xl font-extrabold mb-4 text-center text-foreground">
        {isEditing ? "Edit Product" : "Add New Product"}
      </h1>
      <p className="text-xl text-center text-muted-foreground mb-10">
        {isEditing ? "Update the details for your creation." : "Fill in the details for your amazing new product."}
      </p>

      <ThemedCard className="w-full max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">{isEditing ? "Product Details" : "New Product Information"}</CardTitle>
          <CardDescription className="text-muted-foreground">
            Provide all the necessary information for your product.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProduct} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                type="text"
                placeholder="e.g., Rainbow Friendship Bracelet"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productDescription">Description</Label>
              <Textarea
                id="productDescription"
                placeholder="Describe your product in detail!"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="productPrice">Price ($)</Label>
                <Input
                  id="productPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={productPrice}
                  onChange={(e) => setProductPrice(parseFloat(e.target.value))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="productQuantity">Quantity Available</Label>
                <Input
                  id="productQuantity"
                  type="number"
                  min="1"
                  value={productQuantity}
                  onChange={(e) => setProductQuantity(parseInt(e.target.value))}
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="productSize">Size (Optional)</Label>
              <Input
                id="productSize"
                type="text"
                placeholder="e.g., Small, 10x12 inches, Adjustable"
                value={productSize}
                onChange={(e) => setProductSize(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productMaterials">Materials (Optional)</Label>
              <Input
                id="productMaterials"
                type="text"
                placeholder="e.g., Cotton yarn, plastic beads, wood"
                value={productMaterials}
                onChange={(e) => setProductMaterials(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productTimeRequired">Time/Shipping (Optional)</Label>
              <Input
                id="productTimeRequired"
                type="text"
                placeholder="e.g., 2 hours to make, Ships in 3-5 days"
                value={productTimeRequired}
                onChange={(e) => setProductTimeRequired(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                This could be creation time, shipping time, or other relevant timing.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="productPhotos">Product Photo</Label>
              <div className="flex flex-col gap-4">
                  {productPhotos.length > 0 && productPhotos[0] !== "/placeholder.svg" && (
                      <div className="relative w-full max-w-sm">
                          <img
                              src={productPhotos[0]}
                              alt="Product Preview"
                              className="w-full h-48 object-cover rounded-md border"
                          />
                      </div>
                  )}
                  <Input
                    id="productPhotoUpload"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const formData = new FormData();
                            formData.append("file", file);

                            try {
                                const toastId = toast.loading("Uploading image...");
                                const res = await api.post("/products/upload", formData, {
                                    headers: { "Content-Type": "multipart/form-data" }
                                });
                                // Use the full URL if needed, but backend returns relative path
                                const imageUrl = `http://localhost:8000${res.data.url}`;
                                setProductPhotos([imageUrl]);
                                setProductImageNames([res.data.filename]);
                                toast.dismiss(toastId);
                                toast.success("Image uploaded!");
                            } catch (error) {
                                console.error("Upload error", error);
                                toast.error("Failed to upload image.");
                            }
                        }
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload a photo of your product.
                    {productImageNames.length > 0 && (
                        <span className="block mt-1 font-medium text-primary">
                            Current file: {productImageNames[0]}
                        </span>
                    )}
                  </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isEditing ? "Save Changes" : "Create Product"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/kid/my-products")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </ThemedCard>
      <MadeWithDyad />
    </div>
  );
};

export default ProductDetailsPage;