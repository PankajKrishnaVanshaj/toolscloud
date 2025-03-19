"use client";
import React, { useState, useCallback } from "react";
import yaml from "js-yaml";
import { FaDownload, FaCopy, FaSync, FaPlus } from "react-icons/fa";

const YAMLDataGenerator = () => {
  const [yamlData, setYamlData] = useState("");
  const [count, setCount] = useState(5);
  const [rootKey, setRootKey] = useState("items");
  const [fields, setFields] = useState([
    { name: "id", type: "number", required: true, customValue: "" },
    { name: "name", type: "text", required: false, customValue: "" },
    { name: "email", type: "email", required: false, customValue: "" },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [options, setOptions] = useState({
    includeComments: false,
    nestLevel: 1,
    flowLevel: -1,
    sortKeys: false,
    indent: 2,
    compact: false,
  });

  const MAX_ITEMS = 100;
  const FIELD_TYPES = [
    "number",
    "text",
    "email",
    "date",
    "boolean",
    "null",
    "uuid",
    "custom",
  ];

  const generateRandomData = useCallback((type, required, customValue) => {
    const timestamp = Date.now();
    if (!required && Math.random() < 0.2 && type !== "custom") return null;

    switch (type) {
      case "number":
        return Math.floor(Math.random() * 10000) + 1;
      case "text":
        const firstNames = ["John", "Emma", "Michael", "Sophie", "Alex"];
        const lastNames = ["Smith", "Johnson", "Brown", "Taylor", "Wilson"];
        return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
          lastNames[Math.floor(Math.random() * lastNames.length)]
        }`;
      case "email":
        const emailPrefix = `${Math.random().toString(36).substring(2, 8)}${timestamp}`;
        const domains = ["gmail.com", "outlook.com", "example.org"];
        return `${emailPrefix}@${domains[Math.floor(Math.random() * domains.length)]}`;
      case "date":
        const date = new Date(timestamp - Math.random() * 31536000000);
        return date.toISOString().split("T")[0];
      case "boolean":
        return Math.random() > 0.5;
      case "null":
        return null;
      case "uuid":
        return `${"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        })}`;
      case "custom":
        return customValue || "default-custom-value";
      default:
        return "";
    }
  }, []);

  const validateFields = useCallback(() => {
    if (fields.length === 0) return "Please add at least one field";
    if (!rootKey.trim()) return "Root key cannot be empty";
    if (fields.some((field) => !field.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length)
      return "Field names must be unique";
    return "";
  }, [fields, rootKey]);

  const generateYAML = useCallback(() => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setYamlData("");
      return;
    }

    setError("");
    const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
      const item = fields.reduce(
        (obj, field) => ({
          ...obj,
          [field.name]: generateRandomData(field.type, field.required, field.customValue),
        }),
        {}
      );

      let nestedItem = item;
      for (let i = 1; i < options.nestLevel; i++) {
        nestedItem = { nested: nestedItem };
      }
      return nestedItem;
    });

    try {
      const data = options.compact ? items : { [rootKey]: items };
      const yamlOptions = {
        flowLevel: options.flowLevel,
        sortKeys: options.sortKeys,
        indent: options.indent,
        lineWidth: 80,
        noRefs: true,
      };

      let result = yaml.dump(data, yamlOptions);
      if (options.includeComments) {
        result = `# Generated YAML Data\n# Items: ${count}\n# Date: ${new Date().toISOString()}\n${result}`;
      }
      setYamlData(result);
      setIsCopied(false);
    } catch (e) {
      setError("Error generating YAML: " + e.message);
    }
  }, [count, fields, rootKey, options, generateRandomData, validateFields]);

  const addField = () => {
    const newFieldName = `field${fields.length + 1}`;
    if (!fields.some((f) => f.name === newFieldName) && fields.length < 20) {
      setFields([...fields, { name: newFieldName, type: "text", required: false, customValue: "" }]);
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
      await navigator.clipboard.writeText(yamlData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard: " + err.message);
    }
  };

  const downloadAsYAML = () => {
    try {
      const blob = new Blob([yamlData], { type: "application/yaml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${rootKey}-${Date.now()}.yaml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download: " + err.message);
    }
  };

  const reset = () => {
    setYamlData("");
    setCount(5);
    setRootKey("items");
    setFields([
      { name: "id", type: "number", required: true, customValue: "" },
      { name: "name", type: "text", required: false, customValue: "" },
      { name: "email", type: "email", required: false, customValue: "" },
    ]);
    setIsCopied(false);
    setError("");
    setOptions({ includeComments: false, nestLevel: 1, flowLevel: -1, sortKeys: false, indent: 2, compact: false });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">YAML Data Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Controls */}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Root Key Name</label>
              <input
                type="text"
                value={rootKey}
                onChange={(e) => setRootKey(e.target.value.trim() || "items")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., items"
              />
            </div>
          </div>

          {/* Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields ({fields.length}/20)
            </label>
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
                      value={field.customValue}
                      onChange={(e) => updateField(index, "customValue", e.target.value)}
                      placeholder="Custom Value"
                      className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(index, "required", e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="ml-1 text-sm text-gray-600">Required</span>
                    </label>
                    <button
                      onClick={() => removeField(index)}
                      disabled={fields.length <= 1}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                    >
                      X
                    </button>
                  </div>
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

          {/* YAML Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">YAML Options</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.includeComments}
                  onChange={(e) => setOptions({ ...options, includeComments: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Include Comments</span>
              </label>
              <div>
                <label className="block text-sm text-gray-700">Nesting Level</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={options.nestLevel}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      nestLevel: Math.max(1, Math.min(5, Number(e.target.value))),
                    })
                  }
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.sortKeys}
                  onChange={(e) => setOptions({ ...options, sortKeys: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Sort Keys</span>
              </label>
              <div>
                <label className="block text-sm text-gray-700">Indent (spaces)</label>
                <input
                  type="number"
                  min="2"
                  max="8"
                  step="2"
                  value={options.indent}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      indent: Math.max(2, Math.min(8, Number(e.target.value))),
                    })
                  }
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.compact}
                  onChange={(e) => setOptions({ ...options, compact: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Compact (No Root Key)</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateYAML}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate YAML
            </button>
            {yamlData && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md text-white transition-colors flex items-center justify-center ${
                    isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsYAML}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download
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

          {/* Generated YAML */}
          {yamlData && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Generated YAML Data ({count} items):
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {yamlData}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate random data for multiple field types (including UUID and custom)</li>
            <li>Customizable root key and nesting levels</li>
            <li>Advanced YAML formatting options</li>
            <li>Copy to clipboard and download as .yaml file</li>
            <li>Support for up to 20 fields</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default YAMLDataGenerator;