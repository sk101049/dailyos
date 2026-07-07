import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type GradientButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

export const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "v1-gradient-button inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold transition-all hover:-translate-y-0.5",
          className
        )}
        {...props}
      />
    );
  }
);
GradientButton.displayName = "GradientButton";
