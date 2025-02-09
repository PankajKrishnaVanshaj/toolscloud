export default function robots() {
    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
          disallow: "/dashboard/*",
        },
      ],
      sitemap: "https://toolscloud.pankri.com/sitemap.xml",
    };
  }
  