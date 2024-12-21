"use client";

import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { useTheme } from "next-themes";
import DarkModeToggle from "@/components/darkmode-toggle";

const font = Geist();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DarkModeToggle />
          {children}
          <Toaster
            richColors
            theme={(useTheme().theme as "light" | "dark") || "system"}
            toastOptions={{}}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
