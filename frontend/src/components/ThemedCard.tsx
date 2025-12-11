"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ThemedCardProps extends React.ComponentProps<typeof Card> {
  children?: React.ReactNode;
  className?: string;
}

const ThemedCard = React.forwardRef<HTMLDivElement, ThemedCardProps>(
  ({ className, children, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn(
        "bg-white shadow-lg rounded-2xl p-6 border-none", // Default styling for white cards with soft shadows and generous padding
        className
      )}
      {...props}
    >
      {children}
    </Card>
  )
);
ThemedCard.displayName = "ThemedCard";

// Re-exporting sub-components for convenience
export { CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
export { ThemedCard };