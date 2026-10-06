import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "survey-core/survey-core.css";
import "./survey-xg-theme.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/ui/toast";
import { HostProviders } from "@/components/HostProviders";

// Rounded, friendly sans to match the brand mark (components/brand/SeagullMark.tsx).
const brandSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Seagull - Secure Enterprise API Gateway for Unified Layer Linking",
  description: "Seagull (Secure Enterprise API Gateway for Unified Layer Linking) - High Performance API Gateway & Management Console",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${brandSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <TooltipProvider>
            <HostProviders>{children}</HostProviders>
          </TooltipProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
