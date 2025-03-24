"use client";
import React, { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { FaDownload, FaSync, FaPlus, FaTrash } from "react-icons/fa";

const ParquetDataGenerator = () => {
  const [dataCount, setDataCount] = useState(10);
  const [rootKey, setRootKey] = useState("records");
  const [fields, setFields] = useState([
    { name: "id", type: "number", min: 1, max: 1000, unique: true },
    { name: "name", type: "text", options: ["John", "Emma", "Mike", "Sophie"], unique: false },
    { name: "email", type: "email", domain: "example.com", unique: true },
  ]);
  const [generatedData, setGeneratedData] = useState("");
  const [error, setError] = useState("");
  const [compression, setCompression] = useState("none");
  const [format, setFormat] = useState("json"); // JSON or CSV
  const [isGenerating, setIsGenerating] = useState(false);

  const FIELD_TYPES = {
    number: "Number",
    text: "Text",
    email: "Email",
    date: "Date",
    boolean: "Boolean",
    custom: "Custom List",
    uuid: "UUID",
  };

  const generateRandomData = useCallback((field) => {
    const { type, min, max, options, domain } = field;
    const timestamp = Date.now();

    switch (type) {
      case "number":
        return Math.floor(Math.random() * (max - min + 1)) + min;
      case "text":
        return options[Math.floor(Math.random() * options.length)];
      case "email":
        return `${Math.random().toString(36).substring(2, 8)}${timestamp}@${domain}`;
      case "date":
        const date = new Date(timestamp - Math.random() * 31536000000); // Last year range
        return date.toISOString().split("T")[0];
      case "boolean":
        return Math.random() > 0.5;
      case "custom":
        return options[Math.floor(Math.random() * options.length)];
      case "uuid":
        return `${"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        })}`;
      default:
        return "";
    }
  }, []);

  const validateFields = useCallback(() => {
    if (fields.length === 0) return "Please add at least one field";
    if (!rootKey.trim()) return "Root key cannot be empty";
    if (fields.some((f) => !f.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length)
      return "Field names must be unique";
    return "";
  }, [fields, rootKey]);

  const generateData = useCallback(() => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setGeneratedData("");
      return;
    }

    setIsGenerating(true);
    setError("");
    try {
      const generated = new Set();
      const items = Array.from({ length: Math.min(dataCount, 10000) }, () => {
        const obj = {};
        fields.forEach((field) => {
          let value = generateRandomData(field);
          if (field.unique) {
            while (generated.has(`${field.name}:${value}`)) {
              value = generateRandomData(field);
            }
            generated.add(`${field.name}:${value}`);
          }
          obj[field.name] = value;
        });
        return obj;
      });

      if (format === "json") {
        setGeneratedData(JSON.stringify({ [rootKey]: items }, null, 2));
      } else {
        // CSV format
        const headers = fields.map((f) => f.name).join(",");
        const rows = items.map((item) => fields.map((f) => item[f.name]).join(",")).join("\n");
        setGeneratedData(`${headers}\n${rows}`);
      }
    } catch (e) {
      setError("Error generating data: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  }, [dataCount, fields, rootKey, format, generateRandomData, validateFields]);

  const addField = () => {
    if (fields.length >= 20) return;
    setFields([
      ...fields,
      {
        name: `field${fields.length + 1}`,
        type: "text",
        options: ["value1", "value2"],
        unique: false,
      },
    ]);
  };

  const updateField = (index, key, value) => {
    setFields(fields.map((f, i) => (i === index ? { ...f, [key]: value } : f)));
  };

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const downloadFile = () => {
    if (!generatedData) return;
    const extension = format === "json" ? "json" : "csv";
    const blob = new Blob([generatedData], {
      type: `text/${extension};charset=utf-8`,
    });
    saveAs(blob, `${rootKey}-${Date.now()}.${extension}`);
  };

  const reset = () => {
    setDataCount(10);
    setRootKey("records");
    setFields([
      { name: "id", type: "number", min: 1, max: 1000, unique: true },
      { name: "name", type: "text", options: ["John", "Emma", "Mike", "Sophie"], unique: false },
      { name: "email", type: "email", domain: "example.com", unique: true },
    ]);
    setGeneratedData("");
    setError("");
    setCompression("none");
    setFormat("json");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Parquet Data Generator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Configuration Section */}
        <div className="space-y-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Records (1-10000)
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={dataCount}
                onChange={(e) =>
                  setDataCount(Math.max(1, Math.min(10000, Number(e.target.value) || 1)))
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Root Key Name
              </label>
              <input
                type="text"
                value={rootKey}
                onChange={(e) => setRootKey(e.target.value.trim() || "records")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., records"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compression (Server-side)
              </label>
              <select
                value={compression}
                onChange={(e) => setCompression(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              >
                <option value="none">None</option>
                <option value="snappy">Snappy</option>
                <option value="gzip">GZIP</option>
                <option value="lz4">LZ4</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Applied when converted to Parquet
              </p>
            </div>
          </div>

          {/* Fields Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields ({fields.length}/20)
            </label>
            <div className="max-h-72 overflow-y-auto border rounded-lg p-2 bg-gray-50">
              {fields.map((field, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-2 mb-2 items-start sm:items-center"
                >
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    placeholder="Field Name"
                    className="w-full sm:w-28 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating}
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, "type", e.target.value)}
                    className="w-full sm:w-28 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating}
                  >
                    {Object.entries(FIELD_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {field.type === "number" && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={field.min || ""}
                        onChange={(e) => updateField(index, "min", Number(e.target.value))}
                        className="w-20 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        disabled={isGenerating}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={field.max || ""}
                        onChange={(e) => updateField(index, "max", Number(e.target.value))}
                        className="w-20 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        disabled={isGenerating}
                      />
                    </div>
                  )}
                  {(field.type === "text" || field.type === "custom") && (
                    <input
                      type="text"
                      placeholder="Options (comma-separated)"
                      value={field.options?.join(",") || ""}
                      onChange={(e) => updateField(index, "options", e.target.value.split(","))}
                      className="w-full sm:flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      disabled={isGenerating}
                    />
                  )}
                  {field.type === "email" && (
                    <input
                      type="text"
                      placeholder="Domain"
                      value={field.domain || ""}
                      onChange={(e) => updateField(index, "domain", e.target.value)}
                      className="w-full sm:w-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      disabled={isGenerating}
                    />
                  )}
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={field.unique}
                      onChange={(e) => updateField(index, "unique", e.target.checked)}
                      disabled={isGenerating}
                      className="accent-blue-500"
                    />
                    <span className="text-sm">Unique</span>
                  </label>
                  <button
                    onClick={() => removeField(index)}
                    disabled={fields.length <= 1 || isGenerating}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addField}
              disabled={fields.length >= 20 || isGenerating}
              className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              <FaPlus /> Add Field {fields.length >= 20 && "(Max 20)"}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={generateData}
            disabled={isGenerating}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : null}
            {isGenerating ? "Generating..." : "Generate Data"}
          </button>
          {generatedData && (
            <>
              <button
                onClick={downloadFile}
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
              Generated Data Preview ({dataCount} records):
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                {generatedData}
              </pre>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate up to 10,000 records</li>
            <li>Multiple field types: Number, Text, Email, Date, Boolean, UUID, Custom</li>
            <li>Support for unique values</li>
            <li>Output in JSON or CSV format</li>
            <li>Simulated Parquet compression options</li>
          </ul>
        </div>

        {/* Note */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700 text-sm">
            <strong>Note:</strong> This generates JSON/CSV data. For actual Parquet files, integrate with a server-side library like Apache Arrow.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParquetDataGenerator;