import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project MING · 命",
  description: "在三千世界里试错，在唯一现实中觉醒。",
  keywords: ["命理", "沙盒", "人生推演", "五行", "无限流"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MING命",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-ming-void text-ming-paper antialiased overflow-x-hidden select-none">
        {children}
      </body>
    </html>
  );
}
