"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaEye,
  FaEyeSlash,
  FaBold,
  FaItalic,
  FaListUl,
  FaListOl,
  FaHeading,
} from "react-icons/fa";

const TextMarkdownEditor = () => {
  const [markdown, setMarkdown] = useState("");
  const [htmlPreview, setHtmlPreview] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    links: true,             // Enable links [text](url)
    codeBlocks: true,        // Enable ```code```
    tables: true,            // Enable |table|syntax|
    autoScroll: true,        // Auto-scroll preview
  });

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

    // Links [text](url)
    if (options.links) {
      html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');
    }

    // Code blocks (```language\ncode\n```)
    if (options.codeBlocks) {
      html = html.replace(/```(\w+)?\n([\s\S]+?)\n```/g, (match, lang, code) => {
        return `<pre><code class="${lang ? `language-${lang}` : ""}">${code.trim()}</code></pre>`;
      });
    }

    // Inline code (`code`)
    html = html.replace(/`(.+?)`/g, "<code>$1</code>");

    // Tables (| header | header |\n|------|------|\n| cell | cell |)
    if (options.tables) {
      html = html.replace(/^\|(.+)\|\n\|([-:]+)\|(\n\|.+)+$/gm, (match) => {
        const rows = match.trim().split("\n");
        const headers = rows[0].split("|").slice(1, -1).map(h => h.trim());
        const aligns = rows[1].split("|").slice(1, -1).map(a => {
          if (a.startsWith(":") && a.endsWith(":")) return "center";
          if (a.endsWith(":")) return "right";
          return "left";
        });
        const body = rows.slice(2).map(row => row.split("|").slice(1, -1).map(c => c.trim()));
        
        let tableHtml = "<table><thead><tr>";
        headers.forEach((h, i) => {
          tableHtml += `<th style="text-align: ${aligns[i]}">${h}</th>`;
        });
        tableHtml += "</tr></thead><tbody>";
        body.forEach(row => {
          tableHtml += "<tr>";
          row.forEach((cell, i) => {
            tableHtml += `<td style="text-align: ${aligns[i]}">${cell}</td>`;
          });
          tableHtml += "</tr>";
        });
        tableHtml += "</tbody></table>";
        return tableHtml;
      });
    }

    // Unordered lists (- item)
    html = html.replace(/^-\s+(.+)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.+<\/li>\n?)+/g, "<ul>$&</ul>");
    html = html.replace(/<\/li>\n/g, "</li>");

    // Ordered lists (1. item)
    html = html.replace(/^(\d+)\.\s+(.+)$/gm, "<li>$2</li>");
    html = html.replace(/(<li>.+<\/li>\n?)+/g, "<ol>$&</ol>");
    html = html.replace(/<\/li>\n/g, "</li>");

    // Paragraphs
    html = html.split("\n").map(line => {
      line = line.trim();
      if (line && !line.match(/^<(h[1-6]|ul|ol|li|pre|table)/)) {
        return `<p>${line}</p>`;
      }
      return line;
    }).join("\n");

    // Line breaks
    html = html.replace(/\n/g, "<br>");

    return html;
  };

  useEffect(() => {
    const preview = convertMarkdownToHTML(markdown);
    setHtmlPreview(preview);
  }, [markdown, options]);

  const handleClear = () => {
    setMarkdown("");
  };

  const handleCopy = (type) => {
    if (type === "markdown") {
      navigator.clipboard.writeText(markdown);
    } else {
      navigator.clipboard.writeText(htmlPreview);
    }
  };

  const exportMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `markdown_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const insertMarkdown = (syntax) => {
    const textarea = document.getElementById("markdown-input");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    let newText = "";

    switch (syntax) {
      case "bold":
        newText = `${markdown.substring(0, start)}**${selectedText || "text"}**${markdown.substring(end)}`;
        break;
      case "italic":
        newText = `${markdown.substring(0, start)}*${selectedText || "text"}*${markdown.substring(end)}`;
        break;
      case "ul":
        newText = `${markdown.substring(0, start)}- ${selectedText || "item"}\n${markdown.substring(end)}`;
        break;
      case "ol":
        newText = `${markdown.substring(0, start)}1. ${selectedText || "item"}\n${markdown.substring(end)}`;
        break;
      case "heading":
        newText = `${markdown.substring(0, start)}# ${selectedText || "Heading"}\n${markdown.substring(end)}`;
        break;
      default:
        return;
    }

    setMarkdown(newText);
    setHistory(prev => [...prev, markdown].slice(-5));
    textarea.focus();
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col ">
      <div className=" mx-auto w-full flex-grow flex flex-col bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-gray-900">
          Advanced Markdown Editor
        </h1>

        {/* Editor Controls */}
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => insertMarkdown("heading")}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              title="Add Heading"
            >
              <FaHeading />
            </button>
            <button
              onClick={() => insertMarkdown("bold")}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              title="Bold"
            >
              <FaBold />
            </button>
            <button
              onClick={() => insertMarkdown("italic")}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              title="Italic"
            >
              <FaItalic />
            </button>
            <button
              onClick={() => insertMarkdown("ul")}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              title="Unordered List"
            >
              <FaListUl />
            </button>
            <button
              onClick={() => insertMarkdown("ol")}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              title="Ordered List"
            >
              <FaListOl />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
            >
              {showPreview ? <FaEyeSlash className="inline mr-2" /> : <FaEye className="inline mr-2" />}
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
            <button
              onClick={() => handleCopy("markdown")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Markdown
            </button>
            <button
              onClick={() => handleCopy("html")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy HTML
            </button>
            <button
              onClick={exportMarkdown}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold"
            >
              <FaDownload className="inline mr-2" />
              Export
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold"
            >
              <FaTrash className="inline mr-2" />
              Clear
            </button>
          </div>
        </div>

        {/* Editor and Preview */}
        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          {/* Markdown Input */}
          <div className={`w-full ${showPreview ? "md:w-1/2" : "md:w-full"} flex flex-col min-h-80`}>
            <label className="block text-gray-700 font-medium mb-2">Markdown Input</label>
            <textarea
              id="markdown-input"
              value={markdown}
              onChange={(e) => {
                setMarkdown(e.target.value);
                setHistory(prev => [...prev, markdown].slice(-5));
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow resize-y transition-all bg-white text-gray-900"
              placeholder={"# Heading\n**Bold** text\n- List item\n[Link](https://example.com)\n```\nCode block\n```"}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {markdown.length} characters
            </div>
          </div>

          {/* HTML Preview */}
          {showPreview && (
            <div className="w-full md:w-1/2 flex flex-col">
              <label className="block text-gray-700 font-medium mb-2">Live Preview</label>
              <div
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 flex-grow overflow-auto prose prose-blue"
                dangerouslySetInnerHTML={{ __html: htmlPreview }}
                style={{ maxHeight: "calc(100vh - 300px)" }}
              />
            </div>
          )}
        </div>

        {/* Options */}
        <div className="mt-6 p-4 bg-gray-200 rounded-lg">
          <p className="text-sm font-medium text-gray-700">Editor Options:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.links}
                  onChange={() => handleOptionChange("links", !options.links)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Enable Links</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.codeBlocks}
                  onChange={() => handleOptionChange("codeBlocks", !options.codeBlocks)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Enable Code Blocks</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.tables}
                  onChange={() => handleOptionChange("tables", !options.tables)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Enable Tables</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.autoScroll}
                  onChange={() => handleOptionChange("autoScroll", !options.autoScroll)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Auto-Scroll Preview</span>
              </label>
            </div>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Changes (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>"{entry.slice(0, 30)}{entry.length > 30 ? "..." : ""}"</span>
                  <button
                    onClick={() => setMarkdown(entry)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Live preview with Markdown syntax</li>
            <li>Support for headings, bold, italic, lists, links, code, tables</li>
            <li>Formatting toolbar for quick edits</li>
            <li>Customizable options for Markdown features</li>
            <li>Copy Markdown/HTML, export as .md, history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextMarkdownEditor;