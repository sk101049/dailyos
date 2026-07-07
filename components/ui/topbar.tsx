import { Bell, Plus, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";

export function Topbar<TTheme extends string>({
  theme,
  themes,
  onThemeChange,
  onNotify
}: {
  theme: TTheme;
  themes: readonly TTheme[];
  onThemeChange: (theme: TTheme) => void;
  onNotify: () => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto]">
      <label className="flex h-12 items-center gap-3 rounded-2xl border bg-white/80 px-4 shadow-sm backdrop-blur">
        <Search className="h-5 w-5 text-muted-foreground" />
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder="搜尋專案、素材或 Render Job"
        />
      </label>
      <GradientButton asChild>
        <Link href="/director">
          <Plus className="h-4 w-4" />
          快速創作
        </Link>
      </GradientButton>
      <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-white/80" onClick={onNotify}>
        <Bell className="h-5 w-5" />
      </Button>
      <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-white/80">
        <UserRound className="h-5 w-5" />
      </Button>
      <select
        value={theme}
        onChange={(event) => onThemeChange(event.target.value as TTheme)}
        className="h-12 rounded-2xl border bg-white/80 px-3 text-sm font-medium outline-none"
        aria-label="Theme"
      >
        {themes.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </div>
  );
}
