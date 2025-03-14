"use client";
import React, { useState, useCallback, useRef } from "react";
import jsyaml from "js-yaml"; // npm install js-yaml
import { FaDownload, FaSync, FaUpload, FaCopy } from "react-icons/fa";

const CsvToYaml = () => {
  const [csvInput, setCsvInput] = useState("");
  const [yamlOutput, setYamlOutput] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [options, setOptions] = useState({
    indent: 2,
    flowLevel: -1,
    header: true,
    arrayOutput: true,
    delimiter: ",",
    quoteValues: false,
    forceQuotes: false,
  });
  const fileInputRef = useRef(null);

  // Parse CSV with custom delimiter
  const parseCSV = useCallback(() => {
    const lines = csvInput.trim().split("\n");
    const result = [];
    const headers = options.header ? lines[0].split(options.delimiter).map(h => h.trim()) : null;

    if (options.header && lines.length < 2) {
      throw new Error("CSV must have at least one data row if header is enabled");
    }

    const dataLines = options.header ? lines.slice(1) : lines;
    for (const line of dataLines) {
      const values = line.split(options.delimiter).map(v => v.trim());
      if (headers && values.length !== headers.length) {
        throw new Error("Mismatch between header and data columns");
      }
      const obj = headers
        ? headers.reduce((acc, header, i) => {
            const value = isNaN(values[i]) ? values[i] : Number(values[i]);
            acc[header] = options.quoteValues && typeof value === "string" ? `"${value}"` : value;
            return acc;
          }, {})
        : values.map(v => (isNaN(v) ? v : Number(v)));
      result.push(obj);
    }

    return options.arrayOutput ? result : { data: result };
  }, [csvInput, options]);

  // Convert CSV to YAML
  const convertToYaml = useCallback(() => {
    setError("");
    setYamlOutput("");
    setIsProcessing(true);

    if (!csvInput.trim()) {
      setError("Please enter or upload a CSV");
      setIsProcessing(false);
      return;
    }

    try {
      const parsedData = parseCSV();
      const yaml = jsyaml.dump(parsedData, {
        indent: options.indent,
        flowLevel: options.flowLevel,
        forceQuotes: options.forceQuotes,
      });
      setYamlOutput(yaml);
    } catch (err) {
      setError(`Error converting CSV to YAML: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [parseCSV, options]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvInput(event.target.result);
      setError("");
    };
    reader.onerror = () => setError("Error reading file");
    reader.readAsText(file);
  };

  // Download YAML file
  const downloadYaml = () => {
    if (!yamlOutput) return;
    const blob = new Blob([yamlOutput], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted-${Date.now()}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy YAML to clipboard
  const copyToClipboard = () => {
    if (!yamlOutput) return;
    navigator.clipboard.writeText(yamlOutput).then(() => {
      alert("YAML copied to clipboard!");
    });
  };

  // Reset everything
  const reset = () => {
    setCsvInput("");
    setYamlOutput("");
    setError("");
    setOptions({
      indent: 2,
      flowLevel: -1,
      header: true,
      arrayOutput: true,
      delimiter: ",",
      quoteValues: false,
      forceQuotes: false,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle option changes
  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          CSV to YAML Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">CSV Input</label>
            <textarea
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder="e.g., name,age,city\nJohn,25,New York"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-y"
              disabled={isProcessing}
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="file"
                accept=".csv,.txt"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isProcessing}
              />
              <div className="flex gap-2">
                <button
                  onClick={convertToYaml}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FaUpload className="mr-2" /> {isProcessing ? "Converting..." : "Convert"}
                </button>
                <button
                  onClick={reset}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FaSync className="mr-2" /> Reset
                </button>
              </div>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Conversion Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.header}
                  onChange={(e) => handleOptionChange("header", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isProcessing}
                />
                <span className="text-sm text-gray-700">CSV has header row</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.arrayOutput}
                  onChange={(e) => handleOptionChange("arrayOutput", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isProcessing}
                />
                <span className="text-sm text-gray-700">Output as array</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.quoteValues}
                  onChange={(e) => handleOptionChange("quoteValues", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isProcessing}
                />
                <span className="text-sm text-gray-700">Quote string values</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.forceQuotes}
                  onChange={(e) => handleOptionChange("forceQuotes", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isProcessing}
                />
                <span className="text-sm text-gray-700">Force quotes on all values</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delimiter
                </label>
                <select
                  value={options.delimiter}
                  onChange={(e) => handleOptionChange("delimiter", e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="\t">Tab (\t)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indentation
                </label>
                <select
                  value={options.indent}
                  onChange={(e) => handleOptionChange("indent", parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={6}>6 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flow Level
                </label>
                <select
                  value={options.flowLevel}
                  onChange={(e) => handleOptionChange("flowLevel", parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  <option value={-1}>Auto</option>
                  <option value={0}>Inline</option>
                  <option value={1}>1 level</option>
                  <option value={2}>2 levels</option>
                  <option value={3}>3 levels</option>
                </select>
              </div>
            </div>
          </div>

          {/* Output Section */}
          {yamlOutput && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-2">
                <h2 className="text-lg font-semibold text-gray-800">YAML Output</h2>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <FaCopy className="mr-2" /> Copy
                  </button>
                  <button
                    onClick={downloadYaml}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <FaDownload className="mr-2" /> Download
                  </button>
                </div>
              </div>
              <pre className="text-sm bg-gray-100 p-3 rounded-lg overflow-auto max-h-72">
                {yamlOutput}
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
              <li>Convert CSV to YAML with customizable options</li>
              <li>Support for file upload (.csv, .txt)</li>
              <li>Custom delimiters: comma, semicolon, tab, pipe</li>
              <li>Header row and array/object output options</li>
              <li>Adjustable indentation and flow level</li>
              <li>Quote string values or force quotes on all</li>
              <li>Copy to clipboard or download as YAML file</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvToYaml;