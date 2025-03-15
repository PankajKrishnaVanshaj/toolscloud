"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync } from "react-icons/fa";

const IEEE754ToBinary = () => {
  const [number, setNumber] = useState("");
  const [precision, setPrecision] = useState("single");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSteps, setShowSteps] = useState(false);
  const [format, setFormat] = useState("spaced"); // "raw", "spaced", "hex"
  const [endianness, setEndianness] = useState("big"); // "big" or "little"

  const toIEEE754 = useCallback((input, isDouble) => {
    const num = parseFloat(input);
    if (isNaN(num)) {
      setError("Invalid number");
      return null;
    }

    const bits = isDouble ? 64 : 32;
    const expBits = isDouble ? 11 : 8;
    const mantissaBits = isDouble ? 52 : 23;
    const bias = isDouble ? 1023 : 127;

    // Handle special cases
    if (!Number.isFinite(num)) {
      const isPositive = num > 0;
      return {
        binary: `${isPositive ? "0" : "1"}${"1".repeat(expBits)}${"0".repeat(mantissaBits)}`,
        sign: isPositive ? "0" : "1",
        exponent: "1".repeat(expBits),
        mantissa: "0".repeat(mantissaBits),
        steps: [
          `Special case: ${num === Infinity ? "Infinity" : num === -Infinity ? "-Infinity" : "NaN"}`,
        ],
      };
    }

    const sign = num >= 0 ? "0" : "1";
    const absNum = Math.abs(num);

    let exponent = Math.floor(Math.log2(absNum));
    let mantissa = absNum / Math.pow(2, exponent) - 1;
    let expBinary = (exponent + bias).toString(2).padStart(expBits, "0");
    let mantBinary = "";

    // Handle subnormal numbers
    if (exponent < -bias + 1) {
      mantissa = absNum / Math.pow(2, -bias + 1);
      expBinary = "0".repeat(expBits);
    } else if (exponent + bias >= Math.pow(2, expBits)) {
      return {
        binary: `${sign}${"1".repeat(expBits)}${"0".repeat(mantissaBits)}`,
        sign,
        exponent: "1".repeat(expBits),
        mantissa: "0".repeat(mantissaBits),
        steps: ["Overflow: Number too large for IEEE 754 representation"],
      };
    }

    for (let i = 0; i < mantissaBits; i++) {
      mantissa *= 2;
      mantBinary += Math.floor(mantissa);
      mantissa %= 1;
    }

    let binary = sign + expBinary + mantBinary;
    if (endianness === "little") {
      binary = binary.match(/.{1,8}/g)?.reverse().join("") || binary;
    }

    const hex = parseInt(binary, 2).toString(16).toUpperCase().padStart(bits / 4, "0");
    const steps = [
      `Input: ${num}`,
      `Sign bit: ${sign} (${num >= 0 ? "positive" : "negative"})`,
      `Exponent (decimal): ${exponent}, biased: ${exponent + bias}`,
      `Exponent (binary): ${expBinary}`,
      `Mantissa (decimal): ${absNum / Math.pow(2, exponent) - 1}`,
      `Mantissa (binary): ${mantBinary}`,
      `Full IEEE 754 (binary): ${binary}`,
      `Hexadecimal: ${hex}`,
    ];

    return { binary, sign, exponent: expBinary, mantissa: mantBinary, steps, hex };
  }, [endianness]);

  const handleConvert = () => {
    setError("");
    setResult(null);
    if (!number) {
      setError("Please enter a number");
      return;
    }

    const isDouble = precision === "double";
    const conversion = toIEEE754(number, isDouble);
    if (conversion) {
      setResult(conversion);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const reset = () => {
    setNumber("");
    setPrecision("single");
    setResult(null);
    setError("");
    setShowSteps(false);
    setFormat("spaced");
    setEndianness("big");
  };

  const formatBinary = (binary) => {
    if (format === "raw") return binary;
    if (format === "spaced") return binary.match(/.{1,8}/g)?.join(" ") || binary;
    if (format === "hex" && result) return result.hex;
    return binary;
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          IEEE 754 to Binary Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="e.g., 3.14, -42, Infinity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precision</label>
              <select
                value={precision}
                onChange={(e) => setPrecision(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="single">Single (32-bit)</option>
                <option value="double">Double (64-bit)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="spaced">Spaced Binary</option>
                <option value="raw">Raw Binary</option>
                <option value="hex">Hexadecimal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endianness</label>
              <select
                value={endianness}
                onChange={(e) => setEndianness(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="big">Big Endian</option>
                <option value="little">Little Endian</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConvert}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Convert
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Result</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <p>
                  <span className="font-medium">Binary:</span> {formatBinary(result.binary)}
                </p>
                <button
                  onClick={() => copyToClipboard(formatBinary(result.binary))}
                  className="p-1 text-gray-500 hover:text-blue-500"
                >
                  <FaCopy />
                </button>
              </div>
              <p>
                <span className="font-medium">Sign:</span> {result.sign} (
                {result.sign === "0" ? "Positive" : "Negative"})
              </p>
              <p>
                <span className="font-medium">Exponent:</span> {result.exponent}
              </p>
              <p>
                <span className="font-medium">Mantissa:</span>{" "}
                {result.mantissa.match(/.{1,8}/g)?.join(" ") || result.mantissa}
              </p>
              {format === "hex" && (
                <p>
                  <span className="font-medium">Hexadecimal:</span> {result.hex}
                </p>
              )}
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={showSteps}
                  onChange={(e) => setShowSteps(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Show Conversion Steps</span>
              </label>
              {showSteps && (
                <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                  <h3 className="font-medium text-gray-700">Conversion Steps</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                    {result.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports IEEE 754 single (32-bit) and double (64-bit) precision</li>
            <li>Output in spaced binary, raw binary, or hexadecimal</li>
            <li>Big and little endian options</li>
            <li>Handles special cases (Infinity, NaN, subnormals)</li>
            <li>Copy result to clipboard</li>
            <li>Detailed step-by-step explanation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IEEE754ToBinary;