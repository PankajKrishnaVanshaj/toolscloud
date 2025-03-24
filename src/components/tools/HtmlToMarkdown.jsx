"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import htmlToMarkdown from "html-to-md";
import { FaCopy, FaDownload, FaSync, FaEye, FaEyeSlash } from "react-icons/fa";

const HtmlToMarkdown = () => {
  const [htmlInput, setHtmlInput] = useState("");
  const [markdownOutput, setMarkdownOutput] = useState("");
  const [error, setError] = useState("");
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [liveConvert, setLiveConvert] = useState(false);
  const [conversionOptions, setConversionOptions] = useState({
    preserveTags: false,
    tableSupport: true,
    stripComments: true,
    listStyle: "asterisk", // New: bullet list style
  });
  const fileInputRef = useRef(null);

  // Validate HTML
  const validateHTML = (html) => {
    if (!html.trim()) return "HTML input is empty";
    if (!html.includes("<") || !html.includes(">"))
      return "Input doesn’t appear to be valid HTML";
    return "";
  };

  // Convert HTML to Markdown
  const convertToMarkdown = useCallback(() => {
    const validationError = validateHTML(htmlInput);
    if (validationError) {
      setError(validationError);
      setMarkdownOutput("");
      return;
    }

    try {
      setError("");
      const options = {
        preserveTags: conversionOptions.preserveTags ? ["<custom-tag>"] : [],
        ignore: conversionOptions.tableSupport
          ? conversionOptions.stripComments
            ? ["!--"]
            : []
          : ["table", "tr", "td", "th", "!--"],
        listStyle: conversionOptions.listStyle === "dash" ? "-" : "*",
      };
      const markdown = htmlToMarkdown(htmlInput, options);
      setMarkdownOutput(markdown);
    } catch (err) {
      setError("Conversion error: " + err.message);
      setMarkdownOutput("");
    }
  }, [htmlInput, conversionOptions]);

  // Handle live conversion
  useEffect(() => {
    if (liveConvert && htmlInput) {
      convertToMarkdown();
    }
  }, [htmlInput, liveConvert, convertToMarkdown]);

  // Handle file upload
  const handleFileUpload = useCallback(
    (file) => {
      if (!file) return;

      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const htmlData = event.target.result;
        setHtmlInput(htmlData);
        if (!liveConvert) {
          convertToMarkdown();
        }
        setIsLoading(false);
      };
      reader.onerror = () => {
        setError("Error reading file");
        setIsLoading(false);
      };
      reader.readAsText(file);
    },
    [convertToMarkdown, liveConvert]
  );

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/html" || file.name.match(/\.(html|htm)$/))) {
      handleFileUpload(file);
    } else {
      setError("Please drop a valid HTML file (.html or .htm)");
    }
  };

  // Handle copy
  const handleCopy = () => {
    if (markdownOutput) {
      navigator.clipboard.writeText(markdownOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (markdownOutput) {
      const blob = new Blob([markdownOutput], { type: "text/markdown;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `converted-${Date.now()}.md`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  // Clear all
  const clearAll = () => {
    setHtmlInput("");
    setMarkdownOutput("");
    setError("");
    setShowPreview(false);
    setLiveConvert(false);
    setConversionOptions({
      preserveTags: false,
      tableSupport: true,
      stripComments: true,
      listStyle: "asterisk",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="relative w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Copied to clipboard!
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            HTML to Markdown Converter
          </h1>
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
            disabled={isLoading}
          >
            <FaSync /> Clear All
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Conversion Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Conversion Options</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={liveConvert}
                onChange={(e) => setLiveConvert(e.target.checked)}
                className="mr-2 accent-blue-500"
                disabled={isLoading}
              />
              Live Conversion
            </label>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={conversionOptions.preserveTags}
                onChange={(e) =>
                  setConversionOptions((prev) => ({
                    ...prev,
                    preserveTags: e.target.checked,
                  }))
                }
                className="mr-2 accent-blue-500"
                disabled={isLoading}
              />
              Preserve Custom Tags
            </label>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={conversionOptions.tableSupport}
                onChange={(e) =>
                  setConversionOptions((prev) => ({
                    ...prev,
                    tableSupport: e.target.checked,
                  }))
                }
                className="mr-2 accent-blue-500"
                disabled={isLoading}
              />
              Table Support
            </label>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={conversionOptions.stripComments}
                onChange={(e) =>
                  setConversionOptions((prev) => ({
                    ...prev,
                    stripComments: e.target.checked,
                  }))
                }
                className="mr-2 accent-blue-500"
                disabled={isLoading}
              />
              Strip Comments
            </label>
            <div>
              <label className="block text-sm text-gray-700 mb-1">List Style</label>
              <select
                value={conversionOptions.listStyle}
                onChange={(e) =>
                  setConversionOptions((prev) => ({
                    ...prev,
                    listStyle: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="asterisk">Asterisk (*)</option>
                <option value="dash">Dash (-)</option>
              </select>
            </div>
          </div>
        </div>

        {/* HTML Input */}
        <div
          className={`mb-6 border-2 rounded-lg ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex justify-between items-center mb-2 p-3 border-b border-gray-200">
            <label className="text-sm font-medium text-gray-700">
              HTML Input {isDragging && "(Drop here)"}
            </label>
            <div className="flex gap-3">
              <label className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer flex items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  accept=".html,.htm"
                  className="hidden"
                  disabled={isLoading}
                />
                Upload File
              </label>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 flex items-center gap-1"
                disabled={!htmlInput || isLoading}
              >
                {showPreview ? <FaEyeSlash /> : <FaEye />}
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
            </div>
          </div>
          {showPreview ? (
            <div
              className="w-full h-48 p-4 bg-white rounded-b-lg overflow-auto text-sm border-t border-gray-200"
              dangerouslySetInnerHTML={{ __html: htmlInput }}
              aria-label="HTML preview"
            />
          ) : (
            <textarea
              value={htmlInput}
              onChange={(e) => {
                setHtmlInput(e.target.value);
                if (!liveConvert) {
                  setMarkdownOutput("");
                  setError("");
                }
              }}
              placeholder="Paste your HTML here or drag-and-drop a file (e.g., <p>Hello <strong>World</strong></p>)"
              className="w-full h-48 px-4 py-3 border-t border-gray-200 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
              aria-label="HTML input"
              disabled={isLoading}
            />
          )}
          {!liveConvert && (
            <button
              onClick={convertToMarkdown}
              className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              disabled={isLoading || !htmlInput.trim()}
            >
              {isLoading ? "Converting..." : "Convert to Markdown"}
            </button>
          )}
        </div>

        {/* Markdown Output */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Markdown Output
          </label>
          <textarea
            value={markdownOutput}
            readOnly
            placeholder="Markdown output will appear here"
            className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-y"
            aria-label="Markdown output"
          />
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <button
              onClick={handleCopy}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
              disabled={!markdownOutput || isLoading}
            >
              <FaCopy className="mr-2" /> Copy Markdown
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
              disabled={!markdownOutput || isLoading}
            >
              <FaDownload className="mr-2" /> Download .md
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Live conversion option</li>
            <li>File upload and drag-and-drop support</li>
            <li>Preview HTML content</li>
            <li>Customizable options: tables, tags, comments, list style</li>
            <li>Copy to clipboard and download as .md</li>
          </ul>
        </div>

        {/* Example */}
        <div className="text-sm text-gray-600">
          <h3 className="font-medium mb-2">Example</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="mb-1">Input (HTML):</p>
              <pre className="bg-gray-50 p-3 rounded-md overflow-x-auto text-xs">
                {`<h1>Title</h1>
<p>Hello <strong>World</strong></p>
<ul><li>Item 1</li></ul>
<!-- Comment -->
<table>
  <tr><th>Name</th><th>Age</th></tr>
  <tr><td>John</td><td>30</td></tr>
</table>`}
              </pre>
            </div>
            <div>
              <p className="mb-1">Output (Markdown):</p>
              <pre className="bg-gray-50 p-3 rounded-md overflow-x-auto text-xs">
                {`# Title

Hello **World**

* Item 1

| Name | Age |
|------|-----|
| John | 30  |`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HtmlToMarkdown;