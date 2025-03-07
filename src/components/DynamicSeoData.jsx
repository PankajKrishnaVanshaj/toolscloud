// src/components/DynamicSeoData.js
const defaultMetadata = {
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
  
  const loadSeoData = async (code) => {
    try {
      const seoModule = await import(`@/staticData/seoData/${code}`);
      return seoModule.default || defaultMetadata;
    } catch (error) {
      // Only log if it's not a "module not found" error
      if (!error.message.includes("Cannot find module")) {
        console.error(`Failed to load SEO data for ${code}:`, error);
      }
      return defaultMetadata; // Silently return default metadata for missing files
    }
  };
  
  export default loadSeoData;