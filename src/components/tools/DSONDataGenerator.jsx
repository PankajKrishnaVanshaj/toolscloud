"use client";
import React, { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { FaDownload, FaCopy, FaPlus, FaTrash, FaSync } from "react-icons/fa";

const DSONDataGenerator = () => {
  const [dsonData, setDsonData] = useState("");
  const [count, setCount] = useState(5);
  const [rootKey, setRootKey] = useState("items");
  const [fields, setFields] = useState([
    { name: "id", type: "number" },
    { name: "name", type: "string" },
    { name: "active", type: "boolean" },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [indentation, setIndentation] = useState(2); // New: indentation spaces
  const [includeComments, setIncludeComments] = useState(true); // New: toggle comments

  const MAX_ITEMS = 1000;
  const FIELD_TYPES = ["number", "string", "boolean", "array", "object", "date"];

  const generateRandomData = useCallback((type) => {
    const timestamp = Date.now();
    switch (type) {
      case "number":
        return Math.floor(Math.random() * 1000000);
      case "string":
        const prefixes = ["user", "item", "record", "data"];
        return `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
      case "boolean":
        return Math.random() > 0.5;
      case "array":
        return Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => Math.floor(Math.random() * 100));
      case "object":
        return {
          key1: Math.floor(Math.random() * 100),
          key2: `nested_${Math.random().toString(36).substring(2, 6)}`,
        };
      case "date":
        return new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString();
      default:
        return 0;
    }
  }, []);

  const formatDSONValue = (value, indentLevel = 0) => {
    const indent = " ".repeat(indentation * indentLevel);
    if (typeof value === "boolean") return value.toString();
    if (Array.isArray(value)) return `[${value.join(", ")}]`;
    if (typeof value === "object" && value !== null) {
      const entries = Object.entries(value)
        .map(([k, v]) => `${indent}${" ".repeat(indentation)}${k}: ${formatDSONValue(v, indentLevel + 1)}`)
        .join("\n");
      return `{\n${entries}\n${indent}}`;
    }
    if (typeof value === "string") return `"${value}"`;
    return value;
  };

  const generateDSON = useCallback(() => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setDsonData("");
      return;
    }

    setError("");
    try {
      const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
        return fields.reduce(
          (obj, field) => ({
            ...obj,
            [field.name]: generateRandomData(field.type),
          }),
          {}
        );
      });

      let dsonString = `${rootKey}\n{\n`;
      items.forEach((item, index) => {
        if (includeComments) {
          dsonString += `${" ".repeat(indentation)}// Item ${index + 1}\n`;
        }
        dsonString += `${" ".repeat(indentation)}{\n`;
        Object.entries(item).forEach(([key, value]) => {
          dsonString += `${" ".repeat(indentation * 2)}${key}: ${formatDSONValue(value, 2)}\n`;
        });
        dsonString += `${" ".repeat(indentation)}}${index < items.length - 1 ? "," : ""}\n`;
      });
      dsonString += `}`;

      setDsonData(dsonString);
      setIsCopied(false);
    } catch (err) {
      setError("Generation failed: " + err.message);
    }
  }, [count, fields, rootKey, indentation, includeComments, generateRandomData]);

  const validateFields = () => {
    if (fields.length === 0) return "Please add at least one field";
    if (!rootKey.trim()) return "Root key cannot be empty";
    if (fields.some((field) => !field.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length) return "Field names must be unique";
    return "";
  };

  const addField = () => {
    if (fields.length < 20) {
      setFields([...fields, { name: `field${fields.length + 1}`, type: "number" }]);
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
      await navigator.clipboard.writeText(dsonData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy: " + err.message);
    }
  };

  const downloadFile = () => {
    try {
      const blob = new Blob([dsonData], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `${rootKey.toLowerCase()}.dson`);
    } catch (err) {
      setError("Download failed: " + err.message);
    }
  };

  const reset = () => {
    setDsonData("");
    setCount(5);
    setRootKey("items");
    setFields([
      { name: "id", type: "number" },
      { name: "name", type: "string" },
      { name: "active", type: "boolean" },
    ]);
    setIndentation(2);
    setIncludeComments(true);
    setError("");
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">DSON Data Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Items (1-{MAX_ITEMS})
              </label>
              <input
                type="number"
                min="1"
                max={MAX_ITEMS}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(MAX_ITEMS, Number(e.target.value) || 1)))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Root Key</label>
              <input
                type="text"
                value={rootKey}
                onChange={(e) => setRootKey(e.target.value.trim() || "items")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., items"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields ({fields.length}/20)
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={index} className="flex items-center gap-2">
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
                        {type}
                      </option>
                    ))}
                  </select>
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
            <button
              onClick={addField}
              disabled={fields.length >= 20}
              className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
            >
              <FaPlus className="mr-1" /> Add Field {fields.length >= 20 && "(Max 20)"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indentation ({indentation} spaces)
              </label>
              <input
                type="range"
                min="0"
                max="8"
                value={indentation}
                onChange={(e) => setIndentation(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeComments}
                  onChange={(e) => setIncludeComments(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Include Comments</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={generateDSON}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Generate DSON
          </button>
          {dsonData && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                  isCopied
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                <FaCopy className="mr-2" /> {isCopied ? "Copied!" : "Copy DSON"}
              </button>
              <button
                onClick={downloadFile}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download DSON
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

        {/* Generated Data */}
        {dsonData && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated DSON Data ({count} items):
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{dsonData}</pre>
            </div>
            <div className="mt-2 text-sm text-gray-600">Size: {dsonData.length} characters</div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable field types: number, string, boolean, array, object, date</li>
            <li>Adjustable item count (up to {MAX_ITEMS})</li>
            <li>Custom root key and field names</li>
            <li>Configurable indentation and comments</li>
            <li>Copy to clipboard and download as .dson file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DSONDataGenerator;