"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const XMLDataGenerator = () => {
  const [xmlData, setXmlData] = useState("");
  const [count, setCount] = useState(5);
  const [rootElement, setRootElement] = useState("items");
  const [itemElement, setItemElement] = useState("item");
  const [fields, setFields] = useState([
    { name: "id", type: "number", asAttribute: true, customValues: "" },
    { name: "name", type: "text", asAttribute: false, customValues: "" },
    { name: "email", type: "email", asAttribute: false, customValues: "" },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    useCDATA: false,
    indent: 2, // Spaces for indentation
    includeComments: false,
  });

  const MAX_ITEMS = 100;
  const FIELD_TYPES = ["number", "text", "email", "date", "boolean", "custom"];

  const generateRandomData = useCallback((type, customValues) => {
    if (type === "custom" && customValues) {
      const values = customValues.split(",").map((v) => v.trim());
      return values[Math.floor(Math.random() * values.length)];
    }
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
      default:
        return "";
    }
  }, []);

  const escapeXML = (str) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const generateXML = useCallback(() => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setXmlData("");
      return;
    }

    setError("");
    try {
      const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
        const item = {};
        fields.forEach((field) => {
          item[field.name] = generateRandomData(field.type, field.customValues);
        });
        return item;
      });

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      if (options.includeComments) {
        xml += `<!-- Generated on ${new Date().toISOString()} -->\n`;
      }
      xml += `<${rootElement}>\n`;

      items.forEach((item, idx) => {
        const indent = " ".repeat(options.indent);
        const attributes = fields
          .filter((f) => f.asAttribute)
          .map((f) => `${f.name}="${escapeXML(String(item[f.name]))}"`)
          .join(" ");
        xml += `${indent}<${itemElement}${attributes ? " " + attributes : ""}>`;
        if (options.includeComments) {
          xml += ` <!-- Item ${idx + 1} -->`;
        }
        xml += "\n";

        fields
          .filter((f) => !f.asAttribute)
          .forEach((field) => {
            const value = escapeXML(String(item[field.name]));
            xml += `${indent}  <${field.name}>`;
            xml += options.useCDATA ? `<![CDATA[${value}]]>` : value;
            xml += `</${field.name}>\n`;
          });

        xml += `${indent}</${itemElement}>\n`;
      });

      xml += `</${rootElement}>`;
      setXmlData(xml);
      setHistory((prev) => [
        ...prev,
        { xml, count, rootElement, itemElement, fields, options },
      ].slice(-5));
      setIsCopied(false);
    } catch (e) {
      setError("Error generating XML: " + e.message);
    }
  }, [count, fields, rootElement, itemElement, options, generateRandomData]);

  const validateFields = useCallback(() => {
    if (fields.length === 0) return "Please add at least one field";
    if (!rootElement.trim()) return "Root element cannot be empty";
    if (!itemElement.trim()) return "Item element cannot be empty";
    if (fields.some((field) => !field.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length) return "Field names must be unique";
    if (fields.some((f) => f.type === "custom" && !f.customValues.trim()))
      return "Custom fields must have values specified";
    return "";
  }, [fields, rootElement, itemElement]);

  const addField = () => {
    if (fields.length >= 10) return;
    const newFieldName = `field${fields.length + 1}`;
    setFields([...fields, { name: newFieldName, type: "text", asAttribute: false, customValues: "" }]);
  };

  const updateField = (index, key, value) =>
    setFields(fields.map((field, i) => (i === index ? { ...field, [key]: value } : field)));

  const removeField = (index) => fields.length > 1 && setFields(fields.filter((_, i) => i !== index));

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(xmlData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard: " + err.message);
    }
  };

  const downloadAsXML = () => {
    try {
      const blob = new Blob([xmlData], { type: "application/xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${rootElement}-${Date.now()}.xml`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download: " + err.message);
    }
  };

  const clearData = () => {
    setXmlData("");
    setIsCopied(false);
    setError("");
  };

  const restoreFromHistory = (entry) => {
    setXmlData(entry.xml);
    setCount(entry.count);
    setRootElement(entry.rootElement);
    setItemElement(entry.itemElement);
    setFields(entry.fields);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced XML Data Generator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Input Controls */}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Root Element Name
              </label>
              <input
                type="text"
                value={rootElement}
                onChange={(e) => setRootElement(e.target.value.trim() || "items")}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., items"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Element Name
              </label>
              <input
                type="text"
                value={itemElement}
                onChange={(e) => setItemElement(e.target.value.trim() || "item")}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., item"
              />
            </div>
          </div>

          {/* Fields Management */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields ({fields.length}/10)
            </label>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    placeholder="Field Name"
                    className="w-full sm:flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, "type", e.target.value)}
                    className="w-full sm:flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      value={field.customValues}
                      onChange={(e) => updateField(index, "customValues", e.target.value)}
                      placeholder="e.g., value1, value2, value3"
                      className="w-full sm:flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.asAttribute}
                      onChange={(e) => updateField(index, "asAttribute", e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-600">Attribute</label>
                    <button
                      onClick={() => removeField(index)}
                      disabled={fields.length <= 1}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={addField}
                disabled={fields.length >= 10}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                + Add Field {fields.length >= 10 && "(Max 10)"}
              </button>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.useCDATA}
                  onChange={(e) => setOptions((prev) => ({ ...prev, useCDATA: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Use CDATA</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.includeComments}
                  onChange={(e) => setOptions((prev) => ({ ...prev, includeComments: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Include Comments</label>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Indentation (spaces):</label>
                <input
                  type="number"
                  min="0"
                  max="8"
                  value={options.indent}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      indent: Math.max(0, Math.min(8, Number(e.target.value) || 2)),
                    }))
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateXML}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate XML
            </button>
            {xmlData && (
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
                  onClick={downloadAsXML}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearData}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Output Display */}
        {xmlData && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 text-center">
              Generated XML Data ({count} items):
            </h2>
            <div className="mt-3 bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{xmlData}</pre>
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
                  <span>
                    {entry.count} items in &lt;{entry.rootElement}&gt;
                  </span>
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
            <li>Generate custom XML structures with up to 10 fields</li>
            <li>Support for number, text, email, date, boolean, and custom values</li>
            <li>Fields as elements or attributes with CDATA option</li>
            <li>Custom indentation and optional comments</li>
            <li>Copy, download, and restore from history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default XMLDataGenerator;