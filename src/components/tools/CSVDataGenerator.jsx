"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const CSVDataGenerator = () => {
  const [csvData, setCsvData] = useState("");
  const [rowCount, setRowCount] = useState(5);
  const [delimiter, setDelimiter] = useState(",");
  const [fields, setFields] = useState([
    { name: "id", type: "number", options: { min: 1, max: 1000, format: "integer" } },
    { name: "name", type: "text", options: { format: "fullname" } },
    { name: "email", type: "email", options: {} },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [includeHeader, setIncludeHeader] = useState(true);
  const [quoteValues, setQuoteValues] = useState(false);
  const [history, setHistory] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  const MAX_ROWS = 10000;
  const FIELD_TYPES = {
    number: ["integer", "decimal"],
    text: ["fullname", "word", "sentence", "custom"],
    email: [],
    date: ["iso", "short", "custom"],
    boolean: [],
    uuid: [],
  };

  const generateRandomData = useCallback((type, options) => {
    const timestamp = Date.now();
    switch (type) {
      case "number":
        const min = options.min || 0;
        const max = options.max || 1000;
        return options.format === "decimal"
          ? Number((Math.random() * (max - min) + min).toFixed(2))
          : Math.floor(Math.random() * (max - min) + min);
      case "text":
        if (options.format === "fullname") {
          const first = ["John", "Emma", "Michael", "Sophie", "Alex"];
          const last = ["Smith", "Johnson", "Brown", "Taylor", "Wilson"];
          return `${first[Math.floor(Math.random() * first.length)]} ${
            last[Math.floor(Math.random() * last.length)]
          }`;
        } else if (options.format === "sentence") {
          const words = ["quick", "brown", "fox", "jumps", "over", "lazy", "dog"];
          return Array(5)
            .fill(0)
            .map(() => words[Math.floor(Math.random() * words.length)])
            .join(" ");
        } else if (options.format === "custom" && options.customList) {
          const list = options.customList.split(",").map((item) => item.trim());
          return list[Math.floor(Math.random() * list.length)] || "custom";
        }
        return ["apple", "book", "car"][Math.floor(Math.random() * 3)];
      case "email":
        const prefix = `${Math.random().toString(36).substring(2, 8)}${timestamp}`;
        const domains = ["gmail.com", "outlook.com", "example.org"];
        return `${prefix}@${domains[Math.floor(Math.random() * domains.length)]}`;
      case "date":
        const date = new Date(timestamp - Math.random() * 31536000000);
        if (options.format === "custom" && options.customFormat) {
          return new Intl.DateTimeFormat("en-US", JSON.parse(options.customFormat)).format(date);
        }
        return options.format === "short" ? date.toLocaleDateString() : date.toISOString().split("T")[0];
      case "boolean":
        return Math.random() > 0.5;
      case "uuid":
        return `${"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        })}`;
      default:
        return "";
    }
  }, []);

  const validateInputs = useCallback(() => {
    if (fields.length === 0) return "Add at least one field";
    if (fields.some((f) => !f.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length) return "Field names must be unique";
    if (rowCount < 1 || rowCount > MAX_ROWS) return `Rows must be between 1 and ${MAX_ROWS}`;
    return "";
  }, [fields, rowCount]);

  const generateCSV = useCallback(() => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      setCsvData("");
      return;
    }

    setError("");
    try {
      const rows = [];
      if (includeHeader) {
        rows.push(fields.map((f) => (quoteValues ? `"${f.name}"` : f.name)).join(delimiter));
      }

      for (let i = 0; i < rowCount; i++) {
        const row = fields.map((field) => {
          const value = generateRandomData(field.type, field.options);
          return quoteValues ? `"${value}"` : value;
        });
        rows.push(row.join(delimiter));
      }

      const newCsv = rows.join("\n");
      setCsvData(newCsv);
      setHistory((prev) => [
        ...prev,
        { csv: newCsv, fields, rowCount, delimiter, includeHeader, quoteValues },
      ].slice(-5));
      setIsCopied(false);
    } catch (e) {
      setError("Error generating CSV: " + e.message);
    }
  }, [fields, rowCount, delimiter, includeHeader, quoteValues, generateRandomData, validateInputs]);

  const addField = () => {
    if (fields.length < 15) {
      setFields([...fields, { name: `field${fields.length + 1}`, type: "text", options: { format: "word" } }]);
    }
  };

  const updateField = (index, key, value) => {
    const newFields = [...fields];
    if (key === "options") {
      newFields[index].options = { ...newFields[index].options, ...value };
    } else {
      newFields[index][key] = value;
    }
    setFields(newFields);
  };

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(csvData);
      setShowAlert(true);
      setIsCopied(true);
      setTimeout(() => {
        setShowAlert(false);
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      setError("Failed to copy: " + err.message);
    }
  };

  const downloadCSV = () => {
    try {
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `data-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download: " + err.message);
    }
  };

  const restoreFromHistory = (entry) => {
    setCsvData(entry.csv);
    setFields(entry.fields);
    setRowCount(entry.rowCount);
    setDelimiter(entry.delimiter);
    setIncludeHeader(entry.includeHeader);
    setQuoteValues(entry.quoteValues);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full ">
        {/* Alert Notification */}
        {showAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            CSV copied to clipboard!
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced CSV Data Generator
        </h1>

        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>
        )}

        <div className="space-y-6">
          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Rows (1-{MAX_ROWS})
              </label>
              <input
                type="number"
                min="1"
                max={MAX_ROWS}
                value={rowCount}
                onChange={(e) => setRowCount(Math.max(1, Math.min(MAX_ROWS, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delimiter</label>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={includeHeader}
                onChange={(e) => setIncludeHeader(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              Include Header
            </label>
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={quoteValues}
                onChange={(e) => setQuoteValues(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              Quote Values
            </label>
          </div>

          {/* Fields Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields ({fields.length}/15)
            </label>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    placeholder="Field Name"
                    className="w-full sm:w-1/4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, "type", e.target.value)}
                    className="w-full sm:w-1/4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(FIELD_TYPES).map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  {FIELD_TYPES[field.type].length > 0 && (
                    <select
                      value={field.options.format || FIELD_TYPES[field.type][0]}
                      onChange={(e) => updateField(index, "options", { format: e.target.value })}
                      className="w-full sm:w-1/4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {FIELD_TYPES[field.type].map((format) => (
                        <option key={format} value={format}>
                          {format.charAt(0).toUpperCase() + format.slice(1)}
                        </option>
                      ))}
                    </select>
                  )}
                  {field.type === "number" && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <input
                        type="number"
                        placeholder="Min"
                        value={field.options.min || ""}
                        onChange={(e) => updateField(index, "options", { min: Number(e.target.value) })}
                        className="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={field.options.max || ""}
                        onChange={(e) => updateField(index, "options", { max: Number(e.target.value) })}
                        className="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  {(field.type === "text" && field.options.format === "custom") && (
                    <input
                      type="text"
                      placeholder="Custom List (comma-separated)"
                      value={field.options.customList || ""}
                      onChange={(e) => updateField(index, "options", { customList: e.target.value })}
                      className="w-full sm:flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  {(field.type === "date" && field.options.format === "custom") && (
                    <input
                      type="text"
                      placeholder='JSON Date Format (e.g., {"month": "long"})'
                      value={field.options.customFormat || ""}
                      onChange={(e) => updateField(index, "options", { customFormat: e.target.value })}
                      className="w-full sm:flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  <button
                    onClick={() => removeField(index)}
                    disabled={fields.length <= 1}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                onClick={addField}
                disabled={fields.length >= 15}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
              >
                + Add Field {fields.length >= 15 && "(Max 15)"}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateCSV}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              Generate CSV
            </button>
            {csvData && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md text-white transition-colors font-medium flex items-center justify-center ${
                    isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadCSV}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={() => setCsvData("")}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Generated CSV */}
          {csvData && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Generated CSV Data ({rowCount} rows):
              </h2>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-64 overflow-y-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{csvData}</pre>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-700 flex items-center">
                <FaHistory className="mr-2" /> Recent Generations (Last 5)
              </h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-2">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{entry.rowCount} rows, {entry.fields.length} fields</span>
                    <button
                      onClick={() => restoreFromHistory(entry)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FaUndo />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Generate numbers, text, emails, dates, booleans, and UUIDs</li>
            <li>Custom text lists and date formats</li>
            <li>Flexible delimiters and quoting options</li>
            <li>Copy, download, and track history</li>
          </ul>
        </div>
      </div>

      {/* Tailwind Animation */}
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

export default CSVDataGenerator;