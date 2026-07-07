import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

export function DashboardCard({
  title,
  action,
  href,
  children,
  className
}: {
  title: string;
  action?: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <GlassCard className={cn("p-5", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold leading-none">{title}</h3>
        {action && href ? (
          <Button asChild variant="outline" size="sm" className="rounded-full bg-white/70">
            <Link href={href}>{action}</Link>
          </Button>
        ) : null}
      </div>
      <div className="space-y-3">{children}</div>
    </GlassCard>
  );
}
