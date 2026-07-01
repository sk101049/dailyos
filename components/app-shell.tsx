"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", marker: "D" },
  { href: "/content", label: "Content Studio", marker: "C" },
  { href: "/crm", label: "CRM", marker: "R" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentItem =
    navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ??
    navItems[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r bg-card px-5 py-6 lg:block">
        <div className="space-y-1 px-2">
          <p className="text-xl font-semibold">DailyOS</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Personal insurance workspace
          </p>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md border text-xs",
                    active
                      ? "border-primary-foreground/25 bg-primary-foreground/10"
                      : "border-border bg-background"
                  )}
                >
                  {item.marker}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Daily workspace</p>
              <h1 className="text-lg font-semibold">{currentItem.label}</h1>
            </div>
            <Button variant="outline" size="sm">
              Today
            </Button>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
