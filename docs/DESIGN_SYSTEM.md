# DailyOS Design System

DailyOS v1 uses one shared visual system across Dashboard and Studios.

## Principles

- Use shared components before page-specific styling.
- Keep all UI in Traditional Chinese, while preserving product names such as DailyOS, AI Director, Gemini, OpenMontage, and Video Studio.
- Prefer lucide-react icons.
- Keep layout desktop-first and responsive.

## Shared Components

- `AppLayout`
- `Topbar`
- `SidebarItem`
- `HeroBanner`
- `DashboardCard`
- `StatCard`
- `GlassCard`
- `GradientButton`
- `QuickAction`
- shadcn-style `Card`, `Button`, `Badge`

## Visual Tokens

- Primary: `#6C63FF`
- Secondary: `#3B82F6`
- Accent: `#F59E0B`
- Background: `#F8FAFC`

Themes are saved in LocalStorage under `dailyos-theme`.

## Page Rule

New pages should use `Card`, `Button`, `Badge`, and the v1 layout components instead of recreating one-off card, button, or sidebar styles.
