import Link from "next/link";
import type React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Icon = React.ComponentType<{ className?: string }>;

export function SidebarGroupButton({
  label,
  icon: Icon,
  active,
  open,
  compact,
  onClick
}: {
  label: string;
  icon: Icon;
  active: boolean;
  open: boolean;
  compact: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-all duration-200",
        active ? "bg-white/10 text-white" : "text-white/72 hover:bg-white/10 hover:text-white",
        compact && "lg:justify-center lg:px-2"
      )}
      onClick={onClick}
      title={label}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className={cn("flex-1 text-left", compact && "lg:hidden")}>{label}</span>
      <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180", compact && "lg:hidden")} />
    </button>
  );
}

export function SidebarItem({
  href,
  label,
  icon: Icon,
  active,
  compact,
  onClick
}: {
  href: string;
  label: string;
  icon: Icon;
  active: boolean;
  compact: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-10 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition-all duration-200",
        active ? "v1-active-nav" : "text-white/62 hover:translate-x-1 hover:bg-white/10 hover:text-white",
        compact && "lg:justify-center lg:px-2"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className={cn(compact && "lg:hidden")}>{label}</span>
    </Link>
  );
}
