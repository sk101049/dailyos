import type React from "react";
import { GlassCard } from "@/components/ui/glass-card";

export function PageHeader({
  eyebrow,
  title,
  description,
  media,
  actions
}: {
  eyebrow: string;
  title: string;
  description: string;
  media?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <GlassCard className="relative overflow-hidden rounded-[2rem] p-6 shadow-2xl">
      {media}
      <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_560px] xl:items-start">
        <div className="pt-4">
          <p className="text-sm font-semibold text-primary">{eyebrow}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-normal text-slate-900 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
        {actions}
      </div>
    </GlassCard>
  );
}
