"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaDownload, FaSync, FaUpload, FaCopy } from "react-icons/fa";

const TsvToCsv = () => {
  const [tsvInput, setTsvInput] = useState("");
  const [csvOutput, setCsvOutput] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [quoteFields, setQuoteFields] = useState(true);
  const [headerRow, setHeaderRow] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("converted.csv");
  const fileInputRef = useRef(null);

  const convertTsvToCsv = useCallback(
    (tsv) => {
      try {
        setError("");
        if (!tsv.trim()) {
          setError("Please enter TSV data or upload a file");
          return "";
        }

        const rows = tsv.split("\n").map((row) => row.trim());
        const csvRows = rows.map((row, index) => {
          const fields = row.split("\t");
          return fields.map((field) => {
            let trimmed = trimWhitespace ? field.trim() : field;
            const needsQuotes =
              quoteFields ||
              trimmed.includes(delimiter) ||
              trimmed.includes('"') ||
              trimmed.includes("\n") ||
              (!headerRow && index === 0);
            if (needsQuotes) {
              return `"${trimmed.replace(/"/g, '""')}"`;
            }
            return trimmed;
          }).join(delimiter);
        });

        return csvRows.join("\n");
      } catch (err) {
        setError(`Conversion error: ${err.message}`);
        return "";
      }
    },
    [delimiter, quoteFields, trimWhitespace, headerRow]
  );

  const handleInputChange = (value) => {
    setTsvInput(value);
    setCsvOutput(convertTsvToCsv(value));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name.replace(/\.[^/.]+$/, "") + ".csv");
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setTsvInput(text);
      setCsvOutput(convertTsvToCsv(text));
    };
    reader.onerror = () => setError("Error reading file");
    reader.readAsText(file);
  };

  const downloadCsv = () => {
    if (!csvOutput) {
      setError("No CSV data to download");
      return;
    }

    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName || "converted.csv");
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!csvOutput) {
      setError("No CSV data to copy");
      return;
    }
    navigator.clipboard.writeText(csvOutput);
    alert("CSV copied to clipboard!");
  };

  const clearAll = () => {
    setTsvInput("");
    setCsvOutput("");
    setError("");
    setFileName("converted.csv");
    setDelimiter(",");
    setQuoteFields(true);
    setHeaderRow(true);
    setTrimWhitespace(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          TSV to CSV Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TSV Input
              </label>
              <textarea
                value={tsvInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Paste TSV data here (e.g., column1\tcolumn2\nvalue1\tvalue2)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-48 resize-y"
              />
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
                onClick={clearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Clear
              </button>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Conversion Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CSV Delimiter
                </label>
                <select
                  value={delimiter}
                  onChange={(e) => {
                    setDelimiter(e.target.value);
                    setCsvOutput(convertTsvToCsv(tsvInput));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value=" ">Space</option>
                  <option value="\t">Tab</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={quoteFields}
                  onChange={(e) => {
                    setQuoteFields(e.target.checked);
                    setCsvOutput(convertTsvToCsv(tsvInput));
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Quote all fields
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={headerRow}
                  onChange={(e) => {
                    setHeaderRow(e.target.checked);
                    setCsvOutput(convertTsvToCsv(tsvInput));
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Treat first row as header
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={trimWhitespace}
                  onChange={(e) => {
                    setTrimWhitespace(e.target.checked);
                    setCsvOutput(convertTsvToCsv(tsvInput));
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Trim whitespace
                </label>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CSV Output
            </label>
            <textarea
              value={csvOutput}
              readOnly
              placeholder="CSV output will appear here"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 h-48 resize-y"
            />
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="File name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  onClick={downloadCsv}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert TSV to CSV with custom delimiters (comma, semicolon, space, tab, pipe)</li>
              <li>Upload TSV files or paste text</li>
              <li>Optional field quoting and header row handling</li>
              <li>Trim whitespace option</li>
              <li>Copy to clipboard or download as CSV</li>
              <li>Handles quotes and special characters</li>
            </ul>
            <p className="text-sm text-blue-600 mt-2">
              Example TSV: "Name\tAge\nJohn Doe\t30"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TsvToCsv;