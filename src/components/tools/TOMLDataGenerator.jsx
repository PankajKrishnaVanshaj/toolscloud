"use client";
import React, { useState, useCallback } from "react";
import TOML from "@iarna/toml";
import { FaDownload, FaCopy, FaTrash, FaPlus } from "react-icons/fa";

const TOMLDataGenerator = () => {
  const [tomlData, setTomlData] = useState("");
  const [count, setCount] = useState(5);
  const [tableName, setTableName] = useState("items");
  const [fields, setFields] = useState([
    { name: "id", type: "integer", options: { min: 1, max: 1000 } },
    { name: "name", type: "string", options: { prefix: "", choices: ["John", "Emma", "Michael", "Sophie", "Alex"] } },
    { name: "active", type: "boolean", options: {} },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");

  const MAX_ITEMS = 1000;
  const FIELD_TYPES = [
    { value: "string", label: "String", hasOptions: true },
    { value: "integer", label: "Integer", hasOptions: true },
    { value: "float", label: "Float", hasOptions: true },
    { value: "boolean", label: "Boolean", hasOptions: false },
    { value: "datetime", label: "DateTime", hasOptions: true },
    { value: "array", label: "Array", hasOptions: true },
  ];

  const generateRandomData = useCallback((type, options) => {
    const timestamp = Date.now();
    switch (type) {
      case "integer":
        const min = options?.min ?? 0;
        const max = options?.max ?? 1000;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      case "float":
        const fMin = options?.min ?? 0;
        const fMax = options?.max ?? 100;
        return Number((Math.random() * (fMax - fMin) + fMin).toFixed(options?.decimals ?? 2));
      case "string":
        const choices = options?.choices?.length ? options.choices : ["John", "Emma", "Michael", "Sophie", "Alex"];
        const prefix = options?.prefix ?? "";
        return `${prefix}${choices[Math.floor(Math.random() * choices.length)]}`;
      case "boolean":
        return Math.random() > 0.5;
      case "datetime":
        const range = options?.range ?? 31536000000; // 1 year default
        const date = new Date(timestamp - Math.random() * range);
        return date;
      case "array":
        const length = options?.length ?? 3;
        const arrayType = options?.arrayType ?? "integer";
        return Array.from({ length }, () => generateRandomData(arrayType, options?.arrayOptions || {}));
      default:
        return "";
    }
  }, []);

  const validateFields = useCallback(() => {
    if (fields.length === 0) return "Please add at least one field";
    if (!tableName.trim()) return "Table name cannot be empty";
    if (fields.some((field) => !field.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length) return "Field names must be unique";
    return "";
  }, [fields, tableName]);

  const generateTOML = useCallback(() => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setTomlData("");
      return;
    }

    setError("");
    const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
      return fields.reduce((obj, field) => ({
        ...obj,
        [field.name]: generateRandomData(field.type, field.options),
      }), {});
    });

    const dataStructure = { [tableName]: items };
    try {
      const tomlString = TOML.stringify(dataStructure);
      setTomlData(tomlString);
      setIsCopied(false);
    } catch (e) {
      setError("Error generating TOML: " + e.message);
    }
  }, [count, fields, tableName, generateRandomData, validateFields]);

  const addField = () => {
    if (fields.length < 15) {
      setFields([...fields, { name: `field${fields.length + 1}`, type: "string", options: {} }]);
    }
  };

  const updateField = (index, key, value) => {
    setFields(fields.map((field, i) => (i === index ? { ...field, [key]: value } : field)));
  };

  const updateFieldOptions = (index, optionKey, value) => {
    setFields(fields.map((field, i) =>
      i === index ? { ...field, options: { ...field.options, [optionKey]: value } } : field
    ));
  };

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tomlData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy: " + err.message);
    }
  };

  const downloadAsTOML = () => {
    try {
      const blob = new Blob([tomlData], { type: "application/toml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${tableName}-${Date.now()}.toml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download: " + err.message);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">TOML Data Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Items (1-{MAX_ITEMS})</label>
              <input
                type="number"
                min="1"
                max={MAX_ITEMS}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(MAX_ITEMS, Number(e.target.value) || 1)))}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value.trim() || "items")}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 border-gray-300"
                placeholder="e.g., items"
              />
            </div>
          </div>

          {/* Fields Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fields ({fields.length})</label>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {fields.map((field, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center border-b pb-2">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    placeholder="Field Name"
                    className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 border-gray-300"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, "type", e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 border-gray-300"
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {FIELD_TYPES.find((t) => t.value === field.type)?.hasOptions && (
                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                      {(field.type === "integer" || field.type === "float") && (
                        <>
                          <input
                            type="number"
                            value={field.options.min ?? ""}
                            onChange={(e) => updateFieldOptions(index, "min", Number(e.target.value))}
                            placeholder="Min"
                            className="w-full sm:w-20 p-2 border rounded-md bg-white text-gray-800 border-gray-300"
                          />
                          <input
                            type="number"
                            value={field.options.max ?? ""}
                            onChange={(e) => updateFieldOptions(index, "max", Number(e.target.value))}
                            placeholder="Max"
                            className="w-full sm:w-20 p-2 border rounded-md bg-white text-gray-800 border-gray-300"
                          />
                          {field.type === "float" && (
                            <input
                              type="number"
                              value={field.options.decimals ?? 2}
                              onChange={(e) => updateFieldOptions(index, "decimals", Number(e.target.value))}
                              placeholder="Decimals"
                              min="0"
                              max="10"
                              className="w-full sm:w-20 p-2 border rounded-md bg-white text-gray-800 border-gray-300"
                            />
                          )}
                        </>
                      )}
                      {field.type === "string" && (
                        <>
                          <input
                            type="text"
                            value={field.options.prefix ?? ""}
                            onChange={(e) => updateFieldOptions(index, "prefix", e.target.value)}
                            placeholder="Prefix"
                            className="w-full sm:flex-1 p-2 border rounded-md bg-white text-gray-800 border-gray-300"
                          />
                          <input
                            type="text"
                            value={field.options.choices?.join(",") ?? ""}
                            onChange={(e) => updateFieldOptions(index, "choices", e.target.value.split(",").map((s) => s.trim()))}
                            placeholder="Choices (comma-separated)"
                            className="w-full sm:flex-1 p-2 border rounded-md bg-white text-gray-800 border-gray-300"
                          />
                        </>
                      )}
                      {field.type === "datetime" && (
                        <input
                          type="number"
                          value={field.options.range ?? 31536000000}
                          onChange={(e) => updateFieldOptions(index, "range", Number(e.target.value))}
                          placeholder="Range (ms)"
                          className="w-full sm:w-24 p-2 border rounded-md bg-white text-gray-800 border-gray-300"
                        />
                      )}
                      {field.type === "array" && (
                        <>
                          <input
                            type="number"
                            value={field.options.length ?? 3}
                            onChange={(e) => updateFieldOptions(index, "length", Number(e.target.value))}
                            placeholder="Length"
                            min="1"
                            max="20"
                            className="w-full sm:w-20 p-2 border rounded-md bg-white text-gray-800 border-gray-300"
                          />
                          <select
                            value={field.options.arrayType ?? "integer"}
                            onChange={(e) => updateFieldOptions(index, "arrayType", e.target.value)}
                            className="w-full sm:flex-1 p-2 border rounded-md bg-white text-gray-800 border-gray-300"
                          >
                            {FIELD_TYPES.filter((t) => t.value !== "array").map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
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
              disabled={fields.length >= 15}
              className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              <FaPlus className="mr-1" /> Add Field {fields.length >= 15 && "(Max 15)"}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateTOML}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Generate TOML
            </button>
            {tomlData && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center transition-colors ${
                    isCopied
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-600 hover:bg-gray-700"
                  } text-white focus:ring-2`}
                >
                  <FaCopy className="mr-2" /> {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsTOML}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 flex items-center justify-center transition-colors"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
                <button
                  onClick={() => setTomlData("")}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Generated TOML */}
          {tomlData && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated TOML Data ({count} items):</h2>
              <pre className="p-4 rounded-md border max-h-96 overflow-auto text-sm font-mono bg-gray-50 text-gray-800 border-gray-200">
                {tomlData}
              </pre>
            </div>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Generate TOML data with custom fields</li>
              <li>Support for String, Integer, Float, Boolean, DateTime, and Array types</li>
              <li>Customizable options for each field type</li>
              <li>Copy to clipboard and download as .toml file</li>
              <li>Up to {MAX_ITEMS} items and 15 fields</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TOMLDataGenerator;