"use client";
import React, { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { FaDownload, FaCopy, FaSync, FaTrash } from "react-icons/fa";

const MessagePackDataGenerator = () => {
  const [generatedData, setGeneratedData] = useState(null);
  const [count, setCount] = useState(5);
  const [rootKey, setRootKey] = useState("items");
  const [fields, setFields] = useState([
    { name: "id", type: "integer" },
    { name: "name", type: "string" },
    { name: "active", type: "boolean" },
  ]);
  const [isCopied, setIsCopied] = useState({ json: false, hex: false });
  const [error, setError] = useState("");
  const [compression, setCompression] = useState(false);
  const [previewLimit, setPreviewLimit] = useState(1000);

  const MAX_ITEMS = 1000;
  const FIELD_TYPES = ["integer", "float", "boolean", "string", "binary", "timestamp"];

  const generateRandomData = useCallback((type) => {
    const timestamp = Date.now();
    switch (type) {
      case "integer":
        return Math.floor(Math.random() * 1000000);
      case "float":
        return Math.random() * 1000;
      case "boolean":
        return Math.random() > 0.5;
      case "string":
        const prefixes = ["user", "item", "record", "data"];
        return `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
      case "binary":
        const byteLength = Math.floor(Math.random() * 10) + 1;
        const bytes = new Uint8Array(byteLength);
        for (let i = 0; i < byteLength; i++) {
          bytes[i] = Math.floor(Math.random() * 256);
        }
        return bytes;
      case "timestamp":
        return new Date(timestamp - Math.floor(Math.random() * 10000000000)).toISOString();
      default:
        return null;
    }
  }, []);

  const generateData = useCallback(() => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setGeneratedData(null);
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

      const dataStructure = { [rootKey]: items };
      const jsonString = JSON.stringify(dataStructure);
      let binaryBuffer = new TextEncoder().encode(jsonString);

      // Simulate compression if enabled
      if (compression) {
        binaryBuffer = new Uint8Array(binaryBuffer.buffer.slice(0, Math.floor(binaryBuffer.length * 0.7))); // Simulated reduction
      }

      const hexPreview = Array.from(binaryBuffer)
        .slice(0, previewLimit)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join(" ");

      setGeneratedData({
        items: dataStructure,
        binary: binaryBuffer,
        hexPreview: hexPreview,
        size: binaryBuffer.length,
      });
      setIsCopied({ json: false, hex: false });
    } catch (err) {
      setError("Generation failed: " + err.message);
    }
  }, [count, fields, rootKey, compression, previewLimit, generateRandomData]);

  const validateFields = () => {
    if (fields.length === 0) return "Please add at least one field";
    if (!rootKey.trim()) return "Root key cannot be empty";
    if (fields.some((field) => !field.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length)
      return "Field names must be unique";
    return "";
  };

  const addField = () => {
    if (fields.length < 20) {
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

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied((prev) => ({ ...prev, [type]: true }));
      setTimeout(() => setIsCopied((prev) => ({ ...prev, [type]: false })), 2000);
    } catch (err) {
      setError("Failed to copy: " + err.message);
    }
  };

  const downloadFile = (content, fileName, type) => {
    try {
      const blob = new Blob([content], { type });
      saveAs(blob, fileName);
    } catch (err) {
      setError("Download failed: " + err.message);
    }
  };

  const reset = () => {
    setGeneratedData(null);
    setCount(5);
    setRootKey("items");
    setFields([
      { name: "id", type: "integer" },
      { name: "name", type: "string" },
      { name: "active", type: "boolean" },
    ]);
    setCompression(false);
    setPreviewLimit(1000);
    setError("");
    setIsCopied({ json: false, hex: false });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          MessagePack Data Generator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Configuration */}
        <div className="space-y-6 mb-6">
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
                onChange={(e) =>
                  setCount(Math.max(1, Math.min(MAX_ITEMS, Number(e.target.value) || 1)))
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Root Key
              </label>
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
            <button
              onClick={addField}
              disabled={fields.length >= 20}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              + Add Field {fields.length >= 20 && "(Max 20)"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={compression}
                  onChange={(e) => setCompression(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Simulate Compression</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hex Preview Limit ({previewLimit} bytes)
              </label>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={previewLimit}
                onChange={(e) => setPreviewLimit(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={generateData}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Generate MessagePack
          </button>
          {generatedData && (
            <>
              <button
                onClick={() => downloadFile(generatedData.binary, `${rootKey}.msgpack`, "application/octet-stream")}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download Binary
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
        {generatedData && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Data Structure ({generatedData.items[rootKey].length} items)
              </h2>
              <div className="relative bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(generatedData.items, null, 2)}
                </pre>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(generatedData.items, null, 2), "json")}
                  className={`absolute top-2 right-2 py-1 px-2 rounded-md transition-colors ${
                    isCopied.json
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy /> {isCopied.json ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Binary Preview (Hex, first {previewLimit} bytes)
              </h2>
              <div className="relative bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {generatedData.hexPreview}
                </pre>
                <button
                  onClick={() => copyToClipboard(generatedData.hexPreview, "hex")}
                  className={`absolute top-2 right-2 py-1 px-2 rounded-md transition-colors ${
                    isCopied.hex
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy /> {isCopied.hex ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Total items: {generatedData.items[rootKey].length} | Binary size: {generatedData.size} bytes{" "}
              {compression && "(compressed)"}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable field types including timestamp</li>
            <li>Adjustable item count and root key</li>
            <li>Simulated compression option</li>
            <li>Configurable hex preview limit</li>
            <li>Copy JSON or hex to clipboard</li>
            <li>Download as binary file</li>
          </ul>
        </div>

        {/* Note */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700 text-sm">
            <strong>Note:</strong> This simulates MessagePack encoding. For real MessagePack, install{" "}
            <code>msgpack-lite</code> and use <code>msgpack.encode()</code>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessagePackDataGenerator;