"use client";

import { useState } from "react";
import yaml from "js-yaml"; // Import js-yaml

const YamlToJson = () => {
  const [yamlInput, setYamlInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");

  // Convert YAML to JSON using js-yaml
  const handleConvert = () => {
    try {
      const json = yaml.load(yamlInput); // Parse YAML to JS object
      setJsonOutput(JSON.stringify(json, null, 2)); // Convert to formatted JSON
    } catch (error) {
      setJsonOutput("Invalid YAML format."); // Handle errors
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setYamlInput(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  // Handle download of JSON
  const handleDownload = () => {
    if (!jsonOutput) return;
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "output.json";
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

  // Handle clear input and output
  const handleClear = () => {
    setYamlInput("");
    setJsonOutput("");
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      {/* File Upload */}
      <input
        type="file"
        accept=".yaml, .yml"
        onChange={handleFileUpload}
        className="mb-3"
      />

      {/* YAML Input */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-primary"
        placeholder="Enter YAML here..."
        value={yamlInput}
        onChange={(e) => setYamlInput(e.target.value)}
      />

      {/* Convert and Clear Buttons */}
      <div className="flex space-x-2 mt-3">
        <button
          onClick={handleConvert}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Convert to JSON
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Clear
        </button>
      </div>

      {/* JSON Output */}
      <textarea
        className="w-full h-40 p-3 mt-4 border rounded-lg bg-gray-100"
        placeholder="JSON output will appear here..."
        value={jsonOutput}
        readOnly
      />

      {/* Additional Buttons */}
      {jsonOutput && (
        <div className="flex justify-between mt-4">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Download JSON
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
};

export default YamlToJson;
