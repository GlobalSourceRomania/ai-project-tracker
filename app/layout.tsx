import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AmbientBackground from "@/components/AmbientBackground";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#07090d',
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
    icon: '/favicon-32x32.png',
    apple: '/apple-touch-icon-v3.png',
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
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body>
        <AmbientBackground />
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
