"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { messages } from "@/messages/zh-TW";

type NavItem = {
  href: string;
  label: string;
  marker: string;
};

type NavGroup = {
  label: string;
  marker: string;
  items: NavItem[];
};

const SIDEBAR_STATE_KEY = "dailyos-sidebar-open-groups";
const SIDEBAR_COMPACT_KEY = "dailyos-sidebar-compact";

const navGroups: NavGroup[] = [
  {
    label: "工作台",
    marker: "D",
    items: [
      { href: "/dashboard", label: messages.navigation.dashboard, marker: "D" },
      { href: "/workflow", label: messages.navigation.workflow, marker: "W" }
    ]
  },
  {
    label: "AI 創作",
    marker: "AI",
    items: [
      { href: "/director", label: messages.navigation.director, marker: "AI" },
      { href: "/trends", label: messages.navigation.trendCenter, marker: "趨" }
    ]
  },
  {
    label: "內容工作室",
    marker: "文",
    items: [
      { href: "/content", label: messages.navigation.aiScript, marker: "S" },
      { href: "/content#storyboard", label: messages.navigation.storyboard, marker: "B" },
      { href: "/content#cover", label: messages.navigation.cover, marker: "封" }
    ]
  },
  {
    label: "素材工作室",
    marker: "庫",
    items: [
      { href: "/brand", label: messages.navigation.brandStudio, marker: "品" },
      { href: "/character", label: messages.navigation.character, marker: "人" },
      { href: "/voice", label: messages.navigation.voice, marker: "聲" },
      { href: "/assets", label: messages.navigation.assetLibrary, marker: "庫" }
    ]
  },
  {
    label: "製作中心",
    marker: "V",
    items: [
      { href: "/video", label: messages.navigation.videoCenter, marker: "V" },
      { href: "/render-queue", label: messages.navigation.renderQueue, marker: "Q" },
      { href: "/video#export", label: messages.navigation.export, marker: "出" }
    ]
  },
  {
    label: "專案",
    marker: "P",
    items: [
      { href: "/projects", label: messages.navigation.projects, marker: "P" },
      { href: "/calendar", label: messages.navigation.calendar, marker: "日" }
    ]
  },
  {
    label: "發布",
    marker: "發",
    items: [
      { href: "/publishing", label: messages.navigation.publishing, marker: "發" },
      { href: "/crm", label: messages.navigation.crm, marker: "客" }
    ]
  },
  {
    label: "設定",
    marker: "設",
    items: [
      { href: "/settings/api-keys", label: messages.navigation.apiKeys, marker: "K" },
      { href: "/video#providers", label: messages.navigation.providers, marker: "Pr" }
    ]
  }
];

const navItems = navGroups.flatMap((group) => group.items);

function pathOf(href: string) {
  return href.split("#")[0];
}

function isActive(pathname: string, href: string) {
  const path = pathOf(href);
  return pathname === path || pathname.startsWith(`${path}/`);
}

function activeGroupLabel(pathname: string) {
  return navGroups.find((group) => group.items.some((item) => isActive(pathname, item.href)))?.label ?? navGroups[0].label;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentItem = navItems.find((item) => isActive(pathname, item.href)) ?? navItems[0];
  const activeGroup = activeGroupLabel(pathname);
  const [openGroups, setOpenGroups] = useState<string[]>([activeGroup]);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    try {
      const savedGroups = window.localStorage.getItem(SIDEBAR_STATE_KEY);
      const parsedGroups = savedGroups ? (JSON.parse(savedGroups) as string[]) : [];
      const savedCompact = window.localStorage.getItem(SIDEBAR_COMPACT_KEY) === "true";
      setOpenGroups(Array.from(new Set([activeGroup, ...parsedGroups])));
      setCompact(savedCompact);
    } catch {
      setOpenGroups([activeGroup]);
    }
  }, [activeGroup]);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(openGroups));
  }, [openGroups]);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COMPACT_KEY, String(compact));
  }, [compact]);

  const mobileItems = useMemo(
    () => navGroups.flatMap((group) => group.items.filter((item) => !item.href.includes("#"))),
    []
  );

  function toggleGroup(label: string) {
    setOpenGroups((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label]
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className={cn(
        "fixed inset-y-0 left-0 hidden overflow-y-auto border-r bg-card px-4 py-6 lg:block",
        compact ? "w-24" : "w-72"
      )}>
        <div className={cn("space-y-1 px-2", compact && "text-center")}>
          <p className="text-xl font-semibold">{compact ? "D" : "DailyOS"}</p>
          {compact ? null : (
            <p className="text-sm leading-6 text-muted-foreground">
              {messages.app.tagline}
            </p>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-5 w-full"
          onClick={() => setCompact((value) => !value)}
        >
          {compact ? "展開" : "收合"}
        </Button>

        <nav className="mt-6 space-y-2">
          {navGroups.map((group) => {
            const open = openGroups.includes(group.label);
            const groupActive = group.label === activeGroup;

            return (
              <div key={group.label} className="space-y-1">
                <button
                  type="button"
                  className={cn(
                    "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors",
                    groupActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    compact && "justify-center px-2"
                  )}
                  onClick={() => toggleGroup(group.label)}
                  title={group.label}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background text-xs">
                    {group.marker}
                  </span>
                  {compact ? null : (
                    <>
                      <span className="flex-1 text-left">{group.label}</span>
                      <span className="text-xs">{open ? "收合" : "展開"}</span>
                    </>
                  )}
                </button>
                {(open || compact) ? (
                  <div className={cn("space-y-1", compact ? "pl-0" : "pl-3")}>
                    {group.items.map((item) => {
                      const active = isActive(pathname, item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={item.label}
                          className={cn(
                            "flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                            compact && "justify-center px-2"
                          )}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-background text-[11px] text-foreground">
                            {item.marker}
                          </span>
                          {compact ? null : item.label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className={cn(compact ? "lg:pl-24" : "lg:pl-72")}>
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
            {mobileItems.map((item) => (
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
