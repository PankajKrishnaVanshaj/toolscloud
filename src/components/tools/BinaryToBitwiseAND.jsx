"use client";
import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaSync } from "react-icons/fa";

const BinaryToBitwiseAND = () => {
  const [inputs, setInputs] = useState(["", ""]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [bitLength, setBitLength] = useState(8);
  const [outputFormat, setOutputFormat] = useState("all"); // New: binary, decimal, hex, or all
  const [highlightBits, setHighlightBits] = useState(true); // New: highlight AND bits

  // Validation and conversion utilities
  const validateBinary = (binary) => /^[01]+$/.test(binary);
  const padBinary = (binary, length) => binary.padStart(length, "0");
  const binaryToDecimal = (binary) => parseInt(binary, 2);
  const decimalToBinary = (decimal, length) => decimal.toString(2).padStart(length, "0");
  const decimalToHex = (decimal, length) =>
    decimal.toString(16).toUpperCase().padStart(Math.ceil(length / 4), "0");

  // Perform Bitwise AND
  const performBitwiseAND = useCallback(() => {
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
    const andResult = decimals.reduce((acc, curr) => acc & curr);
    const paddedInputs = validInputs.map((binary) => padBinary(binary, bitLength));
    const binaryResult = decimalToBinary(andResult, bitLength);

    setResult({
      inputs: paddedInputs,
      decimals,
      result: andResult,
      binaryResult,
      hexResult: decimalToHex(andResult, bitLength),
    });
  }, [inputs, bitLength]);

  // Input handlers
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
    setOutputFormat("all");
    setHighlightBits(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performBitwiseAND();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary Bitwise AND Calculator
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
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                Output Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All (Binary, Decimal, Hex)</option>
                <option value="binary">Binary Only</option>
                <option value="decimal">Decimal Only</option>
                <option value="hex">Hex Only</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={highlightBits}
                  onChange={(e) => setHighlightBits(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Highlight AND Bits</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Calculate Bitwise AND
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
                <p className="font-medium text-gray-700">Inputs (Padded):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.inputs.map((input, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="font-mono">{input}</span>
                      <span className="text-gray-500">
                        (decimal: {result.decimals[index]})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-700">Bitwise AND Result:</p>
                <div className="flex flex-col gap-2">
                  {(outputFormat === "all" || outputFormat === "binary") && (
                    <p>Binary: <span className="font-mono">{result.binaryResult}</span></p>
                  )}
                  {(outputFormat === "all" || outputFormat === "decimal") && (
                    <p>Decimal: {result.result}</p>
                  )}
                  {(outputFormat === "all" || outputFormat === "hex") && (
                    <p>Hex: <span className="font-mono">{result.hexResult}</span></p>
                  )}
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-700">Operation Visualization:</p>
                <div className="font-mono text-xs">
                  {result.inputs.map((input, index) => (
                    <p key={index}>
                      {highlightBits
                        ? input.split("").map((bit, i) => (
                            <span
                              key={i}
                              className={
                                bit === "1" && result.binaryResult[i] === "1"
                                  ? "text-blue-600 font-bold"
                                  : ""
                              }
                            >
                              {bit}
                            </span>
                          ))
                        : input}{" "}
                      ({index + 1})
                    </p>
                  ))}
                  <p className="border-t border-gray-300">{"-".repeat(bitLength)}</p>
                  <p>
                    {highlightBits
                      ? result.binaryResult.split("").map((bit, i) => (
                          <span
                            key={i}
                            className={bit === "1" ? "text-blue-600 font-bold" : ""}
                          >
                            {bit}
                          </span>
                        ))
                      : result.binaryResult}{" "}
                    (AND)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate Bitwise AND for multiple binary inputs</li>
            <li>Dynamic input addition/removal (minimum 2)</li>
            <li>Customizable bit length (4, 8, 16, 32 bits)</li>
            <li>Flexible output format: Binary, Decimal, Hex, or All</li>
            <li>Highlight resulting AND bits option</li>
            <li>Example: 1010 & 1100 = 1000 (10 & 12 = 8)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToBitwiseAND;