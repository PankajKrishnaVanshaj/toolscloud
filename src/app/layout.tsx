import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import GA from "@/components/GA";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

interface OpenGraphImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

interface OpenGraph {
  title: string;
  description: string;
  url: string;
  type: string;
  locale: string;
  images: OpenGraphImage[];
}

interface TwitterImage {
  url: string;
  alt: string;
}

interface Twitter {
  card: string;
  title: string;
  description: string;
  site: string;
  images: TwitterImage[];
}

interface ExtendedMetadata extends Metadata {
  keywords?: string | string[];
  openGraph: OpenGraph;
  twitter: Twitter;
}

export const metadata: ExtendedMetadata = {
  title: "PK ToolsCloud - Free Unlimited File Converter",
  description: `Unlock the full potential of your media with PK ToolsCloud – the premier online solution for
limitless and complimentary multimedia conversion. Seamlessly transmute images, audio, and
videos without boundaries. Don't settle for ordinary content; elevate your creations today! Convert your files effortlessly with our intuitive interface. Enjoy hassle-free conversion of various file formats including JPG, PNG, MP3, MP4, WAV, and more. Whether you're a designer, musician, or content creator, PK ToolsCloud empowers you to transform your files with ease.`,
  creator: "PanKri",
  keywords:
    "image converter, video converter, audio converter, unlimited image converter, unlimited audio converter, unlimited video converter, file converter, multimedia converter, online converter, free converter, file format converter, JPG converter, PNG converter, MP3 converter, MP4 converter, WAV converter, online file converter, image transformation, audio enhancement, video editing, creative tools, design software, multimedia tools, multimedia conversion, media file converter, graphic design tool",
  openGraph: {
    title: "PK ToolsCloud - Free Unlimited File Converter",
    description: `Unlock the full potential of your media with PK ToolsCloud – the premier online solution for
limitless and complimentary multimedia conversion. Seamlessly transmute images, audio, and
videos without boundaries. Don't settle for ordinary content; elevate your creations today! Convert your files effortlessly with our intuitive interface. Enjoy hassle-free conversion of various file formats including JPG, PNG, MP3, MP4, WAV, and more. Whether you're a designer, musician, or content creator, PK ToolsCloud empowers you to transform your files with ease.`,
    url: "https://toolscloud.pankri.com",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://toolscloud.pankri.com/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PK ToolsCloud - Free Unlimited File Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PK ToolsCloud - Free Unlimited File Converter",
    description: `Unlock the full potential of your media with PK ToolsCloud – the premier online solution for
limitless and complimentary multimedia conversion. Seamlessly transmute images, audio, and
videos without boundaries. Don't settle for ordinary content; elevate your creations today! Convert your files effortlessly with our intuitive interface. Enjoy hassle-free conversion of various file formats including JPG, PNG, MP3, MP4, WAV, and more. Whether you're a designer, musician, or content creator, PK ToolsCloud empowers you to transform your files with ease.`,
    site: "@yourtwitterhandle",
    images: [
      {
        url: "https://toolscloud.pankri.com/images/twitter-card.jpg",
        alt: "PK ToolsCloud - Free Unlimited File Converter",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ogImage = metadata.openGraph.images[0];
  const twitterImage = metadata.twitter.images[0];

  const keywords = Array.isArray(metadata.keywords)
    ? metadata.keywords.join(", ")
    : metadata.keywords ?? "";

  return (
    <html lang="en">
      <head>
        <meta name="description" content={metadata.description!} />
        <meta name="keywords" content={keywords} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta
          property="og:description"
          content={metadata.openGraph.description}
        />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:type" content={metadata.openGraph.type} />
        <meta property="og:locale" content={metadata.openGraph.locale} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta
          property="og:image:width"
          content={metadata.openGraph.images[0].width.toString()}
        />
        <meta
          property="og:image:height"
          content={metadata.openGraph.images[0].height.toString()}
        />
        <meta
          property="og:image:alt"
          content={metadata.openGraph.images[0].alt}
        />
        <meta name="twitter:card" content={metadata.twitter.card} />
        <meta name="twitter:title" content={metadata.twitter.title} />
        <meta
          name="twitter:description"
          content={metadata.twitter.description}
        />
        <meta name="twitter:site" content={metadata.twitter.site} />
        <meta name="twitter:image" content={metadata.twitter.images[0].url} />
        <meta
          name="twitter:image:alt"
          content={metadata.twitter.images[0].alt}
        />
        <meta
          name="google-site-verification"
          content="V8lmEvFOdYBlChgR6pYABBZBhI1EFnPb1YuxTTdHXMU"
        />
      </head>
      <body className={inter.className}>
        <GA GA_MEASUREMENT_ID="G-52GQ441X7H" />
        <Navbar />
        <Toaster />
        <div className="pt-32 min-h-screen lg:pt-36 2xl:pt-44 container max-w-4xl lg:max-w-6xl 2xl:max-w-7xl">
          {children}
        </div>
      </body>
    </html>
  );
}
