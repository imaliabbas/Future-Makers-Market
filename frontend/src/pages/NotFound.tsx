"use client";

import React from "react";
import { Link } from "react-router-dom";
import { ThemedCard, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ThemedCard";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="container mx-auto max-w-6xl p-8 bg-background min-h-[calc(100vh-64px)] text-foreground flex items-center justify-center">
      <ThemedCard className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-5xl font-extrabold text-primary mb-4">404</CardTitle>
          <CardTitle className="text-3xl font-bold text-foreground mb-2">Page Not Found</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Oops! The page you're looking for doesn't exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">
            It might have been moved, deleted, or you might have typed the address incorrectly.
          </p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg text-base font-semibold">
            <Link to="/">Go to Homepage</Link>
          </Button>
        </CardContent>
      </ThemedCard>
    </div>
  );
};

export default NotFound;