"use client";

import { useState, useCallback } from "react";
import yaml from "js-yaml";
import { FaDownload, FaCopy, FaSync, FaFileUpload, FaExchangeAlt } from "react-icons/fa";

const YamlToJson = () => {
  const [yamlInput, setYamlInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [indentation, setIndentation] = useState(2);
  const [isJsonToYaml, setIsJsonToYaml] = useState(false); // Toggle conversion direction
  const [error, setError] = useState(null);
  const fileInputRef = React.useRef(null);

  // Convert YAML to JSON or JSON to YAML
  const handleConvert = useCallback(() => {
    try {
      if (isJsonToYaml) {
        // JSON to YAML
        const jsonObj = JSON.parse(yamlInput);
        const yamlStr = yaml.dump(jsonObj, { indent: indentation });
        setJsonOutput(yamlStr);
      } else {
        // YAML to JSON
        const json = yaml.load(yamlInput);
        setJsonOutput(JSON.stringify(json, null, indentation));
      }
      setError(null);
    } catch (error) {
      setJsonOutput("");
      setError(isJsonToYaml ? "Invalid JSON format." : "Invalid YAML format.");
    }
  }, [yamlInput, indentation, isJsonToYaml]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setYamlInput(event.target.result);
        setError(null);
      };
      reader.readAsText(file);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!jsonOutput) return;
    const extension = isJsonToYaml ? "yaml" : "json";
    const blob = new Blob([jsonOutput], { type: `application/${extension}` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `converted.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    if (!jsonOutput) return;
    navigator.clipboard.writeText(jsonOutput).then(() => {
      alert("Copied to clipboard!");
    });
  };

  // Handle clear
  const handleClear = () => {
    setYamlInput("");
    setJsonOutput("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Toggle conversion direction
  const toggleDirection = () => {
    setIsJsonToYaml((prev) => !prev);
    setYamlInput(jsonOutput);
    setJsonOutput("");
    setError(null);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          {isJsonToYaml ? "JSON to YAML Converter" : "YAML to JSON Converter"}
        </h1>

        {/* Controls */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="file"
              accept={isJsonToYaml ? ".json" : ".yaml, .yml"}
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="flex gap-2">
              <button
                onClick={toggleDirection}
                className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                title="Switch conversion direction"
              >
                <FaExchangeAlt className="mr-2" /> Switch
              </button>
              <button
                onClick={handleClear}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaSync className="mr-2" /> Clear
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indentation ({indentation} spaces)
              </label>
              <input
                type="range"
                min="0"
                max="8"
                value={indentation}
                onChange={(e) => setIndentation(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Input and Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isJsonToYaml ? "JSON Input" : "YAML Input"}
              </label>
              <textarea
                className="w-full h-64 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder={`Enter ${isJsonToYaml ? "JSON" : "YAML"} here...`}
                value={yamlInput}
                onChange={(e) => setYamlInput(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isJsonToYaml ? "YAML Output" : "JSON Output"}
              </label>
              <textarea
                className="w-full h-64 p-3 border rounded-lg bg-gray-50 resize-y"
                placeholder="Output will appear here..."
                value={jsonOutput || error}
                readOnly
                style={{ color: error ? "red" : "inherit" }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          {yamlInput && (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleConvert}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaExchangeAlt className="mr-2" /> Convert
              </button>
              {jsonOutput && !error && (
                <>
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <FaDownload className="mr-2" /> Download
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
                  >
                    <FaCopy className="mr-2" /> Copy
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Bidirectional conversion (YAML to JSON and JSON to YAML)</li>
            <li>File upload support</li>
            <li>Customizable indentation</li>
            <li>Download output as file</li>
            <li>Copy to clipboard functionality</li>
            <li>Error handling with visual feedback</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default YamlToJson;