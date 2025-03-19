"use client";
import React, { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { FaPlus, FaTrash, FaDownload, FaCopy, FaSync } from "react-icons/fa";

const FlatBuffersDataGenerator = () => {
  const [schema, setSchema] = useState("");
  const [generatedData, setGeneratedData] = useState(null);
  const [count, setCount] = useState(5);
  const [rootType, setRootType] = useState("Item");
  const [namespace, setNamespace] = useState("Generated");
  const [fields, setFields] = useState([
    { name: "id", type: "int", required: false },
    { name: "name", type: "string", required: false },
    { name: "active", type: "bool", required: false },
  ]);
  const [isCopied, setIsCopied] = useState({ schema: false, data: false });
  const [error, setError] = useState("");
  const [fileFormat, setFileFormat] = useState("binary"); // New: binary or json

  const MAX_ITEMS = 1000;
  const FIELD_TYPES = [
    "int",
    "float",
    "bool",
    "string",
    "byte",
    "double",
    "uint",
    "short",
    "long",
  ];

  const generateRandomData = useCallback((type, required) => {
    const timestamp = Date.now();
    let value;
    switch (type) {
      case "int":
        value = Math.floor(Math.random() * 1000000);
        break;
      case "uint":
        value = Math.floor(Math.random() * 4294967295);
        break;
      case "float":
        value = Math.random() * 1000;
        break;
      case "bool":
        value = Math.random() > 0.5;
        break;
      case "string":
        const prefixes = ["user", "item", "record", "data"];
        value = `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${timestamp}_${Math.random()
          .toString(36)
          .substring(2, 8)}`;
        break;
      case "byte":
        value = Math.floor(Math.random() * 256);
        break;
      case "double":
        value = Math.random() * 1000000;
        break;
      case "short":
        value = Math.floor(Math.random() * 65535);
        break;
      case "long":
        value = Math.floor(Math.random() * 9007199254740991); // JavaScript max safe integer
        break;
      default:
        value = 0;
    }
    return required && (value === 0 || value === false) ? generateRandomData(type, required) : value;
  }, []);

  const generateSchema = useCallback(() => {
    let schemaContent = `namespace ${namespace};\n\n`;
    schemaContent += `table ${rootType} {\n`;
    fields.forEach((field) => {
      schemaContent += `  ${field.name}:${field.type}${field.required ? " (required)" : ""};\n`;
    });
    schemaContent += `}\n\n`;
    schemaContent += `root_type ${rootType};`;
    return schemaContent;
  }, [namespace, rootType, fields]);

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
            [field.name]: generateRandomData(field.type, field.required),
          }),
          {}
        );
      });

      const dataStructure = { [rootType.toLowerCase()]: items };
      const jsonString = JSON.stringify(dataStructure, null, 2);
      const binaryBuffer = new TextEncoder().encode(jsonString);

      setGeneratedData({
        items: dataStructure,
        binary: binaryBuffer,
        json: jsonString,
        size: binaryBuffer.length,
      });
      setSchema(generateSchema());
      setIsCopied({ schema: false, data: false });
    } catch (err) {
      setError("Generation failed: " + err.message);
    }
  }, [count, fields, rootType, namespace, generateRandomData, generateSchema]);

  const validateFields = () => {
    if (fields.length === 0) return "Please add at least one field";
    if (!rootType.trim()) return "Root type cannot be empty";
    if (!namespace.trim()) return "Namespace cannot be empty";
    if (fields.some((field) => !field.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length)
      return "Field names must be unique";
    return "";
  };

  const addField = () => {
    if (fields.length < 20) {
      setFields([
        ...fields,
        { name: `field${fields.length + 1}`, type: "int", required: false },
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
    setSchema("");
    setGeneratedData(null);
    setCount(5);
    setRootType("Item");
    setNamespace("Generated");
    setFields([
      { name: "id", type: "int", required: false },
      { name: "name", type: "string", required: false },
      { name: "active", type: "bool", required: false },
    ]);
    setIsCopied({ schema: false, data: false });
    setError("");
    setFileFormat("binary");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          FlatBuffers Data Generator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Configuration */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Items (1-{MAX_ITEMS})
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Namespace</label>
              <input
                type="text"
                value={namespace}
                onChange={(e) => setNamespace(e.target.value.trim() || "Generated")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Generated"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Root Type</label>
              <input
                type="text"
                value={rootType}
                onChange={(e) => setRootType(e.target.value.trim() || "Item")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Item"
              />
            </div>
          </div>

          {/* Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields ({fields.length}/20)
            </label>
            <div className="max-h-64 overflow-y-auto space-y-2">
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
                    className="w-28 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
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
                    <span className="text-sm text-gray-600">Req</span>
                  </label>
                  <button
                    onClick={() => removeField(index)}
                    disabled={fields.length <= 1}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addField}
              disabled={fields.length >= 20}
              className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              <FaPlus className="mr-1" /> Add Field {fields.length >= 20 && "(Max 20)"}
            </button>
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
            <select
              value={fileFormat}
              onChange={(e) => setFileFormat(e.target.value)}
              className="w-full sm:w-48 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="binary">Binary (.bin)</option>
              <option value="json">JSON (.json)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={generateData}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Generate FlatBuffers
          </button>
          {generatedData && (
            <>
              <button
                onClick={() => copyToClipboard(schema, "schema")}
                className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                  isCopied.schema
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                <FaCopy className="mr-2" /> {isCopied.schema ? "Schema Copied!" : "Copy Schema"}
              </button>
              <button
                onClick={() =>
                  downloadFile(schema, `${rootType.toLowerCase()}.fbs`, "text/plain")
                }
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download Schema
              </button>
              <button
                onClick={() =>
                  downloadFile(
                    fileFormat === "binary" ? generatedData.binary : generatedData.json,
                    `${rootType.toLowerCase()}.${fileFormat === "binary" ? "bin" : "json"}`,
                    fileFormat === "binary" ? "application/octet-stream" : "application/json"
                  )
                }
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download{" "}
                {fileFormat === "binary" ? "Binary" : "JSON"}
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
          <div className="mt-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated Schema</h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{schema}</pre>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Generated Data ({generatedData.items[rootType.toLowerCase()].length} items)
              </h2>
              <div className="flex justify-between items-center mb-2">
                <button
                  onClick={() => copyToClipboard(generatedData.json, "data")}
                  className={`py-1 px-3 rounded-md transition-colors ${
                    isCopied.data
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  {isCopied.data ? "Data Copied!" : "Copy Data"}
                </button>
                <span className="text-sm text-gray-600">
                  Size: {generatedData.size} bytes
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(generatedData.items, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable schema with multiple field types</li>
            <li>Generate up to {MAX_ITEMS} items</li>
            <li>Support for binary and JSON output formats</li>
            <li>Copy schema/data to clipboard</li>
            <li>Download schema and data files</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FlatBuffersDataGenerator;