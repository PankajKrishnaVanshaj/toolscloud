"use client";
import React, { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { FaDownload, FaCopy, FaPlus, FaTrash, FaSync } from "react-icons/fa";

const ORCDataGenerator = () => {
  const [schema, setSchema] = useState("");
  const [generatedData, setGeneratedData] = useState(null);
  const [count, setCount] = useState(5);
  const [tableName, setTableName] = useState("SampleTable");
  const [fields, setFields] = useState([
    { name: "id", type: "bigint", nullable: true },
    { name: "name", type: "string", nullable: true },
    { name: "timestamp", type: "timestamp", nullable: true },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [compression, setCompression] = useState("none"); // New: Compression option
  const [format, setFormat] = useState("json"); // New: Output format option

  const MAX_ITEMS = 1000;
  const FIELD_TYPES = [
    "bigint",
    "int",
    "smallint",
    "tinyint",
    "float",
    "double",
    "boolean",
    "string",
    "timestamp",
    "decimal",
    "date",
  ];
  const COMPRESSION_TYPES = ["none", "snappy", "zlib"];

  // Generate random data based on field type
  const generateRandomData = useCallback((type, nullable) => {
    const timestamp = Date.now();
    let value;
    switch (type) {
      case "bigint":
        value = BigInt(Math.floor(Math.random() * 1000000000));
        break;
      case "int":
        value = Math.floor(Math.random() * 1000000);
        break;
      case "smallint":
        value = Math.floor(Math.random() * 32768);
        break;
      case "tinyint":
        value = Math.floor(Math.random() * 128);
        break;
      case "float":
        value = Math.random() * 1000;
        break;
      case "double":
        value = Math.random() * 1000000;
        break;
      case "boolean":
        value = Math.random() > 0.5;
        break;
      case "string":
        const prefixes = ["user", "record", "event", "item"];
        value = `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${timestamp}_${Math.random()
          .toString(36)
          .substring(2, 8)}`;
        break;
      case "timestamp":
        value = new Date(timestamp - Math.random() * 31536000000).toISOString();
        break;
      case "decimal":
        value = (Math.random() * 1000).toFixed(2);
        break;
      case "date":
        value = new Date(timestamp - Math.random() * 31536000000).toISOString().split("T")[0];
        break;
      default:
        value = null;
    }
    return nullable && Math.random() < 0.1 ? null : value;
  }, []);

  // Generate ORC schema
  const generateSchema = useCallback(() => {
    let schemaContent = `-- ORC Schema for ${tableName}\n`;
    schemaContent += `CREATE TABLE ${tableName} (\n`;
    schemaContent += fields
      .map((field) => `  ${field.name} ${field.type.toUpperCase()}${field.nullable ? "" : " NOT NULL"}`)
      .join(",\n");
    schemaContent += `\n) STORED AS ORC\n`;
    schemaContent += `  TBLPROPERTIES ("orc.compress"="${compression.toUpperCase()}");`;
    return schemaContent;
  }, [tableName, fields, compression]);

  // Generate data
  const generateData = useCallback(() => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setGeneratedData(null);
      setSchema("");
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
      let content, contentType;

      if (format === "json") {
        const jsonString = JSON.stringify(dataStructure, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        );
        content = new TextEncoder().encode(jsonString);
        contentType = "application/json";
      } else if (format === "csv") {
        const headers = fields.map((f) => f.name).join(",");
        const rows = items
          .map((item) =>
            fields
              .map((f) => {
                const value = item[f.name];
                return value === null ? "" : typeof value === "string" ? `"${value}"` : value;
              })
              .join(",")
          )
          .join("\n");
        content = new TextEncoder().encode(`${headers}\n${rows}`);
        contentType = "text/csv";
      }

      setGeneratedData({
        items: dataStructure,
        binary: content,
        size: content.length,
      });
      setSchema(generateSchema());
      setIsCopied(false);
    } catch (err) {
      setError("Generation failed: " + err.message);
    }
  }, [count, fields, tableName, compression, format, generateRandomData, generateSchema]);

  // Validation
  const validateFields = () => {
    if (fields.length === 0) return "Please add at least one field";
    if (!tableName.trim()) return "Table name cannot be empty";
    if (fields.some((field) => !field.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length) return "Field names must be unique";
    return "";
  };

  // Field management
  const addField = () => {
    if (fields.length < 20) {
      setFields([...fields, { name: `field${fields.length + 1}`, type: "int", nullable: true }]);
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

  // Reset everything
  const reset = () => {
    setSchema("");
    setGeneratedData(null);
    setCount(5);
    setTableName("SampleTable");
    setFields([
      { name: "id", type: "bigint", nullable: true },
      { name: "name", type: "string", nullable: true },
      { name: "timestamp", type: "timestamp", nullable: true },
    ]);
    setCompression("none");
    setFormat("json");
    setIsCopied(false);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">ORC Data Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Configuration Section */}
        <div className="space-y-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Rows</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value.trim() || "SampleTable")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., SampleTable"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compression</label>
              <select
                value={compression}
                onChange={(e) => setCompression(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {COMPRESSION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>

          {/* Fields Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Columns ({fields.length}/20)
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 items-center">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    placeholder="Column Name"
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
                      className="mr-2 accent-blue-500"
                    />
                    <span className="text-sm text-gray-600">Nullable</span>
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
              className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              <FaPlus className="mr-1" /> Add Column {fields.length >= 20 && "(Max 20)"}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={generateData}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Generate ORC Data
          </button>
          {generatedData && (
            <>
              <button
                onClick={() => copyToClipboard(schema)}
                className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                  isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                } text-white`}
              >
                <FaCopy className="mr-2" /> {isCopied ? "Copied!" : "Copy Schema"}
              </button>
              <button
                onClick={() => downloadFile(schema, `${tableName.toLowerCase()}.sql`, "text/plain")}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download Schema
              </button>
              <button
                onClick={() =>
                  downloadFile(
                    generatedData.binary,
                    `${tableName.toLowerCase()}.${format}`,
                    format === "json" ? "application/json" : "text/csv"
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
        {schema && generatedData && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Generated ORC Schema ({count} rows):
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{schema}</pre>
              </div>
            </div>
            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-2">
                Generated Data ({generatedData.items[tableName.toLowerCase()].length} rows):
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(
                    generatedData.items,
                    (key, value) => (typeof value === "bigint" ? value.toString() : value),
                    2
                  )}
                </pre>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Total rows: {generatedData.items[tableName.toLowerCase()].length} | Data size:{" "}
              {(generatedData.size / 1024).toFixed(2)} KB
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable table schema with multiple data types</li>
            <li>Support for compression options (None, Snappy, Zlib)</li>
            <li>Output in JSON or CSV formats</li>
            <li>Generate up to {MAX_ITEMS} rows</li>
            <li>Copy schema to clipboard</li>
            <li>Download schema and data files</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ORCDataGenerator;