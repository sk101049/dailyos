import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DailyOS",
  description: "Personal AI insurance workspace"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
