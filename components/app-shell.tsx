"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
const THEME_KEY = "dailyos-theme";

const themes = [
  { value: "sunrise", label: "Sunrise" },
  { value: "aurora", label: "Aurora" },
  { value: "forest", label: "Forest" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" }
];

const navGroups: NavGroup[] = [
  {
    label: "工作台",
    marker: "D",
    items: [
      { href: "/dashboard", label: "儀表板", marker: "D" },
      { href: "/workflow", label: "Workflow", marker: "W" }
    ]
  },
  {
    label: "AI 創作",
    marker: "AI",
    items: [
      { href: "/director", label: "AI Director", marker: "AI" },
      { href: "/trends", label: "趨勢中心", marker: "T" }
    ]
  },
  {
    label: "內容工作室",
    marker: "C",
    items: [
      { href: "/content", label: "AI 腳本", marker: "S" },
      { href: "/content#storyboard", label: "分鏡", marker: "B" },
      { href: "/content#cover", label: "封面", marker: "P" }
    ]
  },
  {
    label: "素材工作室",
    marker: "A",
    items: [
      { href: "/brand", label: "品牌工作室", marker: "B" },
      { href: "/character", label: "人物模板", marker: "C" },
      { href: "/voice", label: "配音", marker: "V" },
      { href: "/assets", label: "素材庫", marker: "L" }
    ]
  },
  {
    label: "影片中心",
    marker: "V",
    items: [
      { href: "/video", label: "Video Studio", marker: "V" },
      { href: "/render-queue", label: "Render Queue", marker: "Q" },
      { href: "/video#export", label: "匯出", marker: "E" }
    ]
  },
  {
    label: "專案",
    marker: "P",
    items: [
      { href: "/projects", label: "專案", marker: "P" },
      { href: "/calendar", label: "行事曆", marker: "C" }
    ]
  },
  {
    label: "發布",
    marker: "P",
    items: [
      { href: "/publishing", label: "發布中心", marker: "P" },
      { href: "/crm", label: "CRM", marker: "R" }
    ]
  },
  {
    label: "設定",
    marker: "S",
    items: [
      { href: "/settings/api-keys", label: "API Keys", marker: "K" },
      { href: "/video#providers", label: "生成服務", marker: "Pr" }
    ]
  }
];

const navItems = navGroups.flatMap((group) => group.items);

function pathOf(href: string) {
  return href.split("#")[0];
}

function isActive(pathname: string, href: string) {
  const path = pathOf(href);
  return pathname === path || pathname.startsWith(`${path}/`) || (pathname === "/" && path === "/dashboard");
}

function activeGroupLabel(pathname: string) {
  return navGroups.find((group) => group.items.some((item) => isActive(pathname, item.href)))?.label ?? navGroups[0].label;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentItem = pathname === "/" ? navItems[0] : navItems.find((item) => isActive(pathname, item.href)) ?? navItems[0];
  const activeGroup = activeGroupLabel(pathname);
  const [openGroups, setOpenGroups] = useState<string[]>([activeGroup]);
  const [compact, setCompact] = useState(false);
  const [theme, setTheme] = useState("sunrise");

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

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_KEY) ?? "sunrise";
    setTheme(savedTheme);
    document.documentElement.dataset.theme = savedTheme;
  }, []);

  useEffect(() => {
    window.localStorage.setItem(THEME_KEY, theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

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
    <div className="min-h-screen text-foreground">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 hidden overflow-y-auto border-r bg-card/92 px-4 py-6 shadow-sm backdrop-blur lg:block",
          compact ? "w-24" : "w-72"
        )}
      >
        <div className={cn("space-y-1 px-2", compact && "text-center")}>
          <p className="text-xl font-semibold">{compact ? "D" : "DailyOS"}</p>
          {compact ? null : (
            <p className="text-sm leading-6 text-muted-foreground">
              AI 內容營運工作台
            </p>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-5 w-full rounded-full"
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
                    groupActive ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    compact && "justify-center px-2"
                  )}
                  onClick={() => toggleGroup(group.label)}
                  title={group.label}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background text-xs font-semibold">
                    {group.marker}
                  </span>
                  {compact ? null : (
                    <>
                      <span className="flex-1 text-left">{group.label}</span>
                      <span className="text-xs">{open ? "收合" : "展開"}</span>
                    </>
                  )}
                </button>
                {open || compact ? (
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
                              ? "v1-active-nav"
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
        <header className="sticky top-0 z-20 border-b bg-background/88 backdrop-blur">
          <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                DailyOS 工作區
              </p>
              <h1 className="text-lg font-semibold">{currentItem.label}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" className="v1-gradient-button rounded-full">
                <Link href="/">儀表板</Link>
              </Button>
              <select
                className="h-9 rounded-full border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
                aria-label="主題"
              >
                {themes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm" className="rounded-full">
                今日
              </Button>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t px-4 py-2 lg:hidden">
            {mobileItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-md border px-3 py-1.5 text-sm",
                  isActive(pathname, item.href)
                    ? "v1-active-nav"
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
