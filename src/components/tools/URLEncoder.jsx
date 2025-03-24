"use client";

import { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaExchangeAlt } from "react-icons/fa";

const URLEncoder = () => {
  const [textInput, setTextInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [mode, setMode] = useState("encode"); // encode or decode
  const [options, setOptions] = useState({
    encodeSpacesAsPlus: false,
    includeHash: true,
  });

  // Encode URL
  const encodeURL = useCallback((text) => {
    try {
      setError("");
      let result = options.encodeSpacesAsPlus 
        ? encodeURI(text).replace(/%20/g, "+") 
        : encodeURIComponent(text);
      if (!options.includeHash) {
        result = result.split("#")[0];
      }
      return result;
    } catch (error) {
      setError("Invalid input for URL encoding.");
      return "";
    }
  }, [options]);

  // Decode URL
  const decodeURL = useCallback((text) => {
    try {
      setError("");
      return decodeURIComponent(text.replace(/\+/g, "%20"));
    } catch (error) {
      setError("Invalid input for URL decoding.");
      return "";
    }
  }, []);

  // Handle processing based on mode
  const handleProcess = () => {
    const result = mode === "encode" ? encodeURL(textInput) : decodeURL(textInput);
    setOutput(result);
  };

  // Clear all fields
  const handleClear = () => {
    setTextInput("");
    setOutput("");
    setError("");
    setCopySuccess(false);
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  };

  // Download as text file
  const handleDownload = () => {
    if (output) {
      const blob = new Blob([output], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${mode}d-url-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Toggle mode
  const toggleMode = () => {
    setMode(prev => prev === "encode" ? "decode" : "encode");
    setOutput("");
    setError("");
    setCopySuccess(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          URL {mode === "encode" ? "Encoder" : "Decoder"}
        </h1>

        {/* Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Input Text
          </label>
          <textarea
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-y"
            placeholder={`Enter text to ${mode}...`}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            aria-label="URL Input"
          />
          <p className="text-xs text-gray-500 mt-1">
            Character count: {textInput.length}
          </p>
        </div>

        {/* Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Options</h2>
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.encodeSpacesAsPlus}
                onChange={(e) => setOptions(prev => ({ ...prev, encodeSpacesAsPlus: e.target.checked }))}
                disabled={mode === "decode"}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">
                Encode spaces as "+" (encode only)
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.includeHash}
                onChange={(e) => setOptions(prev => ({ ...prev, includeHash: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">
                Include URL hash (#)
              </span>
            </label>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={handleProcess}
            disabled={!textInput.trim()}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {mode === "encode" ? "Encode" : "Decode"}
          </button>
          <button
            onClick={toggleMode}
            className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <FaExchangeAlt className="mr-2" />
            Switch to {mode === "encode" ? "Decode" : "Encode"}
          </button>
          <button
            onClick={handleClear}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" />
            Clear
          </button>
        </div>

        {/* Output */}
        {output && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Output
            </label>
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-lg bg-gray-100 font-mono text-sm resize-y"
              value={output}
              readOnly
              aria-label="URL Output"
            />
            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              <button
                onClick={handleCopy}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaCopy className="mr-2" />
                {copySuccess ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                Download
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Features List */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Encode and decode URLs</li>
            <li>Optional space encoding as "+"</li>
            <li>Hash (#) inclusion control</li>
            <li>Copy to clipboard</li>
            <li>Download as text file</li>
            <li>Real-time character count</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default URLEncoder;