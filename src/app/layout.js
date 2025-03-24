import Footer from "@/components/Footer";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: {
    default: "PK ToolsCloud | Free Online Tools for Productivity & SEO",
    template: "%s - PK ToolsCloud | Smart Web Utilities & AI Tools",
  },
  description:
    "PK ToolsCloud provides 50+ free online tools for productivity, AI-powered text generation, PDF conversion, image processing, web development, SEO audits, unit conversion, and more. Boost efficiency with fast, user-friendly tools.",
  keywords: [
    "PK ToolsCloud",
    "free online tools",
    "AI tools for content writing",
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
};

export default function RootLayout({ children }) {
  const globalJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PK ToolsCloud",
    url: "https://toolscloud.pankri.com",
    description:
      "PK ToolsCloud offers 50+ free web-based tools for text editing, AI-generated content, PDF conversion, image processing, web development, SEO analysis, and more. Enhance productivity with fast and reliable tools.",
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
    publisher: {
      "@type": "Organization",
      name: "PK ToolsCloud",
      url: "https://toolscloud.pankri.com",
      logo: "https://toolscloud.pankri.com/appicons/toolscloud.png",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(globalJsonLd),
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
