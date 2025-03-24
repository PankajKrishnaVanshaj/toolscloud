"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync } from "react-icons/fa";

const SignedIntegerToBinary = () => {
  const [input, setInput] = useState("");
  const [bitWidth, setBitWidth] = useState(8);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [format, setFormat] = useState("space"); // New: Format binary output
  const bitWidths = [8, 16, 32, 64];

  // Validate input based on bit width
  const validateInput = useCallback(
    (value) => {
      const num = parseInt(value, 10);
      if (isNaN(num)) {
        setError("Please enter a valid integer");
        return false;
      }
      const max = 2 ** (bitWidth - 1) - 1;
      const min = -(2 ** (bitWidth - 1));
      if (num > max || num < min) {
        setError(`Value must be between ${min} and ${max} for ${bitWidth}-bit`);
        return false;
      }
      return true;
    },
    [bitWidth]
  );

  // Convert to two's complement binary
  const toTwosComplement = useCallback((num, bits) => {
    if (num >= 0) {
      return num.toString(2).padStart(bits, "0");
    }
    const absBinary = Math.abs(num).toString(2).padStart(bits, "0");
    const inverted = absBinary
      .split("")
      .map((bit) => (bit === "0" ? "1" : "0"))
      .join("");
    const twosComplement = (parseInt(inverted, 2) + 1)
      .toString(2)
      .padStart(bits, "0");
    return twosComplement;
  }, []);

  // Format binary string
  const formatBinary = (binary) => {
    switch (format) {
      case "space":
        return binary.match(/.{1,4}/g)?.join(" ") || binary;
      case "dash":
        return binary.match(/.{1,4}/g)?.join("-") || binary;
      case "none":
        return binary;
      default:
        return binary;
    }
  };

  // Convert and set result
  const convertToBinary = useCallback(() => {
    setError("");
    setResult(null);

    if (!input.trim()) {
      setError("Please enter a number");
      return;
    }

    if (!validateInput(input)) return;

    const num = parseInt(input, 10);
    const binary = toTwosComplement(num, bitWidth);
    const formattedBinary = formatBinary(binary);
    const decimal = num;
    const hex = parseInt(binary, 2)
      .toString(16)
      .toUpperCase()
      .padStart(Math.ceil(bitWidth / 4), "0");
    const steps = num < 0
      ? {
          absolute: formatBinary(Math.abs(num).toString(2).padStart(bitWidth, "0")),
          inverted: formatBinary(
            binary
              .split("")
              .map((bit) => (bit === "0" ? "1" : "0"))
              .join("")
          ),
          final: formattedBinary,
        }
      : null;

    setResult({ binary: formattedBinary, decimal, hex, steps });
  }, [input, bitWidth, format, validateInput, toTwosComplement]);

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Reset all fields
  const reset = () => {
    setInput("");
    setBitWidth(8);
    setResult(null);
    setError("");
    setFormat("space");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    convertToBinary();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Signed Integer to Binary Converter
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Signed Integer
              </label>
              <input
                type="number"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Range: -${2 ** (bitWidth - 1)} to ${
                  2 ** (bitWidth - 1) - 1
                }`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bit Width
              </label>
              <select
                value={bitWidth}
                onChange={(e) => {
                  setBitWidth(parseInt(e.target.value));
                  setInput("");
                  setResult(null);
                  setError("");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {bitWidths.map((width) => (
                  <option key={width} value={width}>
                    {width}-bit
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="space">Space (e.g., 1111 0000)</option>
                <option value="dash">Dash (e.g., 1111-0000)</option>
                <option value="none">None (e.g., 11110000)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Convert to Binary
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
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
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Results:</h2>
            <div className="space-y-6 text-sm">
              <div className="flex flex-col gap-2">
                <p className="font-medium text-gray-700">Input:</p>
                <p>Decimal: {result.decimal}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-medium text-gray-700">
                  Binary Representation ({bitWidth}-bit):
                </p>
                <div className="flex items-center gap-2">
                  <p>Binary: {result.binary}</p>
                  <button
                    onClick={() => copyToClipboard(result.binary.replace(/\s|-/g, ""))}
                    className="p-1 text-gray-500 hover:text-blue-500"
                  >
                    <FaCopy />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <p>Hex: 0x{result.hex}</p>
                  <button
                    onClick={() => copyToClipboard(result.hex)}
                    className="p-1 text-gray-500 hover:text-blue-500"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>
              {result.steps && (
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-gray-700">
                    Two's Complement Steps (Negative Number):
                  </p>
                  <div className="font-mono text-xs bg-white p-2 rounded border">
                    <p>Absolute: {result.steps.absolute}</p>
                    <p>Inverted: {result.steps.inverted}</p>
                    <p>+1:       {"0".repeat(bitWidth - 1) + "1"}</p>
                    <p className="border-t border-gray-300">
                      {"-".repeat(bitWidth / (format === "none" ? 1 : 4))}
                    </p>
                    <p>Final:    {result.steps.final}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features & Usage */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Converts signed integers to two's complement binary</li>
            <li>Supports 8, 16, 32, and 64-bit widths</li>
            <li>Customizable binary output format (spaces, dashes, none)</li>
            <li>Displays decimal, binary, and hex representations</li>
            <li>Copy binary or hex to clipboard</li>
            <li>Shows two's complement steps for negative numbers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SignedIntegerToBinary;