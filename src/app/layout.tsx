import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "MineX Pro — Premium Cloud Crypto Mining Platform",
  description:
    "MineX Pro is a premium cloud mining simulation platform with live mining rigs, tiered hash-power plans, instant payouts, referral rewards and a full admin control center.",
  // ✅ Coinzilla Verification (Ye automatically <meta> tag bana dega)
  verification: {
    other: {
      coinzilla: "de4c20ee5f20ea9a0230a6cdb424d98b",
    },
  },
  // ✅ Professional Clean Favicon (Bina kisi .ico file ke)
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23131c2e'/%3E%3Ctext x='50' y='70' font-family='Arial%2Csans-serif' font-size='55' font-weight='bold' fill='%2300FFAA' text-anchor='middle'%3EM%3C/text%3E%3C/svg%3E"
  },
};

export const viewport: Viewport = {
  themeColor: "#03060d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* ✅ Duplicate Coinzilla Meta Tag Hata diya gaya (Upar metadata me handle ho raha hai) */}
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans text-slate-200 antialiased">{children}</body>
    </html>
  );
}
