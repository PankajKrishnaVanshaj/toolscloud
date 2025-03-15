"use client";
import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaDownload, FaSync } from "react-icons/fa";

const BinaryParityChecker = () => {
  const [inputs, setInputs] = useState([""]);
  const [parityType, setParityType] = useState("even");
  const [bitLength, setBitLength] = useState(8);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [showBinaryWithParity, setShowBinaryWithParity] = useState(true);
  const [exportFormat, setExportFormat] = useState("text");

  // Validation and utility functions
  const validateBinary = (binary) => /^[01]+$/.test(binary);
  const padBinary = (binary, length) => binary.padStart(length, "0");
  const countOnes = (binary) =>
    binary.split("").reduce((sum, bit) => sum + parseInt(bit), 0);
  const checkParity = (binary) => {
    const ones = countOnes(binary);
    const isEven = ones % 2 === 0;
    return {
      ones,
      isEven,
      parityBit: parityType === "even" ? (isEven ? "0" : "1") : (isEven ? "1" : "0"),
    };
  };

  // Calculate parity
  const calculateParity = useCallback(() => {
    setError("");
    setResults([]);

    const validInputs = inputs.filter((input) => input.trim() !== "");
    if (validInputs.length === 0) {
      setError("Please enter at least one binary number");
      return;
    }

    const newResults = [];
    for (const input of validInputs) {
      if (!validateBinary(input)) {
        setError(`Invalid binary input: ${input}`);
        return;
      }
      const paddedBinary = padBinary(input, bitLength);
      const decimal = parseInt(paddedBinary, 2);
      const parity = checkParity(paddedBinary);
      newResults.push({
        original: input,
        padded: paddedBinary,
        decimal,
        ...parity,
      });
    }
    setResults(newResults);
  }, [inputs, parityType, bitLength]);

  // Handle input changes
  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const addInput = () => setInputs([...inputs, ""]);
  const removeInput = (index) => {
    if (inputs.length > 1) {
      setInputs(inputs.filter((_, i) => i !== index));
    }
  };

  // Reset form
  const resetForm = () => {
    setInputs([""]);
    setParityType("even");
    setBitLength(8);
    setResults([]);
    setError("");
    setShowBinaryWithParity(true);
    setExportFormat("text");
  };

  // Export results
  const exportResults = () => {
    if (!results.length) return;

    let content;
    if (exportFormat === "json") {
      content = JSON.stringify(results, null, 2);
    } else {
      content = results
        .map((r, i) => {
          const lines = [
            `Input ${i + 1}: ${r.original}`,
            `Padded Binary: ${r.padded}`,
            `Decimal: ${r.decimal}`,
            `Number of 1s: ${r.ones}`,
            `Parity: ${r.isEven ? "Even" : "Odd"}`,
            `${parityType === "even" ? "Even" : "Odd"} Parity Bit: ${r.parityBit}`,
          ];
          if (showBinaryWithParity) {
            lines.push(`With Parity: ${r.padded + r.parityBit}`);
          }
          return lines.join("\n");
        })
        .join("\n\n");
    }

    const blob = new Blob([content], {
      type: exportFormat === "json" ? "application/json" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `parity-results-${Date.now()}.${exportFormat === "json" ? "json" : "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateParity();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Binary Parity Checker
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            {inputs.map((input, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={`Binary ${index + 1} (e.g., 1010)`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {inputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInput(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addInput}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <FaPlus /> Add Input
            </button>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parity Type
              </label>
              <select
                value={parityType}
                onChange={(e) => setParityType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="even">Even Parity</option>
                <option value="odd">Odd Parity</option>
              </select>
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
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="text">Text (.txt)</option>
                <option value="json">JSON (.json)</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showBinaryWithParity}
                  onChange={(e) => setShowBinaryWithParity(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Binary with Parity</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Check Parity
            </button>
            <button
              type="button"
              onClick={exportResults}
              disabled={!results.length}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Export Results
            </button>
            <button
              type="button"
              onClick={resetForm}
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
        {results.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Parity Results:</h2>
            <div className="space-y-4 text-sm">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="p-3 bg-white rounded-md shadow-sm border border-gray-200"
                >
                  <p>
                    <span className="font-medium">Input:</span> {result.original}
                  </p>
                  <p>
                    <span className="font-medium">Padded Binary:</span> {result.padded}
                  </p>
                  <p>
                    <span className="font-medium">Decimal:</span> {result.decimal}
                  </p>
                  <p>
                    <span className="font-medium">Number of 1s:</span> {result.ones}
                  </p>
                  <p>
                    <span className="font-medium">Parity:</span>{" "}
                    {result.isEven ? "Even" : "Odd"}
                  </p>
                  <p>
                    <span className="font-medium">
                      {parityType === "even" ? "Even" : "Odd"} Parity Bit:
                    </span>{" "}
                    {result.parityBit}
                    {showBinaryWithParity && (
                      <span className="ml-2 text-gray-500">
                        (With parity: {result.padded + result.parityBit})
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports multiple binary inputs</li>
            <li>Configurable even/odd parity and bit length (4, 8, 16, 32)</li>
            <li>Dynamic input addition/removal</li>
            <li>Export results as Text or JSON</li>
            <li>Option to show binary with parity bit</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryParityChecker;