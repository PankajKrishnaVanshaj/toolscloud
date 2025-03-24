"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";

const JsonToMarkdown = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [markdownOutput, setMarkdownOutput] = useState("");
  const [error, setError] = useState("");
  const [options, setOptions] = useState({
    tableForObjects: true,
    codeBlockForJson: false,
    headerLevel: 2,
    includeKeys: true,
    maxDepth: 5,
    listStyle: "bullet", // New: bullet, number, none
    collapseNested: false, // New: collapse nested objects/arrays
    inlineCode: false, // New: wrap values in inline code
  });

  // Parse JSON with error handling
  const parseJson = (input) => {
    try {
      return JSON.parse(input);
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      return null;
    }
  };

  // Convert JSON to Markdown
  const jsonToMarkdown = useCallback(
    (data, depth = 0, key = "") => {
      if (depth > options.maxDepth) return "*[Depth limit reached]*";
      if (data === null) return options.inlineCode ? "`null`" : "null";
      if (data === undefined) return options.inlineCode ? "`undefined`" : "undefined";

      const indent = "  ".repeat(depth);

      if (Array.isArray(data)) {
        if (data.length === 0) return `${indent}${options.listStyle === "none" ? "" : "- "}*(empty array)*`;
        return data
          .map((item, index) => {
            const prefix =
              options.listStyle === "bullet"
                ? "- "
                : options.listStyle === "number"
                ? `${index + 1}. `
                : "";
            const value = jsonToMarkdown(item, depth + 1, `Item ${index}`);
            return `${indent}${prefix}${options.includeKeys && depth > 0 ? `${index}: ` : ""}${value}`;
          })
          .join("\n");
      }

      if (typeof data === "object") {
        if (Object.keys(data).length === 0) return `${indent}${options.listStyle === "none" ? "" : "- "}*(empty object)*`;

        if (options.tableForObjects && depth === 0) {
          const headers = Object.keys(data);
          const values = headers.map((key) => {
            const value = data[key];
            return options.collapseNested && typeof value === "object"
              ? JSON.stringify(value)
              : typeof value === "object"
              ? jsonToMarkdown(value, depth + 1, key)
              : options.inlineCode
              ? `\`${value}\``
              : String(value);
          });
          const headerRow = `| ${headers.join(" | ")} |`;
          const separator = `| ${headers.map(() => "---").join(" | ")} |`;
          const valueRow = `| ${values.map((v) => String(v).replace(/\|/g, "\\|")).join(" | ")} |`;
          return `${headerRow}\n${separator}\n${valueRow}`;
        }

        const entries = Object.entries(data);
        return entries
          .map(([key, value]) => {
            const formattedValue =
              options.collapseNested && typeof value === "object"
                ? JSON.stringify(value)
                : jsonToMarkdown(value, depth + 1, key);
            const headerPrefix =
              options.headerLevel > 0 ? "#".repeat(options.headerLevel + depth) + " " : "";
            return `${indent}${headerPrefix}${key}${options.includeKeys ? ": " : ""}${formattedValue}`;
          })
          .join("\n");
      }

      return options.inlineCode ? `\`${String(data)}\`` : String(data);
    },
    [options]
  );

  // Convert JSON to Markdown
  const convertJsonToMarkdown = () => {
    setError("");
    setMarkdownOutput("");

    const jsonData = parseJson(jsonInput);
    if (!jsonData) return;

    const markdown = options.codeBlockForJson
      ? "```markdown\n" + jsonToMarkdown(jsonData) + "\n```"
      : jsonToMarkdown(jsonData);
    setMarkdownOutput(markdown);
  };

  // Reset form
  const resetForm = () => {
    setJsonInput("");
    setMarkdownOutput("");
    setError("");
    setOptions({
      tableForObjects: true,
      codeBlockForJson: false,
      headerLevel: 2,
      includeKeys: true,
      maxDepth: 5,
      listStyle: "bullet",
      collapseNested: false,
      inlineCode: false,
    });
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdownOutput);
  };

  // Download as Markdown file
  const downloadMarkdown = () => {
    const blob = new Blob([markdownOutput], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `converted-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          JSON to Markdown Converter
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            convertJsonToMarkdown();
          }}
          className="space-y-6"
        >
          {/* Input Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JSON Input
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='e.g., {"name": "John", "age": 30, "skills": ["JavaScript", "React"]}'
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-48 font-mono text-sm resize-y"
            />
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Conversion Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.tableForObjects}
                  onChange={(e) => setOptions({ ...options, tableForObjects: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Tables for Top-Level Objects</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.codeBlockForJson}
                  onChange={(e) => setOptions({ ...options, codeBlockForJson: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Wrap in Code Block</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.includeKeys}
                  onChange={(e) => setOptions({ ...options, includeKeys: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Include Key Names</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.collapseNested}
                  onChange={(e) => setOptions({ ...options, collapseNested: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Collapse Nested Objects</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.inlineCode}
                  onChange={(e) => setOptions({ ...options, inlineCode: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Inline Code for Values</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  List Style
                </label>
                <select
                  value={options.listStyle}
                  onChange={(e) => setOptions({ ...options, listStyle: e.target.value })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bullet">Bullet (-)</option>
                  <option value="number">Number (1.)</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Header Level
                </label>
                <select
                  value={options.headerLevel}
                  onChange={(e) =>
                    setOptions({ ...options, headerLevel: parseInt(e.target.value) })
                  }
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>None</option>
                  <option value={1}>H1</option>
                  <option value={2}>H2</option>
                  <option value={3}>H3</option>
                  <option value={4}>H4</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Depth ({options.maxDepth})
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={options.maxDepth}
                  onChange={(e) =>
                    setOptions({ ...options, maxDepth: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Convert to Markdown
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error Section */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Output Section */}
        {markdownOutput && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Markdown Output</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  onClick={downloadMarkdown}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <pre className="text-sm font-mono whitespace-pre-wrap bg-white p-3 rounded-md border border-gray-200">
              {markdownOutput}
            </pre>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable list styles (bullet, number, none)</li>
            <li>Option to collapse nested objects/arrays</li>
            <li>Inline code formatting for values</li>
            <li>Tables for top-level objects</li>
            <li>Code block wrapping</li>
            <li>Adjustable header levels and depth</li>
            <li>Download as .md file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JsonToMarkdown;