import type React from "react";
import { cn } from "@/lib/utils";

export function AppLayout({
  compact,
  children,
  mobileNav
}: {
  compact: boolean;
  children: React.ReactNode;
  mobileNav: React.ReactNode;
}) {
  return (
    <div className={cn("transition-all duration-300", compact ? "lg:pl-24" : "lg:pl-64")}>
      <main className="v1-page px-4 py-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">{children}</main>
      {mobileNav}
    </div>
  );
}
