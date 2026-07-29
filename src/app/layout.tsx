import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Topos | Spatial Engineering & AR Inpainting",
  description: "Digitally erase your room, map the depth, and furnish an empty canvas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
