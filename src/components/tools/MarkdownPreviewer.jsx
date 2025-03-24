"use client";
import React, { useState, useCallback, useEffect } from "react";
import { FaCopy, FaDownload, FaEye, FaSync, FaCog } from "react-icons/fa";

const MarkdownPreviewer = () => {
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown Previewer!

Try some Markdown:
- **Bold** and *italic* text
- [Links](https://example.com)
- \`Inline code\`
- \`\`\`javascript
console.log("Hello World");
\`\`\`
- > Blockquote
- | Header | Value |
  |--------|-------|
  | A      | B     |
`);

  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [previewMode, setPreviewMode] = useState("split"); // "split", "editor", "preview"
  const [options, setOptions] = useState({
    sanitize: true,
    lineNumbers: false,
    wordWrap: true,
  });

  // Enhanced Markdown renderer
  const renderMarkdown = useCallback((text) => {
    try {
      let html = options.sanitize
        ? text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
        : text;

      // Headers
      html = html.replace(/^###### (.*)$/gm, '<h6 class="text-sm font-bold mb-2">$1</h6>')
        .replace(/^##### (.*)$/gm, '<h5 class="text-base font-bold mb-2">$1</h5>')
        .replace(/^#### (.*)$/gm, '<h4 class="text-lg font-bold mb-2">$1</h4>')
        .replace(/^### (.*)$/gm, '<h3 class="text-xl font-bold mb-3">$1</h3>')
        .replace(/^## (.*)$/gm, '<h2 class="text-2xl font-bold mb-4">$1</h2>')
        .replace(/^# (.*)$/gm, '<h1 class="text-3xl font-bold mb-5">$1</h1>');

      // Text formatting
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
        .replace(/__(.*?)__/g, '<strong class="font-bold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/_(.*?)_/g, '<em class="italic">$1</em>')
        .replace(/~~(.*?)~~/g, '<del class="line-through">$1</del>');

      // Blockquotes
      html = html.replace(/^> (.*)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 my-3 italic text-gray-600">$1</blockquote>');

      // Lists
      html = html.replace(/(^[-*+]\s+.*(?:\n[-*+]\s+.*)*)/gm, (match) => {
        const items = match.split("\n").map(item => item.replace(/^[-*+]\s+(.*)$/m, '<li class="ml-4">$1</li>')).join("");
        return `<ul class="list-disc my-3">${items}</ul>`;
      });
      html = html.replace(/(^\d+\.\s+.*(?:\n\d+\.\s+.*)*)/gm, (match) => {
        const items = match.split("\n").map(item => item.replace(/^\d+\.\s+(.*)$/m, '<li class="ml-4">$1</li>')).join("");
        return `<ol class="list-decimal my-3">${items}</ol>`;
      });

      // Tables
      html = html.replace(/^\|(.+)\|$/gm, (match, row) => {
        const cells = row.split("|").filter(Boolean).map(cell => `<td class="border px-2 py-1">${cell.trim()}</td>`).join("");
        return `<tr>${cells}</tr>`;
      }).replace(/(<tr>.*<\/tr>)(?:\n(<tr>.*<\/tr>))*/g, '<table class="border-collapse border my-3"><tbody>$&</tbody></table>');

      // Horizontal rule
      html = html.replace(/^\s*[-*_]{3,}\s*$/gm, '<hr class="border-t-2 border-gray-200 my-4"/>');

      // Code
      html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
        .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
          const lines = options.lineNumbers ? code.split("\n").map((line, i) => `<span class="pr-2 text-gray-500">${i + 1}</span>${line}`).join("\n") : code;
          return `<pre class="bg-gray-800 text-white p-3 rounded my-3 overflow-x-auto ${lang ? `language-${lang}` : ''}"><code>${lines}</code></pre>`;
        });

      // Links and Images
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-3 rounded"/>');

      // Paragraphs
      html = html.replace(/^(?!<(h[1-6]|ul|ol|blockquote|pre|hr|table|img|a)).*$/gm, '<p class="my-2">$&</p>');

      return html;
    } catch (err) {
      return `<p class="text-red-500">Error rendering Markdown: ${err.message}</p>`;
    }
  }, [options]);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setShowCopyAlert(true);
    setTimeout(() => setShowCopyAlert(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `markdown-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setMarkdown("");
    setShowCopyAlert(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative w-full bg-white shadow-xl rounded-xl p-6 sm:p-8">
        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Markdown copied to clipboard!
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Markdown Previewer</h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={() => setPreviewMode("split")}
            className={`flex-1 py-2 px-4 rounded-lg ${previewMode === "split" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"} hover:bg-blue-700 hover:text-white transition-colors`}
          >
            Split View
          </button>
          <button
            onClick={() => setPreviewMode("editor")}
            className={`flex-1 py-2 px-4 rounded-lg ${previewMode === "editor" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"} hover:bg-blue-700 hover:text-white transition-colors`}
          >
            Editor Only
          </button>
          <button
            onClick={() => setPreviewMode("preview")}
            className={`flex-1 py-2 px-4 rounded-lg ${previewMode === "preview" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"} hover:bg-blue-700 hover:text-white transition-colors`}
          >
            Preview Only
          </button>
        </div>

        {/* Main Content */}
        <div className={`grid gap-6 ${previewMode === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
          {(previewMode === "split" || previewMode === "editor") && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Markdown Editor</label>
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-blue-600 hover:text-blue-800 flex items-center" title="Copy">
                    <FaCopy />
                  </button>
                  <button onClick={handleDownload} className="text-green-600 hover:text-green-800 flex items-center" title="Download">
                    <FaDownload />
                  </button>
                  <button onClick={handleReset} className="text-red-600 hover:text-red-800 flex items-center" title="Reset">
                    <FaSync />
                  </button>
                </div>
              </div>
              <textarea
                className={`w-full h-96 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y bg-white text-gray-900 ${options.wordWrap ? "whitespace-pre-wrap" : "whitespace-nowrap"}`}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Enter your Markdown here..."
                aria-label="Markdown editor"
              />
            </div>
          )}

          {(previewMode === "split" || previewMode === "preview") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
              <div
                className="w-full h-96 p-4 border border-gray-300 rounded-lg bg-white text-gray-900 overflow-y-auto prose max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
                aria-label="Markdown preview"
              />
            </div>
          )}
        </div>

        {/* Options */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
            <FaCog className="mr-2" /> Options
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(options).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Examples */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-700 mb-2">Supported Markdown</h3>
          <pre className="bg-white p-3 rounded-md text-sm overflow-x-auto">
            {`# Headings (1-6)
**Bold**, *Italic*, ~~Strikethrough~~
- Unordered lists
1. Ordered lists
> Blockquotes
\`Inline code\`
\`\`\`javascript
// Code blocks with language
\`\`\`
[Links](https://example.com)
![Images](https://via.placeholder.com/150)
| Tables | Work |
|--------|------|
| Yes    | Great|
--- Horizontal Rules`}
          </pre>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-in;
          }
        `}</style>
      </div>
    </div>
  );
};

export default MarkdownPreviewer;