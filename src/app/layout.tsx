import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter_Tight, Playfair_Display } from "next/font/google";
import "./globals.css";

const body = Inter_Tight({ variable: "--font-body", weight: ["300", "400", "600"], subsets: ["latin"] });
const display = Playfair_Display({ variable: "--font-display", style: ["normal", "italic"], subsets: ["latin"] });
const mono = IBM_Plex_Mono({ variable: "--font-mono", weight: ["400", "600"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Topos | Spatial Engineering & AR Inpainting Engine",
  description: "Digitally erase your room, map the depth, and furnish an empty canvas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body id="app-root" className={`${body.variable} ${display.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
