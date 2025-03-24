"use client";
import React, { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { FaDownload, FaCopy, FaPlus, FaTrash, FaSync } from "react-icons/fa";

const BSONDataGenerator = () => {
  const [generatedData, setGeneratedData] = useState(null);
  const [count, setCount] = useState(5);
  const [collectionName, setCollectionName] = useState("documents");
  const [fields, setFields] = useState([
    { name: "_id", type: "objectId", required: true },
    { name: "name", type: "string", required: false },
    { name: "age", type: "int", required: false },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [format, setFormat] = useState("json"); // New: Output format option

  const MAX_ITEMS = 1000;
  const FIELD_TYPES = [
    "objectId",
    "string",
    "int",
    "double",
    "boolean",
    "date",
    "array",
    "object",
    "binary",
  ];

  const generateRandomData = useCallback((type, required) => {
    const timestamp = Date.now();
    let value;
    switch (type) {
      case "objectId":
        value = Array(24)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("");
        break;
      case "string":
        const prefixes = ["user", "doc", "item", "record"];
        value = `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
        break;
      case "int":
        value = Math.floor(Math.random() * 100000);
        break;
      case "double":
        value = Number((Math.random() * 10000).toFixed(2));
        break;
      case "boolean":
        value = Math.random() > 0.5;
        break;
      case "date":
        value = new Date(timestamp - Math.random() * 31536000000).toISOString();
        break;
      case "array":
        value = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () =>
          Math.floor(Math.random() * 100)
        );
        break;
      case "object":
        value = {
          key: Math.random().toString(36).substring(2, 8),
          value: Math.floor(Math.random() * 1000),
          timestamp: new Date().toISOString(),
        };
        break;
      case "binary":
        value = Array.from({ length: 16 }, () =>
          Math.floor(Math.random() * 256)
        )
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("");
        break;
      default:
        value = null;
    }
    return required && (value === null || value === 0 || value === false)
      ? generateRandomData(type, required)
      : value;
  }, []);

  const generateBSONData = useCallback(() => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setGeneratedData(null);
      return;
    }

    setError("");
    try {
      const documents = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
        return fields.reduce(
          (obj, field) => ({
            ...obj,
            [field.name]: generateRandomData(field.type, field.required),
          }),
          {}
        );
      });

      const dataStructure = { [collectionName]: documents };
      const jsonString = JSON.stringify(dataStructure, null, 2);
      const binaryBuffer = new TextEncoder().encode(jsonString);

      setGeneratedData({
        documents: dataStructure,
        binary: binaryBuffer,
        size: binaryBuffer.length,
      });
      setIsCopied(false);
    } catch (err) {
      setError("Generation failed: " + err.message);
    }
  }, [count, fields, collectionName, generateRandomData]);

  const validateFields = () => {
    if (fields.length === 0) return "Please add at least one field";
    if (!collectionName.trim()) return "Collection name cannot be empty";
    if (fields.some((field) => !field.name.trim()))
      return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length)
      return "Field names must be unique";
    return "";
  };

  const addField = () => {
    if (fields.length < 20) {
      setFields([
        ...fields,
        { name: `field${fields.length + 1}`, type: "string", required: false },
      ]);
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

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
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
    setCollectionName("documents");
    setFields([
      { name: "_id", type: "objectId", required: true },
      { name: "name", type: "string", required: false },
      { name: "age", type: "int", required: false },
    ]);
    setError("");
    setIsCopied(false);
    setFormat("json");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          BSON Data Generator
        </h1>

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
                Number of Documents (1-{MAX_ITEMS})
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
                Collection Name
              </label>
              <input
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value.trim() || "documents")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., documents"
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
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, "required", e.target.checked)}
                      className="mr-1 accent-blue-500"
                    />
                    <span className="text-sm text-gray-600">Required</span>
                  </label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Output Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="json">JSON</option>
              <option value="bson">BSON (Binary)</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={generateBSONData}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Generate Data
          </button>
          {generatedData && (
            <>
              <button
                onClick={() =>
                  copyToClipboard(JSON.stringify(generatedData.documents, null, 2))
                }
                className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                  isCopied
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                <FaCopy className="mr-2" /> {isCopied ? "Copied!" : "Copy JSON"}
              </button>
              <button
                onClick={() => {
                  const content =
                    format === "csv"
                      ? generateCSV(generatedData.documents[collectionName])
                      : format === "bson"
                      ? generatedData.binary
                      : JSON.stringify(generatedData.documents, null, 2);
                  const fileName = `${collectionName}.${format}`;
                  const type =
                    format === "csv"
                      ? "text/csv"
                      : format === "bson"
                      ? "application/octet-stream"
                      : "application/json";
                  downloadFile(content, fileName, type);
                }}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download {format.toUpperCase()}
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

        {/* Generated Data Preview */}
        {generatedData && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Data ({count} documents)
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(generatedData.documents, null, 2)}
              </pre>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Total documents: {generatedData.documents[collectionName].length} | Binary size:{" "}
              {generatedData.size} bytes
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate up to {MAX_ITEMS} documents</li>
            <li>Customizable fields with multiple data types</li>
            <li>Support for JSON, BSON, and CSV output formats</li>
            <li>Copy to clipboard and download options</li>
            <li>Field management (add, edit, remove)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate CSV
const generateCSV = (documents) => {
  if (!documents || documents.length === 0) return "";
  const headers = Object.keys(documents[0]);
  const rows = documents.map((doc) =>
    headers
      .map((header) => {
        const value = doc[header];
        return typeof value === "object" ? JSON.stringify(value) : String(value);
      })
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
};

export default BSONDataGenerator;