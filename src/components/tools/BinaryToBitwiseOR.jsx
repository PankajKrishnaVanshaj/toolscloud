"use client";
import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaSync } from "react-icons/fa";

const BinaryToBitwiseOR = () => {
  const [inputs, setInputs] = useState(["", ""]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [bitLength, setBitLength] = useState(8);
  const [displayMode, setDisplayMode] = useState("binary"); // binary, decimal, hex
  const [showSteps, setShowSteps] = useState(false);

  // Validation and conversion utilities
  const validateBinary = (binary) => /^[01]+$/.test(binary);
  const padBinary = (binary, length) => binary.padStart(length, "0");
  const binaryToDecimal = (binary) => parseInt(binary, 2);
  const decimalToBinary = (decimal, length) => decimal.toString(2).padStart(length, "0");
  const decimalToHex = (decimal, length) =>
    decimal.toString(16).toUpperCase().padStart(Math.ceil(length / 4), "0");

  // Perform Bitwise OR operation
  const performBitwiseOR = useCallback(() => {
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
      if (input.length > bitLength) {
        setError(`Input ${input} exceeds ${bitLength}-bit limit`);
        return;
      }
    }

    const decimals = validInputs.map((binary) => binaryToDecimal(binary));
    const orResult = decimals.reduce((acc, curr) => acc | curr, 0);
    const paddedInputs = validInputs.map((binary) => padBinary(binary, bitLength));
    const binaryResult = decimalToBinary(orResult, bitLength);

    setResult({
      inputs: paddedInputs,
      decimals: decimals,
      result: orResult,
      binaryResult: binaryResult,
      hexResult: decimalToHex(orResult, bitLength),
      steps: paddedInputs.map((input, index) => ({
        step: index + 1,
        binary: input,
        decimal: decimals[index],
      })),
    });
  }, [inputs, bitLength]);

  // Input management
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
    setDisplayMode("binary");
    setShowSteps(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performBitwiseOR();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Bitwise OR Converter
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
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addInput}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <FaPlus /> Add Input
            </button>
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
                Display Mode
              </label>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="binary">Binary</option>
                <option value="decimal">Decimal</option>
                <option value="hex">Hexadecimal</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showSteps}
                  onChange={(e) => setShowSteps(e.target.checked)}
                  className="accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Steps</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate Bitwise OR
            </button>
            <button
              type="button"
              onClick={reset}
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
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Results:</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Inputs:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.inputs.map((input, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span>
                        {displayMode === "binary"
                          ? input
                          : displayMode === "decimal"
                          ? result.decimals[index]
                          : decimalToHex(result.decimals[index], bitLength)}
                      </span>
                      <span className="text-gray-500">
                        ({displayMode === "binary" ? "bin" : displayMode === "decimal" ? "dec" : "hex"})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium">Bitwise OR Result:</p>
                <div className="flex flex-col gap-2">
                  <p>
                    Binary: {result.binaryResult} <span className="text-gray-500">(bin)</span>
                  </p>
                  <p>
                    Decimal: {result.result} <span className="text-gray-500">(dec)</span>
                  </p>
                  <p>
                    Hex: {result.hexResult} <span className="text-gray-500">(hex)</span>
                  </p>
                </div>
              </div>
              {showSteps && (
                <div>
                  <p className="font-medium">Step-by-Step Operation:</p>
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                    {result.steps.map(({ step, binary }) => (
                      <p key={step}>
                        {binary.padEnd(bitLength + 2, " ")} ({step})
                      </p>
                    ))}
                    <p className="border-t border-gray-300">{"-".repeat(bitLength)}</p>
                    <p>{result.binaryResult.padEnd(bitLength + 2, " ")} (OR)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features & Usage */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports multiple binary inputs with dynamic add/remove</li>
            <li>Configurable bit length (4, 8, 16, 32)</li>
            <li>Display results in binary, decimal, or hex</li>
            <li>Optional step-by-step visualization</li>
            <li>Example: 1010 | 1100 = 1110 (10 | 12 = 14)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToBitwiseOR;