"use client";
import React, { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { FaPlus, FaTrash, FaDownload, FaCopy, FaSync } from "react-icons/fa";

const ApacheArrowDataGenerator = () => {
  const [schemaDef, setSchemaDef] = useState("");
  const [generatedData, setGeneratedData] = useState(null);
  const [count, setCount] = useState(5);
  const [tableName, setTableName] = useState("DataTable");
  const [fields, setFields] = useState([
    { name: "id", type: "Int32", nullable: true },
    { name: "name", type: "Utf8", nullable: true },
    { name: "value", type: "Float64", nullable: true },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [compression, setCompression] = useState("none"); // New: Compression option

  const MAX_ITEMS = 1000;
  const FIELD_TYPES = [
    "Int32",
    "Int64",
    "Float32",
    "Float64",
    "Utf8",
    "Bool",
    "Date32",
    "Timestamp",
    "Decimal128",
    "List<Utf8>",
  ];

  // Enhanced random data generation
  const generateRandomData = useCallback((type, nullable) => {
    const timestamp = Date.now();
    let value;
    switch (type) {
      case "Int32":
      case "Int64":
        value = Math.floor(Math.random() * 1000000);
        break;
      case "Float32":
      case "Float64":
        value = parseFloat((Math.random() * 1000).toFixed(2));
        break;
      case "Bool":
        value = Math.random() > 0.5;
        break;
      case "Utf8":
        const prefixes = ["record", "entry", "item", "data"];
        value = `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
        break;
      case "Date32":
        value = new Date(timestamp - Math.random() * 31536000000).toISOString().split("T")[0];
        break;
      case "Timestamp":
        value = new Date(timestamp - Math.random() * 31536000000).toISOString();
        break;
      case "Decimal128":
        value = parseFloat((Math.random() * 1000).toFixed(4));
        break;
      case "List<Utf8>":
        value = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () =>
          `item_${Math.random().toString(36).substring(2, 6)}`
        );
        break;
      default:
        value = null;
    }
    if (nullable && Math.random() < 0.1) return null;
    return value;
  }, []);

  // Generate schema with additional metadata
  const generateSchema = useCallback(() => {
    let schemaContent = `// Apache Arrow Schema Definition (JSON format)\n`;
    schemaContent += JSON.stringify(
      {
        name: tableName,
        fields: fields.map((field) => ({
          name: field.name,
          type: field.type,
          nullable: field.nullable,
        })),
        metadata: {
          generated_at: new Date().toISOString(),
          item_count: count,
          compression: compression,
        },
      },
      null,
      2
    );
    return schemaContent;
  }, [tableName, fields, count, compression]);

  // Generate data with compression option
  const generateData = useCallback(async () => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setGeneratedData(null);
      setSchemaDef("");
      return;
    }

    setError("");
    try {
      const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
        return fields.reduce(
          (obj, field) => ({
            ...obj,
            [field.name]: generateRandomData(field.type, field.nullable),
          }),
          {}
        );
      });

      const dataStructure = { [tableName.toLowerCase()]: items };
      let binaryBuffer;
      const jsonString = JSON.stringify(dataStructure);

      if (compression === "gzip") {
        // Simulate GZIP compression (actual implementation would require a library like pako)
        binaryBuffer = new TextEncoder().encode(jsonString); // Placeholder
      } else {
        binaryBuffer = new TextEncoder().encode(jsonString);
      }

      setGeneratedData({
        items: dataStructure,
        binary: binaryBuffer,
        size: binaryBuffer.length,
      });
      setSchemaDef(generateSchema());
      setIsCopied(false);
    } catch (err) {
      setError("Generation failed: " + err.message);
    }
  }, [count, fields, tableName, compression, generateRandomData, generateSchema]);

  const validateFields = () => {
    if (fields.length === 0) return "Please add at least one field";
    if (!tableName.trim()) return "Table name cannot be empty";
    if (fields.some((field) => !field.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length)
      return "Field names must be unique";
    return "";
  };

  const addField = () => {
    if (fields.length < 20) {
      setFields([
        ...fields,
        { name: `field${fields.length + 1}`, type: "Int32", nullable: true },
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
    setSchemaDef("");
    setGeneratedData(null);
    setCount(5);
    setTableName("DataTable");
    setFields([
      { name: "id", type: "Int32", nullable: true },
      { name: "name", type: "Utf8", nullable: true },
      { name: "value", type: "Float64", nullable: true },
    ]);
    setIsCopied(false);
    setError("");
    setCompression("none");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Apache Arrow Data Generator
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
                Table Name
              </label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value.trim() || "DataTable")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., DataTable"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compression
              </label>
              <select
                value={compression}
                onChange={(e) => setCompression(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="gzip">GZIP (Simulated)</option>
              </select>
            </div>
          </div>

          {/* Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields ({fields.length}/20)
            </label>
            <div className="max-h-64 overflow-y-auto border rounded-lg p-2 bg-gray-50">
              {fields.map((field, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
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
                      checked={field.nullable}
                      onChange={(e) => updateField(index, "nullable", e.target.checked)}
                      className="mr-1 accent-blue-500"
                    />
                    <span className="text-sm text-gray-600">Nullable</span>
                  </label>
                  <button
                    onClick={() => removeField(index)}
                    disabled={fields.length <= 1}
                    className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addField}
              disabled={fields.length >= 20}
              className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              <FaPlus className="mr-1" /> Add Field{" "}
              {fields.length >= 20 && "(Max 20)"}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateData}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate Arrow Data
            </button>
            {generatedData && (
              <>
                <button
                  onClick={() => copyToClipboard(schemaDef)}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" /> {isCopied ? "Copied!" : "Copy Schema"}
                </button>
                <button
                  onClick={() =>
                    downloadFile(
                      schemaDef,
                      `${tableName.toLowerCase()}_schema.json`,
                      "application/json"
                    )
                  }
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download Schema
                </button>
                <button
                  onClick={() =>
                    downloadFile(
                      generatedData.binary,
                      `${tableName.toLowerCase()}.arrow`,
                      "application/octet-stream"
                    )
                  }
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download Data
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
          {schemaDef && generatedData && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  Generated Arrow Schema ({count} items)
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-auto">
                  <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                    {schemaDef}
                  </pre>
                </div>
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-700 mb-2">
                  Generated Data ({generatedData.items[tableName.toLowerCase()].length}{" "}
                  items)
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-auto">
                  <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                    {JSON.stringify(generatedData.items, null, 2)}
                  </pre>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Total items: {generatedData.items[tableName.toLowerCase()].length} | Data
                size: {(generatedData.size / 1024).toFixed(2)} KB
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable fields with multiple data types</li>
            <li>Support for nullable fields</li>
            <li>Compression option (simulated GZIP)</li>
            <li>Download schema and data files</li>
            <li>Copy schema to clipboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApacheArrowDataGenerator;