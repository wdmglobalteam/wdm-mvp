import "./globals.css";
import type { Metadata } from "next";
import CursorEffect from "@/components/CursorEffect";

export const metadata: Metadata = {
  title: {
    default: "WDM",
    template: "WDM | %s",
  },
  icons: {
    icon: "/favicon.ico",
  },
  description: "PathMastery MVP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a1738] text-white">
        {children}
        <CursorEffect />
      </body>
    </html>
  );
}
