import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent v1-gradient-button",
        secondary: "border-transparent bg-white/70 text-foreground backdrop-blur",
        outline: "border-white/70 bg-white/60 text-foreground backdrop-blur",
        accent: "border-transparent bg-accent text-accent-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
