"use client";
import React, { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import CBOR from "cbor";
import { FaDownload, FaCopy, FaSync, FaPlus, FaTrash } from "react-icons/fa";

const CBORDataGenerator = () => {
  const [jsonPreview, setJsonPreview] = useState("");
  const [cborData, setCborData] = useState(null);
  const [count, setCount] = useState(5);
  const [rootKey, setRootKey] = useState("items");
  const [fields, setFields] = useState([
    { name: "id", type: "integer" },
    { name: "name", type: "string" },
    { name: "active", type: "boolean" },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [nestedDepth, setNestedDepth] = useState(0); // New: Nested object depth
  const [compression, setCompression] = useState(false); // New: Simulated compression

  const MAX_ITEMS = 1000;
  const MAX_FIELDS = 20;
  const MAX_NESTED_DEPTH = 3;
  const FIELD_TYPES = ["integer", "float", "boolean", "string", "bytes", "object"];

  // Generate random data based on type
  const generateRandomData = useCallback((type, depth = 0) => {
    const timestamp = Date.now();
    switch (type) {
      case "integer":
        return Math.floor(Math.random() * 1000000);
      case "float":
        return parseFloat((Math.random() * 1000).toFixed(2));
      case "boolean":
        return Math.random() > 0.5;
      case "string":
        const prefixes = ["user", "item", "record", "data"];
        return `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${timestamp}_${Math.random()
          .toString(36)
          .substring(2, 8)}`;
      case "bytes":
        const byteLength = Math.floor(Math.random() * 10) + 1;
        return Array.from(new Uint8Array(byteLength), () => Math.floor(Math.random() * 256));
      case "object":
        if (depth >= nestedDepth) return {};
        return fields.reduce((obj, field) => ({
          ...obj,
          [field.name]: generateRandomData(field.type, depth + 1),
        }), {});
      default:
        return null;
    }
  }, [fields, nestedDepth]);

  // Generate CBOR data
  const generateCBOR = useCallback(() => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setCborData(null);
      setJsonPreview("");
      return;
    }

    setError("");
    try {
      const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
        return fields.reduce((obj, field) => ({
          ...obj,
          [field.name]: generateRandomData(field.type),
        }), {});
      });

      const dataStructure = { [rootKey]: items };
      let cborBuffer = CBOR.encode(dataStructure);

      // Simulated compression (just for demonstration)
      if (compression) {
        cborBuffer = new Uint8Array(cborBuffer.buffer.slice(0, Math.floor(cborBuffer.length * 0.9))); // Dummy compression
      }

      setCborData({
        items: dataStructure,
        binary: cborBuffer,
        size: cborBuffer.length,
      });
      setJsonPreview(JSON.stringify(dataStructure, null, 2));
      setIsCopied(false);
    } catch (err) {
      setError("Generation failed: " + err.message);
    }
  }, [count, fields, rootKey, compression, generateRandomData]);

  // Validation
  const validateFields = () => {
    if (fields.length === 0) return "Please add at least one field";
    if (!rootKey.trim()) return "Root key cannot be empty";
    if (fields.some((field) => !field.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length) return "Field names must be unique";
    return "";
  };

  // Field management
  const addField = () => {
    if (fields.length < MAX_FIELDS) {
      setFields([...fields, { name: `field${fields.length + 1}`, type: "integer" }]);
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

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy: " + err.message);
    }
  };

  // Download file
  const downloadFile = (content, fileName, type) => {
    try {
      const blob = new Blob([content], { type });
      saveAs(blob, fileName);
    } catch (err) {
      setError("Download failed: " + err.message);
    }
  };

  // Reset all
  const reset = () => {
    setFields([{ name: "id", type: "integer" }, { name: "name", type: "string" }, { name: "active", type: "boolean" }]);
    setCount(5);
    setRootKey("items");
    setNestedDepth(0);
    setCompression(false);
    setCborData(null);
    setJsonPreview("");
    setError("");
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">CBOR Data Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="space-y-6">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nested Depth (0-{MAX_NESTED_DEPTH})
              </label>
              <input
                type="number"
                min="0"
                max={MAX_NESTED_DEPTH}
                value={nestedDepth}
                onChange={(e) => setNestedDepth(Math.max(0, Math.min(MAX_NESTED_DEPTH, Number(e.target.value) || 0)))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Fields */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Fields ({fields.length}/{MAX_FIELDS})
              </label>
              <button
                onClick={addField}
                disabled={fields.length >= MAX_FIELDS}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                <FaPlus className="mr-1" /> Add Field
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={index} className="flex gap-2 items-center">
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
          </div>

          {/* Compression Toggle */}
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={compression}
                onChange={(e) => setCompression(e.target.checked)}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Enable Compression (Simulated)</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateCBOR}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate CBOR
            </button>
            {cborData && (
              <>
                <button
                  onClick={() => copyToClipboard(jsonPreview)}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" /> {isCopied ? "Copied!" : "Copy JSON"}
                </button>
                <button
                  onClick={() =>
                    downloadFile(cborData.binary, `${rootKey}-${Date.now()}.cbor`, "application/octet-stream")
                  }
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download CBOR
                </button>
                <button
                  onClick={() =>
                    downloadFile(jsonPreview, `${rootKey}-${Date.now()}.json`, "application/json")
                  }
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download JSON
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
        </div>

        {/* Preview */}
        {cborData && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Data Preview ({cborData.items[rootKey].length} items)
            </h2>
            <div className="max-h-96 overflow-y-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{jsonPreview}</pre>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              CBOR Size: {cborData.size} bytes {compression && "(Compressed)"}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable field types: integer, float, boolean, string, bytes, object</li>
            <li>Adjustable item count and nested object depth</li>
            <li>Simulated compression option</li>
            <li>Download as CBOR or JSON</li>
            <li>Copy JSON preview to clipboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CBORDataGenerator;