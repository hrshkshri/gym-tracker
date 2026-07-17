import "./globals.css";
import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/BottomNav";
import { SyncTrigger } from "@/components/SyncTrigger";

export const metadata: Metadata = {
  title: "Wayne",
  description: "Gym tracker",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Wayne" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink text-white">
        <SyncTrigger />
        <div className="mx-auto max-w-md pb-20">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
