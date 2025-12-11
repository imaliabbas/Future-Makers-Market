"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.ComponentProps<typeof Card> {
  children?: React.ReactNode;
  className?: string;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn(
        "bg-glass-background/70 border-glass-border/70 backdrop-blur-md shadow-lg rounded-xl", // Adjusted transparency, border, and blur
        className
      )}
      {...props}
    >
      {children}
    </Card>
  )
);
GlassCard.displayName = "GlassCard";

// Re-exporting sub-components for convenience
export { CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
export { GlassCard };