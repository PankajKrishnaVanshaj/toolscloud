"use client";
import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaSync, FaCalculator } from "react-icons/fa";

const BinaryNORCalculator = () => {
  const [inputs, setInputs] = useState(["", ""]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [bitLength, setBitLength] = useState(8);
  const [showSteps, setShowSteps] = useState(true);
  const [inputBase, setInputBase] = useState("binary"); // New: binary, decimal, hex input modes

  // Validation and conversion functions
  const validateInput = (value, base) => {
    switch (base) {
      case "binary":
        return /^[01]+$/.test(value);
      case "decimal":
        return /^\d+$/.test(value);
      case "hex":
        return /^[0-9A-Fa-f]+$/.test(value);
      default:
        return false;
    }
  };

  const convertToBinary = (value, base) => {
    switch (base) {
      case "binary":
        return value;
      case "decimal":
        return parseInt(value, 10).toString(2);
      case "hex":
        return parseInt(value, 16).toString(2);
      default:
        return value;
    }
  };

  const padBinary = (binary, length) => binary.padStart(length, "0");

  const binaryToDecimal = (binary) => parseInt(binary, 2);

  const decimalToBinary = (decimal, length) =>
    (decimal >>> 0).toString(2).padStart(length, "0"); // Use >>> for unsigned shift

  const performNOR = useCallback(() => {
    setError("");
    setResult(null);

    const validInputs = inputs.filter((input) => input.trim() !== "");
    if (validInputs.length < 2) {
      setError("Please enter at least two numbers");
      return;
    }

    // Validate and convert inputs
    const binaryInputs = [];
    for (const input of validInputs) {
      if (!validateInput(input, inputBase)) {
        setError(`Invalid ${inputBase} input: ${input}`);
        return;
      }
      binaryInputs.push(convertToBinary(input, inputBase));
    }

    // Pad to bit length
    const paddedInputs = binaryInputs.map((binary) => padBinary(binary, bitLength));
    const decimals = paddedInputs.map(binaryToDecimal);
    const orResult = decimals.reduce((acc, curr) => acc | curr, 0);
    const norResult = ~orResult & ((1 << bitLength) - 1); // NOR with bit mask
    const binaryResult = decimalToBinary(norResult, bitLength);

    setResult({
      inputs: paddedInputs,
      rawInputs: validInputs,
      decimals,
      orResult,
      norResult,
      binaryResult,
    });
  }, [inputs, bitLength, inputBase]);

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
    setShowSteps(true);
    setInputBase("binary");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performNOR();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary NOR Calculator
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
                  placeholder={`${inputBase.charAt(0).toUpperCase() + inputBase.slice(1)} ${index + 1} (e.g., ${inputBase === "binary" ? "1010" : inputBase === "decimal" ? "10" : "A"})`}
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
                Input Base
              </label>
              <select
                value={inputBase}
                onChange={(e) => setInputBase(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="binary">Binary</option>
                <option value="decimal">Decimal</option>
                <option value="hex">Hexadecimal</option>
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
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showSteps}
                  onChange={(e) => setShowSteps(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Steps</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaCalculator /> Calculate NOR
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync /> Reset
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
            <div className="space-y-6 text-sm">
              <div>
                <p className="font-medium">Inputs ({inputBase}):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.rawInputs.map((input, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span>{input}</span>
                      <span className="text-gray-500">
                        (binary: {result.inputs[index]}, decimal: {result.decimals[index]})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium">Intermediate OR Result:</p>
                <div className="flex flex-col gap-2">
                  <p>Binary: {decimalToBinary(result.orResult, bitLength)}</p>
                  <p>Decimal: {result.orResult}</p>
                  <p>Hex: {result.orResult.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), "0")}</p>
                </div>
              </div>
              <div>
                <p className="font-medium">NOR Result:</p>
                <div className="flex flex-col gap-2">
                  <p>Binary: {result.binaryResult}</p>
                  <p>Decimal: {result.norResult}</p>
                  <p>Hex: {result.norResult.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), "0")}</p>
                </div>
              </div>
              {showSteps && (
                <div>
                  <p className="font-medium">Operation Steps:</p>
                  <div className="font-mono text-xs bg-white p-2 rounded border">
                    {result.inputs.map((input, index) => (
                      <p key={index}>{input.padEnd(bitLength + 2)} ({index + 1})</p>
                    ))}
                    <p className="border-t border-gray-300 my-1">{"-".repeat(bitLength)}</p>
                    <p>{decimalToBinary(result.orResult, bitLength).padEnd(bitLength + 2)} (OR)</p>
                    <p className="border-t border-gray-300 my-1">{"-".repeat(bitLength)}</p>
                    <p>{result.binaryResult.padEnd(bitLength + 2)} (NOR)</p>
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
            <li>Supports binary, decimal, or hexadecimal inputs</li>
            <li>Dynamic bit length (4, 8, 16, 32 bits)</li>
            <li>Add/remove multiple inputs (minimum 2)</li>
            <li>Displays results in binary, decimal, and hex</li>
            <li>Toggleable step-by-step visualization</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryNORCalculator;