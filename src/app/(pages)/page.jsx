"use client";

import Link from "next/link";
import { FaCode } from "react-icons/fa";
import ToolList from "@/staticData/ToolList";
import { MdPalette, MdTransform } from "react-icons/md";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="text-center py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
          Welcome to PK ToolsCloud
        </h1>
        <p className="mt-3 text-lg md:text-xl text-gray-700 px-4 sm:px-8 md:px-12 lg:px-16">
          Explore <strong>PK ToolsCloud</strong>, your go-to platform for free
          online tools, including AI automation, SEO optimization, text
          formatting, code generation, image editing, PDF management, unit
          conversion, security checks, and social media tools. Boost
          productivity, enhance creativity, and simplify tasks with our powerful
          digital solutions!
        </p>

        <Link
          href="/tools"
          className="mt-6 inline-block px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-primary to-secondary rounded-lg shadow-md hover:opacity-90 transition-all"
        >
          Explore Tools
        </Link>
      </header>

      {/* Featured Tools Section */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-secondary to-primary text-transparent bg-clip-text">
          Featured Tools
        </h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Color Tools",
              description: "Explore and generate beautiful color palettes.",
              icon: <MdPalette className="text-6xl text-primary" />,
              slug: "/color-tools",
            },
            {
              title: "Data Converter",
              description: "Easily convert data formats with powerful tools.",
              icon: <MdTransform className="text-6xl text-secondary" />,
              slug: "/data-converter-tools",
            },
            {
              title: "Developer Tools",
              description:
                "Enhance your coding experience with essential utilities.",
              icon: <FaCode className="text-6xl text-primary" />,
              slug: "/developer-tools",
            },
          ].map((tool, index) => (
            <div
              key={index}
              className="p-5 bg-white shadow-md rounded-lg transition-transform transform hover:scale-105 text-center border border-gray-200 hover:shadow-xl"
            >
              {/* Centered Icon */}
              <div className="flex items-center justify-center h-20 w-20 mx-auto">
                {tool.icon}
              </div>

              {/* Title with Link */}
              <h3 className="text-xl font-semibold mt-3 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                <Link href={tool.slug}>{tool.title}</Link>
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-center mt-2">
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
          Browse by Categories
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {ToolList.map((category) => (
            <Link
              key={category.slug}
              href={`/${category.slug}`}
              className="flex items-center gap-2 px-4 py-1.5 bg-white text-secondary shadow-md border border-gray-300 rounded-xl hover:text-primary hover:border-primary hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <span className="text-xl">{category.icon}</span>
              <span className="font-medium bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                {category.category}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
