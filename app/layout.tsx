import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Sea } from "@/components/sea";
import { site } from "@/content/site";
import "./globals.css";

// Used where SF Pro isn't available (anything but Apple devices), so Apple
// devices never download it.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: site.name,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#080a0e",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body>
        {/* One sea for every page, so it doesn't change when navigating. */}
        <Sea />
        {children}
      </body>
    </html>
  );
}
