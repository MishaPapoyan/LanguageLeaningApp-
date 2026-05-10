import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lingova — Learn Languages",
    short_name: "Lingova",
    description: "Learn languages through stories, games, and AI conversation.",
    start_url: "/home",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#10b981",
    orientation: "portrait-primary",
    categories: ["education", "language"],
    lang: "en",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/og-image.png",
        sizes: "1200x630",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Games",
        short_name: "Games",
        description: "Jump straight into language games",
        url: "/games",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Review Words",
        short_name: "Review",
        description: "Review your saved words",
        url: "/review",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
