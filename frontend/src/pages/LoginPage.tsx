"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; // Corrected import path
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemedCard, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ThemedCard"; // Changed from GlassCard to ThemedCard
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser) {
      // Redirect based on role after successful login
      if (currentUser.role === "kid_seller") {
        navigate("/kid-dashboard");
      } else if (currentUser.role === "parent_guardian") {
        navigate("/parent-dashboard");
      } else if (currentUser.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/marketplace"); // Default for buyers or other roles
      }
      toast.success(`Welcome back, ${currentUser.display_name}!`);
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      // Redirection handled by useEffect
    } else {
      toast.error("Login failed. Please check your email and password.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <ThemedCard className="w-full max-w-md"> {/* Changed from GlassCard to ThemedCard */}
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="underline">
              Sign up
            </Link>
          </div>
          <div className="mt-2 text-center text-sm">
            <Link to="/forgot-password" className="underline">
              Forgot password?
            </Link>
          </div>
        </CardContent>
      </ThemedCard>
    </div>
  );
};

export default LoginPage;