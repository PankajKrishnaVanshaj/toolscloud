"use client";
import React, { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { FaDownload, FaCopy, FaSync, FaPlus, FaTrash } from "react-icons/fa";

const EDNDataGenerator = () => {
  const [ednData, setEdnData] = useState("");
  const [count, setCount] = useState(5);
  const [rootKey, setRootKey] = useState(":items");
  const [structureType, setStructureType] = useState("vector"); // New: vector or map
  const [fields, setFields] = useState([
    { name: ":id", type: "integer", required: false, customValues: [] },
    { name: ":name", type: "string", required: false, customValues: [] },
    { name: ":active", type: "boolean", required: false, customValues: [] },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(false); // New: pretty print option

  const MAX_ITEMS = 1000;
  const FIELD_TYPES = [
    "integer",
    "string",
    "boolean",
    "keyword",
    "symbol",
    "float",
    "list",
    "vector",
    "set",
  ];

  const generateRandomData = useCallback((type, required, customValues) => {
    const timestamp = Date.now();
    let value;
    if (customValues.length > 0) {
      value = customValues[Math.floor(Math.random() * customValues.length)];
    } else {
      switch (type) {
        case "integer":
          value = Math.floor(Math.random() * 1000000);
          break;
        case "string":
          value = `"${["user", "item", "record"][Math.floor(Math.random() * 3)]}-${timestamp}-${Math.random().toString(36).substring(2, 8)}"`;
          break;
        case "boolean":
          value = Math.random() > 0.5 ? "true" : "false";
          break;
        case "keyword":
          value = `:${["red", "blue", "green", "status"][Math.floor(Math.random() * 4)]}-${Math.random().toString(36).substring(2, 6)}`;
          break;
        case "symbol":
          value = `sym-${Math.random().toString(36).substring(2, 8)}`;
          break;
        case "float":
          value = (Math.random() * 1000).toFixed(2);
          break;
        case "list":
          value = `'(${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)})`;
          break;
        case "vector":
          value = `[${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)}]`;
          break;
        case "set":
          value = `#{${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)}}`;
          break;
        default:
          value = "nil";
      }
    }
    return required && (value === "nil" || value === "false")
      ? generateRandomData(type, required, customValues)
      : value;
  }, []);

  const generateEDN = useCallback(() => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setEdnData("");
      return;
    }

    setError("");
    try {
      const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
        const itemFields = fields.map((field) =>
          `${field.name} ${generateRandomData(field.type, field.required, field.customValues)}`
        ).join(indent ? "\n  " : " ");
        return indent ? `{\n  ${itemFields}\n}` : `{${itemFields}}`;
      });

      const dataStructure =
        structureType === "map" && rootKey
          ? `{${rootKey} [${indent ? "\n" : ""}${items.join(indent ? "\n" : " ")}${indent ? "\n" : ""}]}`
          : `[${indent ? "\n" : ""}${items.join(indent ? "\n" : " ")}${indent ? "\n" : ""}]`;

      setEdnData(dataStructure);
      setIsCopied(false);
    } catch (err) {
      setError("Generation failed: " + err.message);
    }
  }, [count, fields, rootKey, structureType, indent, generateRandomData]);

  const validateFields = () => {
    if (fields.length === 0) return "Please add at least one field";
    if (fields.some((field) => !field.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length)
      return "Field names must be unique";
    if (fields.some((field) => !field.name.startsWith(":")))
      return "Field names must start with : (EDN keyword)";
    if (structureType === "map" && rootKey && !rootKey.startsWith(":"))
      return "Root key must start with : (EDN keyword)";
    return "";
  };

  const addField = () => {
    if (fields.length < 20) {
      setFields([
        ...fields,
        { name: `:field${fields.length + 1}`, type: "integer", required: false, customValues: [] },
      ]);
    }
  };

  const updateField = (index, key, value) => {
    setFields(fields.map((field, i) =>
      i === index
        ? {
            ...field,
            [key]: key === "name" ? `:${value.replace(/^:+/, "")}` : value,
          }
        : field
    ));
  };

  const updateCustomValues = (index, value) => {
    const customValues = value.split(",").map((v) => v.trim()).filter(Boolean);
    setFields(fields.map((field, i) =>
      i === index ? { ...field, customValues } : field
    ));
  };

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(ednData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy: " + err.message);
    }
  };

  const downloadFile = () => {
    try {
      const blob = new Blob([ednData], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `data-${Date.now()}.edn`);
    } catch (err) {
      setError("Download failed: " + err.message);
    }
  };

  const reset = () => {
    setEdnData("");
    setCount(5);
    setRootKey(":items");
    setStructureType("vector");
    setFields([
      { name: ":id", type: "integer", required: false, customValues: [] },
      { name: ":name", type: "string", required: false, customValues: [] },
      { name: ":active", type: "boolean", required: false, customValues: [] },
    ]);
    setIsCopied(false);
    setError("");
    setIndent(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">EDN Data Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Configuration */}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Structure Type
              </label>
              <select
                value={structureType}
                onChange={(e) => setStructureType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="vector">Vector</option>
                <option value="map">Map with Root Key</option>
              </select>
            </div>
            {structureType === "map" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Root Key (must start with :)
                </label>
                <input
                  type="text"
                  value={rootKey}
                  onChange={(e) => setRootKey(e.target.value ? `:${e.target.value.replace(/^:+/, "")}` : "")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., :items"
                />
              </div>
            )}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={indent}
                  onChange={(e) => setIndent(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Pretty Print (Indented)</span>
              </label>
            </div>
          </div>

          {/* Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields ({fields.length}/20)
            </label>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    placeholder=":field-name"
                    className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, "type", e.target.value)}
                    className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={field.customValues.join(",")}
                    onChange={(e) => updateCustomValues(index, e.target.value)}
                    placeholder="Custom values (comma-separated)"
                    className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
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
                      <FaTrash />
                    </button>
                  </div>
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateEDN}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate EDN
            </button>
            {ednData && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" /> {isCopied ? "Copied!" : "Copy EDN"}
                </button>
                <button
                  onClick={downloadFile}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download EDN
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
          {ednData && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Generated EDN Data ({count} items):
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{ednData}</pre>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Size: {ednData.length} characters
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate up to {MAX_ITEMS} items</li>
            <li>Support for multiple EDN data types</li>
            <li>Custom field values (comma-separated)</li>
            <li>Optional root key with map or vector structure</li>
            <li>Pretty print option for readability</li>
            <li>Copy to clipboard and download as .edn file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EDNDataGenerator;