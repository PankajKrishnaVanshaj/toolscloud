"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaDownload, FaSync, FaUpload, FaCopy, FaTrash } from "react-icons/fa";

const CsvToTsv = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [inputDelimiter, setInputDelimiter] = useState(",");
  const [outputDelimiter, setOutputDelimiter] = useState("\t");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("converted");
  const [quoteChar, setQuoteChar] = useState('"'); // For handling quoted fields
  const [skipEmptyLines, setSkipEmptyLines] = useState(true);
  const [previewRows, setPreviewRows] = useState(5); // Number of rows to preview
  const fileInputRef = useRef(null);

  // Parse CSV/TSV with quote handling
  const parseCSVorTSV = useCallback(
    (text, delimiter) => {
      try {
        const rows = [];
        let currentRow = [];
        let inQuotes = false;
        let field = "";

        const lines = text.split("\n");
        for (let line of lines) {
          if (skipEmptyLines && line.trim() === "") continue;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === quoteChar && (i === 0 || line[i - 1] !== "\\")) {
              inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
              currentRow.push(field);
              field = "";
            } else {
              field += char;
            }
          }
          currentRow.push(field);
          rows.push(currentRow);
          currentRow = [];
          field = "";
          inQuotes = false;
        }

        return rows;
      } catch (err) {
        setError(`Error parsing input: ${err.message}`);
        return [];
      }
    },
    [quoteChar, skipEmptyLines]
  );

  // Convert rows to output format
  const convertToOutputFormat = (rows, delimiter) => {
    return rows
      .map((row) =>
        row
          .map((field) =>
            field.includes(delimiter) || field.includes("\n") ? `${quoteChar}${field}${quoteChar}` : field
          )
          .join(delimiter)
      )
      .join("\n");
  };

  // Handle conversion
  const handleConvert = useCallback(() => {
    setError("");
    setOutputText("");

    if (!inputText.trim()) {
      setError("Please enter or upload some text");
      return;
    }

    const rows = parseCSVorTSV(inputText, inputDelimiter);
    if (rows.length === 0) return;

    const converted = convertToOutputFormat(rows, outputDelimiter);
    setOutputText(converted);
  }, [inputText, inputDelimiter, outputDelimiter, parseCSVorTSV]);

  // File upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name.split(".")[0]);
    const reader = new FileReader();
    reader.onload = (event) => {
      setInputText(event.target.result);
      setError("");
    };
    reader.onerror = () => setError("Error reading file");
    reader.readAsText(file);
  };

  // Download file
  const downloadFile = () => {
    if (!outputText) return;

    const extension = outputDelimiter === "\t" ? "tsv" : "csv";
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    alert("Output copied to clipboard!");
  };

  // Swap delimiters
  const swapDelimiters = () => {
    setInputDelimiter(outputDelimiter);
    setOutputDelimiter(inputDelimiter);
    setInputText(outputText);
    setOutputText("");
  };

  // Reset everything
  const reset = () => {
    setInputText("");
    setOutputText("");
    setInputDelimiter(",");
    setOutputDelimiter("\t");
    setError("");
    setFileName("converted");
    setQuoteChar('"');
    setSkipEmptyLines(true);
    setPreviewRows(5);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          CSV/TSV Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Input Text</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your CSV/TSV here (e.g., a,b,c\n1,2,3)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Delimiter
                </label>
                <select
                  value={inputDelimiter}
                  onChange={(e) => setInputDelimiter(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value=",">Comma (,)</option>
                  <option value="\t">Tab (\t)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Delimiter
                </label>
                <select
                  value={outputDelimiter}
                  onChange={(e) => setOutputDelimiter(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="\t">Tab (\t)</option>
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quote Character
                </label>
                <select
                  value={quoteChar}
                  onChange={(e) => setQuoteChar(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value='"'>Double Quote (")</option>
                  <option value="'">Single Quote (')</option>
                  <option value="">None</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={skipEmptyLines}
                    onChange={(e) => setSkipEmptyLines(e.target.checked)}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Skip Empty Lines</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="file"
                accept=".csv,.tsv,.txt"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                onClick={swapDelimiters}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Swap Delimiters
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConvert}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaUpload className="mr-2" /> Convert
            </button>
            <button
              onClick={downloadFile}
              disabled={!outputText}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!outputText}
              className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCopy className="mr-2" /> Copy
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaTrash className="mr-2" /> Reset
            </button>
          </div>

          {/* Output Section */}
          {outputText && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-700">Output Preview:</h2>
                <div>
                  <label className="text-sm text-gray-600 mr-2">Rows to preview:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={previewRows}
                    onChange={(e) => setPreviewRows(Math.max(1, Math.min(50, e.target.value)))}
                    className="w-16 p-1 border rounded-md"
                  />
                </div>
              </div>
              <textarea
                value={outputText.split("\n").slice(0, previewRows).join("\n")}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 h-40 resize-y"
              />
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between CSV, TSV, and other delimited formats</li>
              <li>Custom input/output delimiters (comma, tab, semicolon, pipe)</li>
              <li>Support for quoted fields with customizable quote character</li>
              <li>Skip empty lines option</li>
              <li>File upload support (.csv, .tsv, .txt)</li>
              <li>Swap delimiters, copy to clipboard, and download options</li>
              <li>Adjustable preview rows</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvToTsv;