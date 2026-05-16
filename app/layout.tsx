import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "./providers";

// Field Guide type system: Instrument Serif (display, italic) · Geist (body) · Geist Mono (stamps)
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic", "normal"],
  display: "swap",
  variable: "--font-serif",
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
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable} antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark') {
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
