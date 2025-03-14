"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const HtmlToText = () => {
  const [htmlInput, setHtmlInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [options, setOptions] = useState({
    preserveLineBreaks: true,
    removeTags: true,
    trimWhitespace: false,
    decodeEntities: true,
    removeScripts: true,
    removeStyles: true,
    preserveLinks: false,
  });
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const convertHtmlToText = useCallback((html) => {
    let text = html;

    try {
      // Remove script and style tags first
      if (options.removeScripts) {
        text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
      }
      if (options.removeStyles) {
        text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
      }

      // Decode HTML entities
      if (options.decodeEntities) {
        const textarea = document.createElement("textarea");
        textarea.innerHTML = text;
        text = textarea.value;
      }

      // Preserve links as text
      if (options.preserveLinks) {
        text = text.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, "$2 ($1)");
      }

      // Remove HTML tags
      if (options.removeTags) {
        text = text.replace(/<[^>]+>/g, "");
      }

      // Preserve line breaks
      if (options.preserveLineBreaks) {
        text = text.replace(/<\/?(p|br|div|h[1-6])[^>]*>/gi, "\n");
      }

      // Trim whitespace
      if (options.trimWhitespace) {
        text = text
          .split("\n")
          .map((line) => line.replace(/\s+/g, " ").trim())
          .filter((line) => line.length > 0)
          .join("\n");
      }

      return text.trim();
    } catch (err) {
      throw new Error(`Error processing HTML: ${err.message}`);
    }
  }, [options]);

  const handleInputChange = (value) => {
    setHtmlInput(value);
    setError("");
    try {
      const result = convertHtmlToText(value);
      setTextOutput(result);
    } catch (err) {
      setError(err.message);
      setTextOutput("");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => handleInputChange(event.target.result);
      reader.onerror = () => setError("Error reading file");
      reader.readAsText(file);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textOutput);
    alert("Text copied to clipboard!");
  };

  const downloadText = () => {
    const blob = new Blob([textOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `converted-text-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setHtmlInput("");
    setTextOutput("");
    setError("");
    setOptions({
      preserveLineBreaks: true,
      removeTags: true,
      trimWhitespace: false,
      decodeEntities: true,
      removeScripts: true,
      removeStyles: true,
      preserveLinks: false,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => {
      const newOptions = { ...prev, [key]: value };
      try {
        setTextOutput(convertHtmlToText(htmlInput));
      } catch (err) {
        setError(err.message);
        setTextOutput("");
      }
      return newOptions;
    });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          HTML to Text Converter
        </h1>

        <div className="space-y-6">
          {/* Input/Output Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTML Input
              </label>
              <textarea
                value={htmlInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter or paste HTML here..."
                className="w-full h-48 sm:h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
              <input
                type="file"
                accept=".html,.txt"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Output
              </label>
              <textarea
                value={textOutput}
                readOnly
                placeholder="Converted text will appear here..."
                className="w-full h-48 sm:h-64 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none resize-y"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={copyToClipboard}
                  disabled={!textOutput}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  onClick={downloadText}
                  disabled={!textOutput}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Conversion Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                { key: "preserveLineBreaks", label: "Preserve Line Breaks" },
                { key: "removeTags", label: "Remove HTML Tags" },
                { key: "trimWhitespace", label: "Trim Whitespace" },
                { key: "decodeEntities", label: "Decode HTML Entities" },
                { key: "removeScripts", label: "Remove Scripts" },
                { key: "removeStyles", label: "Remove Styles" },
                { key: "preserveLinks", label: "Preserve Links as Text" },
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
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button
              onClick={reset}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Live HTML to text conversion</li>
              <li>File upload support (.html, .txt)</li>
              <li>Advanced options: scripts/styles removal, link preservation</li>
              <li>Copy to clipboard or download as .txt</li>
              <li>Example: &lt;p&gt;Hello &lt;a href="example.com"&gt;Link&lt;/a&gt;&lt;/p&gt; → Hello Link (example.com)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HtmlToText;