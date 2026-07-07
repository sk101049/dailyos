"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bot,
  Box,
  BriefcaseBusiness,
  CalendarDays,
  Clapperboard,
  FileText,
  FolderKanban,
  Image,
  KeyRound,
  LayoutDashboard,
  Megaphone,
  Menu,
  Mic2,
  Palette,
  Settings,
  Sparkles,
  TrendingUp,
  UserRound,
  Workflow,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/ui/app-layout";
import { SidebarGroupButton, SidebarItem } from "@/components/ui/sidebar-item";
import { cn } from "@/lib/utils";

type Icon = React.ComponentType<{ className?: string }>;

type NavItem = {
  href: string;
  label: string;
  icon: Icon;
};

type NavGroup = {
  label: string;
  icon: Icon;
  items: NavItem[];
};

const SIDEBAR_STATE_KEY = "dailyos-sidebar-open-groups";
const SIDEBAR_COMPACT_KEY = "dailyos-sidebar-compact";

const navGroups: NavGroup[] = [
  {
    label: "工作台",
    icon: LayoutDashboard,
    items: [
      { href: "/dashboard", label: "儀表板", icon: LayoutDashboard },
      { href: "/workflow", label: "Workflow", icon: Workflow }
    ]
  },
  {
    label: "AI 創作",
    icon: Sparkles,
    items: [
      { href: "/director", label: "AI Director", icon: Bot },
      { href: "/trends", label: "熱門趨勢", icon: TrendingUp }
    ]
  },
  {
    label: "內容工作室",
    icon: FileText,
    items: [
      { href: "/content", label: "AI 腳本", icon: FileText },
      { href: "/content#storyboard", label: "分鏡", icon: Clapperboard },
      { href: "/content#cover", label: "封面", icon: Image }
    ]
  },
  {
    label: "素材工作室",
    icon: Box,
    items: [
      { href: "/brand", label: "品牌工作室", icon: Palette },
      { href: "/character", label: "人物模板", icon: UserRound },
      { href: "/voice", label: "配音", icon: Mic2 },
      { href: "/assets", label: "素材庫", icon: Box }
    ]
  },
  {
    label: "製作中心",
    icon: Clapperboard,
    items: [
      { href: "/video", label: "Video Studio", icon: Clapperboard },
      { href: "/render-queue", label: "Render Queue", icon: Workflow },
      { href: "/video#providers", label: "生成服務", icon: Settings }
    ]
  },
  {
    label: "專案管理",
    icon: FolderKanban,
    items: [
      { href: "/projects", label: "專案", icon: FolderKanban },
      { href: "/calendar", label: "行事曆", icon: CalendarDays }
    ]
  },
  {
    label: "發布中心",
    icon: Megaphone,
    items: [
      { href: "/publishing", label: "發布中心", icon: Megaphone },
      { href: "/crm", label: "CRM", icon: BriefcaseBusiness }
    ]
  },
  {
    label: "系統設定",
    icon: Settings,
    items: [
      { href: "/health", label: "系統健康", icon: Activity },
      { href: "/settings/api-keys", label: "API Keys", icon: KeyRound }
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
  const activeGroup = activeGroupLabel(pathname);
  const [openGroups, setOpenGroups] = useState<string[]>([activeGroup]);
  const [compact, setCompact] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    () => navItems.filter((item) => !item.href.includes("#")),
    []
  );

  function toggleGroup(label: string) {
    setOpenGroups((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label]
    );
  }

  return (
    <div className="min-h-screen text-foreground">
      <Button
        size="icon"
        variant="outline"
        className="fixed left-4 top-4 z-50 rounded-2xl bg-white/80 shadow-lg backdrop-blur lg:hidden"
        onClick={() => setMobileOpen((value) => !value)}
        aria-label="開啟選單"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 overflow-y-auto bg-[#111a44] px-4 py-6 text-white shadow-2xl transition-all duration-300 ease-out",
          compact ? "lg:w-24" : "lg:w-64",
          mobileOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className={cn("flex items-center gap-3 px-2", compact && "lg:justify-center")}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl v1-gradient text-white shadow-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className={cn(compact && "lg:hidden")}>
            <p className="text-xl font-bold">DailyOS</p>
            <p className="text-sm text-white/62">AI 內容營運工作台</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-5 w-full rounded-2xl border-white/10 bg-white/10 text-white hover:bg-white/15"
          onClick={() => setCompact((value) => !value)}
        >
          {compact ? "展開選單" : "收合選單"}
        </Button>

        <nav className="mt-6 space-y-2">
          {navGroups.map((group) => {
            const Icon = group.icon;
            const open = openGroups.includes(group.label);
            const groupActive = group.label === activeGroup;

            return (
              <div key={group.label} className="space-y-1">
                <SidebarGroupButton
                  label={group.label}
                  icon={Icon}
                  active={groupActive}
                  open={open}
                  compact={compact}
                  onClick={() => toggleGroup(group.label)}
                />

                {open || compact ? (
                  <div className={cn("space-y-1", compact ? "lg:pl-0" : "pl-4")}>
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const active = isActive(pathname, item.href);

                      return (
                        <SidebarItem
                          key={item.href}
                          href={item.href}
                          label={item.label}
                          icon={ItemIcon}
                          active={active}
                          compact={compact}
                          onClick={() => setMobileOpen(false)}
                        />
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </aside>

      <AppLayout
        compact={compact}
        mobileNav={(
          <nav className="fixed inset-x-4 bottom-4 z-30 flex gap-2 overflow-x-auto rounded-3xl border bg-white/82 p-2 shadow-2xl backdrop-blur lg:hidden">
          {mobileItems.slice(0, 6).map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-16 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px]",
                  isActive(pathname, item.href) ? "v1-active-nav" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          </nav>
        )}
      >
        {children}
      </AppLayout>
    </div>
  );
}
