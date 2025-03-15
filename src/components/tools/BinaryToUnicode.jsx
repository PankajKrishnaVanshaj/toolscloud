"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaInfoCircle } from "react-icons/fa";

const BinaryToUnicode = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [format, setFormat] = useState("continuous"); // continuous, bytes, hex
  const [unicodeOutput, setUnicodeOutput] = useState("");
  const [charCodes, setCharCodes] = useState([]);
  const [error, setError] = useState("");
  const [outputFormat, setOutputFormat] = useState("text"); // text, decimal, hex

  // Validation and conversion utilities
  const validateBinary = (binary) => /^[01\s]+$/.test(binary);
  const validateHex = (hex) => /^[0-9A-Fa-f\s]+$/.test(hex);
  const binaryToDecimal = (binary) => parseInt(binary, 2);
  const hexToDecimal = (hex) => parseInt(hex, 16);
  const decimalToUnicodeChar = (decimal) => {
    try {
      return String.fromCharCode(decimal);
    } catch {
      return "";
    }
  };

  // Binary/Hex to Unicode conversion
  const convertToUnicode = useCallback(() => {
    setError("");
    setUnicodeOutput("");
    setCharCodes([]);

    if (!binaryInput.trim()) {
      setError("Please enter a binary or hex string");
      return;
    }

    let decimals = [];
    if (format === "hex") {
      if (!validateHex(binaryInput)) {
        setError("Invalid hex input: Use only 0-9, A-F, and spaces");
        return;
      }
      const hexValues = binaryInput.trim().split(/\s+/);
      decimals = hexValues.map(hexToDecimal);
    } else {
      if (!validateBinary(binaryInput)) {
        setError("Invalid binary input: Use only 0s, 1s, and spaces");
        return;
      }
      let bytes;
      if (format === "continuous") {
        const binary = binaryInput.replace(/\s/g, "");
        if (binary.length % 8 !== 0) {
          setError("Continuous binary input must be a multiple of 8 bits");
          return;
        }
        bytes = binary.match(/.{1,8}/g) || [];
      } else {
        bytes = binaryInput.trim().split(/\s+/);
        for (const byte of bytes) {
          if (byte.length !== 8) {
            setError("Each byte must be exactly 8 bits");
            return;
          }
        }
      }
      decimals = bytes.map(binaryToDecimal);
    }

    const chars = decimals.map(decimalToUnicodeChar);
    setCharCodes(decimals);
    setUnicodeOutput(
      outputFormat === "text"
        ? chars.join("")
        : outputFormat === "decimal"
        ? decimals.join(", ")
        : decimals.map((d) => d.toString(16).toUpperCase().padStart(4, "0")).join(" ")
    );
  }, [binaryInput, format, outputFormat]);

  // Text to Binary/Hex conversion
  const convertTextToBinary = useCallback(() => {
    setError("");
    setBinaryInput("");
    setUnicodeOutput("");

    if (!textInput.trim()) {
      setError("Please enter text to convert");
      return;
    }

    const charArray = textInput.split("");
    const decimals = charArray.map((char) => char.charCodeAt(0));
    setCharCodes(decimals);

    if (format === "hex") {
      setBinaryInput(
        decimals.map((d) => d.toString(16).toUpperCase().padStart(4, "0")).join(" ")
      );
    } else {
      const binaryArray = decimals.map((d) => d.toString(2).padStart(8, "0"));
      setBinaryInput(format === "continuous" ? binaryArray.join("") : binaryArray.join(" "));
    }
    setUnicodeOutput(textInput);
  }, [textInput, format]);

  // Handlers
  const handleBinarySubmit = (e) => {
    e.preventDefault();
    convertToUnicode();
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    convertTextToBinary();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const reset = () => {
    setBinaryInput("");
    setTextInput("");
    setUnicodeOutput("");
    setCharCodes([]);
    setError("");
    setFormat("continuous");
    setOutputFormat("text");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary/Hex to Unicode Converter
        </h1>

        <div className="space-y-6">
          {/* Binary/Hex Input Section */}
          <form onSubmit={handleBinarySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {format === "hex" ? "Hex Input" : "Binary Input"}
              </label>
              <textarea
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                placeholder={
                  format === "hex"
                    ? "e.g., 0048 0065"
                    : format === "continuous"
                    ? "e.g., 0100100001100101"
                    : "e.g., 01001000 01100101"
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-y"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="continuous">Continuous Binary</option>
                  <option value="bytes">Space-Separated Bytes</option>
                  <option value="hex">Hexadecimal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Text</option>
                  <option value="decimal">Decimal Codes</option>
                  <option value="hex">Hex Codes</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Convert to Unicode
            </button>
          </form>

          {/* Text Input Section */}
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Input (Reverse Conversion)
              </label>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g., Hello"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Convert to {format === "hex" ? "Hex" : "Binary"}
            </button>
          </form>

          {/* Reset Button */}
          <button
            onClick={reset}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Results Section */}
          {unicodeOutput && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Results:</h2>
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <p>
                    <span className="font-medium">
                      {outputFormat === "text" ? "Unicode Text" : `${outputFormat} Codes`}:
                    </span>{" "}
                    {unicodeOutput}
                  </p>
                  <button
                    onClick={() => copyToClipboard(unicodeOutput)}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 flex items-center"
                  >
                    <FaCopy className="mr-1" /> Copy
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <p>
                    <span className="font-medium">{format === "hex" ? "Hex" : "Binary"}:</span>{" "}
                    {binaryInput}
                  </p>
                  <button
                    onClick={() => copyToClipboard(binaryInput)}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 flex items-center"
                  >
                    <FaCopy className="mr-1" /> Copy
                  </button>
                </div>
                <div>
                  <p className="font-medium">Character Codes (Decimal):</p>
                  <p>{charCodes.join(", ")}</p>
                </div>
                <div>
                  <p className="font-medium">Visualization:</p>
                  <div className="font-mono text-xs grid gap-1 max-h-40 overflow-y-auto">
                    {charCodes.map((code, index) => (
                      <p key={index}>
                        {binaryInput.split(format === "continuous" || format === "hex" ? /\s+/ : /\s+/)[index] || ""} →{" "}
                        {decimalToUnicodeChar(code)} (U+{code.toString(16).toUpperCase().padStart(4, "0")})
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
              <FaInfoCircle className="mr-2" /> Features & Usage
            </h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert binary or hex to Unicode text</li>
              <li>Supports continuous binary, space-separated bytes, or hex input</li>
              <li>Reverse conversion from text to binary/hex</li>
              <li>Multiple output formats: text, decimal, hex</li>
              <li>Copy results to clipboard</li>
              <li>Example: "01001000 01100101" → "He" or "0048 0065" → "He"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinaryToUnicode;