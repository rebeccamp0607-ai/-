import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project MING (命) — 无限流命理沙盒",
  description: "在三千世界里试错，在唯一现实中觉醒。",
  keywords: ["命理", "沙盒", "人生推演", "五行", "无限流"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-ming-void text-ming-paper antialiased">
        {children}
      </body>
    </html>
  );
}
