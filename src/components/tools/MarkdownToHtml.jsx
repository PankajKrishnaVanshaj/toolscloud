"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github.css"; // Default theme
import { FaDownload, FaSync, FaCopy, FaEye, FaEyeSlash } from "react-icons/fa";

const MarkdownToHtml = () => {
  const [markdown, setMarkdown] = useState("");
  const [html, setHtml] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [theme, setTheme] = useState("github");
  const [options, setOptions] = useState({
    gfm: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    highlight: true,
    smartypants: false,
  });
  const textareaRef = useRef(null);

  // Available highlight.js themes
  const themes = ["github", "monokai", "vs2015", "atom-one-dark", "solarized-light"];

  // Configure marked with highlight.js
  useEffect(() => {
    marked.setOptions({
      ...options,
      highlight: options.highlight
        ? (code, lang) => {
            try {
              return lang && hljs.getLanguage(lang)
                ? hljs.highlight(code, { language: lang }).value
                : hljs.highlightAuto(code).value;
            } catch {
              return code;
            }
          }
        : null,
      smartypants: options.smartypants,
    });
    convertMarkdown();
    // Dynamically load theme CSS
    const existingStyle = document.getElementById("hljs-theme");
    if (existingStyle) existingStyle.remove();
    const link = document.createElement("link");
    link.id = "hljs-theme";
    link.rel = "stylesheet";
    link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${theme}.min.css`;
    document.head.appendChild(link);
  }, [markdown, options, theme]);

  const convertMarkdown = useCallback(() => {
    try {
      const parsedHtml = marked.parse(markdown);
      setHtml(parsedHtml);
    } catch (err) {
      setHtml(`<p class="text-red-500">Error parsing Markdown: ${err.message}</p>`);
    }
  }, [markdown]);

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  // Export to file
  const exportToFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
    alert("Copied to clipboard!");
  };

  // Reset all
  const reset = () => {
    setMarkdown("");
    setHtml("");
    setShowPreview(true);
    setTheme("github");
    setOptions({
      gfm: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      highlight: true,
      smartypants: false,
    });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Markdown to HTML Converter
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Markdown Input
              </label>
              <textarea
                ref={textareaRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Enter your Markdown here... (e.g., # Heading\n**Bold** text)"
                className="w-full h-64 sm:h-80 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>

            {/* Options */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Rendering Options</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  { key: "gfm", label: "GitHub Flavored Markdown" },
                  { key: "breaks", label: "Line Breaks" },
                  { key: "pedantic", label: "Pedantic Mode" },
                  { key: "sanitize", label: "Sanitize HTML" },
                  { key: "highlight", label: "Syntax Highlighting" },
                  { key: "smartypants", label: "Smart Typography" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={options[key]}
                      onChange={(e) => handleOptionChange(key, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    {label}
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Highlight Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {themes.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTML Output
              </label>
              <textarea
                value={html}
                readOnly
                className="w-full h-40 p-3 border border-gray-300 rounded-md bg-gray-50 resize-y"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => exportToFile(html, "output.html", "text/html")}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Export HTML
                </button>
                <button
                  onClick={() => exportToFile(markdown, "input.md", "text/markdown")}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Export Markdown
                </button>
                <button
                  onClick={() => copyToClipboard(html)}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FaCopy className="mr-2" /> Copy HTML
                </button>
              </div>
            </div>

            {showPreview && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Live Preview
                </label>
                <div
                  className="p-4 border border-gray-300 rounded-md bg-white prose max-w-none overflow-auto max-h-96"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                {showPreview ? <FaEyeSlash className="mr-2" /> : <FaEye className="mr-2" />}
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Features & Usage */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Real-time Markdown to HTML conversion</li>
            <li>Customizable options: GFM, breaks, sanitization, highlighting, smart typography</li>
            <li>Multiple syntax highlighting themes</li>
            <li>Export as HTML or Markdown, copy to clipboard</li>
            <li>Responsive design with live preview toggle</li>
            <li>Example: `# Heading\n\`\`\`js\nconst x = 1;\n\`\`\``</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MarkdownToHtml;