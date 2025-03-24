"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaCopy } from "react-icons/fa";

const BinaryToChecksum = () => {
  const [input, setInput] = useState("");
  const [checksumType, setChecksumType] = useState("8bit");
  const [inputFormat, setInputFormat] = useState("binary");
  const [outputFormat, setOutputFormat] = useState("all"); // all, binary, hex, decimal
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSteps, setShowSteps] = useState(true);

  const checksumAlgorithms = {
    "8bit": {
      name: "8-bit Checksum",
      calculate: (bytes) => {
        let sum = 0;
        for (const byte of bytes) {
          sum = (sum + byte) & 0xFF;
        }
        return sum;
      },
      byteSize: 1,
    },
    "16bit": {
      name: "16-bit Checksum",
      calculate: (bytes) => {
        let sum = 0;
        for (let i = 0; i < bytes.length; i += 2) {
          const word = (bytes[i] << 8) + (bytes[i + 1] || 0);
          sum = (sum + word) & 0xFFFF;
        }
        return sum;
      },
      byteSize: 2,
    },
    "xor": {
      name: "XOR Checksum",
      calculate: (bytes) => {
        let xor = 0;
        for (const byte of bytes) {
          xor ^= byte;
        }
        return xor;
      },
      byteSize: 1,
    },
    "crc8": {
      name: "CRC-8",
      calculate: (bytes) => {
        let crc = 0;
        const polynomial = 0x07; // CRC-8 polynomial
        for (const byte of bytes) {
          crc ^= byte;
          for (let i = 0; i < 8; i++) {
            crc = crc & 0x80 ? (crc << 1) ^ polynomial : crc << 1;
            crc &= 0xFF;
          }
        }
        return crc;
      },
      byteSize: 1,
    },
  };

  const parseInput = useCallback((input) => {
    setError("");
    let bytes = [];

    switch (inputFormat) {
      case "binary":
        if (!/^[01\s]+$/.test(input)) {
          setError("Invalid binary input: Use only 0s, 1s, and spaces");
          return null;
        }
        const binaryChunks = input.replace(/\s+/g, "").match(/.{1,8}/g) || [];
        bytes = binaryChunks.map((chunk) => parseInt(chunk.padEnd(8, "0"), 2));
        break;
      case "hex":
        if (!/^[0-9A-Fa-f\s]+$/.test(input)) {
          setError("Invalid hex input: Use only 0-9, A-F, and spaces");
          return null;
        }
        const hexPairs = input.replace(/\s+/g, "").match(/.{1,2}/g) || [];
        bytes = hexPairs.map((pair) => parseInt(pair.padStart(2, "0"), 16));
        break;
      case "text":
        bytes = Array.from(input).map((char) => char.charCodeAt(0));
        break;
      default:
        setError("Invalid input format");
        return null;
    }
    return bytes;
  }, [inputFormat]);

  const calculateChecksum = useCallback(() => {
    setResult(null);
    setError("");

    if (!input.trim()) {
      setError("Please enter some input");
      return;
    }

    const bytes = parseInput(input);
    if (!bytes) return;

    const algorithm = checksumAlgorithms[checksumType];
    const checksum = algorithm.calculate(bytes);
    const checksumBinary = checksum
      .toString(2)
      .padStart(algorithm.byteSize * 8, "0");
    const checksumHex = checksum
      .toString(16)
      .toUpperCase()
      .padStart(algorithm.byteSize * 2, "0");

    setResult({
      bytes,
      checksum,
      checksumBinary,
      checksumHex,
      steps: bytes.map((byte, index) => ({
        byte: byte.toString(2).padStart(8, "0"),
        decimal: byte,
        step: index === 0 ? byte : algorithm.calculate(bytes.slice(0, index + 1)),
      })),
    });
  }, [input, checksumType, inputFormat]);

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateChecksum();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const downloadResult = () => {
    if (!result) return;
    const content = `
Input Format: ${inputFormat}
Checksum Type: ${checksumAlgorithms[checksumType].name}
Input: ${input}
Checksum (Binary): ${result.checksumBinary}
Checksum (Hex): ${result.checksumHex}
Checksum (Decimal): ${result.checksum}
    `.trim();
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `checksum-result-${Date.now()}.txt`;
    link.click();
  };

  const reset = () => {
    setInput("");
    setChecksumType("8bit");
    setInputFormat("binary");
    setOutputFormat("all");
    setResult(null);
    setError("");
    setShowSteps(true);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary to Checksum Converter
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  inputFormat === "binary"
                    ? "e.g., 10101010 11001100"
                    : inputFormat === "hex"
                    ? "e.g., AA CC"
                    : "e.g., Hello World"
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Format
                </label>
                <select
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="binary">Binary (0s and 1s)</option>
                  <option value="hex">Hexadecimal</option>
                  <option value="text">Text (ASCII)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Checksum Type
                </label>
                <select
                  value={checksumType}
                  onChange={(e) => setChecksumType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(checksumAlgorithms).map(([key, { name }]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All (Binary, Hex, Decimal)</option>
                  <option value="binary">Binary Only</option>
                  <option value="hex">Hex Only</option>
                  <option value="decimal">Decimal Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate Checksum
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

        {/* Error Section */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Checksum Result</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Input Bytes:</p>
                <p>
                  Binary: {result.bytes.map((b) => b.toString(2).padStart(8, "0")).join(" ")}
                </p>
                <p>
                  Hex:{" "}
                  {result.bytes.map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ")}
                </p>
                <p>Decimal: {result.bytes.join(" ")}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Checksum:</p>
                {(outputFormat === "all" || outputFormat === "binary") && (
                  <p className="flex items-center">
                    Binary: {result.checksumBinary}
                    <FaCopy
                      className="ml-2 cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => copyToClipboard(result.checksumBinary)}
                    />
                  </p>
                )}
                {(outputFormat === "all" || outputFormat === "hex") && (
                  <p className="flex items-center">
                    Hex: {result.checksumHex}
                    <FaCopy
                      className="ml-2 cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => copyToClipboard(result.checksumHex)}
                    />
                  </p>
                )}
                {(outputFormat === "all" || outputFormat === "decimal") && (
                  <p className="flex items-center">
                    Decimal: {result.checksum}
                    <FaCopy
                      className="ml-2 cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => copyToClipboard(result.checksum.toString())}
                    />
                  </p>
                )}
              </div>
              {showSteps && (
                <div>
                  <p className="font-medium text-gray-700 mb-2">Calculation Steps:</p>
                  <div className="font-mono text-xs overflow-x-auto bg-white p-2 rounded border">
                    {result.steps.map((step, index) => (
                      <p key={index}>
                        {step.byte} ({step.decimal}) →{" "}
                        {step.step.toString(2).padStart(checksumAlgorithms[checksumType].byteSize * 8, "0")}{" "}
                        ({step.step})
                      </p>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showSteps}
                    onChange={(e) => setShowSteps(e.target.checked)}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Show Steps</span>
                </label>
                <button
                  onClick={downloadResult}
                  className="flex items-center py-1 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FaDownload className="mr-2" /> Download Result
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports 8-bit, 16-bit, XOR, and CRC-8 checksums</li>
            <li>Input formats: Binary, Hex, Text (ASCII)</li>
            <li>Customizable output: Binary, Hex, Decimal, or All</li>
            <li>Detailed calculation steps (toggleable)</li>
            <li>Copy results to clipboard</li>
            <li>Download result as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToChecksum;