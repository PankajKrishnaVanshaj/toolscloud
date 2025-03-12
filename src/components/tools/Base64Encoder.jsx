"use client";

import { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaExchangeAlt } from "react-icons/fa";

const Base64Encoder = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isEncoding, setIsEncoding] = useState(true); // Toggle between encode/decode
  const [copySuccess, setCopySuccess] = useState(false);
  const [formatOptions, setFormatOptions] = useState({
    wrapLines: false,
    lineLength: 76,
  });

  // Encode to Base64
  const encodeBase64 = useCallback((text) => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(text)));
      if (formatOptions.wrapLines) {
        return encoded.match(new RegExp(`.{1,${formatOptions.lineLength}}`, "g")).join("\n");
      }
      return encoded;
    } catch (error) {
      return "Error: Invalid input for Base64 encoding.";
    }
  }, [formatOptions]);

  // Decode from Base64
  const decodeBase64 = useCallback((text) => {
    try {
      return decodeURIComponent(escape(atob(text.replace(/\s/g, ""))));
    } catch (error) {
      return "Error: Invalid Base64 string for decoding.";
    }
  }, []);

  // Handle conversion based on mode
  const handleConvert = () => {
    if (!input.trim()) {
      setOutput("Please enter some text to process.");
      return;
    }
    setOutput(isEncoding ? encodeBase64(input) : decodeBase64(input));
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    if (output && !output.startsWith("Error:")) {
      navigator.clipboard.writeText(output).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  };

  // Handle download
  const handleDownload = () => {
    if (output && !output.startsWith("Error:")) {
      const blob = new Blob([output], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `base64-${isEncoding ? "encoded" : "decoded"}-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Handle reset
  const handleReset = () => {
    setInput("");
    setOutput("");
    setCopySuccess(false);
  };

  // Toggle between encode and decode
  const toggleMode = () => {
    setIsEncoding(!isEncoding);
    setOutput("");
    setInput("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Base64 {isEncoding ? "Encoder" : "Decoder"}
        </h1>

        {/* Input Section */}
        <div className="mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-40 sm:h-48 p-4 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder={`Enter ${isEncoding ? "text" : "Base64 string"} to ${isEncoding ? "encode" : "decode"}...`}
            aria-label={`${isEncoding ? "Text" : "Base64"} Input`}
          />
        </div>

        {/* Options Section */}
        {isEncoding && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Formatting Options</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formatOptions.wrapLines}
                  onChange={(e) => setFormatOptions(prev => ({ ...prev, wrapLines: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Wrap Lines</span>
              </label>
              {formatOptions.wrapLines && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Line Length:</label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={formatOptions.lineLength}
                    onChange={(e) => setFormatOptions(prev => ({ ...prev, lineLength: Math.max(10, Math.min(200, parseInt(e.target.value) || 76)) }))}
                    className="w-20 p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={handleConvert}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            disabled={!input.trim()}
          >
            {isEncoding ? "Encode" : "Decode"}
          </button>
          <button
            onClick={toggleMode}
            className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <FaExchangeAlt className="mr-2" /> Switch to {isEncoding ? "Decode" : "Encode"}
          </button>
          <button
            onClick={handleCopy}
            disabled={!output || output.startsWith("Error:")}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaCopy className="mr-2" /> Copy
          </button>
          <button
            onClick={handleDownload}
            disabled={!output || output.startsWith("Error:")}
            className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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

        {/* Output Section */}
        {output && (
          <div className="mb-6">
            <textarea
              value={output}
              readOnly
              className="w-full h-40 sm:h-48 p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
              placeholder="Output will appear here..."
              aria-label="Base64 Output"
            />
            {copySuccess && (
              <p className="text-green-600 mt-2 font-semibold animate-fade-in">
                Copied to clipboard!
              </p>
            )}
          </div>
        )}

        {/* Features List */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Encode text to Base64</li>
            <li>Decode Base64 to text</li>
            <li>Optional line wrapping for encoded output</li>
            <li>Copy output to clipboard</li>
            <li>Download result as text file</li>
            <li>Switch between encode/decode modes</li>
          </ul>
        </div>

        {/* Animation Styles */}
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

export default Base64Encoder;