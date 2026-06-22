import type { Metadata } from "next";
import localFont from "next/font/local";
import { buildMetadata } from "@/lib/seo";
import "./globals.css";

const acherus = localFont({
  src: [
    { path: "../../public/fonts/SVN-Acherus_Arial/SVN-Acherus-normal-400-100.otf", weight: "400" },
    { path: "../../public/fonts/SVN-Acherus_Arial/SVN-Acherus-normal-700-100.otf", weight: "700" },
  ],
  variable: "--font-acherus",
  display: "swap",
});

const arial = localFont({
  src: [{ path: "../../public/fonts/SVN-Acherus_Arial/Arial-normal-300-100.ttf", weight: "300" }],
  variable: "--font-arial",
  display: "swap",
});

export const metadata: Metadata = buildMetadata();

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${acherus.variable} ${arial.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
