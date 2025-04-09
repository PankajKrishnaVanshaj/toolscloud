import Footer from "@/components/Footer";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: {
    default: "PK ToolsCloud | Free Online Tools for Productivity",
    template: "%s - PK ToolsCloud | Smart Web Utilities & AI Tools",
  },
  description:
    "PK ToolsCloud provides 50+ free online tools for productivity, AI-powered text generation, PDF conversion, image processing, web development, SEO audits, unit conversion, and more. Boost efficiency with fast, user-friendly tools. No items detected. No rich results detected in this URL. Learn more.",
  keywords: [
    "PK ToolsCloud",
    "free online tools",
    "AI tools for content writing_openGraph",
    "best productivity tools online",
    "text editor with grammar check",
    "word counter online",
    "plagiarism checker free",
    "QR code generator online",
    "barcode generator free",
    "secure password generator",
    "JSON formatter and validator",
    "regex tester for developers",
    "convert PDF to Word online",
    "image compressor free",
    "SEO keyword research tool",
    "best SEO audit tool",
    "domain authority checker",
    "website speed test",
    "SSL certificate checker",
    "DNS lookup tool",
    "color palette generator online",
    "scientific calculator free",
    "loan and investment calculator",
    "unit converter online",
    "Pankri toolscloud utilities",
    "toolscloud pk online tools",
  ],
  openGraph: {
    title: "PK ToolsCloud | Free Online Tools for Productivity",
    description:
      "PK ToolsCloud offers 50+ free tools for productivity, AI text generation, PDF conversion, image processing, web dev, SEO, and more. No items detected. No rich results detected in this URL. Learn more.",
    url: "https://toolscloud.pankri.com",
    type: "website",
    images: [
      {
        url: "https://toolscloud.pankri.com/appicons/toolscloud.png",
        width: 1200,
        height: 630,
        alt: "PK ToolsCloud - Free Online Productivity Tools",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PK ToolsCloud | Free Online Tools for Productivity",
    description:
      "Boost productivity with PK ToolsCloud’s 50+ free tools: AI content, PDF conversion, SEO audits, and more. No items detected. No rich results detected in this URL. Learn more.",
    images: ["https://toolscloud.pankri.com/appicons/toolscloud.png"],
  },
};

export default function RootLayout({ children }) {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "PK ToolsCloud",
      url: "https://toolscloud.pankri.com",
      description:
        "PK ToolsCloud offers 1000+ free web-based tools for text editing, AI-generated content, PDF conversion, image processing, web development, SEO analysis, and more. Enhance productivity with fast and reliable tools.",
      keywords: [
        "free online tools",
        "AI-powered tools",
        "best SEO tools",
        "text editor online",
        "PDF to Word converter",
        "JSON formatter",
        "developer utilities",
        "unit conversion tools",
        "investment calculators",
        "PK ToolsCloud",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "PK ToolsCloud",
      url: "https://toolscloud.pankri.com",
      logo: "https://toolscloud.pankri.com/appicons/toolscloud.png",
      description:
        "PK ToolsCloud provides 50+ free online tools for productivity, AI-powered text generation, PDF conversion, image processing, web development, SEO audits, unit conversion, and more.",
      sameAs: [
        "https://twitter.com/pankri", // Add real social links if available
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.5", // Placeholder; replace with real data
        reviewCount: "150", // Placeholder; replace with real data
        bestRating: "5",
        worstRating: "1",
        itemReviewed: {
          "@type": "Organization",
          name: "PK ToolsCloud",
          url: "https://toolscloud.pankri.com",
        },
      },
    },
  ];

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}