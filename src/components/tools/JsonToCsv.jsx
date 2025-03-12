"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaFileUpload } from "react-icons/fa";

const JsonToCsv = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [csvOutput, setCsvOutput] = useState("");
  const [error, setError] = useState("");
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [isPrettyPrint, setIsPrettyPrint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [delimiter, setDelimiter] = useState(",");
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  // Flatten nested objects
  const flattenObject = useCallback((obj, prefix = "") => {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        return { ...acc, ...flattenObject(obj[key], newKey) };
      }
      return { ...acc, [newKey]: obj[key] };
    }, {});
  }, []);

  // Convert JSON to CSV
  const convertToCsv = useCallback((data) => {
    setIsLoading(true);
    setError("");
    try {
      const parsedJson = typeof data === "string" ? JSON.parse(data) : data;
      const dataArray = Array.isArray(parsedJson) ? parsedJson : [parsedJson];

      if (dataArray.length === 0) {
        throw new Error("JSON data is empty");
      }

      const flattenedData = dataArray.map((obj) => flattenObject(obj));
      const headers = [...new Set(flattenedData.flatMap((obj) => Object.keys(obj)))];

      const csvRows = [];
      if (includeHeaders) {
        csvRows.push(headers.join(delimiter));
      }
      csvRows.push(
        ...flattenedData.map((obj) =>
          headers
            .map((header) => {
              const value = obj[header] ?? "";
              return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value;
            })
            .join(delimiter)
        )
      );

      const result = csvRows.join("\n");
      setCsvOutput(result);
      setHistory((prev) => [...prev, { json: data, csv: result }].slice(-5));
    } catch (err) {
      setError("Invalid JSON format: " + err.message);
      setCsvOutput("");
    } finally {
      setIsLoading(false);
    }
  }, [delimiter, includeHeaders, flattenObject]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonData = event.target.result;
      setJsonInput(jsonData);
      convertToCsv(jsonData);
    };
    reader.onerror = () => setError("Error reading file");
    reader.readAsText(file);
    e.target.value = "";
  };

  // Handle copy
  const handleCopy = () => {
    if (csvOutput) {
      navigator.clipboard.writeText(csvOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (csvOutput) {
      const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `data-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  // Toggle pretty print
  const togglePrettyPrint = () => {
    try {
      if (isPrettyPrint) {
        setJsonInput(JSON.stringify(JSON.parse(jsonInput)));
      } else if (jsonInput) {
        setJsonInput(JSON.stringify(JSON.parse(jsonInput), null, 2));
      }
      setIsPrettyPrint(!isPrettyPrint);
    } catch (err) {
      setError("Cannot format invalid JSON");
    }
  };

  // Clear all
  const clearAll = () => {
    setJsonInput("");
    setCsvOutput("");
    setError("");
    setIsPrettyPrint(false);
    setDelimiter(",");
    setIncludeHeaders(true);
  };

  // Restore from history
  const restoreFromHistory = (entry) => {
    setJsonInput(entry.json);
    setCsvOutput(entry.csv);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="relative w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            CSV copied to clipboard!
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">JSON to CSV Converter</h1>
          <button onClick={clearAll} className="text-sm text-red-600 hover:text-red-800 flex items-center">
            <FaSync className="mr-1" /> Clear All
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Conversion Options</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Delimiter</label>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={includeHeaders}
                onChange={(e) => setIncludeHeaders(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Include Headers</label>
            </div>
          </div>
        </div>

        {/* JSON Input */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">JSON Input</label>
            <div className="flex gap-3">
              <button
                onClick={togglePrettyPrint}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {isPrettyPrint ? "Minify" : "Pretty Print"}
              </button>
              <label className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer flex items-center">
                <FaFileUpload className="mr-1" /> Upload
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json"
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='Paste your JSON here (e.g., [{"name": "John", "age": {"value": 30}}])'
            className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={() => convertToCsv(jsonInput)}
            className="mt-3 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
            disabled={!jsonInput.trim() || isLoading}
          >
            {isLoading ? <span className="animate-spin mr-2">⏳</span> : null}
            {isLoading ? "Converting..." : "Convert to CSV"}
          </button>
        </div>

        {/* CSV Output */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">CSV Output</label>
          <textarea
            value={csvOutput}
            readOnly
            placeholder="CSV output will appear here"
            className="w-full h-48 sm:h-64 p-4 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm resize-y"
          />
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <button
              onClick={handleCopy}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
              disabled={!csvOutput}
            >
              <FaCopy className="mr-2" /> Copy
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
              disabled={!csvOutput}
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Conversion History (Last 5)</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{entry.csv.slice(0, 50)}...</span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Handles nested JSON objects</li>
            <li>Custom delimiter support (comma, semicolon, tab)</li>
            <li>Optional headers inclusion</li>
            <li>File upload capability</li>
            <li>Pretty print/minify JSON</li>
            <li>Copy and download options</li>
            <li>Conversion history tracking</li>
          </ul>
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};

export default JsonToCsv;