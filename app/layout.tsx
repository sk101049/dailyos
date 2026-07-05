import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "DailyOS",
  description: "保險內容創作與每日工作空間"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant-TW">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
