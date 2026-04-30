import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: ["/api/", "/admin/", "/profile/", "/teacher/"],
      allow: "/",
    },
    sitemap: "https://lingova.app/sitemap.xml",
  };
}
