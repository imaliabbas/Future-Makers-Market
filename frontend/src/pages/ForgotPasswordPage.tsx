"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemedCard, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ThemedCard"; // Use ThemedCard
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Since we don't have a real backend for forgot password yet,
    // we simulate the behavior for now.
    toast.success("If an account with that email exists, a password reset link has been sent.");
    navigate("/login");
  };

  return (
    <div className="container mx-auto max-w-6xl p-8 bg-background min-h-[calc(100vh-64px)] text-foreground flex items-center justify-center">
      <ThemedCard className="w-full max-w-md"> {/* Use ThemedCard here */}
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-foreground">Forgot Password</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email address below and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
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
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Send Reset Link
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="underline text-primary hover:text-primary/80">
              Login
            </Link>
          </div>
        </CardContent>
      </ThemedCard>
    </div>
  );
};

export default ForgotPasswordPage;