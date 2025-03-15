"use client";
import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaSync, FaInfoCircle } from "react-icons/fa";

const BinaryNANDCalculator = () => {
  const [inputs, setInputs] = useState(["", ""]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [bitLength, setBitLength] = useState(8);
  const [showSteps, setShowSteps] = useState(true);

  const validateBinary = (binary) => /^[01]+$/.test(binary);

  const padBinary = (binary, length) => binary.padStart(length, "0");

  const binaryToDecimal = (binary) => parseInt(binary, 2);

  const decimalToBinary = (decimal, length) =>
    decimal.toString(2).padStart(length, "0");

  const performNAND = useCallback(() => {
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
    const andResult = decimals.reduce((acc, curr) => acc & curr, decimals[0]);
    const nandResult = ~andResult & ((1 << bitLength) - 1);
    const paddedInputs = validInputs.map((binary) => padBinary(binary, bitLength));
    const binaryAND = decimalToBinary(andResult, bitLength);
    const binaryNAND = decimalToBinary(nandResult, bitLength);

    const truthTable =
      validInputs.length === 2
        ? [
            { A: 0, B: 0, NAND: ~(0 & 0) & 1 },
            { A: 0, B: 1, NAND: ~(0 & 1) & 1 },
            { A: 1, B: 0, NAND: ~(1 & 0) & 1 },
            { A: 1, B: 1, NAND: ~(1 & 1) & 1 },
          ]
        : null;

    setResult({
      inputs: paddedInputs,
      decimals,
      andResult,
      nandResult,
      binaryAND,
      binaryNAND,
      truthTable,
    });
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
    setShowSteps(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performNAND();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
          Binary NAND Calculator
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            {inputs.map((input, index) => (
              <div key={index} className="flex items-center gap-2">
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
                    className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addInput}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 w-32"
            >
              <FaPlus /> Add
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
              >
                <option value={4}>4-bit</option>
                <option value={8}>8-bit</option>
                <option value={16}>16-bit</option>
                <option value={32}>32-bit</option>
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
                <span className="text-sm text-gray-700">Show Calculation Steps</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Calculate NAND
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
          <div className="mt-4 p-4 bg-red-50 rounded-md text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Results</h2>
            <div className="space-y-6 text-sm">
              <div>
                <p className="font-medium text-gray-700">Inputs (Padded):</p>
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
                <p className="font-medium text-gray-700">Intermediate AND Result:</p>
                <div className="flex flex-col gap-2 font-mono">
                  <p>Binary: {result.binaryAND}</p>
                  <p>Decimal: {result.andResult}</p>
                  <p>Hex: 0x{result.andResult.toString(16).toUpperCase()}</p>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-700">NAND Result:</p>
                <div className="flex flex-col gap-2 font-mono">
                  <p>Binary: {result.binaryNAND}</p>
                  <p>Decimal: {result.nandResult}</p>
                  <p>Hex: 0x{result.nandResult.toString(16).toUpperCase()}</p>
                </div>
              </div>
              {showSteps && (
                <div>
                  <p className="font-medium text-gray-700">Operation Steps:</p>
                  <div className="font-mono text-xs p-2 bg-gray-100 rounded">
                    {result.inputs.map((input, index) => (
                      <p key={index}>
                        {input} ({index + 1})
                      </p>
                    ))}
                    <p className="border-t border-gray-400">
                      {"-".repeat(bitLength)} (AND)
                    </p>
                    <p>{result.binaryAND}</p>
                    <p className="border-t border-gray-400">
                      {"-".repeat(bitLength)} (NOT)
                    </p>
                    <p>{result.binaryNAND} (NAND)</p>
                  </div>
                </div>
              )}
              {result.truthTable && (
                <div>
                  <p className="font-medium text-gray-700">Truth Table (2 Inputs):</p>
                  <table className="w-full text-xs border-collapse border-gray-300">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border p-2">A</th>
                        <th className="border p-2">B</th>
                        <th className="border p-2">NAND</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.truthTable.map((row, index) => (
                        <tr key={index} className="text-center border-gray-300">
                          <td className="border p-2">{row.A}</td>
                          <td className="border p-2">{row.B}</td>
                          <td className="border p-2">{row.NAND}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features & Info */}
        <div className="mt-6 p-4 rounded-lg border bg-blue-50 border-blue-200">
          <details open={false}>
            <summary className="cursor-pointer font-medium text-blue-700 flex items-center gap-2">
              <FaInfoCircle /> Features & Usage
            </summary>
            <ul className="list-disc list-inside mt-2 text-sm text-blue-600">
              <li>Calculate NAND operation on multiple binary inputs</li>
              <li>Supports 4, 8, 16, or 32-bit representations</li>
              <li>Dynamically add/remove inputs (min 2)</li>
              <li>Shows intermediate AND result and steps (toggleable)</li>
              <li>Results in binary, decimal, and hex formats</li>
              <li>Truth table for 2 inputs</li>
              <li>Example: 1010 NAND 1100 = 1111</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryNANDCalculator;