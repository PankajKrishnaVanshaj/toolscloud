"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaDownload, FaSync, FaUpload, FaCopy } from "react-icons/fa";

const JsonToTsv = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [tsvOutput, setTsvOutput] = useState("");
  const [error, setError] = useState("");
  const [delimiter, setDelimiter] = useState("\t");
  const [flattenNested, setFlattenNested] = useState(true);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [quoteValues, setQuoteValues] = useState(false);
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Parse JSON to TSV with enhanced options
  const parseJsonToTsv = useCallback(
    (jsonData) => {
      try {
        setError("");
        const parsed = JSON.parse(jsonData);
        if (!Array.isArray(parsed)) {
          throw new Error("JSON must be an array of objects");
        }

        if (parsed.length === 0) {
          return "";
        }

        const headers = new Set();
        const rows = [];
        const effectiveDelimiter = customDelimiter || delimiter;

        parsed.forEach((obj) => {
          const row = {};
          const collectKeys = (data, prefix = "") => {
            Object.entries(data).forEach(([key, value]) => {
              const fullKey = prefix ? `${prefix}.${key}` : key;
              if (flattenNested && typeof value === "object" && value !== null) {
                collectKeys(value, fullKey);
              } else {
                headers.add(fullKey);
                row[fullKey] =
                  value === null || value === undefined ? "" : String(value);
              }
            });
          };
          collectKeys(obj);
          rows.push(row);
        });

        const headerArray = Array.from(headers);
        let tsv = "";
        if (includeHeaders) {
          tsv += headerArray
            .map((h) =>
              quoteValues && (h.includes(effectiveDelimiter) || h.includes("\n"))
                ? `"${h.replace(/"/g, '""')}"`
                : h
            )
            .join(effectiveDelimiter) + "\n";
        }

        rows.forEach((row) => {
          const values = headerArray.map((header) => {
            const value = row[header] ?? "";
            return quoteValues || value.includes(effectiveDelimiter) || value.includes("\n")
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          });
          tsv += values.join(effectiveDelimiter) + "\n";
        });

        return tsv.trim();
      } catch (err) {
        throw new Error(`Invalid JSON: ${err.message}`);
      }
    },
    [delimiter, flattenNested, includeHeaders, quoteValues, customDelimiter]
  );

  // Handle conversion
  const handleConvert = useCallback(() => {
    setIsProcessing(true);
    setTimeout(() => {
      // Simulated async processing
      try {
        const result = parseJsonToTsv(jsonInput);
        setTsvOutput(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  }, [jsonInput, parseJsonToTsv]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setJsonInput(event.target.result);
        handleConvert();
      };
      reader.readAsText(file);
    }
  };

  // Download TSV
  const downloadTsv = () => {
    if (!tsvOutput) return;
    const blob = new Blob([tsvOutput], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted-${Date.now()}.tsv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!tsvOutput) return;
    navigator.clipboard.writeText(tsvOutput);
    alert("TSV copied to clipboard!");
  };

  // Reset all fields
  const reset = () => {
    setJsonInput("");
    setTsvOutput("");
    setError("");
    setDelimiter("\t");
    setFlattenNested(true);
    setIncludeHeaders(true);
    setQuoteValues(false);
    setCustomDelimiter("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          JSON to TSV Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                JSON Input
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]'
                className="w-full h-48 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
                disabled={isProcessing}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isProcessing}
              />
              <button
                onClick={handleConvert}
                disabled={!jsonInput || isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                ) : (
                  <FaUpload className="mr-2" />
                )}
                Convert to TSV
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delimiter
                </label>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={customDelimiter || isProcessing}
                >
                  <option value="\t">Tab (\t)</option>
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Delimiter
                </label>
                <input
                  type="text"
                  value={customDelimiter}
                  onChange={(e) => setCustomDelimiter(e.target.value)}
                  placeholder="Enter custom delimiter"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={flattenNested}
                    onChange={(e) => setFlattenNested(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isProcessing}
                  />
                  <span className="text-sm text-gray-700">Flatten Nested Objects</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeHeaders}
                    onChange={(e) => setIncludeHeaders(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isProcessing}
                  />
                  <span className="text-sm text-gray-700">Include Headers</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={quoteValues}
                    onChange={(e) => setQuoteValues(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isProcessing}
                  />
                  <span className="text-sm text-gray-700">Quote All Values</span>
                </label>
              </div>
            </div>
          </div>

          {/* Output Section */}
          {tsvOutput && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-4">
                <h2 className="text-lg font-semibold text-gray-800">TSV Output</h2>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <FaCopy className="mr-2" /> Copy
                  </button>
                  <button
                    onClick={downloadTsv}
                    className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <FaDownload className="mr-2" /> Download
                  </button>
                </div>
              </div>
              <pre className="text-sm font-mono bg-white p-3 rounded border border-gray-200 overflow-auto max-h-64">
                {tsvOutput}
              </pre>
            </div>
          )}

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
              <li>Convert JSON arrays to TSV</li>
              <li>Customizable delimiters (predefined or custom)</li>
              <li>Flatten nested objects option</li>
              <li>Include/exclude headers</li>
              <li>Quote all values option</li>
              <li>File upload support</li>
              <li>Copy to clipboard and download as TSV</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonToTsv;