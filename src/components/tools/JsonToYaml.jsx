"use client";
import React, { useState, useCallback, useRef } from "react";
import yaml from "js-yaml";
import { FaDownload, FaSync, FaUpload, FaCopy } from "react-icons/fa";

const JsonToYaml = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [yamlOutput, setYamlOutput] = useState("");
  const [error, setError] = useState("");
  const [options, setOptions] = useState({
    indent: 2,
    flowLevel: -1,
    sortKeys: false,
    lineWidth: 80,
    noRefs: false,
    skipInvalid: false,
  });
  const fileInputRef = useRef(null);

  // Validation and Conversion Functions
  const validateJSON = (input) => {
    try {
      JSON.parse(input);
      return true;
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      return false;
    }
  };

  const convertToYAML = useCallback(
    (input) => {
      setError("");
      setYamlOutput("");

      if (!input.trim()) return;

      if (validateJSON(input)) {
        const jsonData = JSON.parse(input);
        try {
          const yamlText = yaml.dump(jsonData, {
            indent: options.indent,
            flowLevel: options.flowLevel,
            sortKeys: options.sortKeys,
            lineWidth: options.lineWidth,
            noRefs: options.noRefs,
            skipInvalid: options.skipInvalid,
          });
          setYamlOutput(yamlText);
        } catch (err) {
          setError(`YAML conversion failed: ${err.message}`);
        }
      }
    },
    [options]
  );

  const convertToJSON = useCallback(
    (input) => {
      setError("");
      setJsonInput("");

      if (!input.trim()) return;

      try {
        const jsonData = yaml.load(input, { skipInvalid: options.skipInvalid });
        const jsonText = JSON.stringify(jsonData, null, options.indent);
        setJsonInput(jsonText);
      } catch (err) {
        setError(`Invalid YAML: ${err.message}`);
      }
    },
    [options]
  );

  // Handlers
  const handleJsonChange = (value) => {
    setJsonInput(value);
    convertToYAML(value);
  };

  const handleYamlChange = (value) => {
    setYamlOutput(value);
    convertToJSON(value);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (file.name.endsWith(".json")) {
        handleJsonChange(content);
      } else if (file.name.endsWith(".yaml") || file.name.endsWith(".yml")) {
        handleYamlChange(content);
      } else {
        setError("Unsupported file type. Please upload .json or .yaml/.yml");
      }
    };
    reader.readAsText(file);
  };

  const downloadFile = (content, type) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted-${Date.now()}.${type === "json" ? "json" : "yaml"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const reset = () => {
    setJsonInput("");
    setYamlOutput("");
    setError("");
    setOptions({
      indent: 2,
      flowLevel: -1,
      sortKeys: false,
      lineWidth: 80,
      noRefs: false,
      skipInvalid: false,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          JSON ↔ YAML Converter
        </h1>

        {/* Input Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">JSON Input</label>
            <textarea
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder='{"key": "value"}'
              className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
            />
            <button
              onClick={() => copyToClipboard(jsonInput)}
              disabled={!jsonInput}
              className="mt-2 flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              <FaCopy /> Copy
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">YAML Output</label>
            <textarea
              value={yamlOutput}
              onChange={(e) => handleYamlChange(e.target.value)}
              placeholder="key: value"
              className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
            />
            <button
              onClick={() => copyToClipboard(yamlOutput)}
              disabled={!yamlOutput}
              className="mt-2 flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              <FaCopy /> Copy
            </button>
          </div>
        </div>

        {/* Options Section */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Conversion Options</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-gray-700 mb-1">Indentation</label>
              <select
                value={options.indent}
                onChange={(e) =>
                  setOptions({ ...options, indent: parseInt(e.target.value) })
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {[2, 4, 8].map((val) => (
                  <option key={val} value={val}>
                    {val} spaces
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Flow Level</label>
              <select
                value={options.flowLevel}
                onChange={(e) =>
                  setOptions({ ...options, flowLevel: parseInt(e.target.value) })
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value={-1}>Auto</option>
                <option value={0}>Block only</option>
                <option value={1}>Flow level 1</option>
                <option value={2}>Flow level 2</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Line Width</label>
              <input
                type="number"
                value={options.lineWidth}
                onChange={(e) =>
                  setOptions({ ...options, lineWidth: parseInt(e.target.value) || 80 })
                }
                min={40}
                max={120}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.sortKeys}
                onChange={(e) => setOptions({ ...options, sortKeys: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-gray-700">Sort Keys</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.noRefs}
                onChange={(e) => setOptions({ ...options, noRefs: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-gray-700">No References</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.skipInvalid}
                onChange={(e) => setOptions({ ...options, skipInvalid: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-gray-700">Skip Invalid</label>
            </div>
          </div>
        </div>

        {/* File Operations */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.yaml,.yml"
              onChange={handleFileUpload}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={reset}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <FaSync /> Reset
            </button>
            <button
              onClick={() => downloadFile(jsonInput, "json")}
              disabled={!jsonInput}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <FaDownload /> JSON
            </button>
            <button
              onClick={() => downloadFile(yamlOutput, "yaml")}
              disabled={!yamlOutput}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <FaDownload /> YAML
            </button>
          </div>
        </div>

        {/* Error Section */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Bidirectional JSON ↔ YAML conversion</li>
            <li>Customizable indent, flow level, and line width</li>
            <li>Options for sorting keys, handling references, and invalid data</li>
            <li>File upload support (.json, .yaml, .yml)</li>
            <li>Download as JSON or YAML</li>
            <li>Copy to clipboard functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JsonToYaml;