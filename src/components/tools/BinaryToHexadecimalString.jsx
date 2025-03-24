"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy, FaDownload } from "react-icons/fa";

const BinaryToHexadecimalString = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [hexOutput, setHexOutput] = useState("");
  const [groupBits, setGroupBits] = useState(4);
  const [padding, setPadding] = useState("none");
  const [caseOption, setCaseOption] = useState("upper");
  const [separator, setSeparator] = useState("space"); // New: Custom separator
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]); // New: Conversion history

  // Validation
  const validateBinary = (input) => {
    const cleanedInput = input.replace(/[\s-_,]/g, ""); // Allow common separators
    if (!/^[01]+$/.test(cleanedInput)) {
      setError("Invalid binary string: Only 0s and 1s are allowed");
      return null;
    }
    return cleanedInput;
  };

  const validateHex = (input) => {
    const cleanedInput = input.replace(/[\s-_,]/g, "");
    if (!/^[0-9A-Fa-f]+$/.test(cleanedInput)) {
      setError("Invalid hexadecimal string: Only 0-9 and A-F (case insensitive) are allowed");
      return null;
    }
    return cleanedInput;
  };

  // Binary to Hex conversion
  const binaryToHex = useCallback(
    (binary) => {
      const validBinary = validateBinary(binary);
      if (!validBinary) {
        setHexOutput("");
        return;
      }

      setError("");
      let binaryStr = validBinary;

      // Apply padding
      const remainder = binaryStr.length % 4;
      if (padding === "left" && remainder !== 0) {
        binaryStr = "0".repeat(4 - remainder) + binaryStr;
      } else if (padding === "right" && remainder !== 0) {
        binaryStr += "0".repeat(4 - remainder);
      }

      // Convert to hex
      const hex = parseInt(binaryStr, 2).toString(16);
      const formattedHex = caseOption === "upper" ? hex.toUpperCase() : hex.toLowerCase();
      setHexOutput(formattedHex);

      // Update history
      setHistory((prev) => [
        { binary: binaryStr, hex: formattedHex, timestamp: Date.now() },
        ...prev.slice(0, 9), // Limit to 10 entries
      ]);
    },
    [padding, caseOption]
  );

  // Hex to Binary conversion
  const hexToBinary = useCallback(
    (hex) => {
      const validHex = validateHex(hex);
      if (!validHex) {
        setBinaryInput("");
        return;
      }

      setError("");
      const binary = parseInt(validHex, 16).toString(2);
      let formattedBinary = binary;

      // Apply padding
      const remainder = binary.length % 4;
      if (padding === "left" && remainder !== 0) {
        formattedBinary = "0".repeat(4 - remainder) + binary;
      } else if (padding === "right" && remainder !== 0) {
        formattedBinary += "0".repeat(4 - remainder);
      }

      setBinaryInput(formattedBinary);

      // Update history
      setHistory((prev) => [
        { binary: formattedBinary, hex: validHex, timestamp: Date.now() },
        ...prev.slice(0, 9),
      ]);
    },
    [padding]
  );

  // Format with separator
  const formatWithSeparator = (str, bits) => {
    if (bits === 1) return str;
    let result = "";
    for (let i = 0; i < str.length; i++) {
      result += str[i];
      if ((i + 1) % bits === 0 && i !== str.length - 1) {
        result += separator === "space" ? " " : separator;
      }
    }
    return result;
  };

  // Handlers
  const handleBinaryChange = (value) => {
    const formatted = formatWithSeparator(value.replace(/[\s-_,]/g, ""), groupBits);
    setBinaryInput(formatted);
    binaryToHex(value);
  };

  const handleHexChange = (value) => {
    setHexOutput(value);
    hexToBinary(value);
  };

  const clearInputs = () => {
    setBinaryInput("");
    setHexOutput("");
    setError("");
    setHistory([]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const downloadResult = () => {
    const text = `Binary: ${binaryInput}\nHexadecimal: ${hexOutput}`;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `conversion-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Hexadecimal Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Binary String</label>
              <div className="relative">
                <input
                  type="text"
                  value={binaryInput}
                  onChange={(e) => handleBinaryChange(e.target.value)}
                  placeholder="e.g., 1010 1100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {binaryInput && (
                  <button
                    onClick={() => copyToClipboard(binaryInput)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-blue-500"
                  >
                    <FaCopy />
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Hexadecimal String</label>
              <div className="relative">
                <input
                  type="text"
                  value={hexOutput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="e.g., AC"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {hexOutput && (
                  <button
                    onClick={() => copyToClipboard(hexOutput)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-blue-500"
                  >
                    <FaCopy />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <button
                onClick={clearInputs}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center transition-colors"
              >
                <FaSync className="mr-2" /> Clear
              </button>
              <button
                onClick={downloadResult}
                disabled={!binaryInput && !hexOutput}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Bits</label>
                <select
                  value={groupBits}
                  onChange={(e) => {
                    setGroupBits(Number(e.target.value));
                    handleBinaryChange(binaryInput);
                  }}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>No grouping</option>
                  <option value={4}>4 bits</option>
                  <option value={8}>8 bits</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Padding</label>
                <select
                  value={padding}
                  onChange={(e) => {
                    setPadding(e.target.value);
                    binaryToHex(binaryInput);
                  }}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hex Case</label>
                <select
                  value={caseOption}
                  onChange={(e) => {
                    setCaseOption(e.target.value);
                    binaryToHex(binaryInput);
                  }}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="upper">Uppercase</option>
                  <option value="lower">Lowercase</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Separator</label>
                <select
                  value={separator}
                  onChange={(e) => {
                    setSeparator(e.target.value);
                    handleBinaryChange(binaryInput);
                  }}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="space">Space</option>
                  <option value="-">Dash (-)</option>
                  <option value="_">Underscore (_)</option>
                  <option value=",">Comma (,)</option>
                </select>
              </div>
            </div>
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
              <h2 className="text-lg font-semibold mb-2 text-blue-700">Conversion History</h2>
              <ul className="text-sm text-blue-600 space-y-2 max-h-40 overflow-y-auto">
                {history.map((entry, index) => (
                  <li key={index}>
                    {new Date(entry.timestamp).toLocaleTimeString()} - Binary:{" "}
                    {formatWithSeparator(entry.binary, groupBits)} ⇔ Hex: {entry.hex}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features Section */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h2 className="text-lg font-semibold mb-2 text-green-700">Features</h2>
            <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
              <li>Bidirectional conversion (binary ↔ hexadecimal)</li>
              <li>Custom bit grouping (1, 4, 8)</li>
              <li>Padding options (left, right, none)</li>
              <li>Uppercase/lowercase hex output</li>
              <li>Custom separators (space, dash, underscore, comma)</li>
              <li>Copy to clipboard and download results</li>
              <li>Conversion history (last 10 entries)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinaryToHexadecimalString;