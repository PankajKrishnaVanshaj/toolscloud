"use client";
import React, { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { FaDownload, FaCopy, FaTrash, FaPlus } from "react-icons/fa";

const ThriftDataGenerator = () => {
  const [schema, setSchema] = useState("");
  const [generatedData, setGeneratedData] = useState(null);
  const [count, setCount] = useState(5);
  const [namespace, setNamespace] = useState("generated");
  const [structName, setStructName] = useState("Item");
  const [fields, setFields] = useState([
    { name: "id", id: 1, type: "i32", required: false },
    { name: "name", id: 2, type: "string", required: false },
    { name: "active", id: 3, type: "bool", required: false },
  ]);
  const [isCopied, setIsCopied] = useState({ schema: false, data: false });
  const [error, setError] = useState("");
  const [format, setFormat] = useState("json"); // New: Output format option

  const MAX_ITEMS = 1000;
  const FIELD_TYPES = [
    "i8",
    "i16",
    "i32",
    "i64",
    "double",
    "string",
    "bool",
    "byte",
    "list<i32>",
    "map<string,string>",
  ];

  // Generate random data based on type
  const generateRandomData = useCallback((type, required) => {
    const timestamp = Date.now();
    let value;
    switch (type) {
      case "i8":
      case "byte":
        value = Math.floor(Math.random() * 256);
        break;
      case "i16":
        value = Math.floor(Math.random() * 65536);
        break;
      case "i32":
        value = Math.floor(Math.random() * 4294967296);
        break;
      case "i64":
        value = Math.floor(Math.random() * 9007199254740991);
        break;
      case "double":
        value = Math.random() * 1000000;
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
      case "list<i32>":
        value = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () =>
          Math.floor(Math.random() * 1000)
        );
        break;
      case "map<string,string>":
        value = {
          [`key_${timestamp}`]: `value_${Math.random().toString(36).substring(2, 8)}`,
          [`key_${timestamp + 1}`]: `value_${Math.random().toString(36).substring(2, 8)}`,
        };
        break;
      default:
        value = 0;
    }
    return required && (value === 0 || value === false) ? generateRandomData(type, required) : value;
  }, []);

  // Generate Thrift schema
  const generateSchema = useCallback(() => {
    let schemaContent = `namespace cpp ${namespace}.cpp\n`;
    schemaContent += `namespace java ${namespace}.java\n`;
    schemaContent += `namespace py ${namespace}.py\n\n`; // Added Python namespace
    schemaContent += `struct ${structName} {\n`;
    fields.forEach((field) => {
      schemaContent += `  ${field.id}: ${field.required ? "required" : "optional"} ${field.type} ${field.name}\n`;
    });
    schemaContent += `}\n`;
    return schemaContent;
  }, [namespace, structName, fields]);

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
            [field.name]: generateRandomData(field.type, field.required),
          }),
          {}
        );
      });

      const dataStructure = { [structName.toLowerCase()]: items };
      let outputData, binaryBuffer;
      if (format === "json") {
        outputData = JSON.stringify(dataStructure, null, 2);
        binaryBuffer = new TextEncoder().encode(outputData);
      } else if (format === "csv") {
        const headers = fields.map((f) => f.name).join(",");
        const rows = items.map((item) => fields.map((f) => JSON.stringify(item[f.name])).join(",")).join("\n");
        outputData = `${headers}\n${rows}`;
        binaryBuffer = new TextEncoder().encode(outputData);
      }

      setGeneratedData({
        items: dataStructure,
        output: outputData,
        binary: binaryBuffer,
        size: binaryBuffer.length,
      });
      setSchema(generateSchema());
      setIsCopied({ schema: false, data: false });
    } catch (err) {
      setError("Generation failed: " + err.message);
    }
  }, [count, fields, structName, namespace, format, generateRandomData, generateSchema]);

  // Validation
  const validateFields = () => {
    if (fields.length === 0) return "Please add at least one field";
    if (!structName.trim()) return "Struct name cannot be empty";
    if (!namespace.trim()) return "Namespace cannot be empty";
    if (fields.some((field) => !field.name.trim())) return "All field names must be filled";
    if (fields.some((field) => !Number.isInteger(field.id) || field.id < 1))
      return "All field IDs must be positive integers";
    if (new Set(fields.map((f) => f.name)).size !== fields.length) return "Field names must be unique";
    if (new Set(fields.map((f) => f.id)).size !== fields.length) return "Field IDs must be unique";
    return "";
  };

  // Field management
  const addField = () => {
    if (fields.length < 20) {
      const newId = Math.max(...fields.map((f) => f.id)) + 1;
      setFields([
        ...fields,
        { name: `field${fields.length + 1}`, id: newId, type: "i32", required: false },
      ]);
    }
  };

  const updateField = (index, key, value) => {
    setFields(fields.map((field, i) =>
      i === index ? { ...field, [key]: key === "id" ? parseInt(value) || field.id : value } : field
    ));
  };

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied((prev) => ({ ...prev, [type]: true }));
      setTimeout(() => setIsCopied((prev) => ({ ...prev, [type]: false })), 2000);
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

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Thrift Data Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Configuration Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Namespace</label>
              <input
                type="text"
                value={namespace}
                onChange={(e) => setNamespace(e.target.value.trim() || "generated")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., generated"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Struct Name</label>
              <input
                type="text"
                value={structName}
                onChange={(e) => setStructName(e.target.value.trim() || "Item")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Item"
              />
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

          {/* Fields Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Fields ({fields.length}/20)</label>
              <button
                onClick={addField}
                disabled={fields.length >= 20}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                <FaPlus className="mr-1" /> Add Field
              </button>
            </div>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <input
                    type="number"
                    value={field.id}
                    onChange={(e) => updateField(index, "id", e.target.value)}
                    placeholder="ID"
                    min="1"
                    className="col-span-2 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    placeholder="Field Name"
                    className="col-span-4 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, "type", e.target.value)}
                    className="col-span-3 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <label className="col-span-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, "required", e.target.checked)}
                      className="mr-2 accent-blue-500"
                    />
                    <span className="text-sm text-gray-600">Required</span>
                  </label>
                  <button
                    onClick={() => removeField(index)}
                    disabled={fields.length <= 1}
                    className="col-span-1 p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateData}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate Thrift
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
                  onClick={() => copyToClipboard(generatedData.output, "data")}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                    isCopied.data
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" /> {isCopied.data ? "Data Copied!" : "Copy Data"}
                </button>
                <button
                  onClick={() =>
                    downloadFile(
                      schema,
                      `${structName.toLowerCase()}.thrift`,
                      "text/plain"
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
                      `${structName.toLowerCase()}.${format}`,
                      format === "json" ? "application/json" : "text/csv"
                    )
                  }
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download {format.toUpperCase()}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Output Section */}
        {schema && generatedData && (
          <div className="mt-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated Thrift Schema</h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{schema}</pre>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Generated Data ({generatedData.items[structName.toLowerCase()].length} items)
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {generatedData.output}
                </pre>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Total items: {generatedData.items[structName.toLowerCase()].length} | Binary size:{" "}
                {(generatedData.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable Thrift schema with multiple field types</li>
            <li>Support for lists and maps</li>
            <li>Output in JSON or CSV format</li>
            <li>Copy schema/data to clipboard</li>
            <li>Download schema and generated data</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ThriftDataGenerator;