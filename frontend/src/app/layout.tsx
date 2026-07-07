import type { Metadata } from "next";
import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { ThemeProvider } from "@/components/theme-provider"; // Import added

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600', '700'] });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-body', weight: ['400', '500', '600', '700'] });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'] });

export const metadata: Metadata = {
  title: "LogicLens DAM",
  description: "Search, preview, and manage company assets stored in Google Drive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return ( <html lang="en" suppressHydrationWarning>
      <body className="h-screen flex flex-col overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider
          attribute="class" // Tells next-themes to add 'dark' class
          defaultTheme="system" // Follows your OS setting by default
          enableSystem
          disableTransitionOnChange // Prevents ugly transition flash
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}