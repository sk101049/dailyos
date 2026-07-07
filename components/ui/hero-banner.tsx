import type React from "react";
import { PageHeader } from "@/components/ui/page-header";

export function HeroBanner({
  actions
}: {
  actions: React.ReactNode;
}) {
  return (
    <PageHeader
      eyebrow="早安，DailyOS 使用者"
      title="今天也是創造精彩內容的一天"
      description="整合 AI Director、Video Studio、Gemini、OpenMontage 與 DailyOS 工作流，快速掌握今天的創作狀態。"
      media={<HeroArt />}
      actions={actions}
    />
  );
}

function HeroArt() {
  return (
    <svg className="absolute inset-y-0 right-0 h-full w-[52%] min-w-[420px] opacity-95" viewBox="0 0 560 320" role="img" aria-label="太陽、火箭、天空與雲朵">
      <defs>
        <linearGradient id="sky" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="52%" stopColor="#ede9fe" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
      </defs>
      <rect width="560" height="320" rx="42" fill="url(#sky)" opacity="0.68" />
      <circle cx="405" cy="78" r="44" fill="#F59E0B" opacity="0.9" />
      <path d="M50 250c38-40 88-40 126 0 28-28 68-30 98-4 38-34 92-26 122 13H50z" fill="#fff" opacity="0.9" />
      <path d="M340 210c48-54 99-70 154-90-17 56-37 105-92 154l-62-64z" fill="#6C63FF" />
      <path d="M401 146l39 39" stroke="#fff" strokeWidth="12" strokeLinecap="round" />
      <circle cx="406" cy="183" r="17" fill="#DBEAFE" />
      <path d="M332 223l-34 14 15-34" fill="#F59E0B" />
      <path d="M364 258c-8 17-25 28-51 31 3-26 15-43 32-51l19 20z" fill="#F59E0B" opacity="0.9" />
    </svg>
  );
}
