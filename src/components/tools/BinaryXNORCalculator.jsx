"use client";
import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaSync } from "react-icons/fa";

const BinaryXNORCalculator = () => {
  const [inputs, setInputs] = useState(["", ""]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [bitLength, setBitLength] = useState(8);
  const [displayMode, setDisplayMode] = useState("all"); // binary, decimal, hex, all
  const [history, setHistory] = useState([]);

  // Validate binary input
  const validateBinary = (binary) => /^[01]+$/.test(binary);

  // Pad binary string to specified length
  const padBinary = (binary, length) => binary.padStart(length, "0");

  // Convert binary to decimal
  const binaryToDecimal = (binary) => parseInt(binary, 2);

  // Convert decimal to binary with padding
  const decimalToBinary = (decimal, length) => decimal.toString(2).padStart(length, "0");

  // Perform XNOR operation
  const performXNOR = useCallback(() => {
    setError("");
    setResult(null);

    const validInputs = inputs.filter((input) => input.trim() !== "");
    if (validInputs.length < 2) {
      setError("Please enter at least two binary numbers");
      return;
    }

    for (const input of validInputs) {
      if (!validateBinary(input)) {
        setError(`Invalid binary input: ${input}`);
        return;
      }
    }

    const decimals = validInputs.map((binary) => binaryToDecimal(binary));
    const xnorResult = decimals.reduce((acc, curr) => ~(acc ^ curr), decimals[0]);
    const mask = (1 << bitLength) - 1;
    const finalResult = xnorResult & mask;

    const paddedInputs = validInputs.map((binary) => padBinary(binary, bitLength));
    const binaryResult = decimalToBinary(finalResult, bitLength);

    const newResult = {
      inputs: paddedInputs,
      decimals,
      result: finalResult,
      binaryResult,
      hexResult: finalResult.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), "0"),
      timestamp: new Date().toLocaleString(),
    };

    setResult(newResult);
    setHistory((prev) => [...prev, newResult].slice(-5)); // Keep last 5 calculations
  }, [inputs, bitLength]);

  // Handle input changes
  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  // Add/remove inputs
  const addInput = () => setInputs([...inputs, ""]);
  const removeInput = (index) => {
    if (inputs.length > 2) {
      setInputs(inputs.filter((_, i) => i !== index));
    }
  };

  // Reset form
  const reset = () => {
    setInputs(["", ""]);
    setResult(null);
    setError("");
    setBitLength(8);
    setDisplayMode("all");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performXNOR();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary XNOR Calculator
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
                {inputs.length > 2 && (
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addInput}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                <FaPlus className="mr-2" /> Add Input
              </button>
              <button
                type="button"
                onClick={reset}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
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
                <option value="all">All (Binary, Dec, Hex)</option>
                <option value="binary">Binary Only</option>
                <option value="decimal">Decimal Only</option>
                <option value="hex">Hex Only</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Calculate XNOR
          </button>
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
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Results:</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Inputs (Padded):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.inputs.map((input, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="font-mono">{input}</span>
                      <span className="text-gray-500">
                        (dec: {result.decimals[index]})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium">XNOR Result:</p>
                <div className="flex flex-col gap-2">
                  {(displayMode === "all" || displayMode === "binary") && (
                    <p>Binary: <span className="font-mono">{result.binaryResult}</span></p>
                  )}
                  {(displayMode === "all" || displayMode === "decimal") && (
                    <p>Decimal: {result.result}</p>
                  )}
                  {(displayMode === "all" || displayMode === "hex") && (
                    <p>Hex: 0x{result.hexResult}</p>
                  )}
                </div>
              </div>
              <div>
                <p className="font-medium">Operation Visualization:</p>
                <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                  {result.inputs.map((input, index) => (
                    <p key={index}>{input} ({index + 1})</p>
                  ))}
                  <p className="border-t border-gray-300 pt-1 mt-1">
                    {"-".repeat(bitLength)}
                  </p>
                  <p>{result.binaryResult} (XNOR)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-4">Calculation History:</h2>
            <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
              {history.slice().reverse().map((entry, index) => (
                <div key={index} className="p-2 bg-white rounded shadow-sm">
                  <p className="text-xs text-gray-500">{entry.timestamp}</p>
                  <p>Inputs: {entry.inputs.join(", ")}</p>
                  <p>Result: {entry.binaryResult} (dec: {entry.result})</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>XNOR operation on multiple binary inputs (min 2)</li>
            <li>Dynamic input addition/removal</li>
            <li>Configurable bit length (4, 8, 16, 32)</li>
            <li>Display options: Binary, Decimal, Hex, or All</li>
            <li>Calculation history (last 5 results)</li>
            <li>Visualization of XNOR process</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryXNORCalculator;