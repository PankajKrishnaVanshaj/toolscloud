"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaCopy, FaSync, FaTrash } from "react-icons/fa";

const AvroDataGenerator = () => {
  const [avroData, setAvroData] = useState("");
  const [count, setCount] = useState(5);
  const [namespace, setNamespace] = useState("example.avro");
  const [recordName, setRecordName] = useState("Record");
  const [fields, setFields] = useState([
    { name: "id", type: "int", logicalType: "", defaultValue: null },
    { name: "name", type: "string", logicalType: "", defaultValue: null },
    { name: "email", type: "string", logicalType: "email", defaultValue: null },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [includeSchema, setIncludeSchema] = useState(true);
  const [outputFormat, setOutputFormat] = useState("json"); // New: JSON or Avro binary preview
  const [customSeed, setCustomSeed] = useState(""); // New: Seed for reproducible data

  const MAX_ITEMS = 100;
  const FIELD_TYPES = [
    "int",
    "long",
    "float",
    "double",
    "boolean",
    "string",
    "bytes",
    "null",
    "array",
    "map",
    "enum",
    "record",
  ];
  const LOGICAL_TYPES = {
    int: ["date", "time-millis"],
    long: ["timestamp-millis", "timestamp-micros"],
    float: ["decimal"],
    double: ["decimal"],
    string: ["email", "uuid"],
    bytes: ["decimal"],
  };

  const generateRandomData = useCallback(
    (field) => {
      const { type, logicalType } = field;
      const timestamp = Date.now();
      const seed = customSeed || Math.random().toString(36).substring(2);

      // Simple seeded random function
      const seededRandom = () => {
        const x = Math.sin(seed.length + timestamp) * 10000;
        return x - Math.floor(x);
      };

      switch (type) {
        case "int":
          if (logicalType === "date") {
            return Math.floor((timestamp - seededRandom() * 31536000000) / 86400000);
          }
          return Math.floor(seededRandom() * 10000) + 1;
        case "long":
          if (logicalType === "timestamp-millis") {
            return timestamp - seededRandom() * 31536000000;
          }
          return Math.floor(seededRandom() * 1000000) + 1;
        case "float":
        case "double":
          return Number((seededRandom() * 100).toFixed(2));
        case "boolean":
          return seededRandom() > 0.5;
        case "string":
          if (logicalType === "email") {
            const prefix = `${seededRandom().toString(36).substring(2, 8)}${timestamp}`;
            const domains = ["gmail.com", "outlook.com", "example.org"];
            return `${prefix}@${domains[Math.floor(seededRandom() * domains.length)]}`;
          }
          const names = ["John", "Emma", "Michael", "Sophie", "Alex"];
          return names[Math.floor(seededRandom() * names.length)];
        case "bytes":
          return Array.from({ length: 8 }, () => Math.floor(seededRandom() * 256));
        case "array":
          return Array.from({ length: 3 }, () => Math.floor(seededRandom() * 100));
        case "map":
          return { key1: Math.floor(seededRandom() * 100), key2: "value" };
        case "enum":
          return ["A", "B", "C"][Math.floor(seededRandom() * 3)]; // Simple enum example
        case "record":
          return { nested: Math.floor(seededRandom() * 100) }; // Simple nested record
        default:
          return null;
      }
    },
    [customSeed]
  );

  const generateAvroSchema = useCallback(() => {
    return {
      type: "record",
      namespace,
      name: recordName,
      fields: fields.map((field) => ({
        name: field.name,
        type: field.type === "null" ? "null" : [field.type, "null"],
        ...(field.logicalType && { logicalType: field.logicalType }),
        ...(field.defaultValue !== null && { default: field.defaultValue }),
        ...(field.type === "enum" && { symbols: ["A", "B", "C"] }), // Example enum symbols
        ...(field.type === "record" && {
          fields: [{ name: "nested", type: "int" }],
        }), // Example nested record
      })),
    };
  }, [namespace, recordName, fields]);

  const validateFields = useCallback(() => {
    if (fields.length === 0) return "Please add at least one field";
    if (!namespace.trim()) return "Namespace cannot be empty";
    if (!recordName.trim()) return "Record name cannot be empty";
    if (fields.some((field) => !field.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length)
      return "Field names must be unique";
    return "";
  }, [fields, namespace, recordName]);

  const generateAvro = useCallback(() => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setAvroData("");
      return;
    }

    setError("");
    const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
      return fields.reduce(
        (obj, field) => ({
          ...obj,
          [field.name]: generateRandomData(field),
        }),
        {}
      );
    });

    try {
      const schema = generateAvroSchema();
      const output =
        outputFormat === "json"
          ? includeSchema
            ? { schema, data: items }
            : items
          : "<Binary Avro preview not implemented>"; // Placeholder for binary
      setAvroData(
        outputFormat === "json" ? JSON.stringify(output, null, 2) : output
      );
      setIsCopied(false);
    } catch (e) {
      setError("Error generating Avro data: " + e.message);
    }
  }, [
    count,
    fields,
    generateRandomData,
    validateFields,
    generateAvroSchema,
    includeSchema,
    outputFormat,
  ]);

  const addField = () => {
    if (fields.length < 15) {
      setFields([
        ...fields,
        {
          name: `field${fields.length + 1}`,
          type: "string",
          logicalType: "",
          defaultValue: null,
        },
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(avroData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy: " + err.message);
    }
  };

  const downloadAsJSON = () => {
    try {
      const blob = new Blob([avroData], {
        type: outputFormat === "json" ? "application/json" : "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${recordName}-${Date.now()}.${outputFormat === "json" ? "json" : "txt"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download: " + err.message);
    }
  };

  const reset = () => {
    setAvroData("");
    setCount(5);
    setNamespace("example.avro");
    setRecordName("Record");
    setFields([
      { name: "id", type: "int", logicalType: "", defaultValue: null },
      { name: "name", type: "string", logicalType: "", defaultValue: null },
      { name: "email", type: "string", logicalType: "email", defaultValue: null },
    ]);
    setIsCopied(false);
    setError("");
    setIncludeSchema(true);
    setOutputFormat("json");
    setCustomSeed("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Avro Data Generator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Configuration Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Records (1-{MAX_ITEMS})
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
                Custom Seed (optional)
              </label>
              <input
                type="text"
                value={customSeed}
                onChange={(e) => setCustomSeed(e.target.value)}
                placeholder="Enter seed for reproducibility"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Namespace
              </label>
              <input
                type="text"
                value={namespace}
                onChange={(e) => setNamespace(e.target.value.trim() || "example.avro")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., example.avro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Record Name
              </label>
              <input
                type="text"
                value={recordName}
                onChange={(e) => setRecordName(e.target.value.trim() || "Record")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Record"
              />
            </div>
          </div>

          {/* Fields Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields ({fields.length})
            </label>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 items-center">
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
                  <select
                    value={field.logicalType}
                    onChange={(e) => updateField(index, "logicalType", e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {(LOGICAL_TYPES[field.type] || []).map((logical) => (
                      <option key={logical} value={logical}>
                        {logical}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeField(index)}
                    disabled={fields.length <= 1}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addField}
              disabled={fields.length >= 15}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              + Add Field {fields.length >= 15 && "(Max 15)"}
            </button>
          </div>

          {/* Output Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={includeSchema}
                  onChange={(e) => setIncludeSchema(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                Include Schema in Output
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="json">JSON</option>
                <option value="avro">Avro Binary (Preview)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateAvro}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate Avro Data
            </button>
            {avroData && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsJSON}
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

          {/* Generated Data */}
          {avroData && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Generated Avro Data ({count} records):
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {avroData}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable Avro schema with multiple field types</li>
            <li>Logical type support (e.g., email, timestamp)</li>
            <li>Custom seed for reproducible data</li>
            <li>Output in JSON or Avro binary preview</li>
            <li>Copy to clipboard and download options</li>
          </ul>
        </div>

        {/* Note */}
        {outputFormat === "avro" && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-700 text-sm">
              <strong>Note:</strong> Avro binary preview is not fully implemented. For actual Avro
              binary output, use a library like Avro JS.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvroDataGenerator;