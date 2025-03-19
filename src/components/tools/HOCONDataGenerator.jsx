"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaCopy, FaSync, FaPlus } from "react-icons/fa";

const HOCONDataGenerator = () => {
  const [hoconData, setHoconData] = useState("");
  const [count, setCount] = useState(5);
  const [rootKey, setRootKey] = useState("items");
  const [fields, setFields] = useState([
    { name: "id", type: "number", includeQuotes: false },
    { name: "name", type: "text", includeQuotes: true },
    { name: "email", type: "email", includeQuotes: true },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [includeComments, setIncludeComments] = useState(true);
  const [useSubstitutions, setUseSubstitutions] = useState(false);
  const [indentLevel, setIndentLevel] = useState(2); // New: indentation control
  const [formatStyle, setFormatStyle] = useState("compact"); // New: compact or pretty

  const MAX_ITEMS = 100;
  const FIELD_TYPES = ["number", "text", "email", "date", "boolean", "uuid"];

  const generateRandomData = useCallback((type) => {
    const timestamp = Date.now();
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
        const date = new Date(timestamp - Math.random() * 31536000000);
        return date.toISOString().split("T")[0];
      case "boolean":
        return Math.random() > 0.5;
      case "uuid":
        return `${"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0,
            v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        })}`;
      default:
        return "";
    }
  }, []);

  const validateFields = useCallback(() => {
    if (fields.length === 0) return "Please add at least one field";
    if (!rootKey.trim()) return "Root key cannot be empty";
    if (fields.some((field) => !field.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length)
      return "Field names must be unique";
    return "";
  }, [fields, rootKey]);

  const generateHOCON = useCallback(() => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setHoconData("");
      return;
    }

    setError("");
    let output = "";

    // Add header comment if enabled
    if (includeComments) {
      output += `# Generated HOCON Data - ${new Date().toLocaleString()}\n`;
    }

    // Generate substitution definitions if enabled
    const substitutions = {};
    if (useSubstitutions) {
      fields.forEach((field) => {
        if (["text", "email", "uuid"].includes(field.type)) {
          substitutions[field.name] = generateRandomData(field.type);
          output += `${field.name} = ${
            field.includeQuotes ? `"${substitutions[field.name]}"` : substitutions[field.name]
          }\n`;
        }
      });
      output += formatStyle === "pretty" ? "\n" : "";
    }

    // Generate main data structure
    const indent = " ".repeat(indentLevel);
    output += `${rootKey} = [${formatStyle === "pretty" ? "\n" : " "}`;
    const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
      const objLines = fields.map((field) => {
        const value = useSubstitutions && substitutions[field.name]
          ? `\${${field.name}}`
          : generateRandomData(field.type);
        const formattedValue =
          field.includeQuotes && typeof value === "string" && !value.startsWith("${")
            ? `"${value}"`
            : value;
        return includeComments
          ? `${indent}${indent}${field.name}: ${formattedValue} # ${field.type} field`
          : `${indent}${indent}${field.name}: ${formattedValue}`;
      });
      return `${indent}{\n${objLines.join(
        formatStyle === "pretty" ? "\n" : ", "
      )}\n${indent}}`;
    });
    output +=
      items.join(formatStyle === "pretty" ? ",\n" : ", ") +
      (formatStyle === "pretty" ? `\n${indent}]` : " ]");

    setHoconData(output);
    setIsCopied(false);
  }, [
    count,
    fields,
    rootKey,
    generateRandomData,
    validateFields,
    includeComments,
    useSubstitutions,
    indentLevel,
    formatStyle,
  ]);

  const addField = () => {
    const newFieldName = `field${fields.length + 1}`;
    if (!fields.some((f) => f.name === newFieldName) && fields.length < 10) {
      setFields([...fields, { name: newFieldName, type: "text", includeQuotes: true }]);
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(hoconData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy: " + err.message);
    }
  };

  const downloadAsHOCON = () => {
    try {
      const blob = new Blob([hoconData], { type: "text/hocon;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${rootKey}-${Date.now()}.conf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download: " + err.message);
    }
  };

  const reset = () => {
    setHoconData("");
    setCount(5);
    setRootKey("items");
    setFields([
      { name: "id", type: "number", includeQuotes: false },
      { name: "name", type: "text", includeQuotes: true },
      { name: "email", type: "email", includeQuotes: true },
    ]);
    setIsCopied(false);
    setError("");
    setIncludeComments(true);
    setUseSubstitutions(false);
    setIndentLevel(2);
    setFormatStyle("compact");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          HOCON Data Generator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Configuration Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Items (1-{MAX_ITEMS})
              </label>
              <input
                type="number"
                min="1"
                max={MAX_ITEMS}
                value={count}
                onChange={(e) =>
                  setCount(Math.max(1, Math.min(MAX_ITEMS, Number(e.target.value) || 1)))
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Root Key Name
              </label>
              <input
                type="text"
                value={rootKey}
                onChange={(e) => setRootKey(e.target.value.trim() || "items")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., items"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indent Level
              </label>
              <input
                type="number"
                min="0"
                max="8"
                value={indentLevel}
                onChange={(e) => setIndentLevel(Math.max(0, Math.min(8, Number(e.target.value))))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format Style
              </label>
              <select
                value={formatStyle}
                onChange={(e) => setFormatStyle(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="compact">Compact</option>
                <option value="pretty">Pretty</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeComments}
                  onChange={(e) => setIncludeComments(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Include Comments</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useSubstitutions}
                  onChange={(e) => setUseSubstitutions(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Use Substitutions</span>
              </label>
            </div>
          </div>

          {/* Fields Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields ({fields.length}/10)
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 items-center">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    placeholder="Field Name"
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, "type", e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={field.includeQuotes}
                      onChange={(e) => updateField(index, "includeQuotes", e.target.checked)}
                      className="mr-1 accent-blue-500"
                    />
                    <span className="text-sm text-gray-600">Quotes</span>
                  </label>
                  <button
                    onClick={() => removeField(index)}
                    disabled={fields.length <= 1}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addField}
              disabled={fields.length >= 10}
              className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              <FaPlus className="mr-1" /> Add Field{" "}
              {fields.length >= 10 && "(Max 10)"}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateHOCON}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate HOCON
            </button>
            {hoconData && (
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
                  onClick={downloadAsHOCON}
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

          {/* Generated Output */}
          {hoconData && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Generated HOCON Data ({count} items):
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {hoconData}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate HOCON with customizable fields (up to 10)</li>
            <li>Support for number, text, email, date, boolean, and UUID types</li>
            <li>Options for comments, substitutions, indentation, and format style</li>
            <li>Copy to clipboard and download as .conf file</li>
            <li>Validation for unique field names and limits</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HOCONDataGenerator;