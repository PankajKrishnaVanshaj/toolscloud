"use client";
import React, { useState, useEffect } from "react";

const TextMarkdownEditor = () => {
  const [markdown, setMarkdown] = useState("");
  const [htmlPreview, setHtmlPreview] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  // Markdown to HTML conversion function
  const convertMarkdownToHTML = (text) => {
    let html = text;

    // Headings (# Heading)
    html = html.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
      const level = hashes.length;
      return `<h${level}>${content.trim()}</h${level}>`;
    });

    // Bold (**text** or __text__)
    html = html.replace(/\*\*(.+?)\*\*|__(.+?)__/g, "<strong>$1$2</strong>");

    // Italic (*text* or _text_)
    html = html.replace(/\*(.+?)\*|_(.+?)_/g, "<em>$1$2</em>");

    // Unordered lists (- item)
    html = html.replace(/^-\s+(.+)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.+<\/li>\n?)+/g, "<ul>$&</ul>");
    html = html.replace(/<\/li>\n/g, "</li>");

    // Ordered lists (1. item)
    html = html.replace(/^(\d+)\.\s+(.+)$/gm, "<li>$2</li>");
    html = html.replace(/(<li>.+<\/li>\n?)+/g, "<ol>$&</ol>");
    html = html.replace(/<\/li>\n/g, "</li>");

    // Paragraphs (wrap non-tagged lines)
    html = html.split("\n").map(line => {
      line = line.trim();
      if (line && !line.match(/^<(h[1-6]|ul|ol|li)/)) {
        return `<p>${line}</p>`;
      }
      return line;
    }).join("\n");

    // Convert line breaks outside of tags
    html = html.replace(/\n/g, "<br>");

    return html;
  };

  // Update preview whenever markdown changes
  useEffect(() => {
    const preview = convertMarkdownToHTML(markdown);
    setHtmlPreview(preview);
  }, [markdown]);

  const handleClear = () => {
    setMarkdown("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6">
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">
          Markdown Editor
        </h1>

        {/* Editor Controls */}
        <div className="flex justify-between mb-4">
          <div className="space-x-2">
            <button
              onClick={togglePreview}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
            >
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
            >
              Copy Markdown
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Editor and Preview */}
        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          {/* Markdown Input */}
          <div className={`w-full ${showPreview ? "md:w-1/2" : "md:w-full"}`}>
            <label className="block text-gray-700 font-medium mb-2">
              Markdown Input
            </label>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-96 resize-y transition-all"
              placeholder={"# Heading\n**Bold** text\n- List item"}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {markdown.length} characters
            </div>
          </div>

          {/* HTML Preview */}
          {showPreview && (
            <div className="w-full md:w-1/2">
              <label className="block text-gray-700 font-medium mb-2">
                Live Preview
              </label>
              <div
                className="w-full p-3 border border-gray-300 rounded-lg bg-white h-96 overflow-auto prose prose-blue"
                dangerouslySetInnerHTML={{ __html: htmlPreview }}
              />
            </div>
          )}
        </div>

       
      </div>
    </div>
  );
};

export default TextMarkdownEditor;