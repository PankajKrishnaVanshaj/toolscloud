"use client";
import React, { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { FaCopy, FaDownload, FaSync, FaPlus, FaTrash } from "react-icons/fa";

const JSONLDataGenerator = () => {
  const [jsonlData, setJsonlData] = useState("");
  const [count, setCount] = useState(5);
  const [fields, setFields] = useState([
    { name: "id", type: "number" },
    { name: "name", type: "text" },
    { name: "email", type: "email" },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [seed, setSeed] = useState(""); // For reproducible results
  const [format, setFormat] = useState("pretty"); // Pretty or compact JSON

  const MAX_ITEMS = 10000; // Increased max items
  const FIELD_TYPES = ["number", "text", "email", "date", "boolean", "uuid", "custom"];

  // Data generation functions with seed support
  const seededRandom = useCallback((seedStr, max) => {
    const seedNum = seedStr ? seedStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.random();
    return Math.floor((Math.sin(seedNum * 123456789) + 1) / 2 * max);
  }, []);

  const generateRandomData = useCallback(
    (type, customValue = "") => {
      const timestamp = Date.now();
      switch (type) {
        case "number":
          return seededRandom(seed, 1000000);
        case "text":
          const firstNames = ["John", "Emma", "Michael", "Sophie", "Alex", "Olivia", "James", "Isabella"];
          const lastNames = ["Smith", "Johnson", "Brown", "Taylor", "Wilson", "Davis", "Clark", "Lewis"];
          return `${firstNames[seededRandom(seed, firstNames.length)]} ${lastNames[seededRandom(seed, lastNames.length)]}`;
        case "email":
          const domains = ["gmail.com", "outlook.com", "yahoo.com", "example.com"];
          return `${Math.random().toString(36).substring(2, 8)}${timestamp}@${domains[seededRandom(seed, domains.length)]}`;
        case "date":
          const date = new Date(timestamp - seededRandom(seed, 31536000000)); // Within last year
          return date.toISOString().split("T")[0];
        case "boolean":
          return seededRandom(seed, 2) === 0;
        case "uuid":
          return `${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 14)}`;
        case "custom":
          return customValue || "default";
        default:
          return "";
      }
    },
    [seed]
  );

  const generateJSONL = useCallback(() => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setJsonlData("");
      return;
    }

    setError("");
    try {
      const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
        const obj = fields.reduce((acc, field) => ({
          ...acc,
          [field.name]: field.type === "custom" ? field.customValue || "default" : generateRandomData(field.type, field.customValue),
        }), {});
        return JSON.stringify(obj, null, format === "pretty" ? 2 : 0);
      });

      const jsonlString = items.join("\n");
      setJsonlData(jsonlString);
      setIsCopied(false);
    } catch (err) {
      setError("Generation failed: " + err.message);
    }
  }, [count, fields, format, generateRandomData]);

  const validateFields = () => {
    if (fields.length === 0) return "Please add at least one field";
    if (fields.some((field) => !field.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length) return "Field names must be unique";
    if (fields.some((field) => field.type === "custom" && !field.customValue)) return "Custom fields must have a value";
    return "";
  };

  const addField = () => {
    if (fields.length < 20) {
      setFields([...fields, { name: `field${fields.length + 1}`, type: "text", customValue: "" }]);
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
      await navigator.clipboard.writeText(jsonlData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy: " + err.message);
    }
  };

  const downloadFile = () => {
    try {
      const blob = new Blob([jsonlData], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `data-${Date.now()}.jsonl`);
    } catch (err) {
      setError("Download failed: " + err.message);
    }
  };

  const clearData = () => {
    setJsonlData("");
    setCount(5);
    setFields([{ name: "id", type: "number" }, { name: "name", type: "text" }, { name: "email", type: "email" }]);
    setSeed("");
    setFormat("pretty");
    setIsCopied(false);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">JSONL Data Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">{error}</div>
        )}

        {/* Settings */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Lines (1-{MAX_ITEMS})
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Seed (optional)</label>
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Enter seed for reproducibility"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="pretty">Pretty (Indented)</option>
                <option value="compact">Compact</option>
              </select>
            </div>
          </div>

          {/* Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fields ({fields.length}/20)</label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
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
                  {field.type === "custom" && (
                    <input
                      type="text"
                      value={field.customValue || ""}
                      onChange={(e) => updateField(index, "customValue", e.target.value)}
                      placeholder="Custom Value"
                      className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
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
            <button
              onClick={addField}
              disabled={fields.length >= 20}
              className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              <FaPlus /> Add Field {fields.length >= 20 && "(Max 20)"}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateJSONL}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate JSONL
            </button>
            {jsonlData && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                    isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                  } text-white`}
                >
                  <FaCopy className="mr-2" /> {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadFile}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
                <button
                  onClick={clearData}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FaSync className="mr-2" /> Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Generated Data */}
        {jsonlData && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated JSONL Data ({Math.min(count, MAX_ITEMS)} lines)
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{jsonlData}</pre>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Total size: {(new TextEncoder().encode(jsonlData).length / 1024).toFixed(2)} KB
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate up to {MAX_ITEMS} JSONL lines</li>
            <li>Customizable fields: number, text, email, date, boolean, UUID, custom</li>
            <li>Seed option for reproducible results</li>
            <li>Pretty or compact JSON formatting</li>
            <li>Copy to clipboard and download options</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JSONLDataGenerator;