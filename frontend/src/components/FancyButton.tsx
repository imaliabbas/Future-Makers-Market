"use client";

import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FancyButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const FancyButton = React.forwardRef<HTMLButtonElement, FancyButtonProps>(
  ({ className, children, asChild, ...props }, ref) => { // Explicitly extract asChild
    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden", // For gradient animation
          "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground", // Subtle gradient
          "shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40", // Enhanced shadow
          "px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 ease-in-out", // Larger, bolder, more rounded
          "hover:scale-[1.02] active:scale-[0.98]", // Subtle hover/active animation
          className
        )}
        asChild={asChild} // Explicitly pass asChild
        {...props}
      >
        {children}
      </Button>
    );
  }
);
FancyButton.displayName = "FancyButton";

export { FancyButton };