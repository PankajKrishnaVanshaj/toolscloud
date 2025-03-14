"use client";

import React, { useState, useCallback, useRef } from "react";
import xml2js from "xml2js";
import yaml from "js-yaml";
import { FaDownload, FaSync, FaFileUpload, FaCopy } from "react-icons/fa";

const XmlToYaml = () => {
  const [xmlInput, setXmlInput] = useState("");
  const [yamlOutput, setYamlOutput] = useState("");
  const [error, setError] = useState("");
  const [options, setOptions] = useState({
    indent: 2,
    explicitArray: true,
    trim: true,
    flowLevel: -1, // -1 for block style, positive for flow style
    sortKeys: false, // Sort object keys
  });
  const fileInputRef = useRef(null);

  // Convert XML to YAML
  const convertXmlToYaml = useCallback(() => {
    setError("");
    setYamlOutput("");

    if (!xmlInput.trim()) {
      setError("Please enter XML content");
      return;
    }

    xml2js.parseString(xmlInput, { trim: options.trim }, (err, result) => {
      if (err) {
        setError(`Invalid XML: ${err.message}`);
        return;
      }

      try {
        const yamlText = yaml.dump(result, {
          indent: options.indent,
          noArrayIndent: !options.explicitArray,
          flowLevel: options.flowLevel,
          sortKeys: options.sortKeys,
        });
        setYamlOutput(yamlText);
      } catch (yamlErr) {
        setError(`YAML conversion failed: ${yamlErr.message}`);
      }
    });
  }, [xmlInput, options]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setXmlInput(event.target.result);
        convertXmlToYaml();
      };
      reader.readAsText(file);
    }
  };

  // Download file
  const downloadFile = (content, fileName, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Reset form
  const reset = () => {
    setXmlInput("");
    setYamlOutput("");
    setError("");
    setOptions({
      indent: 2,
      explicitArray: true,
      trim: true,
      flowLevel: -1,
      sortKeys: false,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle option changes
  const handleOptionChange = (key, value) => {
    setOptions((prev) => {
      const newOptions = { ...prev, [key]: value };
      if (xmlInput) convertXmlToYaml();
      return newOptions;
    });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          XML to YAML Converter
        </h1>

        <div className="space-y-6">
          {/* Input/Output Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                XML Input
              </label>
              <textarea
                value={xmlInput}
                onChange={(e) => setXmlInput(e.target.value)}
                placeholder="Enter XML here (e.g., <root><item>test</item></root>)"
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
              />
              <div className="mt-2 flex flex-col sm:flex-row gap-2">
                <input
                  type="file"
                  accept=".xml"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                  onClick={() => downloadFile(xmlInput, "input.xml", "application/xml")}
                  disabled={!xmlInput}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <FaDownload className="mr-2" /> Download XML
                </button>
                <button
                  onClick={() => copyToClipboard(xmlInput)}
                  disabled={!xmlInput}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YAML Output
              </label>
              <textarea
                value={yamlOutput}
                readOnly
                placeholder="YAML output will appear here..."
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm resize-y"
              />
              <div className="mt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={convertXmlToYaml}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaFileUpload className="mr-2" /> Convert
                </button>
                <button
                  onClick={() => downloadFile(yamlOutput, "output.yaml", "application/x-yaml")}
                  disabled={!yamlOutput}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <FaDownload className="mr-2" /> Download YAML
                </button>
                <button
                  onClick={() => copyToClipboard(yamlOutput)}
                  disabled={!yamlOutput}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
              </div>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Conversion Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Indentation</label>
                <select
                  value={options.indent}
                  onChange={(e) => handleOptionChange("indent", parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Flow Level</label>
                <select
                  value={options.flowLevel}
                  onChange={(e) => handleOptionChange("flowLevel", parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={-1}>Block Style</option>
                  <option value={0}>Flow Style (level 0)</option>
                  <option value={1}>Flow Style (level 1)</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.explicitArray}
                    onChange={(e) => handleOptionChange("explicitArray", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Explicit Arrays</span>
                </label>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.trim}
                    onChange={(e) => handleOptionChange("trim", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Trim Whitespace</span>
                </label>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.sortKeys}
                    onChange={(e) => handleOptionChange("sortKeys", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Sort Keys</span>
                </label>
              </div>
              <div className="flex items-center">
                <button
                  onClick={reset}
                  className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FaSync className="mr-2" /> Reset
                </button>
              </div>
            </div>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700 border border-red-200">
              <p>{error}</p>
            </div>
          )}

          {/* Features & Usage */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert XML to YAML with customizable options</li>
              <li>Upload XML files or paste content</li>
              <li>Download XML input or YAML output as files</li>
              <li>Copy input/output to clipboard</li>
              <li>Adjust indentation, flow level, and array formatting</li>
              <li>Sort keys alphabetically and trim whitespace</li>
              <li>
                Example XML: <code>&lt;root&gt;&lt;item&gt;test&lt;/item&gt;&lt;/root&gt;</code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XmlToYaml;