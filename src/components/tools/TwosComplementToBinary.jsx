"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy } from "react-icons/fa";

const TwosComplementToBinary = () => {
  const [decimalInput, setDecimalInput] = useState("");
  const [binaryInput, setBinaryInput] = useState("");
  const [bitLength, setBitLength] = useState(8); // Default to 8-bit
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [inputMode, setInputMode] = useState("decimal"); // "decimal" or "binary"
  const [showSteps, setShowSteps] = useState(true);

  const validateBinary = (binary) => /^[01]+$/.test(binary);

  const padBinary = (binary, length) => binary.padStart(length, "0");

  const decimalToTwosComplement = (decimal, bits) => {
    const maxValue = 2 ** (bits - 1);
    const minValue = -maxValue;

    if (decimal < minValue || decimal >= maxValue) {
      throw new Error(`Value out of range for ${bits}-bit: ${minValue} to ${maxValue - 1}`);
    }

    if (decimal >= 0) {
      return padBinary(decimal.toString(2), bits);
    } else {
      const absBinary = padBinary(Math.abs(decimal).toString(2), bits);
      const inverted = absBinary
        .split("")
        .map((bit) => (bit === "1" ? "0" : "1"))
        .join("");
      const complement = (parseInt(inverted, 2) + 1).toString(2).padStart(bits, "0");
      return complement;
    }
  };

  const twosComplementToDecimal = (binary, bits) => {
    if (binary.length !== bits) {
      throw new Error(`Binary length must be ${bits} bits`);
    }
    if (!validateBinary(binary)) {
      throw new Error("Invalid binary input");
    }

    const isNegative = binary[0] === "1";
    if (isNegative) {
      const inverted = binary
        .split("")
        .map((bit) => (bit === "1" ? "0" : "1"))
        .join("");
      return -(parseInt(inverted, 2) + 1);
    }
    return parseInt(binary, 2);
  };

  const calculate = useCallback(() => {
    setError("");
    setResult(null);

    try {
      if (inputMode === "decimal") {
        const decimal = parseInt(decimalInput, 10);
        if (isNaN(decimal)) throw new Error("Invalid decimal input");
        const binary = decimalToTwosComplement(decimal, bitLength);
        const steps = decimal < 0
          ? [
              `1. Absolute value: ${Math.abs(decimal)} = ${padBinary(Math.abs(decimal).toString(2), bitLength)}`,
              `2. Invert bits: ${padBinary(Math.abs(decimal).toString(2), bitLength).split("").map((bit) => (bit === "1" ? "0" : "1")).join("")}`,
              `3. Add 1: ${binary}`,
            ]
          : ["Direct binary representation"];
        setResult({ decimal, binary, steps });
      } else {
        const binary = padBinary(binaryInput, bitLength);
        const decimal = twosComplementToDecimal(binary, bitLength);
        const steps = binary[0] === "1"
          ? [
              `1. Invert bits: ${binary.split("").map((bit) => (bit === "1" ? "0" : "1")).join("")}`,
              `2. Add 1 and negate: ${decimal}`,
            ]
          : ["Direct binary to decimal conversion"];
        setResult({ decimal, binary, steps });
      }
    } catch (err) {
      setError(err.message);
    }
  }, [decimalInput, binaryInput, bitLength, inputMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    calculate();
  };

  const reset = () => {
    setDecimalInput("");
    setBinaryInput("");
    setBitLength(8);
    setResult(null);
    setError("");
    setInputMode("decimal");
    setShowSteps(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Two's Complement Converter
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Mode Selector */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              type="button"
              onClick={() => setInputMode("decimal")}
              className={`flex-1 py-2 px-4 rounded-md ${inputMode === "decimal" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"} hover:bg-blue-700 hover:text-white transition-colors`}
            >
              Decimal to Binary
            </button>
            <button
              type="button"
              onClick={() => setInputMode("binary")}
              className={`flex-1 py-2 px-4 rounded-md ${inputMode === "binary" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"} hover:bg-blue-700 hover:text-white transition-colors`}
            >
              Binary to Decimal
            </button>
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {inputMode === "decimal" ? "Decimal Number" : "Two's Complement Binary"}
              </label>
              <input
                type="text"
                value={inputMode === "decimal" ? decimalInput : binaryInput}
                onChange={(e) =>
                  inputMode === "decimal"
                    ? setDecimalInput(e.target.value)
                    : setBinaryInput(e.target.value)
                }
                placeholder={inputMode === "decimal" ? "e.g., -5 or 10" : `e.g., ${"1".repeat(bitLength)}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bit Length</label>
              <select
                value={bitLength}
                onChange={(e) => setBitLength(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={4}>4-bit</option>
                <option value={8}>8-bit</option>
                <option value={16}>16-bit</option>
                <option value={32}>32-bit</option>
              </select>
            </div>
          </div>

          {/* Additional Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showSteps}
                onChange={(e) => setShowSteps(e.target.checked)}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Show Conversion Steps</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Convert
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
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Result:</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <p>
                  <span className="font-medium">Decimal:</span> {result.decimal}
                </p>
                <button
                  onClick={() => copyToClipboard(result.decimal.toString())}
                  className="p-1 text-gray-500 hover:text-blue-600"
                >
                  <FaCopy />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p>
                  <span className="font-medium">Binary (Two's Complement):</span> {result.binary}
                </p>
                <button
                  onClick={() => copyToClipboard(result.binary)}
                  className="p-1 text-gray-500 hover:text-blue-600"
                >
                  <FaCopy />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p>
                  <span className="font-medium">Hex:</span>{" "}
                  {parseInt(result.binary, 2)
                    .toString(16)
                    .toUpperCase()
                    .padStart(Math.ceil(bitLength / 4), "0")}
                </p>
                <button
                  onClick={() =>
                    copyToClipboard(
                      parseInt(result.binary, 2)
                        .toString(16)
                        .toUpperCase()
                        .padStart(Math.ceil(bitLength / 4), "0")
                    )
                  }
                  className="p-1 text-gray-500 hover:text-blue-600"
                >
                  <FaCopy />
                </button>
              </div>
              {showSteps && (
                <div>
                  <p className="font-medium">Conversion Steps:</p>
                  <ul className="list-decimal list-inside mt-1 space-y-1">
                    {result.steps.map((step, index) => (
                      <li key={index} className="text-gray-600">{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features & Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert decimal to two's complement binary and vice versa</li>
            <li>Supports 4, 8, 16, or 32-bit lengths</li>
            <li>Shows optional step-by-step conversion</li>
            <li>Copy results to clipboard</li>
            <li>Range: -2^(n-1) to 2^(n-1)-1 (e.g., -128 to 127 for 8-bit)</li>
            <li>Example: -5 (8-bit) = 11111011</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TwosComplementToBinary;