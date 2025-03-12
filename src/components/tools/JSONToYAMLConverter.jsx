"use client";

import React, { useState, useCallback } from "react";
import YAML from "yaml";
import { FaCopy, FaDownload, FaSync, FaExpand } from "react-icons/fa";

const JSONToYAMLConverter = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState("jsonToYaml");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    indent: 2,
    flowLevel: -1,
    sortKeys: false,
    minify: false,
  });

  const convertData = useCallback(() => {
    setError(null);
    setOutputText("");
    setCopied(false);

    if (!inputText.trim()) {
      setError("Please enter some data to convert");
      return;
    }

    try {
      if (mode === "jsonToYaml") {
        const jsonData = JSON.parse(inputText);
        const yamlOptions = {
          indent: options.indent,
          flowLevel: options.flowLevel,
          sortKeys: options.sortKeys,
        };
        const yamlData = YAML.stringify(jsonData, yamlOptions);
        setOutputText(options.minify ? yamlData.replace(/\n\s*/g, " ") : yamlData);
      } else {
        const yamlData = YAML.parse(inputText);
        const jsonData = JSON.stringify(yamlData, null, options.minify ? 0 : options.indent);
        setOutputText(jsonData);
      }
    } catch (err) {
      setError(`Error converting ${mode === "jsonToYaml" ? "JSON to YAML" : "YAML to JSON"}: ${err.message}`);
    }
  }, [inputText, mode, options]);

  const handleSubmit = (e) => {
    e.preventDefault();
    convertData();
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (outputText) {
      const blob = new Blob([outputText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${mode === "jsonToYaml" ? "output.yaml" : "output.json"}`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setInputText("");
    setOutputText("");
    setError(null);
    setCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8"> <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">JSON ↔ YAML Converter</h2>
          
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input {mode === "jsonToYaml" ? "JSON" : "YAML"}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={mode === "jsonToYaml"
                ? '{\n  "name": "John",\n  "age": 30\n}'
                : "name: John\nage: 30"}
              aria-label="Input data"
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Conversion Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="jsonToYaml">JSON to YAML</option>
                <option value="yamlToJson">YAML to JSON</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Indentation</label>
              <input
                type="number"
                min="0"
                max="10"
                value={options.indent}
                onChange={(e) => setOptions(prev => ({ ...prev, indent: Number(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={options.minify}
              />
            </div>
            {mode === "jsonToYaml" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Flow Level</label>
                <input
                  type="number"
                  min="-1"
                  max="10"
                  value={options.flowLevel}
                  onChange={(e) => setOptions(prev => ({ ...prev, flowLevel: Number(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.sortKeys}
                  onChange={(e) => setOptions(prev => ({ ...prev, sortKeys: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Sort Keys</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.minify}
                  onChange={(e) => setOptions(prev => ({ ...prev, minify: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Minify</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={!inputText.trim()}
            >
              Convert
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
              disabled={!outputText}
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Output */}
        {outputText && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-700">
                {mode === "jsonToYaml" ? "YAML Output" : "JSON Output"}
              </h3>
              <button
                onClick={handleCopy}
                className={`py-1 px-3 rounded-md text-sm flex items-center transition-colors ${copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all max-h-96 overflow-auto border border-gray-200">
              {outputText}
            </pre>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Bidirectional JSON ↔ YAML conversion</li>
            <li>Customizable indentation and flow level</li>
            <li>Sort keys and minify options</li>
            <li>Copy to clipboard and download functionality</li>
            <li>Fullscreen mode for better editing</li>
            <li>Responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JSONToYAMLConverter;