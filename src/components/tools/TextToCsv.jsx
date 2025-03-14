"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaFileCsv } from "react-icons/fa";

const TextToCsv = () => {
  const [inputText, setInputText] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [hasHeaders, setHasHeaders] = useState(false);
  const [customHeaders, setCustomHeaders] = useState("");
  const [outputCsv, setOutputCsv] = useState("");
  const [error, setError] = useState("");
  const [inputFormat, setInputFormat] = useState("plain");
  const [quoteStyle, setQuoteStyle] = useState("double"); // New: Quote style
  const [trimWhitespace, setTrimWhitespace] = useState(true); // New: Trim option
  const [filename, setFilename] = useState("converted"); // New: Custom filename

  // Parse text to CSV
  const parseTextToCsv = useCallback(() => {
    setError("");
    setOutputCsv("");

    if (!inputText.trim()) {
      setError("Please enter some text to convert");
      return;
    }

    let rows = [];
    let headers = customHeaders.split(",").map((h) => h.trim()).filter((h) => h);

    try {
      switch (inputFormat) {
        case "plain":
          rows = inputText.split("\n").map((line) =>
            line
              .split(/\s+/)
              .map((item) => (trimWhitespace ? item.trim() : item))
              .filter((item) => item)
          );
          break;
        case "json":
          const jsonData = JSON.parse(inputText);
          if (Array.isArray(jsonData)) {
            if (jsonData.length > 0 && typeof jsonData[0] === "object") {
              headers = headers.length ? headers : Object.keys(jsonData[0]);
              rows = jsonData.map((obj) =>
                headers.map((key) =>
                  obj[key] !== undefined ? String(obj[key]) : ""
                )
              );
            } else {
              rows = jsonData.map((item) => [String(item)]);
            }
          } else {
            throw new Error("JSON must be an array");
          }
          break;
        case "list":
          rows = inputText.split("\n").map((line) => [
            trimWhitespace ? line.trim() : line,
          ]);
          break;
        case "table":
          rows = inputText.split("\n").map((line) =>
            line
              .split("|")
              .map((item) => (trimWhitespace ? item.trim() : item))
              .filter((item) => item)
          );
          break;
        default:
          throw new Error("Unsupported input format");
      }

      if (hasHeaders && headers.length) {
        if (rows[0].length !== headers.length) {
          setError("Number of headers must match number of columns");
          return;
        }
        rows.unshift(headers);
      }

      const quoteChar = quoteStyle === "double" ? '"' : "'";
      const csv = rows
        .map((row) =>
          row
            .map((cell) =>
              `${quoteChar}${cell.replace(new RegExp(quoteChar, "g"), quoteChar + quoteChar)}${quoteChar}`
            )
            .join(delimiter)
        )
        .join("\n");
      setOutputCsv(csv);
    } catch (err) {
      setError(`Error processing input: ${err.message}`);
    }
  }, [
    inputText,
    inputFormat,
    delimiter,
    hasHeaders,
    customHeaders,
    quoteStyle,
    trimWhitespace,
  ]);

  // Download CSV
  const downloadCsv = () => {
    if (!outputCsv) return;
    const blob = new Blob([outputCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename || "converted"}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset all fields
  const reset = () => {
    setInputText("");
    setDelimiter(",");
    setHasHeaders(false);
    setCustomHeaders("");
    setOutputCsv("");
    setError("");
    setInputFormat("plain");
    setQuoteStyle("double");
    setTrimWhitespace(true);
    setFilename("converted");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    parseTextToCsv();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <FaFileCsv className="mr-2" /> Text to CSV Converter
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Text
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to convert (e.g., space-separated values, JSON, list, table)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Format
                </label>
                <select
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="plain">Plain Text (space-separated)</option>
                  <option value="json">JSON Array</option>
                  <option value="list">List (one per line)</option>
                  <option value="table">Table (pipe-separated)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delimiter
                </label>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="\t">Tab (\t)</option>
                  <option value="|">Pipe (|)</option>
                  <option value=" ">Space</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quote Style
                </label>
                <select
                  value={quoteStyle}
                  onChange={(e) => setQuoteStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="double">Double Quotes ("")</option>
                  <option value="single">Single Quotes ('')</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasHeaders}
                  onChange={(e) => setHasHeaders(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Include Headers
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={trimWhitespace}
                  onChange={(e) => setTrimWhitespace(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Trim Whitespace
                </label>
              </div>
            </div>

            {hasHeaders && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Headers (comma-separated)
                </label>
                <input
                  type="text"
                  value={customHeaders}
                  onChange={(e) => setCustomHeaders(e.target.value)}
                  placeholder="e.g., Name,Age,City"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output Filename (without extension)
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g., converted"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaFileCsv className="mr-2" /> Convert to CSV
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadCsv}
              disabled={!outputCsv}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download CSV
            </button>
          </div>
        </form>

        {/* Error Section */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Output Section */}
        {outputCsv && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">CSV Output:</h2>
            <pre className="text-sm text-gray-600 overflow-auto max-h-60 bg-white p-3 rounded border border-gray-200">
              {outputCsv}
            </pre>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert plain text, JSON, lists, or pipe-separated tables to CSV</li>
            <li>Customizable delimiter (comma, semicolon, tab, pipe, space)</li>
            <li>Choice of quote style (double or single)</li>
            <li>Optional headers and whitespace trimming</li>
            <li>Custom output filename</li>
            <li>Download as CSV file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextToCsv;