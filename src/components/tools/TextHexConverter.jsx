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

const TextHexConverter = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [direction, setDirection] = useState("textToHex");
  const [options, setOptions] = useState({
    uppercase: true,
    addSpaces: true,
    customSeparator: " ", // Custom separator for hex output
    encoding: "utf-8",    // utf-8, ascii
    bytePrefix: false,    // Add "0x" prefix to each byte
  });

  const textToHex = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to convert" };
    }

    const encoder = new TextEncoder();
    const hex = Array.from(encoder.encode(text))
      .map(byte => {
        const code = byte.toString(16).padStart(2, "0");
        const formatted = options.uppercase ? code.toUpperCase() : code.toLowerCase();
        return options.bytePrefix ? `0x${formatted}` : formatted;
      })
      .join(options.addSpaces ? options.customSeparator : "");

    return { original: text, converted: hex, type: "Text to Hex" };
  };

  const hexToText = (hex) => {
    if (!hex.trim()) {
      return { error: "Please enter some hex values to convert" };
    }

    const cleanHex = hex.replace(new RegExp(`${options.customSeparator}|0x`, "g"), "");
    if (!/^[0-9A-Fa-f]+$/.test(cleanHex) || cleanHex.length % 2 !== 0) {
      return { error: "Invalid hex input: Use only 0-9, A-F, and ensure even length (excluding separators/prefixes)" };
    }

    let text;
    try {
      const bytes = [];
      for (let i = 0; i < cleanHex.length; i += 2) {
        bytes.push(parseInt(cleanHex.substr(i, 2), 16));
      }
      text = new TextDecoder(options.encoding).decode(new Uint8Array(bytes));
    } catch (e) {
      return { error: "Error decoding hex values: " + e.message };
    }

    return { original: hex, converted: text, type: "Hex to Text" };
  };

  const handleConvert = useCallback(async () => {
    setError("");
    setOutputText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = direction === "textToHex" ? textToHex(inputText) : hexToText(inputText);

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
      uppercase: true,
      addSpaces: true,
      customSeparator: " ",
      encoding: "utf-8",
      bytePrefix: false,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const exportConvertedText = () => {
    const content = `Input: ${inputText}\nDirection: ${direction === "textToHex" ? "Text to Hex" : "Hex to Text"}\nEncoding: ${options.encoding}\nOutput: ${outputText}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `hex_${direction}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full ">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Text Hex Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter {direction === "textToHex" ? "Text" : "Hex"} to Convert:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-40 sm:h-48 resize-y transition-all"
              placeholder={
                direction === "textToHex"
                  ? "e.g., Hello World"
                  : `e.g., ${options.bytePrefix ? "0x48 0x65 0x6C 0x6C 0x6F 0x20 0x57 0x6F 0x72 0x6C 0x64" : `48${options.customSeparator}65${options.customSeparator}6C${options.customSeparator}6C${options.customSeparator}6F${options.customSeparator}20${options.customSeparator}57${options.customSeparator}6F${options.customSeparator}72${options.customSeparator}6C${options.customSeparator}64`}`
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
                      value="textToHex"
                      checked={direction === "textToHex"}
                      onChange={() => setDirection("textToHex")}
                      className="mr-2"
                    />
                    Text to Hex
                  </label>
                  <label className="text-sm text-gray-600">
                    <input
                      type="radio"
                      name="direction"
                      value="hexToText"
                      checked={direction === "hexToText"}
                      onChange={() => setDirection("hexToText")}
                      className="mr-2"
                    />
                    Hex to Text
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Encoding:</label>
                <select
                  value={options.encoding}
                  onChange={(e) => handleOptionChange("encoding", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="utf-8">UTF-8</option>
                  <option value="ascii">ASCII</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Separator:</label>
                <input
                  type="text"
                  value={options.customSeparator}
                  onChange={(e) => handleOptionChange("customSeparator", e.target.value || " ")}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength="5"
                  placeholder="e.g., space or -"
                  disabled={!options.addSpaces}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.uppercase}
                    onChange={() => handleOptionChange("uppercase", !options.uppercase)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    disabled={direction === "hexToText"}
                  />
                  <span>Uppercase Hex {direction === "hexToText" && "(Text to Hex only)"}</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.addSpaces}
                    onChange={() => handleOptionChange("addSpaces", !options.addSpaces)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Add Spaces</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.bytePrefix}
                    onChange={() => handleOptionChange("bytePrefix", !options.bytePrefix)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    disabled={direction === "hexToText"}
                  />
                  <span>Byte Prefix (0x) {direction === "hexToText" && "(Text to Hex only)"}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConvert}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
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
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
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
          <div className="mt-8 p-6 bg-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Converted {direction === "textToHex" ? "Hex" : "Text"}
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-all whitespace-pre-wrap max-h-64 overflow-y-auto">
              {outputText}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(outputText)}
              className="mt-4 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold"
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
                    {entry.direction === "textToHex" ? "Text → Hex" : "Hex → Text"}: "{entry.output.slice(0, 20)}..."
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setOutputText(entry.output);
                      setDirection(entry.direction);
                      setOptions(entry.options);
                    }}
                    className="text-purple-500 hover:text-purple-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-purple-100 rounded-lg border border-purple-300">
          <h3 className="font-semibold text-purple-700">Features</h3>
          <ul className="list-disc list-inside text-purple-600 text-sm">
            <li>Bidirectional conversion (Text ↔ Hex)</li>
            <li>UTF-8 or ASCII encoding</li>
            <li>Custom separators and 0x prefix</li>
            <li>Uppercase/lowercase hex output</li>
            <li>Export results and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextHexConverter;