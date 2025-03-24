"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";

const BinaryToBinaryString = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [stringInput, setStringInput] = useState("");
  const [bitLength, setBitLength] = useState(8); // Default to 8-bit (ASCII)
  const [error, setError] = useState("");
  const [delimiter, setDelimiter] = useState(" "); // Default to space
  const [endianness, setEndianness] = useState("big"); // Big or little endian
  const [encoding, setEncoding] = useState("ascii"); // ASCII, UTF-8, UTF-16
  const [history, setHistory] = useState([]);

  // Validate binary input
  const validateBinary = (binary) => /^[01\s]+$/.test(binary);

  // Binary to String conversion
  const binaryToString = useCallback(
    (binary) => {
      setError("");
      if (!binary.trim()) {
        setStringInput("");
        return;
      }

      const cleanBinary = binary.replace(/\s+/g, "");
      if (!validateBinary(cleanBinary)) {
        setError("Invalid binary input: Use only 0s, 1s, and spaces");
        setStringInput("");
        return;
      }

      if (cleanBinary.length % bitLength !== 0) {
        setError(`Binary length must be a multiple of ${bitLength} bits`);
        setStringInput("");
        return;
      }

      try {
        const bytes = [];
        for (let i = 0; i < cleanBinary.length; i += bitLength) {
          const byte = cleanBinary.slice(i, i + bitLength);
          const adjustedByte = endianness === "little" ? byte.split("").reverse().join("") : byte;
          bytes.push(parseInt(adjustedByte, 2));
        }

        let text;
        if (encoding === "utf-8") {
          text = new TextDecoder("utf-8").decode(new Uint8Array(bytes));
        } else if (encoding === "utf-16") {
          text = new TextDecoder("utf-16" + (endianness === "little" ? "le" : "be")).decode(
            new Uint16Array(bytes).buffer
          );
        } else {
          text = String.fromCharCode(...bytes); // ASCII
        }

        setStringInput(text);
        setHistory((prev) => [...prev, { binary, text, time: new Date().toLocaleTimeString() }].slice(-5));
      } catch (err) {
        setError(`Conversion failed: ${err.message}`);
        setStringInput("");
      }
    },
    [bitLength, endianness, encoding]
  );

  // String to Binary conversion
  const stringToBinary = useCallback(
    (text) => {
      setError("");
      if (!text) {
        setBinaryInput("");
        return;
      }

      try {
        let binaryArray = [];
        if (encoding === "utf-8") {
          const encoder = new TextEncoder();
          const bytes = encoder.encode(text);
          binaryArray = Array.from(bytes).map((byte) =>
            byte.toString(2).padStart(bitLength, "0")
          );
        } else if (encoding === "utf-16") {
          const encoder = new TextEncoder("utf-16" + (endianness === "little" ? "le" : "be"));
          const bytes = new Uint16Array(encoder.encode(text).buffer);
          binaryArray = Array.from(bytes).map((byte) =>
            byte.toString(2).padStart(bitLength, "0")
          );
        } else {
          binaryArray = text.split("").map((char) => {
            const charCode = char.charCodeAt(0);
            const binary = charCode.toString(2).padStart(bitLength, "0");
            return endianness === "little" ? binary.split("").reverse().join("") : binary;
          });
        }

        setBinaryInput(binaryArray.join(delimiter));
        setHistory((prev) => [...prev, { binary: binaryArray.join(delimiter), text, time: new Date().toLocaleTimeString() }].slice(-5));
      } catch (err) {
        setError(`Conversion failed: ${err.message}`);
        setBinaryInput("");
      }
    },
    [bitLength, delimiter, endianness, encoding]
  );

  // Handlers
  const handleBinaryChange = (value) => {
    setBinaryInput(value);
    binaryToString(value);
  };

  const handleStringChange = (value) => {
    setStringInput(value);
    stringToBinary(value);
  };

  const handleClear = () => {
    setBinaryInput("");
    setStringInput("");
    setError("");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const downloadAsText = () => {
    const content = `Binary: ${binaryInput}\nString: ${stringInput}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `binary-conversion-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary to Binary String Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Binary Input</label>
              <textarea
                value={binaryInput}
                onChange={(e) => handleBinaryChange(e.target.value)}
                placeholder={`e.g., 01001000 01100101 01101100 01101100 01101111 (8-bit)`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 font-mono text-sm resize-y"
              />
              <button
                onClick={() => copyToClipboard(binaryInput)}
                className="mt-2 px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center text-sm"
              >
                <FaCopy className="mr-1" /> Copy
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">String Output</label>
              <input
                type="text"
                value={stringInput}
                onChange={(e) => handleStringChange(e.target.value)}
                placeholder="e.g., Hello"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => copyToClipboard(stringInput)}
                className="mt-2 px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center text-sm"
              >
                <FaCopy className="mr-1" /> Copy
              </button>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Conversion Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bit Length</label>
                <select
                  value={bitLength}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setBitLength(value);
                    binaryToString(binaryInput);
                    stringToBinary(stringInput);
                  }}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value={7}>7-bit (ASCII)</option>
                  <option value={8}>8-bit (Extended ASCII)</option>
                  <option value={16}>16-bit (Unicode)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delimiter</label>
                <select
                  value={delimiter}
                  onChange={(e) => {
                    setDelimiter(e.target.value);
                    stringToBinary(stringInput);
                  }}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  <option value=" ">Space</option>
                  <option value=",">Comma</option>
                  <option value="-">Dash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endianness</label>
                <select
                  value={endianness}
                  onChange={(e) => {
                    setEndianness(e.target.value);
                    binaryToString(binaryInput);
                    stringToBinary(stringInput);
                  }}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="big">Big Endian</option>
                  <option value="little">Little Endian</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Encoding</label>
                <select
                  value={encoding}
                  onChange={(e) => {
                    setEncoding(e.target.value);
                    binaryToString(binaryInput);
                    stringToBinary(stringInput);
                  }}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ascii">ASCII</option>
                  <option value="utf-8">UTF-8</option>
                  <option value="utf-16">UTF-16</option>
                </select>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={downloadAsText}
              disabled={!binaryInput && !stringInput}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center transition-colors"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">Conversion History (Last 5)</h3>
              <ul className="text-sm text-blue-600 space-y-1 max-h-40 overflow-y-auto">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index}>
                    {entry.time}: "{entry.text}" ↔ {entry.binary.substring(0, 20)}...
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <details>
              <summary className="cursor-pointer font-semibold text-gray-700">
                Features & Usage
              </summary>
              <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                <li>Convert binary to string and vice versa in real-time</li>
                <li>Supports 7-bit, 8-bit, and 16-bit lengths</li>
                <li>Multiple encoding options: ASCII, UTF-8, UTF-16</li>
                <li>Customizable delimiter (none, space, comma, dash)</li>
                <li>Big or little endian support</li>
                <li>Copy to clipboard and download results</li>
                <li>Conversion history tracking</li>
                <li>Example: 01001000 01100101 01101100 01101100 01101111 = "Hello" (8-bit ASCII)</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinaryToBinaryString;