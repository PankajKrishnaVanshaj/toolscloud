"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { serialize, deserialize } from "bson";
import { FaCopy, FaDownload, FaSync, FaUpload, FaHistory, FaExchangeAlt } from "react-icons/fa";

const JsonToBson = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [bsonOutput, setBsonOutput] = useState(null);
  const [error, setError] = useState("");
  const [isValidJson, setIsValidJson] = useState(false);
  const [history, setHistory] = useState([]);
  const [livePreview, setLivePreview] = useState(false);
  const [outputFormat, setOutputFormat] = useState("hex"); // "hex" or "base64"
  const [prettyPrint, setPrettyPrint] = useState(true); // Toggle JSON formatting
  const fileInputRef = useRef(null);

  // Real-time JSON validation and live preview
  useEffect(() => {
    if (!jsonInput.trim()) {
      setIsValidJson(false);
      setError("");
      if (!livePreview) setBsonOutput(null);
      return;
    }
    try {
      const jsonObject = JSON.parse(jsonInput);
      setIsValidJson(true);
      setError("");
      if (livePreview) {
        const bsonResult = serialize(jsonObject);
        setBsonOutput(bsonResult);
      }
    } catch (err) {
      setIsValidJson(false);
      setError(`Invalid JSON: ${err.message}`);
      setBsonOutput(null);
    }
  }, [jsonInput, livePreview]);

  // Convert JSON to BSON
  const handleConvertToBson = useCallback(() => {
    try {
      const jsonObject = JSON.parse(jsonInput);
      const bsonResult = serialize(jsonObject);
      setBsonOutput(bsonResult);
      setHistory((prev) => [
        {
          type: "JSON to BSON",
          input: jsonInput,
          output: bsonResult.toString(outputFormat),
          timestamp: new Date(),
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError("Conversion failed: " + err.message);
    }
  }, [jsonInput, outputFormat]);

  // Convert BSON back to JSON
  const handleConvertToJson = useCallback(() => {
    try {
      if (!bsonOutput) throw new Error("No BSON data available");
      const jsonObject = deserialize(bsonOutput);
      const jsonString = JSON.stringify(jsonObject, null, prettyPrint ? 2 : 0);
      setJsonInput(jsonString);
      setBsonOutput(null);
      setHistory((prev) => [
        {
          type: "BSON to JSON",
          input: bsonOutput.toString(outputFormat),
          output: jsonString,
          timestamp: new Date(),
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError("BSON parsing failed: " + err.message);
    }
  }, [bsonOutput, outputFormat, prettyPrint]);

  // Handle file upload
  const handleFileUpload = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          if (file.type === "application/json") {
            const jsonString = event.target.result;
            setJsonInput(jsonString);
          } else {
            const buffer = new Uint8Array(event.target.result);
            const jsonObject = deserialize(buffer);
            setJsonInput(JSON.stringify(jsonObject, null, prettyPrint ? 2 : 0));
            setBsonOutput(buffer);
          }
        } catch (err) {
          setError(`File processing failed: ${err.message}`);
        }
      };
      reader.onerror = () => setError("Error reading file");
      file.type === "application/json" ? reader.readAsText(file) : reader.readAsArrayBuffer(file);
    },
    [prettyPrint]
  );

  // Copy to clipboard
  const handleCopy = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setError("Copied to clipboard!");
      setTimeout(() => setError(""), 2000);
    }
  };

  // Download BSON
  const handleDownload = () => {
    if (bsonOutput) {
      const blob = new Blob([bsonOutput], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `data_${Date.now()}.${outputFormat === "hex" ? "bson" : "bson64"}`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Reset
  const handleReset = () => {
    setJsonInput("");
    setBsonOutput(null);
    setError("");
    setIsValidJson(false);
    setOutputFormat("hex");
    setPrettyPrint(true);
    setLivePreview(false);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  // Load from history
  const loadFromHistory = (entry) => {
    if (entry.type === "JSON to BSON") {
      setJsonInput(entry.input);
      setBsonOutput(Buffer.from(entry.output, outputFormat));
    } else {
      setJsonInput(entry.output);
      setBsonOutput(Buffer.from(entry.input, outputFormat));
    }
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced JSON ↔ BSON Converter
        </h2>

        {/* Input/Output Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">JSON Input</label>
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={prettyPrint}
                  onChange={() => setPrettyPrint(!prettyPrint)}
                  className="mr-2 accent-blue-500"
                />
                Pretty Print
              </label>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Enter JSON or upload a file"
              rows={8}
              className={`w-full p-3 border rounded-lg font-mono text-sm resize-y ${
                jsonInput
                  ? isValidJson
                    ? "border-green-500 focus:ring-green-500"
                    : "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              } focus:outline-none focus:ring-2 shadow-md`}
            />
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/octet-stream"
              onChange={handleFileUpload}
              className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                BSON Output ({outputFormat})
              </h3>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="p-1 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </div>
            {bsonOutput ? (
              <pre className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm overflow-x-auto max-h-64">
                {outputFormat === "hex"
                  ? bsonOutput.toString("hex")
                  : bsonOutput.toString("base64")}
              </pre>
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg text-gray-500">
                No BSON output yet
              </div>
            )}
            <p className="text-xs text-gray-600 mt-1">
              {bsonOutput ? `Size: ${bsonOutput.length} bytes` : "Awaiting conversion"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={handleConvertToBson}
            disabled={!isValidJson || livePreview}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaUpload className="mr-2" /> Convert to BSON
          </button>
          <button
            onClick={handleConvertToJson}
            disabled={!bsonOutput}
            className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaExchangeAlt className="mr-2" /> Convert to JSON
          </button>
          <button
            onClick={() =>
              handleCopy(
                bsonOutput
                  ? outputFormat === "hex"
                    ? bsonOutput.toString("hex")
                    : bsonOutput.toString("base64")
                  : ""
              )
            }
            disabled={!bsonOutput}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaCopy className="mr-2" /> Copy Output
          </button>
          <button
            onClick={handleDownload}
            disabled={!bsonOutput}
            className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download BSON
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Settings */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={livePreview}
              onChange={() => setLivePreview(!livePreview)}
              className="mr-2 accent-blue-500"
            />
            Live Preview (Auto-converts JSON to BSON)
          </label>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              error.includes("Copied")
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
                    {entry.type} - {entry.timestamp.toLocaleString()}
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
            <li>Bidirectional conversion: JSON ↔ BSON</li>
            <li>Live preview for JSON to BSON</li>
            <li>Output in Hex or Base64 format</li>
            <li>Pretty print JSON option</li>
            <li>File upload support (.json or .bson)</li>
            <li>Copy to clipboard and download as file</li>
            <li>Conversion history with clickable entries</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JsonToBson;