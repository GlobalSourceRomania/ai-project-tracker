import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#00B4EF',
};

export const metadata: Metadata = {
  title: "AI Project Tracker",
  description: "Track and manage AI projects with real-time updates, bottleneck tracking, and task checklists",
  manifest: '/manifest.json?v=2',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AI Tracker',
  },
  icons: {
    icon: '/favicon-32x32.png?v=2',
    apple: '/apple-touch-icon.png?v=2',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://globalsource-ai-tracking.vercel.app',
    title: 'AI Project Tracker',
    description: 'Track and manage AI projects with real-time updates',
    images: [{
      url: 'https://globalsource-ai-tracking.vercel.app/logo-512x512.png',
      width: 512,
      height: 512,
    }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-[#080D1A] text-white">{children}</body>
    </html>
  );
}
