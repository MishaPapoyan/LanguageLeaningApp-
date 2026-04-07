import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "LangCraft — Learn French",
  description: "Learn French through stories, AI conversation, and games. Interactive lessons, vocabulary games, and an AI tutor in your pocket.",
  metadataBase: new URL("https://langcraft.app"),
  openGraph: {
    title: "LangCraft — Learn French",
    description: "Learn French through stories, AI conversation, and games. Interactive lessons, vocabulary games, and an AI tutor in your pocket.",
    url: "https://langcraft.app",
    siteName: "LangCraft",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LangCraft — Learn French",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LangCraft — Learn French",
    description: "Learn French through stories, AI conversation, and games.",
    images: ["/og-image.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={plusJakarta.variable}>
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
