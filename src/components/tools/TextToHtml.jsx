"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync } from "react-icons/fa";

const TextToHtml = () => {
  const [text, setText] = useState("");
  const [htmlOutput, setHtmlOutput] = useState("");
  const [options, setOptions] = useState({
    headings: true,
    bold: true,
    italic: true,
    lists: true,
    links: true,
    code: true,
    tables: true,
    images: true,
    wrapInHtml: false,
    minify: false,
    customStyles: false,
  });
  const [previewMode, setPreviewMode] = useState("html"); // 'html', 'rendered', 'both'
  const [fontSize, setFontSize] = useState(16);

  const convertTextToHtml = useCallback(() => {
    let result = text.trim();

    // Apply formatting based on options
    if (options.headings) {
      result = result
        .replace(/^### (.*)$/gm, '<h3>$1</h3>')
        .replace(/^## (.*)$/gm, '<h2>$1</h2>')
        .replace(/^# (.*)$/gm, '<h1>$1</h1>');
    }
    if (options.bold) {
      result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }
    if (options.italic) {
      result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    if (options.lists) {
      result = result
        .replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
        .replace(/^\s*\d+\.\s+(.*)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, (match) =>
          match.includes("</ul>") ? match : `<ol>${match}</ol>`
        );
    }
    if (options.links) {
      result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    }
    if (options.code) {
      result = result
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
    }
    if (options.tables) {
      result = result.replace(
        /^\|(.+?)\|\n\|[-|:]+?\|\n([\s\S]*?)(?=\n\n|$)/gm,
        (match, header, rows) => {
          const headers = header
            .split("|")
            .filter(Boolean)
            .map((h) => `<th>${h.trim()}</th>`);
          const rowData = rows.split("\n").map((row) =>
            row
              .split("|")
              .filter(Boolean)
              .map((cell) => `<td>${cell.trim()}</td>`)
              .join("")
          );
          return `<table><thead><tr>${headers.join("")}</tr></thead><tbody>${rowData
            .map((r) => `<tr>${r}</tr>`)
            .join("")}</tbody></table>`;
        }
      );
    }
    if (options.images) {
      result = result.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
    }

    // Convert newlines to paragraphs
    result = result
      .split("\n\n")
      .map((paragraph) => (paragraph.trim() ? `<p>${paragraph}</p>` : ""))
      .join("");

    // Clean up newlines within paragraphs
    result = result.replace(/\n/g, "<br>");

    // Apply custom styles if enabled
    if (options.customStyles) {
      result = result
        .replace(/<h1>/g, '<h1 style="font-size: 2em; margin: 0.5em 0;">')
        .replace(/<h2>/g, '<h2 style="font-size: 1.5em; margin: 0.5em 0;">')
        .replace(/<h3>/g, '<h3 style="font-size: 1.25em; margin: 0.5em 0;">')
        .replace(/<p>/g, '<p style="margin: 1em 0; line-height: 1.6;">')
        .replace(/<a/g, '<a style="color: #1a73e8; text-decoration: underline;"');
    }

    // Wrap in full HTML document
    if (options.wrapInHtml) {
      result = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted Text</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: ${fontSize}px; padding: 20px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f2f2f2; }
    </style>
</head>
<body>
    ${result}
</body>
</html>`;
    }

    // Minify if enabled
    if (options.minify) {
      result = result.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
    }

    setHtmlOutput(result);
  }, [text, options, fontSize]);

  const handleTextChange = (value) => {
    setText(value);
    convertTextToHtml();
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => {
      const newOptions = { ...prev, [key]: value };
      setOptions(newOptions);
      convertTextToHtml();
      return newOptions;
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(htmlOutput);
  };

  const exportHtml = () => {
    const blob = new Blob([htmlOutput], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setText("");
    setHtmlOutput("");
    setOptions({
      headings: true,
      bold: true,
      italic: true,
      lists: true,
      links: true,
      code: true,
      tables: true,
      images: true,
      wrapInHtml: false,
      minify: false,
      customStyles: false,
    });
    setPreviewMode("html");
    setFontSize(16);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Text to HTML Converter
        </h1>

        <div className="space-y-6">
          {/* Input and Output Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plain Text Input
              </label>
              <textarea
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Enter text with Markdown-like syntax..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-48 resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output Preview
              </label>
              <div className="flex gap-2 mb-2">
                {["html", "rendered", "both"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPreviewMode(mode)}
                    className={`px-3 py-1 rounded-md capitalize ${
                      previewMode === mode
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              {previewMode === "html" ? (
                <textarea
                  value={htmlOutput}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 h-48 resize-y font-mono text-sm"
                />
              ) : previewMode === "rendered" ? (
                <div
                  className="w-full p-3 border border-gray-300 rounded-md bg-white h-48 overflow-auto"
                  dangerouslySetInnerHTML={{ __html: htmlOutput }}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-48">
                  <textarea
                    value={htmlOutput}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 resize-y font-mono text-sm"
                  />
                  <div
                    className="w-full p-3 border border-gray-300 rounded-md bg-white overflow-auto"
                    dangerouslySetInnerHTML={{ __html: htmlOutput }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Formatting Options</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {[
                { key: "headings", label: "Headings (#, ##, ###)" },
                { key: "bold", label: "Bold (**text**)" },
                { key: "italic", label: "Italic (*text*)" },
                { key: "lists", label: "Lists (- or 1.)" },
                { key: "links", label: "Links ([text](url))" },
                { key: "code", label: "Code (` or ```)" },
                { key: "tables", label: "Tables (| header |)" },
                { key: "images", label: "Images (![alt](url))" },
                { key: "wrapInHtml", label: "Full HTML Document" },
                { key: "minify", label: "Minify Output" },
                { key: "customStyles", label: "Apply Custom Styles" },
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
                Font Size ({fontSize}px)
              </label>
              <input
                type="range"
                min="12"
                max="24"
                value={fontSize}
                onChange={(e) => {
                  setFontSize(e.target.value);
                  convertTextToHtml();
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={copyToClipboard}
              disabled={!htmlOutput}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCopy className="mr-2" /> Copy to Clipboard
            </button>
            <button
              onClick={exportHtml}
              disabled={!htmlOutput}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Export as HTML
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Features & Syntax */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & Syntax</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert Markdown-like text to HTML</li>
              <li>Live preview: HTML code, rendered, or both</li>
              <li>Supports headings, bold, italic, lists, links, code, tables, and images</li>
              <li>Customizable options with font size adjustment</li>
              <li>Minify option and custom styling</li>
              <li>Syntax: # Heading, **bold**, *italic*, - list, [link](url), `code`, ```code```, | table |, ![alt](url)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToHtml;