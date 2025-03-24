"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaEye } from "react-icons/fa";

const HTMLEntityDecoder = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState("decode"); // 'decode' or 'encode'
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [options, setOptions] = useState({
    encodeAll: false, // Encode all characters, not just special ones
    preserveWhitespace: true, // Preserve spaces/newlines
    decodeNumeric: true, // Decode numeric entities (e.g., &#65;)
  });

  const decodeEntities = useCallback((text) => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    let result = textarea.value;
    if (options.decodeNumeric) {
      result = result.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(num));
      result = result.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    }
    return options.preserveWhitespace ? result : result.trim();
  }, [options]);

  const encodeEntities = useCallback((text) => {
    const textarea = document.createElement("textarea");
    textarea.textContent = text;
    let result = textarea.innerHTML;
    if (options.encodeAll) {
      result = text.split("").map(char => 
        char.charCodeAt(0) > 127 ? `&#${char.charCodeAt(0)};` : char
      ).join("");
    }
    return options.preserveWhitespace ? result : result.trim();
  }, [options]);

  const processText = () => {
    setError(null);
    setOutputText("");
    setCopied(false);
    setShowPreview(false);

    if (!inputText.trim()) {
      setError("Please enter some text to process");
      return;
    }

    try {
      const result = mode === "decode" ? decodeEntities(inputText) : encodeEntities(inputText);
      setOutputText(result);
    } catch (err) {
      setError("Error processing text: " + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    processText();
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
      link.download = `${mode}d-text-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setInputText("");
    setOutputText("");
    setError(null);
    setCopied(false);
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">HTML Entity Decoder/Encoder</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Input Text</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={mode === "decode"
                ? "e.g., &lt;p&gt;Hello &amp; welcome! &#65;&lt;/p&gt;"
                : "e.g., Hello & welcome!"}
              aria-label="Input Text"
            />
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Processing Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.preserveWhitespace}
                  onChange={(e) => setOptions(prev => ({ ...prev, preserveWhitespace: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Preserve Whitespace</span>
              </label>
              {mode === "decode" ? (
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.decodeNumeric}
                    onChange={(e) => setOptions(prev => ({ ...prev, decodeNumeric: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">Decode Numeric Entities</span>
                </label>
              ) : (
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.encodeAll}
                    onChange={(e) => setOptions(prev => ({ ...prev, encodeAll: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">Encode All Characters</span>
                </label>
              )}
              <div className="sm:col-span-2">
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="decode">Decode Entities</option>
                  <option value="encode">Encode to Entities</option>
                </select>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              disabled={!inputText.trim()}
            >
              {mode === "decode" ? "Decode" : "Encode"}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
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
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <h3 className="font-semibold text-gray-700">
                {mode === "decode" ? "Decoded Text" : "Encoded Text"}
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className={`py-2 px-4 rounded-lg transition-colors flex items-center ${
                    copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200">
              {outputText}
            </pre>

            {/* Preview */}
            {mode === "decode" && (
              <div>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                  <FaEye className="mr-2" /> {showPreview ? "Hide Preview" : "Show Preview"}
                </button>
                {showPreview && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white overflow-auto max-h-64">
                    <iframe
                      srcDoc={outputText}
                      className="w-full h-48 border-none"
                      title="HTML Preview"
                      sandbox="allow-same-origin"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Decode HTML entities (e.g., &amp; → &)</li>
            <li>Encode text to HTML entities (e.g., & → &amp;)</li>
            <li>Support for numeric entity decoding (e.g., &#65; → A)</li>
            <li>Optional whitespace preservation</li>
            <li>Preview decoded HTML</li>
            <li>Copy and download results</li>
            <li>Responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HTMLEntityDecoder;