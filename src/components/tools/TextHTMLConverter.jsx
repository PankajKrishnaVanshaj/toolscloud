"use client";
import React, { useState } from "react";

const TextHTMLConverter = () => {
  const [inputText, setInputText] = useState("");
  const [htmlOutput, setHtmlOutput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    wrapParagraphs: true,
    detectHeadings: true,
    detectLists: true,
    escapeSpecialChars: true,
  });

  // Convert text to HTML
  const convertToHTML = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to convert" };
    }

    let lines = text.split("\n").filter(line => line.trim());
    let result = [];

    const escapeHtml = (str) => {
      if (!options.escapeSpecialChars) return str;
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    };

    let inList = false;
    let listType = "";
    let listItems = [];

    lines.forEach((line, index) => {
      line = line.trim();

      // Detect headings (e.g., # Heading, ## Subheading)
      if (options.detectHeadings && line.match(/^#+/)) {
        if (inList) {
          result.push(renderList(listType, listItems));
          inList = false;
          listItems = [];
        }
        const level = Math.min(line.match(/^#+/)[0].length, 6);
        const content = escapeHtml(line.replace(/^#+/, "").trim());
        result.push(`<h${level}>${content}</h${level}>`);
        return;
      }

      // Detect lists (e.g., - item or 1. item)
      if (options.detectLists && (line.match(/^[-*]/) || line.match(/^\d+\./))) {
        if (!inList) {
          inList = true;
          listType = line.match(/^[-*]/) ? "ul" : "ol";
        } else if (listType === "ul" && line.match(/^\d+\./) || listType === "ol" && line.match(/^[-*]/)) {
          result.push(renderList(listType, listItems));
          listType = line.match(/^[-*]/) ? "ul" : "ol";
          listItems = [];
        }
        const content = escapeHtml(line.replace(/^[-*]|\d+\./, "").trim());
        listItems.push(`<li>${content}</li>`);
        return;
      }

      // Close list if needed
      if (inList) {
        result.push(renderList(listType, listItems));
        inList = false;
        listItems = [];
      }

      // Wrap in paragraph if not empty
      if (options.wrapParagraphs && line) {
        result.push(`<p>${escapeHtml(line)}</p>`);
      } else if (line) {
        result.push(escapeHtml(line));
      }
    });

    // Close any remaining list
    if (inList) {
      result.push(renderList(listType, listItems));
    }

    return result.join("\n");
  };

  const renderList = (type, items) => {
    return `<${type}>\n  ${items.join("\n  ")}\n</${type}>`;
  };

  const handleConvert = async () => {
    setError("");
    setHtmlOutput("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = convertToHTML(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setHtmlOutput(result);
    } catch (err) {
      setError("An error occurred while converting the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setHtmlOutput("");
    setError("");
  };

  const handleOptionChange = (option) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text to HTML Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Convert:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-y transition-all"
              placeholder={"# Heading\n- List item\nText paragraph"}
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Conversion Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(options).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handleOptionChange(key)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{key.replace(/([A-Z])/g, " $1").trim()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleConvert}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Converting..." : "Convert to HTML"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Output Display */}
        {htmlOutput && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              HTML Output
            </h2>
            <pre className="mt-3 text-gray-700 whitespace-pre-wrap break-all">
              {htmlOutput}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(htmlOutput)}
              className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
            >
              Copy to Clipboard
            </button>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextHTMLConverter;