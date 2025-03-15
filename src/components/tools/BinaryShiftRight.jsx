"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const BinaryShiftRight = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [shiftAmount, setShiftAmount] = useState(1);
  const [bitLength, setBitLength] = useState(8);
  const [shiftType, setShiftType] = useState("unsigned"); // New: Unsigned vs Signed shift
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]); // New: History of operations

  const validateBinary = (binary) => /^[01]+$/.test(binary);

  const padBinary = (binary, length) => binary.padStart(length, "0");

  const binaryToDecimal = (binary) => parseInt(binary, 2);

  const decimalToBinary = (decimal, length) => {
    if (shiftType === "signed" && decimal < 0) {
      // Handle negative numbers for signed shift
      return (decimal >>> 0).toString(2).padStart(length, "1").slice(-length);
    }
    return decimal.toString(2).padStart(length, "0");
  };

  const performShiftRight = useCallback(() => {
    setError("");
    setResult(null);

    if (!binaryInput.trim()) {
      setError("Please enter a binary number");
      return;
    }

    if (!validateBinary(binaryInput)) {
      setError("Invalid binary input: only 0s and 1s allowed");
      return;
    }

    if (shiftAmount < 0) {
      setError("Shift amount must be non-negative");
      return;
    }

    const paddedInput = padBinary(binaryInput, bitLength);
    let decimalInput = binaryToDecimal(paddedInput);
    let shiftedDecimal;

    if (shiftType === "unsigned") {
      shiftedDecimal = decimalInput >>> shiftAmount; // Unsigned right shift
    } else {
      // Signed right shift (arithmetic)
      shiftedDecimal = decimalInput >> shiftAmount;
    }

    const binaryResult = decimalToBinary(shiftedDecimal, bitLength);
    const newResult = {
      input: paddedInput,
      decimalInput,
      shiftAmount,
      shiftType,
      result: shiftedDecimal,
      binaryResult,
    };

    setResult(newResult);
    setHistory((prev) => [...prev, newResult].slice(-5)); // Keep last 5 operations
  }, [binaryInput, shiftAmount, bitLength, shiftType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    performShiftRight();
  };

  const reset = () => {
    setBinaryInput("");
    setShiftAmount(1);
    setBitLength(8);
    setShiftType("unsigned");
    setResult(null);
    setError("");
    setHistory([]);
  };

  const downloadResult = () => {
    if (!result) return;
    const text = `
Binary Shift Right Result:
Input Binary: ${result.input}
Input Decimal: ${result.decimalInput}
Input Hex: ${result.decimalInput.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), "0")}
Shift Type: ${result.shiftType}
Shift Amount: ${result.shiftAmount}
Result Binary: ${result.binaryResult}
Result Decimal: ${result.result}
Result Hex: ${result.result.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), "0")}
`;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `binary-shift-right-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Binary Shift Right Converter
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Binary Number
              </label>
              <input
                type="text"
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                placeholder="e.g., 1010"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Shift Amount
              </label>
              <input
                type="number"
                min="0"
                value={shiftAmount}
                onChange={(e) => setShiftAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
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
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Shift Type
              </label>
              <select
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="unsigned">Unsigned {`(>>>)`}</option>
                <option value="signed">Signed {`(>>)`}</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Perform Shift Right
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              type="button"
              onClick={downloadResult}
              disabled={!result}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Result
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
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Input:</p>
                <p>Binary: {result.input}</p>
                <p>Decimal: {result.decimalInput}</p>
                <p>
                  Hex: {result.decimalInput
                    .toString(16)
                    .toUpperCase()
                    .padStart(Math.ceil(bitLength / 4), "0")}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">
                  Shift Right by {result.shiftAmount} ({result.shiftType}):
                </p>
                <p>Binary: {result.binaryResult}</p>
                <p>Decimal: {result.result}</p>
                <p>
                  Hex: {result.result
                    .toString(16)
                    .toUpperCase()
                    .padStart(Math.ceil(bitLength / 4), "0")}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="font-medium text-gray-700">Visualization:</p>
              <div className="font-mono text-xs bg-white p-2 rounded-md border">
                <p>{result.input} (Input)</p>
                <p>
                  {">".repeat(result.shiftAmount) +
                    " ".repeat(bitLength - result.shiftAmount)}
                </p>
                <p>{result.binaryResult} (Result)</p>
              </div>
            </div>
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">History (Last 5)</h2>
            <ul className="space-y-2 text-sm text-blue-600">
              {history
                .slice()
                .reverse()
                .map((entry, index) => (
                  <li key={index}>
                    {`${entry.input} >>${entry.shiftType === "unsigned" ? ">" : ""} ${
                      entry.shiftAmount
                    } = ${entry.binaryResult} (Dec: ${entry.result})`}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h2 className="text-lg font-semibold text-green-800 mb-2">Features</h2>
          <ul className="list-disc list-inside text-sm text-green-600 space-y-1">
            <li>Supports unsigned {`(>>>) and signed (>>)`} right shifts</li>
            <li>Configurable bit lengths: 4, 8, 16, 32 bits</li>
            <li>Custom shift amount with real-time visualization</li>
            <li>Displays results in binary, decimal, and hex</li>
            <li>Operation history (last 5 shifts)</li>
            <li>Download results as a text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryShiftRight;