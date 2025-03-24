"use client";
import React, { useState, useRef, useCallback } from "react";
import { deserialize } from "bson";
import { FaCopy, FaDownload, FaSync, FaUpload, FaHistory } from "react-icons/fa";

const BsonToJson = () => {
  const [bsonInput, setBsonInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState(null);
  const [error, setError] = useState("");
  const [isValidBson, setIsValidBson] = useState(false);
  const [history, setHistory] = useState([]);
  const [inputMode, setInputMode] = useState("hex"); // "hex" or "file"
  const [prettyPrint, setPrettyPrint] = useState(true); // Toggle pretty print
  const fileInputRef = useRef(null);

  // Validate BSON hex input
  const validateBson = useCallback((hex) => {
    if (!hex.trim()) {
      setIsValidBson(false);
      setError("");
      return false;
    }
    if (!/^[0-9A-Fa-f]+$/.test(hex) || hex.length % 2 !== 0) {
      setIsValidBson(false);
      setError("Invalid BSON hex: Must be a valid hexadecimal string with even length");
      return false;
    }
    setIsValidBson(true);
    setError("");
    return true;
  }, []);

  // Convert BSON hex to JSON
  const handleConvertToJson = useCallback(() => {
    if (inputMode === "hex" && !validateBson(bsonInput)) return;
    try {
      const buffer = inputMode === "hex" ? Buffer.from(bsonInput, "hex") : Buffer.from(bsonInput, "hex");
      const jsonObject = deserialize(buffer);
      const jsonString = JSON.stringify(jsonObject, null, prettyPrint ? 2 : 0);
      setJsonOutput(jsonString);
      setHistory((prev) => [
        { input: bsonInput, output: jsonString, timestamp: new Date() },
        ...prev.slice(0, 9), // Limit to 10 entries
      ]);
    } catch (err) {
      setError(`BSON parsing failed: ${err.message}`);
      setJsonOutput(null);
    }
  }, [bsonInput, inputMode, prettyPrint, validateBson]);

  // Handle file upload
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = new Uint8Array(event.target.result);
        const hexString = Buffer.from(buffer).toString("hex");
        setBsonInput(hexString);
        setInputMode("file");
        const jsonObject = deserialize(buffer);
        const jsonString = JSON.stringify(jsonObject, null, prettyPrint ? 2 : 0);
        setJsonOutput(jsonString);
        setHistory((prev) => [
          { input: hexString, output: jsonString, timestamp: new Date() },
          ...prev.slice(0, 9),
        ]);
      } catch (err) {
        setError(`File processing failed: ${err.message}`);
      }
    };
    reader.onerror = () => setError("Error reading file");
    reader.readAsArrayBuffer(file);
  }, [prettyPrint]);

  // Copy JSON to clipboard
  const handleCopy = () => {
    if (jsonOutput) {
      navigator.clipboard.writeText(jsonOutput);
      setError("JSON copied to clipboard!");
      setTimeout(() => setError(""), 2000);
    }
  };

  // Download JSON as file
  const handleDownload = () => {
    if (jsonOutput) {
      const blob = new Blob([jsonOutput], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `data_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Reset
  const handleReset = () => {
    setBsonInput("");
    setJsonOutput(null);
    setError("");
    setIsValidBson(false);
    setInputMode("hex");
    setPrettyPrint(true);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  // Load from history
  const loadFromHistory = (entry) => {
    setBsonInput(entry.input);
    setJsonOutput(entry.output);
    setInputMode("hex"); // Switch to hex mode when loading from history
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          BSON to JSON Converter
        </h2>

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                BSON Input {inputMode === "hex" ? "(Hex)" : "(File)"}
              </label>
              <select
                value={inputMode}
                onChange={(e) => setInputMode(e.target.value)}
                className="p-1 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="hex">Hex Input</option>
                <option value="file">File Upload</option>
              </select>
            </div>
            {inputMode === "hex" ? (
              <textarea
                value={bsonInput}
                onChange={(e) => {
                  setBsonInput(e.target.value);
                  validateBson(e.target.value);
                }}
                placeholder="Enter BSON hex string (e.g., 1e000000026e616d6500050000004a6f686e00...)"
                rows={8}
                className={`w-full p-3 border rounded-lg font-mono text-sm resize-y ${
                  bsonInput
                    ? isValidBson
                      ? "border-green-500 focus:ring-green-500"
                      : "border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                } focus:outline-none focus:ring-2 shadow-md`}
              />
            ) : (
              <input
                type="file"
                ref={fileInputRef}
                accept=".bson,application/octet-stream"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            )}
          </div>

          {/* Output Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800">JSON Output</h3>
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={prettyPrint}
                  onChange={(e) => setPrettyPrint(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                Pretty Print
              </label>
            </div>
            {jsonOutput ? (
              <pre className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm overflow-x-auto max-h-64">
                {jsonOutput}
              </pre>
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg text-gray-500">
                No JSON output yet
              </div>
            )}
            <p className="text-xs text-gray-600 mt-1">
              {jsonOutput ? `Length: ${jsonOutput.length} characters` : "Awaiting conversion"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={handleConvertToJson}
            disabled={inputMode === "hex" && !isValidBson}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaUpload className="mr-2" /> Convert to JSON
          </button>
          <button
            onClick={handleCopy}
            disabled={!jsonOutput}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaCopy className="mr-2" /> Copy JSON
          </button>
          <button
            onClick={handleDownload}
            disabled={!jsonOutput}
            className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download JSON
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              error.includes("copied")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {error}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaHistory className="mr-2" /> Conversion History
              </h3>
              <button
                onClick={clearHistory}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear History
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.map((entry, index) => (
                <div
                  key={index}
                  onClick={() => loadFromHistory(entry)}
                  className="p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800">
                    {entry.timestamp.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    Input: {entry.input.slice(0, 50)}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert BSON hex or files to JSON</li>
            <li>Toggle between hex input and file upload</li>
            <li>Pretty print JSON option</li>
            <li>Copy to clipboard and download as JSON file</li>
            <li>Conversion history with clickable entries</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BsonToJson;