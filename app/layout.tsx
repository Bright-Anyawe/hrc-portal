import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HRC Portal",
  description: "Staff and client portal for Hedge Resource Centre",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
