"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy, FaDownload } from "react-icons/fa";
import { saveAs } from "file-saver";

const BinaryShiftLeft = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [shiftAmount, setShiftAmount] = useState(1);
  const [bitLength, setBitLength] = useState(8);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSteps, setShowSteps] = useState(true);
  const [inputBase, setInputBase] = useState("binary");

  const validateInput = (input, base) => {
    if (base === "binary") return /^[01]+$/.test(input);
    if (base === "decimal") return /^\d+$/.test(input);
    if (base === "hex") return /^[0-9A-Fa-f]+$/.test(input);
    return false;
  };

  const padBinary = (binary, length) => binary.padStart(length, "0");

  const convertToDecimal = (input, base) => {
    if (base === "binary") return parseInt(input, 2);
    if (base === "decimal") return parseInt(input, 10);
    if (base === "hex") return parseInt(input, 16);
    return 0;
  };

  const decimalToBinary = (decimal, length) => decimal.toString(2).padStart(length, "0");

  const performShiftLeft = useCallback(() => {
    setError("");
    setResult(null);

    if (!binaryInput.trim()) {
      setError("Please enter a number");
      return;
    }

    if (!validateInput(binaryInput, inputBase)) {
      setError(`Invalid ${inputBase} input`);
      return;
    }

    if (shiftAmount < 0) {
      setError("Shift amount must be non-negative");
      return;
    }

    const decimal = convertToDecimal(binaryInput, inputBase);
    const shiftedDecimal = decimal << shiftAmount;
    const binaryOriginal = decimalToBinary(decimal, bitLength);
    const binaryResult = decimalToBinary(shiftedDecimal, bitLength);

    const steps = [];
    let current = decimal;
    for (let i = 0; i < Math.min(shiftAmount, bitLength); i++) {
      current = current << 1;
      steps.push(decimalToBinary(current, bitLength));
    }

    const newResult = {
      input: binaryOriginal,
      decimalInput: decimal,
      shiftAmount,
      resultDecimal: shiftedDecimal,
      resultBinary: binaryResult, // Fixed typo: was `resultBinary` without colon
      resultHex: shiftedDecimal.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), "0"),
      steps,
    };

    console.log("Setting result:", newResult); // Debug log
    setResult(newResult);
  }, [binaryInput, shiftAmount, bitLength, inputBase]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted"); // Debug log
    performShiftLeft();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const downloadResult = () => {
    if (!result) return;
    const content = `
Binary Shift Left Result:
Input: ${result.input} (${inputBase}: ${binaryInput})
Decimal Input: ${result.decimalInput}
Shift Amount: ${result.shiftAmount}
Result Binary: ${result.resultBinary}
Result Decimal: ${result.resultDecimal}
Result Hex: ${result.resultHex}
${showSteps && result.steps.length > 0 ? "Steps:\n" + result.steps.map((step, i) => `${i + 1}: ${step}`).join("\n") : ""}
    `.trim();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `binary-shift-left-${Date.now()}.txt`);
  };

  const reset = () => {
    setBinaryInput("");
    setShiftAmount(1);
    setBitLength(8);
    setResult(null);
    setError("");
    setInputBase("binary");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary Shift Left Converter
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input ({inputBase})
              </label>
              <input
                type="text"
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                placeholder={`e.g., ${inputBase === "binary" ? "1010" : inputBase === "decimal" ? "10" : "A"}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
                Shift Amount
              </label>
              <input
                type="number"
                value={shiftAmount}
                onChange={(e) => setShiftAmount(parseInt(e.target.value) || 0)}
                min="0"
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

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Shift Left
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg text-red-700">
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Results:</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Input:</p>
                <p>
                  Binary: {result.input} ({inputBase}: {binaryInput})
                </p>
                <p>Decimal: {result.decimalInput}</p>
              </div>
              <div>
                <p className="font-medium">Shifted Result:</p>
                <div className="flex items-center gap-2">
                  <p>Binary: {result.resultBinary}</p>
                  <button
                    onClick={() => copyToClipboard(result.resultBinary)}
                    className="p-1 text-gray-500 hover:text-blue-500"
                  >
                    <FaCopy />
                  </button>
                </div>
                <p>Decimal: {result.resultDecimal}</p>
                <p>Hex: {result.resultHex}</p>
              </div>
              {result.steps.length > 0 && (
                <div>
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={showSteps}
                      onChange={(e) => setShowSteps(e.target.checked)}
                      className="mr-2 accent-blue-500"
                    />
                    <span className="font-medium">Show Steps</span>
                  </label>
                  {showSteps && (
                    <div className="font-mono text-xs bg-white p-2 rounded-md">
                      <p>{result.input} (Initial)</p>
                      {result.steps.map((step, index) => (
                        <p key={index}>
                          {step} (Shift {index + 1})
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={downloadResult}
                className="mt-4 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FaDownload className="mr-2" /> Download Result
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Input in binary, decimal, or hexadecimal</li>
            <li>Supports 4, 8, 16, or 32-bit lengths</li>
            <li>Shows results in binary, decimal, and hex</li>
            <li>Step-by-step visualization (toggleable)</li>
            <li>Copy result to clipboard</li>
            <li>Download result as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryShiftLeft;