"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { messages } from "@/messages/zh-TW";

type NavItem = {
  href: string;
  label: string;
  marker: string;
};

const navSections: Array<{ label?: string; items: NavItem[] }> = [
  {
    items: [
      { href: "/director", label: messages.navigation.director, marker: "AI" },
      { href: "/dashboard", label: messages.navigation.dashboard, marker: "D" },
      { href: "/projects", label: messages.navigation.projects, marker: "P" },
      { href: "/brand", label: messages.navigation.brandStudio, marker: "品" },
      { href: "/assets", label: messages.navigation.assetLibrary, marker: "庫" }
    ]
  },
  {
    label: messages.navigation.contentStudio,
    items: [
      { href: "/content", label: messages.navigation.aiScript, marker: "S" },
      { href: "/trends", label: messages.navigation.trendCenter, marker: "趨" },
      { href: "/content#storyboard", label: messages.navigation.storyboard, marker: "B" },
      { href: "/character", label: messages.navigation.character, marker: "人" },
      { href: "/voice", label: messages.navigation.voice, marker: "聲" },
      { href: "/content#cover", label: messages.navigation.cover, marker: "封" }
    ]
  },
  {
    label: messages.navigation.videoStudio,
    items: [
      { href: "/video", label: messages.navigation.videoCenter, marker: "V" },
      { href: "/render-queue", label: messages.navigation.renderQueue, marker: "Q" },
      { href: "/video#gemini-render", label: messages.navigation.geminiRender, marker: "G" },
      { href: "/video#export", label: messages.navigation.export, marker: "出" }
    ]
  },
  {
    label: messages.navigation.operations,
    items: [
      { href: "/calendar", label: messages.navigation.calendar, marker: "日" },
      { href: "/publishing", label: messages.navigation.publishing, marker: "發" },
      { href: "/crm", label: messages.navigation.crm, marker: "客" }
    ]
  },
  {
    label: messages.navigation.settings,
    items: [
      { href: "/settings/api-keys", label: messages.navigation.apiKeys, marker: "K" },
      { href: "/video#providers", label: messages.navigation.providers, marker: "Pr" }
    ]
  }
];

const navItems = navSections.flatMap((section) => section.items);

function isActive(pathname: string, href: string) {
  if (href.includes("#")) {
    return false;
  }

  const path = href.split("#")[0];
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentItem = navItems.find((item) => isActive(pathname, item.href)) ?? navItems[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-72 overflow-y-auto border-r bg-card px-5 py-6 lg:block">
        <div className="space-y-1 px-2">
          <p className="text-xl font-semibold">DailyOS</p>
          <p className="text-sm leading-6 text-muted-foreground">
            {messages.app.tagline}
          </p>
        </div>

        <nav className="mt-8 space-y-5">
          {navSections.map((section, sectionIndex) => (
            <div key={section.label ?? sectionIndex} className="space-y-1">
              {section.label ? (
                <p className="px-3 text-xs font-semibold text-muted-foreground">
                  {section.label}
                </p>
              ) : null}
              {section.items.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
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
            </div>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {messages.app.headerLabel}
              </p>
              <h1 className="text-lg font-semibold">{currentItem.label}</h1>
            </div>
            <Button variant="outline" size="sm">
              {messages.app.today}
            </Button>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t px-4 py-2 lg:hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-md border px-3 py-1.5 text-sm",
                  isActive(pathname, item.href)
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
