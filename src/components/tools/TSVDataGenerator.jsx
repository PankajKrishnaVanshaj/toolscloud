"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaCopy, FaSync, FaPlus, FaTrash } from "react-icons/fa";

const TSVDataGenerator = () => {
  const [tsvData, setTsvData] = useState("");
  const [rowCount, setRowCount] = useState(5);
  const [fields, setFields] = useState([
    { name: "id", type: "number" },
    { name: "name", type: "text" },
    { name: "email", type: "email" },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [includeHeader, setIncludeHeader] = useState(true);
  const [delimiter, setDelimiter] = useState("\t");
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [quoteValues, setQuoteValues] = useState(false);

  const MAX_ROWS = 10000; // Increased max rows
  const MAX_FIELDS = 20;
  const FIELD_TYPES = ["number", "text", "email", "date", "boolean", "custom", "uuid"];
  const PRESET_DELIMITERS = ["\t", ",", ";", "|"];

  // Random data generation
  const generateRandomData = useCallback((type, customValue = "") => {
    const timestamp = Date.now();
    switch (type) {
      case "number":
        return Math.floor(Math.random() * 100000) + 1;
      case "text":
        const firstNames = ["John", "Emma", "Michael", "Sophie", "Alex", "Olivia"];
        const lastNames = ["Smith", "Johnson", "Brown", "Taylor", "Wilson", "Davis"];
        return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
          lastNames[Math.floor(Math.random() * lastNames.length)]
        }`;
      case "email":
        const emailPrefix = `${Math.random().toString(36).substring(2, 8)}${timestamp}`;
        const domains = ["gmail.com", "outlook.com", "yahoo.com", "example.org"];
        return `${emailPrefix}@${domains[Math.floor(Math.random() * domains.length)]}`;
      case "date":
        const date = new Date(timestamp - Math.random() * 31536000000); // Last year
        return date.toISOString().split("T")[0];
      case "boolean":
        return Math.random() > 0.5 ? "TRUE" : "FALSE";
      case "custom":
        const values = customValue.split(",").map((v) => v.trim());
        return values[Math.floor(Math.random() * values.length)] || "";
      case "uuid":
        return `${Math.random().toString(36).substring(2, 10)}-${Math.random()
          .toString(36)
          .substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random()
          .toString(36)
          .substring(2, 14)}`;
      default:
        return "";
    }
  }, []);

  // Validation
  const validateFields = useCallback(() => {
    if (fields.length === 0) return "Please add at least one field";
    if (fields.some((field) => !field.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length)
      return "Field names must be unique";
    if (fields.some((f) => f.type === "custom" && !f.customValue?.trim()))
      return "Custom fields must have values specified";
    return "";
  }, [fields]);

  // Generate TSV
  const generateTSV = useCallback(() => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setTsvData("");
      return;
    }

    setError("");
    try {
      const activeDelimiter = customDelimiter && !PRESET_DELIMITERS.includes(delimiter) ? customDelimiter : delimiter;
      const rows = [];
      if (includeHeader) {
        rows.push(fields.map((field) => field.name).join(activeDelimiter));
      }

      const dataRows = Array.from({ length: Math.min(rowCount, MAX_ROWS) }, () => {
        return fields
          .map((field) => {
            const value = generateRandomData(field.type, field.customValue);
            const stringValue = String(value);
            return quoteValues || stringValue.includes(activeDelimiter)
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue;
          })
          .join(activeDelimiter);
      });

      setTsvData([...rows, ...dataRows].join("\n"));
      setIsCopied(false);
    } catch (e) {
      setError("Error generating TSV: " + e.message);
    }
  }, [
    rowCount,
    fields,
    includeHeader,
    delimiter,
    customDelimiter,
    quoteValues,
    generateRandomData,
    validateFields,
  ]);

  // Field management
  const addField = () => {
    if (fields.length < MAX_FIELDS) {
      const newFieldName = `field${fields.length + 1}`;
      if (!fields.some((f) => f.name === newFieldName)) {
        setFields([...fields, { name: newFieldName, type: "text" }]);
      }
    }
  };

  const updateField = (index, key, value) => {
    setFields(fields.map((field, i) => (i === index ? { ...field, [key]: value } : field)));
  };

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  // Clipboard and download
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tsvData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard: " + err.message);
    }
  };

  const downloadAsTSV = () => {
    try {
      const blob = new Blob([tsvData], { type: "text/tab-separated-values;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `data-${Date.now()}.tsv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download: " + err.message);
    }
  };

  const reset = () => {
    setTsvData("");
    setRowCount(5);
    setFields([
      { name: "id", type: "number" },
      { name: "name", type: "text" },
      { name: "email", type: "email" },
    ]);
    setIsCopied(false);
    setError("");
    setIncludeHeader(true);
    setDelimiter("\t");
    setCustomDelimiter("");
    setQuoteValues(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">TSV Data Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Rows (1-{MAX_ROWS})
              </label>
              <input
                type="number"
                min="1"
                max={MAX_ROWS}
                value={rowCount}
                onChange={(e) =>
                  setRowCount(Math.max(1, Math.min(MAX_ROWS, Number(e.target.value) || 1)))
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delimiter</label>
              <select
                value={delimiter}
                onChange={(e) => {
                  setDelimiter(e.target.value);
                  setCustomDelimiter("");
                }}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {PRESET_DELIMITERS.map((d) => (
                  <option key={d} value={d}>
                    {d === "\t" ? "Tab" : d}
                  </option>
                ))}
                <option value="custom">Custom</option>
              </select>
              {delimiter === "custom" && (
                <input
                  type="text"
                  value={customDelimiter}
                  onChange={(e) => setCustomDelimiter(e.target.value)}
                  placeholder="Enter custom delimiter"
                  className="mt-2 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
            <div className="flex flex-col gap-2 justify-end">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={includeHeader}
                  onChange={(e) => setIncludeHeader(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Include Header
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={quoteValues}
                  onChange={(e) => setQuoteValues(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Quote All Values
              </label>
            </div>
          </div>

          {/* Fields */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Columns ({fields.length}/{MAX_FIELDS})
              </label>
              <button
                onClick={addField}
                disabled={fields.length >= MAX_FIELDS}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                <FaPlus /> Add Column
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    placeholder="Column Name"
                    className="flex-1 w-full sm:w-auto p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, "type", e.target.value)}
                    className="flex-1 w-full sm:w-auto p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  {field.type === "custom" && (
                    <input
                      type="text"
                      value={field.customValue || ""}
                      onChange={(e) => updateField(index, "customValue", e.target.value)}
                      placeholder="Comma-separated values"
                      className="flex-1 w-full sm:w-auto p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
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
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateTSV}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate TSV
            </button>
            {tsvData && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" /> {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsTSV}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
                <button
                  onClick={reset}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FaSync className="mr-2" /> Reset
                </button>
              </>
            )}
          </div>

          {/* Output */}
          {tsvData && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Generated TSV Data ({rowCount} rows)
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-80 overflow-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {tsvData}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate up to {MAX_ROWS} rows</li>
            <li>Multiple field types: Number, Text, Email, Date, Boolean, Custom, UUID</li>
            <li>Customizable delimiter (preset or custom)</li>
            <li>Option to quote all values</li>
            <li>Copy to clipboard and download as TSV</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TSVDataGenerator;