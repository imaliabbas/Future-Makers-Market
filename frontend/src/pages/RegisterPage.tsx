// src/pages/RegisterPage.tsx
"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; // Corrected import path
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemedCard, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ThemedCard"; // Use ThemedCard
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UserRole } from "@/types/app";
import { Loader2 } from "lucide-react";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [role, setRole] = useState<UserRole>("buyer");
  const [parentEmail, setParentEmail] = useState(""); // For Kid Seller linking
  const [isLoading, setIsLoading] = useState(false);
  const { register, currentUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser) {
      // Redirect based on role after successful registration
      if (currentUser.role === "kid_seller") {
        navigate("/kid-dashboard");
      } else if (currentUser.role === "parent_guardian") {
        navigate("/parent-dashboard");
      } else if (currentUser.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/marketplace"); // Default for buyers
      }
      toast.success(`Welcome, ${currentUser.display_name}! Your account has been created.`);
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (role === "kid_seller") {
      if (!parentEmail) {
        toast.error("Kid Sellers must provide a Parent/Guardian email.");
        return;
      }
    }

    const newUser = {
      email,
      password: password,
      display_name: displayName,
      birthday,
      role,
      parent_email: role === "kid_seller" ? parentEmail : undefined,
    };

    setIsLoading(true);
    const success = await register(newUser);
    setIsLoading(false);

    if (success) {
      // Redirection handled by useEffect
    } else {
      toast.error("Registration failed. Please check your details and try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <ThemedCard className="w-full max-w-2xl"> {/* Increased max-width */}
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl text-foreground">Register</CardTitle>
          <CardDescription className="text-muted-foreground">
            Create your account to start selling or buying!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your Name or Store Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Account Type</Label>
              <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kid_seller">Kid Seller</SelectItem>
                  <SelectItem value="parent_guardian">Parent/Guardian</SelectItem>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  {/* Admin role not selectable via registration */}
                </SelectContent>
              </Select>
            </div>
            {role === "kid_seller" && (
              <div className="grid gap-2">
                <Label htmlFor="parentEmail">Parent/Guardian Email</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  placeholder="parent@example.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your parent/guardian needs an account to approve your listings.
                </p>
              </div>
            )}
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="underline text-primary hover:text-primary/80">
              Login
            </Link>
          </div>
        </CardContent>
      </ThemedCard>
    </div>
  );
};

export default RegisterPage;