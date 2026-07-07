import Link from "next/link";
import type React from "react";

type Icon = React.ComponentType<{ className?: string }>;

export function QuickAction({
  title,
  detail,
  href,
  icon: Icon,
  tone
}: {
  title: string;
  detail: string;
  href: string;
  icon: Icon;
  tone: string;
}) {
  return (
    <Link href={href} className={`group rounded-[1.6rem] bg-gradient-to-br ${tone} p-5 text-white shadow-2xl transition-all hover:-translate-y-1 hover:scale-[1.02]`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-5 text-lg font-bold">{title}</p>
      <p className="mt-1 text-sm text-white/82">{detail}</p>
    </Link>
  );
}
