"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";

const ROT13Decoder = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [preserveCase, setPreserveCase] = useState(true);
  const [shiftAmount, setShiftAmount] = useState(13);
  const [mode, setMode] = useState("both"); // "encode", "decode", "both"

  // Generalized Caesar cipher transformation
  const caesarCipher = useCallback(
    (text, shift, encode = true) => {
      const effectiveShift = encode ? shift : -shift;
      return text.replace(/[A-Za-z]/g, (char) => {
        const code = char.charCodeAt(0);
        const base = code >= 97 ? 97 : 65;
        const adjustedCode = ((code - base + effectiveShift + 26) % 26) + base;
        return String.fromCharCode(
          preserveCase ? adjustedCode : adjustedCode >= 97 ? adjustedCode - 32 : adjustedCode
        );
      });
    },
    [preserveCase]
  );

  // Process text based on mode
  const processText = useCallback(() => {
    setError("");
    setOutputText("");

    if (!inputText.trim()) {
      setError("Please enter text to process");
      return;
    }

    try {
      let result;
      if (mode === "both") {
        result = caesarCipher(inputText, shiftAmount); // ROT13 or custom shift
      } else if (mode === "encode") {
        result = caesarCipher(inputText, shiftAmount, true);
      } else {
        result = caesarCipher(inputText, shiftAmount, false);
      }
      setOutputText(result);
    } catch (err) {
      setError("Processing failed: " + err.message);
    }
  }, [inputText, mode, shiftAmount, caesarCipher]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    processText();
  };

  // Copy output to clipboard
  const copyToClipboard = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
    }
  };

  // Download output as text file
  const downloadOutput = () => {
    if (outputText) {
      const blob = new Blob([outputText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rot13-output-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Clear all fields
  const clearAll = () => {
    setInputText("");
    setOutputText("");
    setError("");
    setShiftAmount(13);
    setMode("both");
    setPreserveCase(true);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">
          ROT13 Decoder/Encoder
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input Text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              placeholder="Enter text to decode or encode"
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="both">Encode & Decode (ROT13)</option>
                <option value="encode">Encode Only</option>
                <option value="decode">Decode Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shift Amount ({shiftAmount})
              </label>
              <input
                type="range"
                min="1"
                max="25"
                value={shiftAmount}
                onChange={(e) => setShiftAmount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preserveCase}
                  onChange={(e) => setPreserveCase(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Preserve Case</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Process
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Output Text */}
        {outputText && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Output Text</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  onClick={downloadOutput}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <textarea
              value={outputText}
              readOnly
              className="w-full p-3 border rounded-lg bg-gray-50 h-32 resize-y"
            />
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>ROT13 encoding/decoding with custom shift amounts</li>
            <li>Mode selection: Encode, Decode, or Both</li>
            <li>Preserve case option</li>
            <li>Copy to clipboard and download as text file</li>
            <li>Real-time settings adjustment</li>
          </ul>
        </div>

       
      </div>
    </div>
  );
};

export default ROT13Decoder;