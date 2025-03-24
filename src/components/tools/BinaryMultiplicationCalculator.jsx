"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const BinaryMultiplicationCalculator = () => {
  const [num1, setNum1] = useState("");
  const [num2, setNum2] = useState("");
  const [bitLength, setBitLength] = useState(8);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSteps, setShowSteps] = useState(true);
  const [format, setFormat] = useState("binary"); // New: Result format option
  const [isCalculating, setIsCalculating] = useState(false);

  const validateBinary = (binary) => /^[01]+$/.test(binary);

  const padBinary = (binary, length) => binary.padStart(length, "0");

  const binaryToDecimal = (binary) => parseInt(binary, 2);

  const decimalToBinary = (decimal, length) => decimal.toString(2).padStart(length, "0");

  const multiplyBinary = useCallback(() => {
    setError("");
    setResult(null);
    setIsCalculating(true);

    if (!num1 || !num2) {
      setError("Please enter both binary numbers");
      setIsCalculating(false);
      return;
    }
    if (!validateBinary(num1) || !validateBinary(num2)) {
      setError("Invalid binary input: only 0s and 1s are allowed");
      setIsCalculating(false);
      return;
    }

    const dec1 = binaryToDecimal(num1);
    const dec2 = binaryToDecimal(num2);
    const product = dec1 * dec2;
    const maxValue = Math.pow(2, bitLength) - 1;

    if (product > maxValue) {
      setError(`Result exceeds ${bitLength}-bit limit (${maxValue})`);
      setIsCalculating(false);
      return;
    }

    const steps = [];
    const paddedNum1 = padBinary(num1, bitLength);
    const paddedNum2 = padBinary(num2, bitLength);
    const intermediates = [];

    for (let i = num2.length - 1; i >= 0; i--) {
      if (num2[i] === "1") {
        const shifted = paddedNum1 + "0".repeat(num2.length - 1 - i);
        intermediates.push(shifted.padStart(bitLength + num2.length - 1, "0"));
      }
    }

    let currentSum = intermediates.length > 0 ? binaryToDecimal(intermediates[0]) : 0;
    steps.push(`Step 1: ${intermediates[0] || "0".repeat(bitLength)}`);

    for (let i = 1; i < intermediates.length; i++) {
      currentSum += binaryToDecimal(intermediates[i]);
      steps.push(
        `Step ${i + 1}: + ${intermediates[i]} = ${decimalToBinary(currentSum, bitLength)}`
      );
    }

    const binaryResult = decimalToBinary(product, bitLength);

    setResult({
      num1: paddedNum1,
      num2: paddedNum2,
      decimalNum1: dec1,
      decimalNum2: dec2,
      product: product,
      binaryResult: binaryResult,
      hexResult: product.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), "0"),
      steps: steps,
    });
    setIsCalculating(false);
  }, [num1, num2, bitLength]);

  const handleSubmit = (e) => {
    e.preventDefault();
    multiplyBinary();
  };

  const reset = () => {
    setNum1("");
    setNum2("");
    setBitLength(8);
    setResult(null);
    setError("");
    setShowSteps(true);
    setFormat("binary");
  };

  const downloadResult = () => {
    if (!result) return;
    const text = [
      `Binary Multiplication Result (${bitLength}-bit):`,
      `Input 1: ${result.num1} (Decimal: ${result.decimalNum1})`,
      `Input 2: ${result.num2} (Decimal: ${result.decimalNum2})`,
      `Product:`,
      `- Binary: ${result.binaryResult}`,
      `- Decimal: ${result.product}`,
      `- Hex: ${result.hexResult}`,
      showSteps && result.steps.length > 0
        ? `\nSteps:\n${result.steps.join("\n")}`
        : "",
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `binary-multiplication-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary Multiplication Calculator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Binary Number
              </label>
              <input
                type="text"
                value={num1}
                onChange={(e) => setNum1(e.target.value)}
                placeholder="e.g., 1010"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCalculating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Second Binary Number
              </label>
              <input
                type="text"
                value={num2}
                onChange={(e) => setNum2(e.target.value)}
                placeholder="e.g., 1100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCalculating}
              />
            </div>
          </div>

          {/* Options Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bit Length
              </label>
              <select
                value={bitLength}
                onChange={(e) => setBitLength(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCalculating}
              >
                <option value={4}>4-bit</option>
                <option value={8}>8-bit</option>
                <option value={16}>16-bit</option>
                <option value={32}>32-bit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Result Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCalculating}
              >
                <option value="binary">Binary</option>
                <option value="decimal">Decimal</option>
                <option value="hex">Hexadecimal</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showSteps}
                onChange={(e) => setShowSteps(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isCalculating}
              />
              <label className="text-sm font-medium text-gray-700">
                Show Steps
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isCalculating}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" />
              {isCalculating ? "Calculating..." : "Calculate"}
            </button>
            <button
              onClick={reset}
              disabled={isCalculating}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadResult}
              disabled={!result || isCalculating}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
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
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Inputs:</p>
                <p>
                  {result.num1} (Decimal: {result.decimalNum1})
                </p>
                <p>
                  × {result.num2} (Decimal: {result.decimalNum2})
                </p>
              </div>
              <div>
                <p className="font-medium">Product:</p>
                {format === "binary" && <p>Binary: {result.binaryResult}</p>}
                {format === "decimal" && <p>Decimal: {result.product}</p>}
                {format === "hex" && <p>Hex: {result.hexResult}</p>}
                <p className="text-xs text-gray-500">
                  All formats - Binary: {result.binaryResult}, Decimal: {result.product}, Hex:{" "}
                  {result.hexResult}
                </p>
              </div>
              {showSteps && result.steps.length > 0 && (
                <div>
                  <p className="font-medium">Multiplication Steps:</p>
                  <div className="font-mono text-xs bg-white p-2 rounded-md shadow-sm space-y-1">
                    {result.steps.map((step, index) => (
                      <p key={index}>{step}</p>
                    ))}
                    <p className="border-t border-gray-300 pt-1">
                      Result: {result.binaryResult}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiply binary numbers with 4, 8, 16, or 32-bit options</li>
            <li>Customizable result format (Binary, Decimal, Hex)</li>
            <li>Detailed step-by-step multiplication process</li>
            <li>Overflow detection</li>
            <li>Download results as a text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryMultiplicationCalculator;