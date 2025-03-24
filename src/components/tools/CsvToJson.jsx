"use client";

import { useState, useCallback } from "react";
import { FaFileDownload, FaCopy, FaSync, FaFileUpload } from "react-icons/fa";

const CsvToJson = () => {
  const [csvInput, setCsvInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [options, setOptions] = useState({
    indent: 2,
    trimValues: true,
    includeHeaders: true,
    delimiter: ",",
    skipEmptyLines: true,
  });
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const convertCsvToJson = useCallback(() => {
    setError(null);
    setCopied(false);
    if (!csvInput.trim()) {
      setError("CSV input is empty!");
      return;
    }

    try {
      const lines = csvInput.trim().split("\n").filter(line => options.skipEmptyLines ? line.trim() : true);
      if (lines.length < (options.includeHeaders ? 2 : 1)) {
        setError("Invalid CSV format! Must have at least one row.");
        return;
      }

      const headers = options.includeHeaders ? lines[0].split(options.delimiter).map(h => h.trim()) : [];
      const dataLines = options.includeHeaders ? lines.slice(1) : lines;

      const jsonData = dataLines.map((line, lineIndex) => {
        const values = line.split(options.delimiter);
        if (options.includeHeaders && values.length !== headers.length) {
          throw new Error(`Inconsistent columns at line ${lineIndex + (options.includeHeaders ? 2 : 1)}`);
        }
        const obj = {};
        values.forEach((value, index) => {
          const key = options.includeHeaders ? headers[index] : `column_${index + 1}`;
          obj[key] = options.trimValues ? value.trim() : value;
        });
        return obj;
      });

      setJsonOutput(JSON.stringify(jsonData, null, options.indent));
    } catch (err) {
      setError(err.message);
    }
  }, [csvInput, options]);

  const clearAll = () => {
    setCsvInput("");
    setJsonOutput("");
    setError(null);
    setCopied(false);
  };

  const downloadJson = () => {
    if (!jsonOutput) return;
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `converted-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!jsonOutput) return;
    navigator.clipboard.writeText(jsonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setCsvInput(event.target.result);
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">CSV to JSON Converter</h1>

        {/* CSV Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">CSV Input</label>
          <textarea
            className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Enter CSV data here (e.g., name,age\nJohn,25)"
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            aria-label="CSV Input"
          />
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Conversion Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Conversion Options</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Indentation</label>
              <input
                type="number"
                min="0"
                max="8"
                value={options.indent}
                onChange={(e) => setOptions(prev => ({ ...prev, indent: parseInt(e.target.value) || 0 }))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Delimiter</label>
              <select
                value={options.delimiter}
                onChange={(e) => setOptions(prev => ({ ...prev, delimiter: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.trimValues}
                onChange={(e) => setOptions(prev => ({ ...prev, trimValues: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Trim Values</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.includeHeaders}
                onChange={(e) => setOptions(prev => ({ ...prev, includeHeaders: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Include Headers</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.skipEmptyLines}
                onChange={(e) => setOptions(prev => ({ ...prev, skipEmptyLines: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Skip Empty Lines</span>
            </label>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={convertCsvToJson}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Convert to JSON
          </button>
          <button
            onClick={clearAll}
            className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Clear All
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* JSON Output */}
        {jsonOutput && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">JSON Output</label>
            <pre className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-64 overflow-auto text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {jsonOutput}
            </pre>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={downloadJson}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaFileDownload className="mr-2" /> Download JSON
              </button>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors ${copied ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"} flex items-center justify-center`}
              >
                <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert CSV to JSON with customizable options</li>
            <li>Support for multiple delimiters (comma, semicolon, tab, pipe)</li>
            <li>File upload support for CSV files</li>
            <li>Trim values and skip empty lines options</li>
            <li>Flexible header handling</li>
            <li>Download and copy functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CsvToJson;