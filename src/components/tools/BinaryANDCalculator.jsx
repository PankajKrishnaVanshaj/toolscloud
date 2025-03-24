"use client";
import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaSync, FaCalculator } from "react-icons/fa";

const BinaryANDCalculator = () => {
  const [inputs, setInputs] = useState(["", ""]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [bitLength, setBitLength] = useState(8);
  const [displayMode, setDisplayMode] = useState("all"); // binary, decimal, hex, all
  const [isCalculating, setIsCalculating] = useState(false);

  const validateBinary = (binary) => /^[01]+$/.test(binary);

  const padBinary = (binary, length) => binary.padStart(length, "0");

  const binaryToDecimal = (binary) => parseInt(binary, 2);

  const decimalToBinary = (decimal, length) => decimal.toString(2).padStart(length, "0");

  const performBitwiseAND = useCallback(() => {
    setError("");
    setResult(null);
    setIsCalculating(true);

    const validInputs = inputs.filter((input) => input.trim() !== "");
    if (validInputs.length < 2) {
      setError("Please enter at least two binary numbers");
      setIsCalculating(false);
      return;
    }

    for (const input of validInputs) {
      if (!validateBinary(input)) {
        setError(`Invalid binary input: ${input}`);
        setIsCalculating(false);
        return;
      }
    }

    const decimals = validInputs.map((binary) => binaryToDecimal(binary));
    const andResult = decimals.reduce((acc, curr) => acc & curr);
    const paddedInputs = validInputs.map((binary) => padBinary(binary, bitLength));
    const binaryResult = decimalToBinary(andResult, bitLength);

    setTimeout(() => {
      setResult({
        inputs: paddedInputs,
        decimals: decimals,
        result: andResult,
        binaryResult: binaryResult,
      });
      setIsCalculating(false);
    }, 500); // Simulate processing delay
  }, [inputs, bitLength]);

  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const addInput = () => setInputs([...inputs, ""]);

  const removeInput = (index) => {
    if (inputs.length > 2) {
      setInputs(inputs.filter((_, i) => i !== index));
    }
  };

  const reset = () => {
    setInputs(["", ""]);
    setResult(null);
    setError("");
    setBitLength(8);
    setDisplayMode("all");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performBitwiseAND();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Binary AND Calculator
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
                  disabled={isCalculating}
                />
                {inputs.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeInput(index)}
                    className="flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-400"
                    disabled={isCalculating}
                  >
                    <FaTrash className="mr-1" /> Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addInput}
              className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400 w-full sm:w-auto"
              disabled={isCalculating}
            >
              <FaPlus className="mr-2" /> Add Input
            </button>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                Display Mode
              </label>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCalculating}
              >
                <option value="all">All Formats</option>
                <option value="binary">Binary Only</option>
                <option value="decimal">Decimal Only</option>
                <option value="hex">Hex Only</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              disabled={isCalculating}
            >
              {isCalculating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <FaCalculator className="mr-2" />
              )}
              {isCalculating ? "Calculating..." : "Calculate Bitwise AND"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              disabled={isCalculating}
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
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Inputs (Padded):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.inputs.map((input, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="font-mono">{input}</span>
                      {displayMode !== "binary" && (
                        <span className="text-gray-500">
                          (dec: {result.decimals[index]})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-700">Bitwise AND Result:</p>
                <div className="flex flex-col gap-2">
                  {(displayMode === "all" || displayMode === "binary") && (
                    <p>Binary: <span className="font-mono">{result.binaryResult}</span></p>
                  )}
                  {(displayMode === "all" || displayMode === "decimal") && (
                    <p>Decimal: {result.result}</p>
                  )}
                  {(displayMode === "all" || displayMode === "hex") && (
                    <p>
                      Hex: {result.result.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), "0")}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-700">Operation Visualization:</p>
                <div className="font-mono text-xs bg-white p-2 rounded shadow">
                  {result.inputs.map((input, index) => (
                    <p key={index}>{input} ({index + 1})</p>
                  ))}
                  <p className="border-t border-gray-300">{"-".repeat(bitLength)}</p>
                  <p>{result.binaryResult} (AND)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features & Usage */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Perform bitwise AND on multiple binary numbers</li>
            <li>Supports 4, 8, 16, or 32-bit representations</li>
            <li>Dynamic input addition/removal</li>
            <li>Customizable display: Binary, Decimal, Hex, or All</li>
            <li>Visualizes the AND operation</li>
            <li>Example: 1010 & 1100 = 1000 (10 & 12 = 8)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryANDCalculator;