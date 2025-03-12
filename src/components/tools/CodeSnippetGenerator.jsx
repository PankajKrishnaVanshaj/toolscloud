"use client";

import React, { useState, useCallback, useEffect } from "react";
import { FaCopy, FaDownload, FaSync, FaEye } from "react-icons/fa";

const CodeSnippetGenerator = () => {
  const [language, setLanguage] = useState("javascript");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [format, setFormat] = useState("plain");
  const [generatedSnippet, setGeneratedSnippet] = useState("");
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState(false);
  const [options, setOptions] = useState({
    includeTimestamp: false,
    addLineNumbers: false,
    wrapCode: true,
  });
  const [history, setHistory] = useState([]);

  const languages = [
    "javascript",
    "python",
    "java",
    "cpp",
    "html",
    "css",
    "typescript",
    "ruby",
    "go",
    "php",
  ];
  const formats = [
    { value: "plain", label: "Plain Text" },
    { value: "markdown", label: "Markdown" },
    { value: "html", label: "HTML" },
    { value: "json", label: "JSON" },
  ];

  const generateSnippet = useCallback(() => {
    if (!code.trim()) {
      setGeneratedSnippet("Please enter some code");
      setCopied(false);
      return;
    }

    let snippet = "";
    const timestamp = options.includeTimestamp
      ? `// Generated on ${new Date().toLocaleString()}\n`
      : "";
    const lines = code.split("\n");
    const numberedCode = options.addLineNumbers
      ? lines.map((line, i) => `${(i + 1).toString().padStart(2, " ")}| ${line}`).join("\n")
      : code;

    switch (format) {
      case "plain":
        snippet = timestamp + numberedCode;
        break;
      case "markdown":
        snippet = description.trim()
          ? `${timestamp}### ${description}\n\n\`\`\`${language}\n${numberedCode}\n\`\`\``
          : `${timestamp}\`\`\`${language}\n${numberedCode}\n\`\`\``;
        break;
      case "html":
        const escapedCode = numberedCode
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
        snippet = description.trim()
          ? `${timestamp}<pre><code class="${language}">${escapedCode}</code></pre><p>${description}</p>`
          : `${timestamp}<pre><code class="${language}">${escapedCode}</code></pre>`;
        break;
      case "json":
        snippet = JSON.stringify(
          {
            language,
            description: description.trim() || undefined,
            code: numberedCode,
            timestamp: options.includeTimestamp ? new Date().toISOString() : undefined,
          },
          null,
          2
        );
        break;
      default:
        snippet = numberedCode;
    }

    setGeneratedSnippet(options.wrapCode ? snippet : snippet.replace(/\n/g, " "));
    setCopied(false);
    setHistory((prev) => [...prev, { snippet, format, timestamp: new Date() }].slice(-5));
  }, [code, description, format, language, options]);

  const handleSubmit = (e) => {
    e.preventDefault();
    generateSnippet();
  };

  const handleCopy = () => {
    if (generatedSnippet && generatedSnippet !== "Please enter some code") {
      navigator.clipboard.writeText(generatedSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedSnippet && generatedSnippet !== "Please enter some code") {
      const blob = new Blob([generatedSnippet], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const extension = format === "markdown" ? "md" : format === "html" ? "html" : format === "json" ? "json" : "txt";
      const link = document.createElement("a");
      link.href = url;
      link.download = `snippet-${Date.now()}.${extension}`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setCode("");
    setDescription("");
    setGeneratedSnippet("");
    setPreview(false);
  };

  useEffect(() => {
    if (code.trim()) generateSnippet();
  }, [options, generateSnippet]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Code Snippet Generator</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {formats.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Function to add two numbers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`function add(a, b) {\n  return a + b;\n}`}
            />
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(options).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setOptions((prev) => ({ ...prev, [key]: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!code.trim()}
          >
            Generate Snippet
          </button>
        </form>

        {/* Generated Snippet */}
        {generatedSnippet && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
              <h3 className="font-semibold text-gray-700">
                Generated {formats.find((f) => f.value === format).label} Snippet
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className={`py-2 px-4 rounded-md transition-colors flex items-center ${
                    copied ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
                <button
                  onClick={handleReset}
                  className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  <FaSync className="mr-2" /> Reset
                </button>
              </div>
            </div>
            <pre
              className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200 max-h-64 overflow-auto"
            >
              {generatedSnippet}
            </pre>

            {/* Preview */}
            {format === "html" && (
              <div className="mt-4">
                <button
                  onClick={() => setPreview(!preview)}
                  className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                  <FaEye className="mr-2" /> {preview ? "Hide Preview" : "Show Preview"}
                </button>
                {preview && (
                  <iframe
                    srcDoc={generatedSnippet}
                    className="w-full h-48 mt-4 border border-gray-200 rounded-md"
                    title="HTML Preview"
                    sandbox="allow-same-origin"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Recent Snippets (Last 5)</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>
                    {entry.format.toUpperCase()} - {entry.snippet.slice(0, 30)}...
                    <span className="text-gray-400 text-xs ml-2">
                      ({entry.timestamp.toLocaleTimeString()})
                    </span>
                  </span>
                  <button
                    onClick={() => setGeneratedSnippet(entry.snippet)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple languages and output formats</li>
            <li>Customizable options (timestamp, line numbers, wrapping)</li>
            <li>Copy and download functionality</li>
            <li>HTML preview capability</li>
            <li>Snippet history tracking</li>
            <li>Responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CodeSnippetGenerator;