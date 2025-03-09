"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaExchangeAlt,
} from "react-icons/fa";

const TextBinaryConverter = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [direction, setDirection] = useState("textToBinary");
  const [options, setOptions] = useState({
    addSpaces: true,
    customSeparator: " ", // Custom separator for binary output
    bitLength: 8,         // 8, 16, or custom (min 1, max 32)
    customBitLength: 8,   // Custom bit length input
    encoding: "utf-8",    // utf-8, ascii
  });

  const textToBinary = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to convert" };
    }

    const encoder = new TextEncoder();
    const bitLen = options.bitLength === "custom" ? options.customBitLength : options.bitLength;
    const binary = Array.from(encoder.encode(text))
      .map(byte => byte.toString(2).padStart(bitLen, "0"))
      .join(options.addSpaces ? options.customSeparator : "");

    return { original: text, converted: binary, type: "Text to Binary" };
  };

  const binaryToText = (binary) => {
    if (!binary.trim()) {
      return { error: "Please enter some binary values to convert" };
    }

    const cleanBinary = binary.replace(new RegExp(options.customSeparator, "g"), "");
    const bitLen = options.bitLength === "custom" ? options.customBitLength : options.bitLength;
    if (!/^[01]+$/.test(cleanBinary) || cleanBinary.length % bitLen !== 0) {
      return { error: `Invalid binary input: Use only 0s and 1s, length must be a multiple of ${bitLen}` };
    }

    let text;
    try {
      const bytes = [];
      for (let i = 0; i < cleanBinary.length; i += bitLen) {
        bytes.push(parseInt(cleanBinary.substr(i, bitLen), 2));
      }
      text = new TextDecoder(options.encoding).decode(new Uint8Array(bytes));
    } catch (e) {
      return { error: "Error decoding binary values: " + e.message };
    }

    return { original: binary, converted: text, type: "Binary to Text" };
  };

  const handleConvert = useCallback(async () => {
    setError("");
    setOutputText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = direction === "textToBinary" ? textToBinary(inputText) : binaryToText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setOutputText(result.converted);
        setHistory(prev => [...prev, { input: inputText, output: result.converted, direction, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, direction, options]);

  const reset = () => {
    setInputText("");
    setOutputText("");
    setError("");
    setOptions({
      addSpaces: true,
      customSeparator: " ",
      bitLength: 8,
      customBitLength: 8,
      encoding: "utf-8",
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, Math.min(32, value)) : value,
    }));
  };

  const exportConvertedText = () => {
    const content = `Input: ${inputText}\nDirection: ${direction === "textToBinary" ? "Text to Binary" : "Binary to Text"}\nBit Length: ${options.bitLength === "custom" ? options.customBitLength : options.bitLength}\nEncoding: ${options.encoding}\nOutput: ${outputText}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `binary_${direction}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full ">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Text Binary Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter {direction === "textToBinary" ? "Text" : "Binary"} to Convert:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-40 sm:h-48 resize-y transition-all"
              placeholder={
                direction === "textToBinary"
                  ? "e.g., Hello"
                  : `e.g., 01001000${options.customSeparator}01100101${options.customSeparator}01101100${options.customSeparator}01101100${options.customSeparator}01101111`
              }
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Conversion Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Direction:</label>
                <div className="flex items-center space-x-4">
                  <label className="text-sm text-gray-600">
                    <input
                      type="radio"
                      name="direction"
                      value="textToBinary"
                      checked={direction === "textToBinary"}
                      onChange={() => setDirection("textToBinary")}
                      className="mr-2"
                    />
                    Text to Binary
                  </label>
                  <label className="text-sm text-gray-600">
                    <input
                      type="radio"
                      name="direction"
                      value="binaryToText"
                      checked={direction === "binaryToText"}
                      onChange={() => setDirection("binaryToText")}
                      className="mr-2"
                    />
                    Binary to Text
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Encoding:</label>
                <select
                  value={options.encoding}
                  onChange={(e) => handleOptionChange("encoding", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="utf-8">UTF-8</option>
                  <option value="ascii">ASCII</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Bit Length:</label>
                <select
                  value={options.bitLength}
                  onChange={(e) => handleOptionChange("bitLength", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={8}>8-bit</option>
                  <option value={16}>16-bit</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              {options.bitLength === "custom" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Bit Length:</label>
                  <input
                    type="number"
                    value={options.customBitLength}
                    onChange={(e) => handleOptionChange("customBitLength", parseInt(e.target.value) || 8)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="1"
                    max="32"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Separator:</label>
                <input
                  type="text"
                  value={options.customSeparator}
                  onChange={(e) => handleOptionChange("customSeparator", e.target.value || " ")}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  maxLength="5"
                  placeholder="e.g., space or |"
                  disabled={!options.addSpaces}
                />
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.addSpaces}
                  onChange={() => handleOptionChange("addSpaces", !options.addSpaces)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span>Add Spaces</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConvert}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <FaExchangeAlt className="inline mr-2" />
              {isLoading ? "Converting..." : "Convert"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {outputText && (
              <button
                onClick={exportConvertedText}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
              >
                <FaDownload className="inline mr-2" />
                Export
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Output Display */}
        {outputText && (
          <div className="mt-8 p-6 bg-green-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Converted {direction === "textToBinary" ? "Binary" : "Text"}
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-all whitespace-pre-wrap max-h-64 overflow-y-auto">
              {outputText}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(outputText)}
              className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy to Clipboard
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Conversions (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.direction === "textToBinary" ? "Text → Binary" : "Binary → Text"}: "{entry.output.slice(0, 20)}..."
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setOutputText(entry.output);
                      setDirection(entry.direction);
                      setOptions(entry.options);
                    }}
                    className="text-green-500 hover:text-green-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-300">
          <h3 className="font-semibold text-green-700">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm">
            <li>Bidirectional conversion (Text ↔ Binary)</li>
            <li>Customizable bit length (8, 16, or custom 1-32)</li>
            <li>UTF-8 or ASCII encoding</li>
            <li>Custom separators and spacing</li>
            <li>Export results and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextBinaryConverter;