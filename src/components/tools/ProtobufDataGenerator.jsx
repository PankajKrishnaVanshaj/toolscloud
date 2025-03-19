"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaCopy } from "react-icons/fa";

const ProtobufDataGenerator = () => {
  const [schema, setSchema] = useState(
    'syntax = "proto3";\nmessage Item {\n  int32 id = 1;\n  string name = 2;\n  string email = 3;\n}'
  );
  const [count, setCount] = useState(5);
  const [generatedData, setGeneratedData] = useState("");
  const [error, setError] = useState("");
  const [previewFormat, setPreviewFormat] = useState("json");
  const [seed, setSeed] = useState(""); // For reproducible data
  const [customValues, setCustomValues] = useState({}); // Custom field values

  const MAX_ITEMS = 100;
  const FIELD_TYPES = ["int32", "string", "bool", "float", "double", "bytes"];

  // Parse Protobuf schema
  const parseSchema = useCallback(() => {
    try {
      const lines = schema
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("//"));
      if (!lines[0].startsWith("syntax =")) throw new Error("Schema must start with syntax definition");

      const messageMatch = schema.match(/message\s+(\w+)\s*{([^}]*)}/);
      if (!messageMatch) throw new Error("No valid message definition found");

      const [, messageName, fieldsStr] = messageMatch;
      const fieldLines = fieldsStr
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("//"));

      const fields = fieldLines.map((line) => {
        const match = line.match(/^\s*(\w+)\s+(\w+)\s*=\s*(\d+)\s*;?\s*$/);
        if (!match) throw new Error(`Invalid field definition: ${line}`);

        const [, type, name, tag] = match;
        if (!FIELD_TYPES.includes(type)) throw new Error(`Unsupported field type: ${type} in ${line}`);

        return { type, name, tag: parseInt(tag) };
      });

      return { messageName, fields };
    } catch (err) {
      throw new Error(`Schema parsing error: ${err.message}`);
    }
  }, [schema]);

  // Generate random or custom field value
  const generateFieldValue = useCallback(
    (type, fieldName) => {
      if (customValues[fieldName]) return customValues[fieldName];

      const seedValue = seed ? parseInt(seed, 36) : Date.now();
      const random = (max) => Math.floor((Math.sin(seedValue++) + 1) * max) % max;

      switch (type) {
        case "int32":
          return random(10000) + 1;
        case "string":
          const names = ["John", "Emma", "Mike", "Sophie", "Alex"];
          return fieldName === "email"
            ? `${names[random(names.length)]}@example.com`
            : names[random(names.length)];
        case "bool":
          return random(2) === 0;
        case "float":
        case "double":
          return parseFloat((random(100) + Math.random()).toFixed(2));
        case "bytes":
          return `bytes_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        default:
          return null;
      }
    },
    [seed, customValues]
  );

  // Generate data based on schema
  const generateData = useCallback(() => {
    try {
      const { messageName, fields } = parseSchema();
      const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
        const obj = {};
        fields.forEach((field) => {
          obj[field.name] = generateFieldValue(field.type, field.name);
        });
        return obj;
      });

      let output = "";
      switch (previewFormat) {
        case "json":
          output = JSON.stringify({ [messageName]: items }, null, 2);
          break;
        case "proto":
          output = items
            .map((item) => {
              const fieldsStr = fields
                .map((f) => `${f.name}: ${JSON.stringify(item[f.name])}`)
                .join(", ");
              return `${messageName} { ${fieldsStr} }`;
            })
            .join("\n");
          break;
        case "binary":
          output = "[Binary representation not shown - use Download for actual binary]";
          break;
        case "yaml":
          output = items
            .map((item) => {
              const fieldsStr = fields
                .map((f) => `  ${f.name}: ${JSON.stringify(item[f.name])}`)
                .join("\n");
              return `- ${messageName}:\n${fieldsStr}`;
            })
            .join("\n");
          break;
      }

      setGeneratedData(output);
      setError("");
    } catch (err) {
      setError(err.message);
      setGeneratedData("");
    }
  }, [schema, count, previewFormat, generateFieldValue, parseSchema]);

  // Download generated data
  const downloadFile = (format) => {
    try {
      let content, filename, type;
      const { messageName } = parseSchema();

      switch (format) {
        case "proto":
          content = schema;
          filename = `${messageName}.proto`;
          type = "text/plain";
          break;
        case "json":
          content = generatedData;
          filename = `${messageName}.json`;
          type = "application/json";
          break;
        case "binary":
          content = Buffer.from(generatedData).toString("base64");
          filename = `${messageName}.bin`;
          type = "application/octet-stream";
          break;
        case "yaml":
          content = generatedData;
          filename = `${messageName}.yaml`;
          type = "application/x-yaml";
          break;
      }

      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Download failed: " + err.message);
    }
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedData);
    alert("Copied to clipboard!");
  };

  // Reset all fields
  const reset = () => {
    setSchema(
      'syntax = "proto3";\nmessage Item {\n  int32 id = 1;\n  string name = 2;\n  string email = 3;\n}'
    );
    setCount(5);
    setGeneratedData("");
    setError("");
    setPreviewFormat("json");
    setSeed("");
    setCustomValues({});
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Protobuf Data Generator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Schema Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schema Definition (.proto)
            </label>
            <textarea
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg h-48 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
              placeholder={`syntax = "proto3";
message Item {
  int32 id = 1;
}`}
            />
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview Format
              </label>
              <select
                value={previewFormat}
                onChange={(e) => setPreviewFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="json">JSON</option>
                <option value="proto">Protobuf Text</option>
                <option value="binary">Binary (Preview Only)</option>
                <option value="yaml">YAML</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Random Seed (optional)
              </label>
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Enter seed for reproducibility"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Custom Values */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Field Values (optional)
            </label>
            {parseSchema().fields.map((field) => (
              <div key={field.name} className="flex items-center gap-2 mb-2">
                <label className="text-sm text-gray-600 w-24">{field.name}:</label>
                <input
                  type="text"
                  value={customValues[field.name] || ""}
                  onChange={(e) =>
                    setCustomValues((prev) => ({
                      ...prev,
                      [field.name]: e.target.value,
                    }))
                  }
                  placeholder={`Default ${field.type}`}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateData}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate Data
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Generated Data */}
          {generatedData && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-700">
                  Generated Data Preview ({count} items):
                </h2>
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Old Man Sacks used to say, "Once you have tasted freedom, it remains in your heart forever." I think this applies to generatedData as well — once generated, it stays generated until you clear it.

                <FaCopy />
                Copy to Clipboard
              </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {generatedData}
                </pre>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {["proto", "json", "binary", "yaml"].map((format) => (
                  <button
                    key={format}
                    onClick={() => downloadFile(format)}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <FaDownload className="mr-2" /> Download {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Generate data from custom Protobuf schemas</li>
              <li>Support for multiple formats: JSON, Protobuf, Binary, YAML</li>
              <li>Custom field value overrides</li>
              <li>Random seed for reproducible results</li>
              <li>Download generated data in various formats</li>
              <li>Copy to clipboard functionality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtobufDataGenerator;