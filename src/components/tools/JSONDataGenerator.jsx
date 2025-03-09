"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaPlus } from "react-icons/fa";

const JSONDataGenerator = () => {
  const [jsonData, setJsonData] = useState("");
  const [count, setCount] = useState(5);
  const [rootKey, setRootKey] = useState("items");
  const [fields, setFields] = useState([
    { name: "id", type: "number" },
    { name: "name", type: "text" },
    { name: "email", type: "email" },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    indent: 2,           // JSON indentation
    arrayOnly: false,    // Generate array instead of object
    customValues: {},    // Custom values for specific fields
  });

  const MAX_ITEMS = 100;
  const FIELD_TYPES = [
    "number",
    "text",
    "email",
    "date",
    "boolean",
    "uuid",
    "phone",
    "lorem",
  ];

  const generateRandomData = useCallback((type, fieldName) => {
    const timestamp = Date.now();
    const customValue = options.customValues[fieldName];
    if (customValue !== undefined) return customValue;

    switch (type) {
      case "number":
        return Math.floor(Math.random() * 10000) + 1;
      case "text":
        const firstNames = ["John", "Emma", "Michael", "Sophie", "Alex"];
        const lastNames = ["Smith", "Johnson", "Brown", "Taylor", "Wilson"];
        return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
          lastNames[Math.floor(Math.random() * lastNames.length)]
        }`;
      case "email":
        const emailPrefix = `${Math.random().toString(36).substring(2, 8)}${timestamp}`;
        const domains = ["gmail.com", "outlook.com", "example.org"];
        return `${emailPrefix}@${domains[Math.floor(Math.random() * domains.length)]}`;
      case "date":
        const date = new Date(timestamp - Math.random() * 31536000000); // Last year
        return date.toISOString().split("T")[0];
      case "boolean":
        return Math.random() > 0.5;
      case "uuid":
        return `${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 6)}`;
      case "phone":
        return `+1-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000000 + Math.random() * 9000000)}`;
      case "lorem":
        const words = ["lorem", "ipsum", "dolor", "sit", "amet"];
        return Array.from({ length: 5 }, () => words[Math.floor(Math.random() * words.length)]).join(" ");
      default:
        return "";
    }
  }, [options.customValues]);

  const validateFields = useCallback(() => {
    if (fields.length === 0) return "Please add at least one field";
    if (!options.arrayOnly && !rootKey.trim()) return "Root key cannot be empty";
    if (fields.some((field) => !field.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length) return "Field names must be unique";
    return "";
  }, [fields, rootKey, options.arrayOnly]);

  const generateJSON = useCallback(() => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setJsonData("");
      return;
    }

    setError("");
    const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
      return fields.reduce((obj, field) => ({
        ...obj,
        [field.name]: generateRandomData(field.type, field.name),
      }), {});
    });

    try {
      const data = options.arrayOnly ? items : { [rootKey]: items };
      setJsonData(JSON.stringify(data, null, options.indent));
      setIsCopied(false);
      setHistory((prev) => [...prev, { json: JSON.stringify(data, null, options.indent), count, fields, rootKey, options }].slice(-5));
    } catch (e) {
      setError("Error generating JSON: " + e.message);
    }
  }, [count, fields, rootKey, options, generateRandomData, validateFields]);

  const addField = () => {
    const newFieldName = `field${fields.length + 1}`;
    if (!fields.some((f) => f.name === newFieldName) && fields.length < 15) {
      setFields([...fields, { name: newFieldName, type: "text" }]);
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

  const updateCustomValue = (fieldName, value) => {
    setOptions((prev) => ({
      ...prev,
      customValues: { ...prev.customValues, [fieldName]: value || undefined },
    }));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard: " + err.message);
    }
  };

  const downloadAsJSON = () => {
    try {
      const blob = new Blob([jsonData], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${rootKey || "data"}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download: " + err.message);
    }
  };

  const clearData = () => {
    setJsonData("");
    setIsCopied(false);
    setError("");
  };

  const restoreFromHistory = (entry) => {
    setJsonData(entry.json);
    setCount(entry.count);
    setFields(entry.fields);
    setRootKey(entry.rootKey);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screenflex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced JSON Data Generator
        </h1>

        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Items (1-{MAX_ITEMS})
              </label>
              <input
                type="number"
                min="1"
                max={MAX_ITEMS}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(MAX_ITEMS, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {!options.arrayOnly && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Root Key Name
                </label>
                <input
                  type="text"
                  value={rootKey}
                  onChange={(e) => setRootKey(e.target.value.trim() || "items")}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., items"
                />
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Indentation:</label>
                <select
                  value={options.indent}
                  onChange={(e) => setOptions({ ...options, indent: Number(e.target.value) })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>No Indent</option>
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.arrayOnly}
                  onChange={() => setOptions({ ...options, arrayOnly: !options.arrayOnly })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Generate Array Only</label>
              </div>
            </div>
          </div>

          {/* Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields ({fields.length})
            </label>
            {fields.map((field, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 mb-3 items-start sm:items-center">
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => updateField(index, "name", e.target.value)}
                  placeholder="Field Name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={field.type}
                  onChange={(e) => updateField(index, "type", e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Custom Value (optional)"
                  onChange={(e) => updateCustomValue(field.name, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
              className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              disabled={fields.length >= 15}
            >
              <FaPlus className="mr-1" /> Add Field {fields.length >= 15 && "(Max 15)"}
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateJSON}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate JSON
            </button>
            {jsonData && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsJSON}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearData}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Output */}
        {jsonData && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Generated JSON Data ({count} items):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{jsonData}</pre>
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
                  <span>{entry.count} items, {entry.fields.length} fields</span>
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

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Generate arrays or objects with custom root keys</li>
            <li>Support for multiple field types (number, text, email, etc.)</li>
            <li>Custom values per field</li>
            <li>Adjustable indentation and history tracking</li>
            <li>Copy and download generated JSON</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JSONDataGenerator;