"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; // Corrected import path
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemedCard, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ThemedCard"; // Use ThemedCard
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ProfilePage = () => {
  const { currentUser, isAuthenticated, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      toast.error("You must be logged in to view your profile.");
      navigate("/login");
      return;
    }
    setDisplayName(currentUser.display_name);
    setEmail(currentUser.email);
    setPassword(""); // Never pre-fill password fields
    setConfirmPassword("");
  }, [currentUser, isAuthenticated, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const isDisplayNameChanged = displayName !== currentUser.display_name;
    const isPasswordChanged = password !== "";

    if (!isDisplayNameChanged && !isPasswordChanged) {
      toast.info("No changes to save.");
      setIsEditing(false);
      return;
    }

    const updatedUserData = {
      ...currentUser,
      display_name: displayName,
      ...(isPasswordChanged && { password_hash: password }),
    };

    const success = await updateUser(updatedUserData);
    if (success) {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } else {
      toast.error("Failed to update profile.");
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    toast.info("Edit mode enabled. You can now change your Display Name and Password.");
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setDisplayName(currentUser?.display_name || ""); // Reset to current user's display name
    setPassword("");
    setConfirmPassword("");
    toast.info("Edit mode cancelled. Changes discarded.");
  };

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-6xl p-8 bg-background min-h-[calc(100vh-64px)] text-foreground">
      <h1 className="text-4xl font-extrabold mb-4 text-foreground text-center">My Profile</h1>
      <p className="text-xl text-center text-muted-foreground mb-10">
        View and update your account information.
      </p>

      <ThemedCard className="w-full max-w-2xl mx-auto"> {/* Use ThemedCard here */}
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-foreground">Account Details</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your personal information and security settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="grid gap-6"> {/* Increased gap */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="displayName" className="text-base font-medium text-foreground">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  disabled={!isEditing} // Disable if not editing
                  className="text-base"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-base font-medium text-foreground">Email</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block"> {/* Wrap Input in a span */}
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled // Permanently disabled
                        className="text-base"
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Email cannot be changed after registration.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role" className="text-base font-medium text-foreground">Account Type</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block"> {/* Wrap Input in a span */}
                      <Input
                        id="role"
                        type="text"
                        value={currentUser.role.replace('_', ' ')}
                        disabled
                        className="text-base capitalize"
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Account type cannot be changed after registration.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="birthday" className="text-base font-medium text-foreground">Birthday</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block"> {/* Wrap Input in a span */}
                      <Input
                        id="birthday"
                        type="date"
                        value={currentUser.birthday}
                        disabled
                        className="text-base"
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Birthday cannot be changed after registration.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            {isEditing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-base font-medium text-foreground">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="text-base"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-base font-medium text-foreground">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                    className="text-base"
                  />
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-4"> {/* Added margin top */}
              {isEditing ? (
                <>
                  <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-base py-2">Save Changes</Button>
                  <Button type="button" variant="outline" className="flex-1 text-base py-2" onClick={handleCancelClick}>Cancel</Button>
                </>
              ) : (
                <Button type="button" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base py-2" onClick={handleEditClick}>Edit Profile</Button>
              )}
            </div>
          </form>
        </CardContent>
      </ThemedCard>
    </div>
  );
};

export default ProfilePage;