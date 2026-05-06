import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter-tight",
});

export const metadata: Metadata = {
  title: "Lingova — Learn Languages",
  description: "Every goal. Every age. Every language. Learn through stories, AI conversation, and games. Interactive lessons, vocabulary games, and an AI tutor in your pocket.",
  metadataBase: new URL("https://lingova.app"),
  openGraph: {
    title: "Lingova — Learn Languages",
    description: "Every goal. Every age. Every language. Learn through stories, AI conversation, and games.",
    url: "https://lingova.app",
    siteName: "Lingova",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lingova — Every goal. Every age. Every language.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lingova — Learn Languages",
    description: "Every goal. Every age. Every language.",
    images: ["/og-image.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lingova",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${interTight.variable} ${GeistMono.variable} antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') !== 'light') {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
