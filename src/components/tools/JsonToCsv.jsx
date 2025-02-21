"use client";
import React, { useState, useRef } from "react";

const JsonToCsv = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [csvOutput, setCsvOutput] = useState("");
  const [error, setError] = useState("");
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [isPrettyPrint, setIsPrettyPrint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Flatten nested objects
  const flattenObject = (obj, prefix = "") => {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        return { ...acc, ...flattenObject(obj[key], newKey) };
      }
      return { ...acc, [newKey]: obj[key] };
    }, {});
  };

  // Convert JSON to CSV
  const convertToCsv = (data) => {
    try {
      setError("");
      const parsedJson = typeof data === "string" ? JSON.parse(data) : data;
      const dataArray = Array.isArray(parsedJson) ? parsedJson : [parsedJson];

      if (dataArray.length === 0) {
        setError("JSON data is empty");
        setCsvOutput("");
        return;
      }

      // Flatten all objects and get unique headers
      const flattenedData = dataArray.map((obj) => flattenObject(obj));
      const headers = [
        ...new Set(flattenedData.flatMap((obj) => Object.keys(obj))),
      ];

      // Create CSV rows
      const csvRows = [
        headers.join(","), // Header row
        ...flattenedData.map((obj) =>
          headers
            .map((header) => {
              const value = obj[header] ?? "";
              return typeof value === "string"
                ? `"${value.replace(/"/g, '""')}"`
                : value;
            })
            .join(",")
        ),
      ];

      setCsvOutput(csvRows.join("\n"));
    } catch (err) {
      setError("Invalid JSON format: " + err.message);
      setCsvOutput("");
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = event.target.result;
        setJsonInput(jsonData);
        convertToCsv(jsonData);
      } catch (err) {
        setError("Error reading file: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Error reading file");
      setIsLoading(false);
    };
    reader.readAsText(file);
    // Reset file input
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
      link.download = "data.csv";
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setJsonInput(e.target.value);
    setCsvOutput("");
    setError("");
  };

  // Toggle pretty print
  const togglePrettyPrint = () => {
    try {
      if (isPrettyPrint) {
        setJsonInput(jsonInput);
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
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="relative bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            CSV copied to clipboard!
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            JSON to CSV Converter
          </h1>
          <button
            onClick={clearAll}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Clear All
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* JSON Input */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Enter JSON Data
            </label>
            <div className="flex gap-2">
              <button
                onClick={togglePrettyPrint}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {isPrettyPrint ? "Minify" : "Pretty Print"}
              </button>
              <label className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                Upload File
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
            onChange={handleInputChange}
            placeholder='Paste your JSON here (e.g., [{"name": "John", "age": {"value": 30}}])'
            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
            aria-label="JSON input"
            disabled={isLoading}
          />
          <button
            onClick={() => convertToCsv(jsonInput)}
            className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            disabled={!jsonInput.trim() || isLoading}
          >
            {isLoading ? "Processing..." : "Convert to CSV"}
          </button>
        </div>

        {/* CSV Output */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CSV Output
          </label>
          <textarea
            value={csvOutput}
            readOnly
            placeholder="CSV output will appear here"
            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm resize-y"
            aria-label="CSV output"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCopy}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              disabled={!csvOutput}
            >
              Copy CSV
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              disabled={!csvOutput}
            >
              Download CSV
            </button>
          </div>
        </div>

        {/* Example */}
        <div className="text-sm text-gray-600">
          <p>Example input:</p>
          <pre className="bg-gray-50 p-2 rounded-md mt-1 overflow-x-auto">
            {`[{"name": "John", "age": {"value": 30}}, {"name": "Jane", "age": {"value": 25}}]`}
          </pre>
          <p className="mt-2">Example output:</p>
          <pre className="bg-gray-50 p-2 rounded-md mt-1 overflow-x-auto">
            {`name,age.value\n"John",30\n"Jane",25`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default JsonToCsv;
