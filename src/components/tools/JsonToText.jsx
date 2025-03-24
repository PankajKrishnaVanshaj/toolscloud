"use client";
import React, { useState, useCallback } from "react";
import { saveAs } from "file-saver"; // For file download
import { FaCopy, FaDownload, FaSync, FaFileImport } from "react-icons/fa";

const JsonToText = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [outputFormat, setOutputFormat] = useState("plain");
  const [textOutput, setTextOutput] = useState("");
  const [error, setError] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [indent, setIndent] = useState(2);
  const [wrapLines, setWrapLines] = useState(true); // New: Line wrapping option
  const [includeKeys, setIncludeKeys] = useState(true); // New: Include keys in plain text
  const fileInputRef = React.useRef(null);

  const formats = {
    plain: "Plain Text",
    csv: "CSV",
    yaml: "YAML",
    markdown: "Markdown Table", // New format
  };

  // Convert JSON to selected format
  const convertJsonToText = useCallback(() => {
    setError("");
    setTextOutput("");

    if (!jsonInput.trim()) {
      setError("Please enter a JSON string");
      return;
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonInput);
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      return;
    }

    switch (outputFormat) {
      case "plain":
        setTextOutput(
          JSON.stringify(parsedJson, null, includeKeys ? indent : undefined)
            .replace(/{|}/g, includeKeys ? "" : "")
            .trim()
        );
        break;
      case "csv":
        if (!Array.isArray(parsedJson)) {
          setError("CSV format requires an array of objects");
          break;
        }
        const headers = Object.keys(parsedJson[0] || {});
        const csvRows = [
          headers.join(delimiter),
          ...parsedJson.map((obj) =>
            headers
              .map((header) => JSON.stringify(obj[header] ?? "").replace(/"/g, '""'))
              .join(delimiter)
          ),
        ];
        setTextOutput(csvRows.join("\n"));
        break;
      case "yaml":
        setTextOutput(jsonToYaml(parsedJson));
        break;
      case "markdown":
        if (!Array.isArray(parsedJson)) {
          setError("Markdown Table format requires an array of objects");
          break;
        }
        const mdHeaders = Object.keys(parsedJson[0] || {});
        const mdRows = [
          `| ${mdHeaders.join(" | ")} |`,
          `| ${mdHeaders.map(() => "---").join(" | ")} |`,
          ...parsedJson.map((obj) =>
            `| ${mdHeaders.map((header) => obj[header] ?? "").join(" | ")} |`
          ),
        ];
        setTextOutput(mdRows.join("\n"));
        break;
      default:
        setError("Unsupported format");
    }
  }, [jsonInput, outputFormat, delimiter, indent, includeKeys]);

  // Enhanced YAML converter
  const jsonToYaml = (json, level = 0) => {
    const indentStr = "  ".repeat(level);
    if (Array.isArray(json)) {
      return json.length === 0
        ? "[]"
        : json
            .map((item) =>
              `${indentStr}- ${
                typeof item === "object" ? "\n" + jsonToYaml(item, level + 1) : item
              }`
            )
            .join("\n");
    } else if (json && typeof json === "object") {
      return Object.entries(json).length === 0
        ? "{}"
        : Object.entries(json)
            .map(([key, value]) =>
              `${indentStr}${key}: ${
                typeof value === "object" ? "\n" + jsonToYaml(value, level + 1) : value
              }`
            )
            .join("\n");
    }
    return String(json);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    convertJsonToText();
  };

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => setJsonInput(event.target.result);
      reader.readAsText(file);
    }
  };

  // Download output
  const downloadFile = () => {
    if (!textOutput) return;
    const extension =
      outputFormat === "csv"
        ? "csv"
        : outputFormat === "yaml"
        ? "yaml"
        : outputFormat === "markdown"
        ? "md"
        : "txt";
    const blob = new Blob([textOutput], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `converted-${Date.now()}.${extension}`);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!textOutput) return;
    navigator.clipboard.writeText(textOutput);
  };

  // Reset all fields
  const reset = () => {
    setJsonInput("");
    setOutputFormat("plain");
    setTextOutput("");
    setError("");
    setDelimiter(",");
    setIndent(2);
    setWrapLines(true);
    setIncludeKeys(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          JSON to Text Converter
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                JSON Input
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='e.g., {"name": "John", "age": 30} or [{"name": "John"}, {"name": "Jane"}]'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-y"
              />
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="mt-2 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Format Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(formats).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              {outputFormat === "csv" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CSV Delimiter
                  </label>
                  <input
                    type="text"
                    value={delimiter}
                    onChange={(e) => setDelimiter(e.target.value)}
                    placeholder="e.g., , or ;"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {outputFormat === "plain" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Indentation (spaces)
                    </label>
                    <input
                      type="number"
                      value={indent}
                      onChange={(e) => setIndent(Math.max(0, Math.min(8, e.target.value)))}
                      min="0"
                      max="8"
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeKeys}
                        onChange={(e) => setIncludeKeys(e.target.checked)}
                        className="mr-2 accent-blue-500"
                      />
                      <span className="text-sm text-gray-700">Include Keys</span>
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Additional Options */}
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={wrapLines}
                  onChange={(e) => setWrapLines(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Wrap Lines in Output</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Convert
              </button>
              <button
                onClick={reset}
                type="button"
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        </form>

        {/* Error Section */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Output Section */}
        {textOutput && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-700">Converted Output:</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  onClick={downloadFile}
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <pre
              className={`text-sm overflow-auto max-h-60 p-2 bg-white rounded-md border ${
                wrapLines ? "whitespace-pre-wrap break-words" : "whitespace-pre"
              }`}
            >
              {textOutput}
            </pre>
          </div>
        )}

        {/* Features & Usage */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert JSON to Plain Text, CSV, YAML, or Markdown Table</li>
            <li>Upload JSON files directly</li>
            <li>Customizable CSV delimiter and plain text indentation</li>
            <li>Toggle line wrapping and key inclusion for plain text</li>
            <li>Copy to clipboard or download with appropriate file extension</li>
            <li>
              Example: <code>{`[{"name": "John", "age": 30}]`}</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JsonToText;