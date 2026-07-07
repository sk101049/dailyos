import * as React from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("v1-card", className)}
      {...props}
    />
  );
}
