"use client";

import { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaEye } from "react-icons/fa";

const Base64Decoder = () => {
  const [encodedInput, setEncodedInput] = useState("");
  const [decodedOutput, setDecodedOutput] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [options, setOptions] = useState({
    decodeURIComponent: true,
    strictMode: false,
  });

  // Decode Base64 with options
  const decodeBase64 = useCallback((base64Text) => {
    try {
      // Remove any whitespace and validate base64 format
      const cleanedInput = base64Text.trim();
      if (options.strictMode && !/^[A-Za-z0-9+/=]+$/.test(cleanedInput)) {
        throw new Error("Input contains invalid Base64 characters");
      }

      const decoded = atob(cleanedInput);
      return options.decodeURIComponent 
        ? decodeURIComponent(escape(decoded))
        : decoded;
    } catch (error) {
      return `Error: ${error.message || "Invalid Base64 input"}`;
    }
  }, [options]);

  // Handle decoding
  const handleDecode = () => {
    if (!encodedInput.trim()) {
      setError("Please enter Base64 text to decode");
      setDecodedOutput("");
      return;
    }
    setError("");
    const result = decodeBase64(encodedInput);
    setDecodedOutput(result);
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    if (decodedOutput && !decodedOutput.startsWith("Error:")) {
      navigator.clipboard.writeText(decodedOutput).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  };

  // Handle download
  const handleDownload = () => {
    if (decodedOutput && !decodedOutput.startsWith("Error:")) {
      const blob = new Blob([decodedOutput], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `decoded-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Handle reset
  const handleReset = () => {
    setEncodedInput("");
    setDecodedOutput("");
    setError("");
    setCopySuccess(false);
    setShowPreview(false);
  };

  // Detect if output is likely HTML
  const isHTMLContent = decodedOutput && 
    !decodedOutput.startsWith("Error:") && 
    /<[^>]+>/.test(decodedOutput);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Base64 Decoder</h1>

        {/* Input Section */}
        <div className="mb-6">
          <textarea
            className="w-full h-40 sm:h-48 p-4 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Enter Base64 text here..."
            value={encodedInput}
            onChange={(e) => setEncodedInput(e.target.value)}
            aria-label="Base64 Input"
          />
        </div>

        {/* Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Decoding Options</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.decodeURIComponent}
                onChange={(e) => setOptions(prev => ({ ...prev, decodeURIComponent: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Decode URI Component</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.strictMode}
                onChange={(e) => setOptions(prev => ({ ...prev, strictMode: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Strict Mode</span>
            </label>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={handleDecode}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            disabled={!encodedInput.trim()}
          >
            Decode Base64
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            disabled={!decodedOutput || decodedOutput.startsWith("Error:")}
          >
            <FaCopy className="mr-2" /> Copy
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            disabled={!decodedOutput || decodedOutput.startsWith("Error:")}
          >
            <FaDownload className="mr-2" /> Download
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Copy Success */}
        {copySuccess && (
          <div className="mb-6 p-2 text-green-700 bg-green-50 rounded-lg text-center animate-fade-in">
            Copied to clipboard!
          </div>
        )}

        {/* Output */}
        <div className="mb-6">
          <textarea
            className="w-full h-40 sm:h-48 p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
            placeholder="Decoded text will appear here..."
            value={decodedOutput}
            readOnly
            aria-label="Decoded Output"
          />
        </div>

        {/* Preview (for HTML content) */}
        {isHTMLContent && (
          <div className="mb-6">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaEye className="mr-2" /> {showPreview ? "Hide Preview" : "Show HTML Preview"}
            </button>
            {showPreview && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white overflow-auto max-h-64">
                <iframe
                  srcDoc={decodedOutput}
                  className="w-full h-48 border-none"
                  title="HTML Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Decode Base64 to plain text</li>
            <li>Optional URI component decoding</li>
            <li>Strict mode for input validation</li>
            <li>Copy to clipboard</li>
            <li>Download as text file</li>
            <li>Preview HTML content</li>
          </ul>
        </div>
      </div>

      {/* Tailwind Animation */}
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
  );
};

export default Base64Decoder;