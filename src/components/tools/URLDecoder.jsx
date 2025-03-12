"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaDownload, FaExchangeAlt } from "react-icons/fa";

const URLDecoder = () => {
  const [textInput, setTextInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState("");
  const [mode, setMode] = useState("decode"); // "decode" or "encode"
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Handle URL encoding/decoding
  const processURL = useCallback((text) => {
    try {
      setError("");
      if (mode === "decode") {
        return decodeURIComponent(text);
      } else {
        return encodeURIComponent(text);
      }
    } catch (error) {
      setError(`Invalid ${mode === "decode" ? "URL-encoded" : "text"} input.`);
      return "";
    }
  }, [mode]);

  // Handle processing
  const handleProcess = () => {
    const result = processURL(textInput);
    setOutput(result);
    setCopySuccess("");
    if (result && textInput.trim()) {
      setHistory((prev) => [
        ...prev,
        { input: textInput, output: result, mode, timestamp: new Date() },
      ].slice(-5)); // Keep last 5 entries
    }
  };

  // Clear all
  const handleClear = () => {
    setTextInput("");
    setOutput("");
    setError("");
    setCopySuccess("");
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopySuccess("Copied to clipboard!");
      setTimeout(() => setCopySuccess(""), 2000);
    }
  };

  // Download output
  const handleDownload = () => {
    if (output) {
      const blob = new Blob([output], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${mode}d-output-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Toggle mode
  const toggleMode = () => {
    setMode((prev) => (prev === "decode" ? "encode" : "decode"));
    setOutput("");
    setError("");
    setCopySuccess("");
  };

  // Restore from history
  const restoreFromHistory = (entry) => {
    setTextInput(entry.input);
    setOutput(entry.output);
    setMode(entry.mode);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          URL {mode === "decode" ? "Decoder" : "Encoder"}
        </h1>

        {/* Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Input Text
          </label>
          <textarea
            className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-y"
            placeholder={`Enter text to ${mode}...`}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            aria-label="URL Input"
          />
          <p className="text-xs text-gray-500 mt-1">
            Character count: {textInput.length}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={handleProcess}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            disabled={!textInput.trim()}
          >
            <FaExchangeAlt className="mr-2" />
            {mode === "decode" ? "Decode" : "Encode"}
          </button>
          <button
            onClick={toggleMode}
            className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" />
            Switch to {mode === "decode" ? "Encode" : "Decode"}
          </button>
          <button
            onClick={handleClear}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" />
            Clear
          </button>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Output
          </label>
          <textarea
            className="w-full h-40 p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-y"
            placeholder="Output will appear here..."
            value={output}
            readOnly
            aria-label="URL Output"
          />
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <button
              onClick={handleCopy}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              disabled={!output}
            >
              <FaCopy className="mr-2" />
              Copy
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              disabled={!output}
            >
              <FaDownload className="mr-2" />
              Download
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <p className="text-red-600 font-medium mb-4 animate-fade-in">{error}</p>
        )}
        {copySuccess && (
          <p className="text-green-600 font-medium mb-4 animate-fade-in">
            {copySuccess}
          </p>
        )}

        {/* History */}
        <div className="mb-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {showHistory ? "Hide History" : "Show History"} ({history.length})
          </button>
          {showHistory && history.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-64 overflow-auto">
              <ul className="space-y-2 text-sm">
                {history.slice().reverse().map((entry, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 bg-white rounded hover:bg-gray-100 cursor-pointer"
                    onClick={() => restoreFromHistory(entry)}
                  >
                    <span>
                      {entry.mode === "decode" ? "Decoded" : "Encoded"}: {entry.output.slice(0, 30)}...
                    </span>
                    <span className="text-gray-500 text-xs">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Encode and decode URLs</li>
            <li>Copy output to clipboard</li>
            <li>Download output as text file</li>
            <li>Track history of last 5 operations</li>
            <li>Real-time character count</li>
            <li>Switch between encode/decode modes</li>
          </ul>
        </div>

        {/* Animation */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-in;
          }
        `}</style>
      </div>
    </div>
  );
};

export default URLDecoder;