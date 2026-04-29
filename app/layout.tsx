import type { Metadata } from "next";
import { Inter, Inter_Tight, Geist_Mono } from "next/font/google";
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
  variable: "--font-display",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "LangCraft — Learn Languages",
  description: "Learn languages through stories, AI conversation, and games. Interactive lessons, vocabulary games, and an AI tutor in your pocket.",
  metadataBase: new URL("https://langcraft.app"),
  openGraph: {
    title: "LangCraft — Learn Languages",
    description: "Learn languages through stories, AI conversation, and games. Interactive lessons, vocabulary games, and an AI tutor in your pocket.",
    url: "https://langcraft.app",
    siteName: "LangCraft",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LangCraft — Learn Languages",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LangCraft — Learn Languages",
    description: "Learn languages through stories, AI conversation, and games.",
    images: ["/og-image.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${interTight.variable} ${geistMono.variable}`}>
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
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
