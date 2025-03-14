"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaFileDownload } from "react-icons/fa";

const JsonToPhpArray = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [phpOutput, setPhpOutput] = useState("");
  const [error, setError] = useState("");
  const [options, setOptions] = useState({
    indent: 2,
    useArraySyntax: true,
    singleQuotes: false,
    shortSyntax: true,
    includePhpTag: false, // Add <?php tag
    variableName: "", // Optional variable assignment
    inline: false, // Single-line output
  });

  const jsonToPhpArray = useCallback(
    (obj, level = 0) => {
      if (options.inline && level > 0) {
        return inlineJsonToPhpArray(obj);
      }

      const indent = " ".repeat(options.indent * level);
      const quote = options.singleQuotes ? "'" : '"';
      let result = "";

      if (Array.isArray(obj)) {
        if (obj.length === 0) return options.useArraySyntax ? "[]" : "array()";
        result += options.useArraySyntax ? "[" : "array(";
        const innerIndent = " ".repeat(options.indent * (level + 1));
        const items = obj.map((item) => {
          const value =
            typeof item === "object" && item !== null
              ? jsonToPhpArray(item, level + 1)
              : formatValue(item);
          return `${innerIndent}${value},`;
        });
        result +=
          "\n" + items.join("\n") + "\n" + indent + (options.useArraySyntax ? "]" : ")");
      } else if (typeof obj === "object" && obj !== null) {
        if (Object.keys(obj).length === 0) return options.useArraySyntax ? "[]" : "array()";
        result += options.useArraySyntax ? "[" : "array(";
        const innerIndent = " ".repeat(options.indent * (level + 1));
        const items = Object.entries(obj).map(([key, value]) => {
          const formattedValue =
            typeof value === "object" && value !== null
              ? jsonToPhpArray(value, level + 1)
              : formatValue(value);
          return `${innerIndent}${quote}${key}${quote} => ${formattedValue},`;
        });
        result +=
          "\n" + items.join("\n") + "\n" + indent + (options.useArraySyntax ? "]" : ")");
      } else {
        result = formatValue(obj);
      }

      if (level === 0) {
        if (options.variableName) {
          result = `$${options.variableName} = ${result};`;
        }
        if (options.includePhpTag) {
          result = "<?php\n" + result;
        }
      }

      return result;
    },
    [options]
  );

  const inlineJsonToPhpArray = (obj) => {
    const quote = options.singleQuotes ? "'" : '"';
    if (Array.isArray(obj)) {
      if (obj.length === 0) return options.useArraySyntax ? "[]" : "array()";
      const items = obj.map((item) =>
        typeof item === "object" && item !== null
          ? inlineJsonToPhpArray(item)
          : formatValue(item)
      );
      return options.useArraySyntax ? `[${items.join(", ")}]` : `array(${items.join(", ")})`;
    } else if (typeof obj === "object" && obj !== null) {
      if (Object.keys(obj).length === 0) return options.useArraySyntax ? "[]" : "array()";
      const items = Object.entries(obj).map(([key, value]) => {
        const formattedValue =
          typeof value === "object" && value !== null
            ? inlineJsonToPhpArray(value)
            : formatValue(value);
        return `${quote}${key}${quote} => ${formattedValue}`;
      });
      return options.useArraySyntax ? `[${items.join(", ")}]` : `array(${items.join(", ")})`;
    }
    return formatValue(obj);
  };

  const formatValue = (value) => {
    if (value === null) return "null";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") return value.toString();
    if (typeof value === "string") {
      const quote = options.singleQuotes ? "'" : '"';
      return `${quote}${value.replace(options.singleQuotes ? /'/g : /"/g, "\\" + quote)}${quote}`;
    }
    return value;
  };

  const convertJson = () => {
    setError("");
    setPhpOutput("");

    if (!jsonInput.trim()) {
      setError("Please enter a JSON string");
      return;
    }

    try {
      const parsedJson = JSON.parse(jsonInput);
      const phpArray = jsonToPhpArray(parsedJson);
      setPhpOutput(phpArray);
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
    }
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => {
      const newOptions = { ...prev, [key]: value };
      if (jsonInput && !error) {
        try {
          const parsedJson = JSON.parse(jsonInput);
          setPhpOutput(jsonToPhpArray(parsedJson));
        } catch {}
      }
      return newOptions;
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(phpOutput);
  };

  const downloadPhpFile = () => {
    if (!phpOutput) return;
    const blob = new Blob([phpOutput], { type: "application/x-php" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${options.variableName || "array"}.php`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setJsonInput("");
    setPhpOutput("");
    setError("");
    setOptions({
      indent: 2,
      useArraySyntax: true,
      singleQuotes: false,
      shortSyntax: true,
      includePhpTag: false,
      variableName: "",
      inline: false,
    });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          JSON to PHP Array Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">JSON Input</label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"name": "John", "age": 30, "skills": ["PHP", "React"]}'
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 font-mono text-sm resize-y"
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={convertJson}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Convert to PHP Array
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Formatting Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.useArraySyntax}
                  onChange={(e) => handleOptionChange("useArraySyntax", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Use [] instead of array()
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.singleQuotes}
                  onChange={(e) => handleOptionChange("singleQuotes", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Use single quotes
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.shortSyntax}
                  onChange={(e) => handleOptionChange("shortSyntax", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Short syntax for nested arrays
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.includePhpTag}
                  onChange={(e) => handleOptionChange("includePhpTag", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Include &lt;?php tag
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.inline}
                  onChange={(e) => handleOptionChange("inline", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Inline output (single line)
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Indent:</label>
                <select
                  value={options.indent}
                  onChange={(e) => handleOptionChange("indent", parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Variable Name:</label>
                <input
                  type="text"
                  value={options.variableName}
                  onChange={(e) => handleOptionChange("variableName", e.target.value)}
                  placeholder="e.g., data"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Output Section */}
          {phpOutput && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-2">
                <h2 className="text-lg font-semibold text-gray-800">PHP Array Output:</h2>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <FaCopy className="mr-2" /> Copy
                  </button>
                  <button
                    onClick={downloadPhpFile}
                    className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FaFileDownload className="mr-2" /> Download
                  </button>
                </div>
              </div>
              <pre className="text-sm font-mono bg-white p-4 rounded border border-gray-200 overflow-auto max-h-80">
                {phpOutput}
              </pre>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert JSON to PHP array with customizable formatting</li>
              <li>Support for nested objects and arrays</li>
              <li>Options for syntax, quotes, indentation, and more</li>
              <li>Inline or multi-line output</li>
              <li>Add variable assignment and PHP tag</li>
              <li>Copy to clipboard or download as .php file</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonToPhpArray;