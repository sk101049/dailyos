import type React from "react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";

type Icon = React.ComponentType<{ className?: string }>;

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone
}: {
  label: string;
  value: number;
  detail: string;
  icon: Icon;
  tone: string;
}) {
  return (
    <GlassCard className="overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg`}>
          <Icon className="h-6 w-6" />
        </div>
        <Badge variant="outline" className="rounded-full bg-white/70">今日</Badge>
      </div>
      <p className="mt-5 text-sm text-muted-foreground">{label}</p>
      <p className="v1-count mt-2 text-4xl font-bold">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </GlassCard>
  );
}
