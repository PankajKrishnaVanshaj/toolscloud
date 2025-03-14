"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaExchangeAlt, FaDownload } from "react-icons/fa";

const ROT13ToText = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [rotation, setRotation] = useState(13); // Default ROT13
  const [direction, setDirection] = useState("encode"); // encode or decode
  const [preserveCase, setPreserveCase] = useState(true);
  const [realTime, setRealTime] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(false); // New: Rotate numbers
  const [customAlphabet, setCustomAlphabet] = useState(""); // New: Custom alphabet

  const rotCipher = useCallback((text, shift, encode = true) => {
    const effectiveShift = encode ? shift : -shift;
    const defaultAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const alphabet = customAlphabet || defaultAlphabet;

    return text.split("").map((char) => {
      const code = char.charCodeAt(0);
      const isUpper = code >= 65 && code <= 90;
      const isLower = code >= 97 && code <= 122;
      const isNumber = includeNumbers && code >= 48 && code <= 57;

      if (isUpper || isLower) {
        const base = isUpper ? 65 : 97;
        const index = code - base;
        const shiftedIndex = (index + effectiveShift + 26) % 26;
        return String.fromCharCode(base + shiftedIndex);
      } else if (isNumber) {
        const index = code - 48;
        const shiftedIndex = (index + effectiveShift + 10) % 10;
        return String.fromCharCode(48 + shiftedIndex);
      } else if (customAlphabet && /[a-zA-Z]/.test(char)) {
        const isUpperCustom = char === char.toUpperCase();
        const baseAlphabet = alphabet.toUpperCase();
        const index = baseAlphabet.indexOf(char.toUpperCase());
        if (index !== -1) {
          const shiftedIndex = (index + effectiveShift + alphabet.length) % alphabet.length;
          const resultChar = baseAlphabet[shiftedIndex];
          return preserveCase && !isUpperCustom ? resultChar.toLowerCase() : resultChar;
        }
      }
      return char;
    }).join("");
  }, [customAlphabet, includeNumbers, preserveCase]);

  const handleConversion = useCallback(
    (text) => {
      if (!text) {
        setOutputText("");
        return;
      }
      const result = rotCipher(text, rotation, direction === "encode");
      setOutputText(result);
    },
    [rotCipher, rotation, direction]
  );

  const handleInputChange = (value) => {
    setInputText(value);
    if (realTime) handleConversion(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleConversion(inputText);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const swapInputOutput = () => {
    setInputText(outputText);
    setOutputText(inputText);
    setDirection(direction === "encode" ? "decode" : "encode");
    if (realTime) handleConversion(outputText);
  };

  const downloadText = () => {
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rot${rotation}-${direction === "encode" ? "encoded" : "decoded"}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setInputText("");
    setOutputText("");
    setRotation(13);
    setDirection("encode");
    setPreserveCase(true);
    setRealTime(true);
    setIncludeNumbers(false);
    setCustomAlphabet("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          ROT Cipher Converter
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Text
              </label>
              <textarea
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter text to encode/decode"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rotation (1-25)
                </label>
                <input
                  type="number"
                  value={rotation}
                  onChange={(e) => {
                    const value = Math.max(1, Math.min(25, parseInt(e.target.value) || 13));
                    setRotation(value);
                    if (realTime) handleConversion(inputText);
                  }}
                  min={1}
                  max={25}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Direction
                </label>
                <select
                  value={direction}
                  onChange={(e) => {
                    setDirection(e.target.value);
                    if (realTime) handleConversion(inputText);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="encode">Encode</option>
                  <option value="decode">Decode</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Alphabet (optional)
                </label>
                <input
                  type="text"
                  value={customAlphabet}
                  onChange={(e) => {
                    setCustomAlphabet(e.target.value);
                    if (realTime) handleConversion(inputText);
                  }}
                  placeholder="e.g., ABCDEFG"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preserveCase}
                  onChange={(e) => {
                    setPreserveCase(e.target.checked);
                    if (realTime) handleConversion(inputText);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Preserve Case</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={realTime}
                  onChange={(e) => {
                    setRealTime(e.target.checked);
                    if (e.target.checked) handleConversion(inputText);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Real-Time Conversion</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => {
                    setIncludeNumbers(e.target.checked);
                    if (realTime) handleConversion(inputText);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Include Numbers</span>
              </label>
            </div>
          </div>

          {/* Output Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Output</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <textarea
                value={outputText}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-gray-100 h-32 resize-y"
              />
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(outputText)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  type="button"
                  onClick={downloadText}
                  disabled={!outputText}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={realTime || !inputText}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Convert
            </button>
            <button
              type="button"
              onClick={swapInputOutput}
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <FaExchangeAlt className="mr-2" /> Swap
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Features & Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Custom rotation (1-25) with ROT13 default</li>
            <li>Encode/decode with real-time option</li>
            <li>Preserve case or force upper/lower</li>
            <li>Include numbers in rotation (0-9)</li>
            <li>Custom alphabet support</li>
            <li>Copy to clipboard and download as text file</li>
            <li>Swap input/output for reverse operations</li>
          </ul>
        </div>

        {/* Example */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Example</h3>
          <p className="text-sm text-gray-600">
            "Hello123" → "Uryyb123" (ROT13 encode, preserve case) <br />
            "Hello123" → "Uryyb678" (ROT13 encode, include numbers)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ROT13ToText;