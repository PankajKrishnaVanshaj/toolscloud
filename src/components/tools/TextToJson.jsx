"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync } from "react-icons/fa";

const TextToJson = () => {
  const [inputText, setInputText] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [format, setFormat] = useState("auto");
  const [delimiter, setDelimiter] = useState(",");
  const [prettyPrint, setPrettyPrint] = useState(true);
  const [wrapArray, setWrapArray] = useState(false); // New: Wrap result in array
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Detect input format
  const detectFormat = useCallback((text) => {
    if (!text.trim()) return "auto";
    if (text.includes(delimiter) && text.split("\n").length > 1) return "csv";
    if (text.includes("=") || text.includes(":")) return "kv";
    return "plain";
  }, [delimiter]);

  // Parse text to JSON
  const parseTextToJson = useCallback(() => {
    setError("");
    setJsonOutput("");
    setIsProcessing(true);

    if (!inputText.trim()) {
      setError("Please enter some text to convert");
      setIsProcessing(false);
      return;
    }

    let detectedFormat = format === "auto" ? detectFormat(inputText) : format;
    let result;

    try {
      switch (detectedFormat) {
        case "csv":
          result = parseCSV(inputText);
          break;
        case "kv":
          result = parseKeyValue(inputText);
          break;
        case "plain":
          result = { text: inputText.trim() };
          break;
        default:
          throw new Error("Unable to detect text format");
      }

      const finalResult = wrapArray ? [result] : result;
      setJsonOutput(
        prettyPrint ? JSON.stringify(finalResult, null, 2) : JSON.stringify(finalResult)
      );
    } catch (err) {
      setError(`Conversion failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, format, delimiter, prettyPrint, wrapArray]);

  // Parse CSV
  const parseCSV = (text) => {
    const lines = text.trim().split("\n").filter((line) => line.trim());
    const headers = lines[0].split(delimiter).map((h) => h.trim());
    const data = lines.slice(1).map((line) => {
      const values = line.split(delimiter).map((v) => v.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] !== undefined ? values[index] : "";
        return obj;
      }, {});
    });
    return data;
  };

  // Parse Key-Value
  const parseKeyValue = (text) => {
    const lines = text.trim().split("\n").filter((line) => line.trim());
    const result = {};
    lines.forEach((line) => {
      const separator = line.includes("=") ? "=" : ":";
      const [key, value] = line.split(separator);
      if (key && value) {
        result[key.trim()] = value.trim();
      }
    });
    return result;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    parseTextToJson();
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonOutput);
  };

  // Download JSON
  const downloadJson = () => {
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset form
  const reset = () => {
    setInputText("");
    setJsonOutput("");
    setFormat("auto");
    setDelimiter(",");
    setPrettyPrint(true);
    setWrapArray(false);
    setError("");
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Text to JSON Converter
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Text
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text (e.g., CSV, key-value, or plain)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-48 resize-y"
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  <option value="auto">Auto-detect</option>
                  <option value="csv">CSV</option>
                  <option value="kv">Key-Value</option>
                  <option value="plain">Plain Text</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CSV Delimiter
                </label>
                <input
                  type="text"
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value.slice(0, 1))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., , or ;"
                  maxLength={1}
                  disabled={format !== "csv" || isProcessing}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={prettyPrint}
                    onChange={(e) => setPrettyPrint(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isProcessing}
                  />
                  <span className="ml-2 text-sm text-gray-700">Pretty Print</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={wrapArray}
                    onChange={(e) => setWrapArray(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isProcessing}
                  />
                  <span className="ml-2 text-sm text-gray-700">Wrap in Array</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : null}
              {isProcessing ? "Converting..." : "Convert to JSON"}
            </button>
            <button
              onClick={reset}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
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
        {jsonOutput && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <h2 className="text-lg font-semibold text-gray-800">JSON Output:</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  onClick={downloadJson}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <pre className="text-sm bg-white p-4 rounded-md border border-gray-200 overflow-auto max-h-80">
              {jsonOutput}
            </pre>
          </div>
        )}

        {/* Features & Examples */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <details open className="text-blue-600">
            <summary className="cursor-pointer font-semibold text-blue-700 mb-2">
              Features & Examples
            </summary>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Supports CSV, Key-Value, and Plain Text conversion</li>
              <li>Auto-detection of input format</li>
              <li>Customizable CSV delimiter</li>
              <li>Pretty print and array wrapping options</li>
              <li>Copy to clipboard and download as JSON file</li>
              <li>
                <strong>CSV Example:</strong> "name,age\nJohn,30\nJane,25"
              </li>
              <li>
                <strong>Key-Value Example:</strong> "name=John\nage=30" or "name:John\nage:30"
              </li>
              <li>
                <strong>Plain Text Example:</strong> "Hello World"
              </li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TextToJson;