"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaCopy } from "react-icons/fa";

const BinarySubtractionCalculator = () => {
  const [minuend, setMinuend] = useState("");
  const [subtrahend, setSubtrahend] = useState("");
  const [bitLength, setBitLength] = useState(8);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [steps, setSteps] = useState([]);
  const [showSteps, setShowSteps] = useState(true);
  const [displayMode, setDisplayMode] = useState("all"); // all, binary, decimal, hex

  const validateBinary = (binary) => /^[01]+$/.test(binary);

  const padBinary = (binary, length) => binary.padStart(length, "0");

  const binaryToDecimal = (binary) => parseInt(binary, 2);

  const decimalToBinary = (decimal, length) => {
    if (decimal < 0) {
      const positiveBinary = (Math.pow(2, length) + decimal).toString(2);
      return padBinary(positiveBinary, length);
    }
    return padBinary(decimal.toString(2), length);
  };

  const performBinarySubtraction = useCallback(() => {
    setError("");
    setResult(null);
    setSteps([]);

    if (!minuend || !subtrahend) {
      setError("Please enter both binary numbers");
      return;
    }

    if (!validateBinary(minuend) || !validateBinary(subtrahend)) {
      setError("Invalid binary input: only 0s and 1s are allowed");
      return;
    }

    const paddedMinuend = padBinary(minuend, bitLength);
    const paddedSubtrahend = padBinary(subtrahend, bitLength);

    const decMinuend = binaryToDecimal(paddedMinuend);
    const decSubtrahend = binaryToDecimal(paddedSubtrahend);
    const decResult = decMinuend - decSubtrahend;

    const stepsArray = [];
    stepsArray.push(`1. Minuend: ${paddedMinuend} (${decMinuend} decimal)`);
    stepsArray.push(`2. Subtrahend: ${paddedSubtrahend} (${decSubtrahend} decimal)`);

    const subtrahendComplement = decimalToBinary(-decSubtrahend, bitLength);
    stepsArray.push(`3. Two's Complement of Subtrahend: ${subtrahendComplement}`);

    let carry = 0;
    let binaryResult = "";
    for (let i = bitLength - 1; i >= 0; i--) {
      const m = parseInt(paddedMinuend[i]);
      const s = parseInt(subtrahendComplement[i]);
      const sum = m + s + carry;
      binaryResult = (sum % 2) + binaryResult;
      carry = Math.floor(sum / 2);
    }
    binaryResult = binaryResult.slice(-bitLength);
    stepsArray.push(`4. Addition (Minuend + Complement): ${binaryResult}`);

    const finalDecimal = binaryToDecimal(binaryResult);
    const hexResult =
      finalDecimal < 0
        ? (Math.pow(2, bitLength) + finalDecimal)
            .toString(16)
            .toUpperCase()
            .padStart(bitLength / 4, "0")
        : finalDecimal.toString(16).toUpperCase().padStart(bitLength / 4, "0");

    setResult({
      minuend: paddedMinuend,
      subtrahend: paddedSubtrahend,
      binaryResult,
      decimalResult: finalDecimal,
      hexResult,
    });
    setSteps(stepsArray);
  }, [minuend, subtrahend, bitLength]);

  const handleSubmit = (e) => {
    e.preventDefault();
    performBinarySubtraction();
  };

  const reset = () => {
    setMinuend("");
    setSubtrahend("");
    setBitLength(8);
    setResult(null);
    setError("");
    setSteps([]);
    setShowSteps(true);
    setDisplayMode("all");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary Subtraction Calculator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minuend (First Number)
              </label>
              <input
                type="text"
                value={minuend}
                onChange={(e) => setMinuend(e.target.value)}
                placeholder="e.g., 1010"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtrahend (Second Number)
              </label>
              <input
                type="text"
                value={subtrahend}
                onChange={(e) => setSubtrahend(e.target.value)}
                placeholder="e.g., 0011"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bit Length
              </label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Mode
              </label>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Formats</option>
                <option value="binary">Binary Only</option>
                <option value="decimal">Decimal Only</option>
                <option value="hex">Hex Only</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
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
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Results</h2>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <p className="font-medium">Inputs:</p>
                <p>Minuend: {result.minuend} ({binaryToDecimal(result.minuend)} decimal)</p>
                <p>Subtrahend: {result.subtrahend} ({binaryToDecimal(result.subtrahend)} decimal)</p>
              </div>
              <div>
                <p className="font-medium flex items-center">
                  Result:
                  <button
                    onClick={() => copyToClipboard(result.binaryResult)}
                    className="ml-2 p-1 text-blue-500 hover:text-blue-700"
                    title="Copy Binary Result"
                  >
                    <FaCopy />
                  </button>
                </p>
                {(displayMode === "all" || displayMode === "binary") && (
                  <p>Binary: {result.binaryResult}</p>
                )}
                {(displayMode === "all" || displayMode === "decimal") && (
                  <p>Decimal: {result.decimalResult}</p>
                )}
                {(displayMode === "all" || displayMode === "hex") && (
                  <p>Hex: {result.hexResult}</p>
                )}
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showSteps}
                    onChange={(e) => setShowSteps(e.target.checked)}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="font-medium">Show Step-by-Step Process</span>
                </label>
                {showSteps && (
                  <div className="font-mono text-xs mt-2 bg-white p-2 rounded border">
                    {steps.map((step, index) => (
                      <p key={index}>{step}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Binary subtraction using two's complement</li>
            <li>Supports 4, 8, 16, or 32-bit representations</li>
            <li>Customizable display: Binary, Decimal, Hex</li>
            <li>Step-by-step process toggle</li>
            <li>Copy result to clipboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinarySubtractionCalculator;