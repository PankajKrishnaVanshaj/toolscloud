"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaCopy, FaDownload } from "react-icons/fa";

const BinaryNOTCalculator = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [bitLength, setBitLength] = useState(8); // Default to 8-bit
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSteps, setShowSteps] = useState(false);
  const [inputFormat, setInputFormat] = useState("binary"); // New: binary, decimal, hex

  // Validate input based on format
  const validateInput = (input, format) => {
    switch (format) {
      case "binary":
        return /^[01]+$/.test(input);
      case "decimal":
        return /^\d+$/.test(input);
      case "hex":
        return /^[0-9A-Fa-f]+$/.test(input);
      default:
        return false;
    }
  };

  // Convert input to binary based on format
  const convertToBinary = (input, format, length) => {
    let decimal;
    switch (format) {
      case "binary":
        decimal = parseInt(input, 2);
        break;
      case "decimal":
        decimal = parseInt(input, 10);
        break;
      case "hex":
        decimal = parseInt(input, 16);
        break;
      default:
        decimal = 0;
    }
    return decimal.toString(2).padStart(length, "0");
  };

  // Pad binary to specified length
  const padBinary = (binary, length) => binary.padStart(length, "0");

  // Convert binary to decimal
  const binaryToDecimal = (binary) => parseInt(binary, 2);

  // Convert decimal to binary with padding
  const decimalToBinary = (decimal, length) =>
    decimal.toString(2).padStart(length, "0");

  // Perform NOT operation
  const performNOT = useCallback(() => {
    setError("");
    setResult(null);

    if (!binaryInput.trim()) {
      setError("Please enter a number");
      return;
    }

    if (!validateInput(binaryInput, inputFormat)) {
      setError(`Invalid ${inputFormat} input`);
      return;
    }

    const binary = convertToBinary(binaryInput, inputFormat, bitLength);
    const decimalInput = binaryToDecimal(binary);
    const mask = (1 << bitLength) - 1; // e.g., for 8-bit: 11111111 (255)
    const notResult = (~decimalInput) & mask;
    const binaryResult = decimalToBinary(notResult, bitLength);

    setResult({
      input: binary,
      decimalInput: decimalInput,
      notResult: notResult,
      binaryResult: binaryResult,
    });
  }, [binaryInput, bitLength, inputFormat]);

  const handleSubmit = (e) => {
    e.preventDefault();
    performNOT();
  };

  const clearInput = () => {
    setBinaryInput("");
    setResult(null);
    setError("");
    setShowSteps(false);
  };

  // Copy result to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Download result as text file
  const downloadResult = () => {
    if (!result) return;
    const content = `
Binary NOT Calculator Result
---------------------------
Input Format: ${inputFormat}
Bit Length: ${bitLength}-bit
Input Binary: ${result.input}
Input Decimal: ${result.decimalInput}
Input Hex: ${result.decimalInput.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), "0")}
NOT Binary: ${result.binaryResult}
NOT Decimal: ${result.notResult}
NOT Hex: ${result.notResult.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), "0")}
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `binary-not-result-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Binary NOT Calculator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Format
              </label>
              <select
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="binary">Binary</option>
                <option value="decimal">Decimal</option>
                <option value="hex">Hexadecimal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {inputFormat.charAt(0).toUpperCase() + inputFormat.slice(1)} Input
              </label>
              <input
                type="text"
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                placeholder={`e.g., ${inputFormat === "binary" ? "1010" : inputFormat === "decimal" ? "10" : "A"}`}
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
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate NOT
            </button>
            <button
              type="button"
              onClick={clearInput}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
            {result && (
              <button
                type="button"
                onClick={downloadResult}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            )}
          </div>
        </form>

        {/* Error Section */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Results:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="font-medium text-gray-700">Input:</p>
                <p>Binary: {result.input} <FaCopy className="inline ml-2 cursor-pointer" onClick={() => copyToClipboard(result.input)} /></p>
                <p>Decimal: {result.decimalInput} <FaCopy className="inline ml-2 cursor-pointer" onClick={() => copyToClipboard(result.decimalInput.toString())} /></p>
                <p>Hex: {result.decimalInput.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), "0")} <FaCopy className="inline ml-2 cursor-pointer" onClick={() => copyToClipboard(result.decimalInput.toString(16).toUpperCase())} /></p>
              </div>
              <div>
                <p className="font-medium text-gray-700">NOT Result (~):</p>
                <p>Binary: {result.binaryResult} <FaCopy className="inline ml-2 cursor-pointer" onClick={() => copyToClipboard(result.binaryResult)} /></p>
                <p>Decimal: {result.notResult} <FaCopy className="inline ml-2 cursor-pointer" onClick={() => copyToClipboard(result.notResult.toString())} /></p>
                <p>Hex: {result.notResult.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), "0")} <FaCopy className="inline ml-2 cursor-pointer" onClick={() => copyToClipboard(result.notResult.toString(16).toUpperCase())} /></p>
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showSteps}
                  onChange={(e) => setShowSteps(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Calculation Steps</span>
              </label>
              {showSteps && (
                <div className="mt-2 p-4 bg-white rounded-md border border-gray-200 font-mono text-xs">
                  <p>Step 1: Input Binary: {result.input}</p>
                  <p>Step 2: Decimal Value: {result.decimalInput}</p>
                  <p>Step 3: Bitwise NOT (~{result.decimalInput}): {~result.decimalInput & 0xFFFFFFFF}</p>
                  <p>Step 4: Mask to {bitLength}-bit ({mask.toString(2).padStart(bitLength, "0")}): {result.notResult}</p>
                  <p>Step 5: Result Binary: {result.binaryResult}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports binary, decimal, and hexadecimal input</li>
            <li>Configurable bit length (4, 8, 16, 32)</li>
            <li>Displays results in binary, decimal, and hex</li>
            <li>Copy results to clipboard</li>
            <li>Download results as text file</li>
            <li>Optional step-by-step calculation view</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryNOTCalculator;