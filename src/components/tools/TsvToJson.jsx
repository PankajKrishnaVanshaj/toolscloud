"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaDownload, FaCopy, FaSync, FaUpload } from "react-icons/fa";

const TsvToJson = () => {
  const [tsvInput, setTsvInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [error, setError] = useState("");
  const [hasHeader, setHasHeader] = useState(true);
  const [prettyPrint, setPrettyPrint] = useState(true);
  const [delimiter, setDelimiter] = useState("\t");
  const [trimValues, setTrimValues] = useState(true);
  const [convertNumbers, setConvertNumbers] = useState(false);
  const [customDelimiter, setCustomDelimiter] = useState("");
  const fileInputRef = useRef(null);

  // Parse TSV to JSON
  const parseTSV = useCallback(
    (tsv) => {
      const lines = tsv.trim().split("\n").map((line) => line.trim());
      if (lines.length === 0) throw new Error("Empty TSV input");

      const effectiveDelimiter = delimiter === "custom" ? customDelimiter : delimiter;
      const rows = lines.map((line) => line.split(effectiveDelimiter));
      if (rows.some((row) => row.length !== rows[0].length)) {
        throw new Error("Inconsistent number of columns");
      }

      let headers = hasHeader ? rows[0] : rows[0].map((_, i) => `column${i + 1}`);
      const dataRows = hasHeader ? rows.slice(1) : rows;

      const jsonArray = dataRows.map((row) => {
        const obj = {};
        row.forEach((value, index) => {
          let processedValue = trimValues ? value.trim() : value;
          if (convertNumbers && !isNaN(processedValue) && processedValue !== "") {
            processedValue = Number(processedValue);
          }
          obj[headers[index]] = processedValue;
        });
        return obj;
      });

      return prettyPrint ? JSON.stringify(jsonArray, null, 2) : JSON.stringify(jsonArray);
    },
    [delimiter, customDelimiter, hasHeader, prettyPrint, trimValues, convertNumbers]
  );

  // Handle conversion
  const handleConvert = () => {
    setError("");
    setJsonOutput("");
    try {
      const result = parseTSV(tsvInput);
      setJsonOutput(result);
    } catch (err) {
      setError(`Error converting TSV to JSON: ${err.message}`);
    }
  };

  // Handle file upload
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setTsvInput(event.target.result);
      handleConvert();
    };
    reader.onerror = () => setError("Error reading file");
    reader.readAsText(file);
  }, [handleConvert]);

  // Download JSON
  const downloadJson = () => {
    if (!jsonOutput) return;
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!jsonOutput) return;
    navigator.clipboard.writeText(jsonOutput).then(() =>
      alert("JSON copied to clipboard!")
    );
  };

  // Reset form
  const reset = () => {
    setTsvInput("");
    setJsonOutput("");
    setError("");
    setHasHeader(true);
    setPrettyPrint(true);
    setDelimiter("\t");
    setTrimValues(true);
    setConvertNumbers(false);
    setCustomDelimiter("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          TSV to JSON Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TSV Input
              </label>
              <textarea
                value={tsvInput}
                onChange={(e) => setTsvInput(e.target.value)}
                placeholder="Paste your TSV here (e.g., name\tage\nJohn\t25)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-48 resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delimiter
                </label>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="\t">Tab (\t)</option>
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="|">Pipe (|)</option>
                  <option value="custom">Custom</option>
                </select>
                {delimiter === "custom" && (
                  <input
                    type="text"
                    value={customDelimiter}
                    onChange={(e) => setCustomDelimiter(e.target.value)}
                    placeholder="Enter custom delimiter"
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hasHeader}
                    onChange={(e) => setHasHeader(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Has Header Row</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={prettyPrint}
                    onChange={(e) => setPrettyPrint(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Pretty Print</span>
                </label>
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={trimValues}
                    onChange={(e) => setTrimValues(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Trim Values</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={convertNumbers}
                    onChange={(e) => setConvertNumbers(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Convert Numbers</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="file"
                accept=".tsv,.txt"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                onClick={handleConvert}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaUpload className="mr-2" /> Convert to JSON
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Output Section */}
          {jsonOutput && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">JSON Output</h2>
              <pre className="text-sm bg-white p-4 rounded-md border border-gray-200 overflow-auto max-h-64">
                {jsonOutput}
              </pre>
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                  <FaCopy className="mr-2" /> Copy to Clipboard
                </button>
                <button
                  onClick={downloadJson}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download JSON
                </button>
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features & Usage */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert TSV to JSON with optional headers</li>
              <li>Support for file upload (.tsv, .txt)</li>
              <li>Customizable delimiter (including custom input)</li>
              <li>Options to trim values and convert numbers</li>
              <li>Pretty print JSON output</li>
              <li>Copy to clipboard or download as JSON file</li>
              <li>
                Example: "name\tage\nJohn\t25" →{" "}
                {`[{"name": "John", "age": ${convertNumbers ? 25 : '"25"'}}]`}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TsvToJson;