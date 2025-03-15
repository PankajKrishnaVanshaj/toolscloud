"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaCopy, FaInfoCircle } from "react-icons/fa";

const BinaryToTwosComplement = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [bitLength, setBitLength] = useState(8);
  const [isSigned, setIsSigned] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [inputMode, setInputMode] = useState("binary"); // New: binary or decimal input
  const [decimalInput, setDecimalInput] = useState("");

  // Validation and conversion logic
  const validateBinary = (binary) => /^[01]+$/.test(binary);
  const validateDecimal = (decimal) => /^-?\d+$/.test(decimal);

  const padBinary = (binary, length) => binary.padStart(length, "0");

  const binaryToDecimal = (binary, signed = false, length) => {
    if (!signed) return parseInt(binary, 2);
    const padded = padBinary(binary, length);
    if (padded[0] === "0") return parseInt(padded, 2);
    const inverted = padded.split("").map((bit) => (bit === "0" ? "1" : "0")).join("");
    return -(parseInt(inverted, 2) + 1);
  };

  const decimalToTwosComplement = (decimal, length) => {
    if (decimal >= 0) return decimal.toString(2).padStart(length, "0");
    const maxPositive = Math.pow(2, length) - 1;
    const flipped = maxPositive + decimal + 1;
    return flipped.toString(2).padStart(length, "0");
  };

  const calculateConversion = useCallback(() => {
    setError("");
    setResult(null);

    let binary = binaryInput;
    let decimal = decimalInput;

    if (inputMode === "binary") {
      if (!binary.trim()) {
        setError("Please enter a binary number");
        return;
      }
      if (!validateBinary(binary)) {
        setError("Invalid binary input: only 0s and 1s are allowed");
        return;
      }
      if (binary.length > bitLength) {
        setError(`Input exceeds ${bitLength}-bit length`);
        return;
      }
      binary = padBinary(binary, bitLength);
      decimal = binaryToDecimal(binary, isSigned, bitLength);
    } else {
      if (!decimal.trim()) {
        setError("Please enter a decimal number");
        return;
      }
      if (!validateDecimal(decimal)) {
        setError("Invalid decimal input: only integers are allowed");
        return;
      }
      decimal = parseInt(decimal);
      const minVal = isSigned ? -Math.pow(2, bitLength - 1) : 0;
      const maxVal = isSigned ? Math.pow(2, bitLength - 1) - 1 : Math.pow(2, bitLength) - 1;
      if (decimal < minVal || decimal > maxVal) {
        setError(`Input out of range: ${minVal} to ${maxVal} for ${bitLength}-bit ${isSigned ? "signed" : "unsigned"}`);
        return;
      }
      binary = decimalToTwosComplement(decimal, bitLength);
    }

    const unsignedDecimal = parseInt(binary, 2);
    const steps =
      isSigned && decimal < 0 && inputMode === "binary"
        ? [
            `Original: ${binary}`,
            `Invert bits: ${binary.split("").map((bit) => (bit === "0" ? "1" : "0")).join("")}`,
            `Add 1: ${decimalToTwosComplement(decimal, bitLength)}`,
            `Negate: ${decimal}`,
          ]
        : inputMode === "decimal" && decimal < 0
        ? [
            `Original Decimal: ${decimal}`,
            `Max Positive (${bitLength}-bit): ${Math.pow(2, bitLength) - 1}`,
            `Add 1 to |decimal|: ${Math.abs(decimal) + 1}`,
            `Resulting Binary: ${binary}`,
          ]
        : null;

    setResult({
      binary,
      decimal,
      twosComplement: isSigned ? binary : decimalToTwosComplement(decimal, bitLength),
      unsignedDecimal,
      steps,
    });
  }, [binaryInput, decimalInput, bitLength, isSigned, inputMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateConversion();
  };

  const reset = () => {
    setBinaryInput("");
    setDecimalInput("");
    setBitLength(8);
    setIsSigned(true);
    setResult(null);
    setError("");
    setInputMode("binary");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Binary & Two's Complement Converter
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Mode
              </label>
              <select
                value={inputMode}
                onChange={(e) => setInputMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="binary">Binary</option>
                <option value="decimal">Decimal</option>
              </select>
            </div>
            <div>
              {inputMode === "binary" ? (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Binary Input
                  </label>
                  <input
                    type="text"
                    value={binaryInput}
                    onChange={(e) => setBinaryInput(e.target.value)}
                    placeholder={`e.g., 1010 (${bitLength}-bit)`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Decimal Input
                  </label>
                  <input
                    type="text"
                    value={decimalInput}
                    onChange={(e) => setDecimalInput(e.target.value)}
                    placeholder={`e.g., -6 or 10 (${bitLength}-bit)`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </>
              )}
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
                Interpretation
              </label>
              <select
                value={isSigned ? "signed" : "unsigned"}
                onChange={(e) => setIsSigned(e.target.value === "signed")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="signed">Signed (Two's Complement)</option>
                <option value="unsigned">Unsigned</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center transition-colors"
            >
              <FaCalculator className="mr-2" /> Convert
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error Section */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Results</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Binary:</p>
                  <p>{result.binary}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(result.binary)}
                  className="p-2 text-gray-500 hover:text-blue-600"
                >
                  <FaCopy />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Decimal:</p>
                  <p>
                    {isSigned ? `Signed: ${result.decimal}` : `Unsigned: ${result.unsignedDecimal}`}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(String(isSigned ? result.decimal : result.unsignedDecimal))}
                  className="p-2 text-gray-500 hover:text-blue-600"
                >
                  <FaCopy />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {isSigned ? "Two's Complement:" : "Converted to Two's Complement:"}
                  </p>
                  <p>{result.twosComplement}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(result.twosComplement)}
                  className="p-2 text-gray-500 hover:text-blue-600"
                >
                  <FaCopy />
                </button>
              </div>
              {result.steps && (
                <div>
                  <p className="font-medium">
                    Conversion Steps ({inputMode === "binary" ? "Negative Number" : "Decimal to Binary"}):
                  </p>
                  <div className="font-mono text-xs mt-2 space-y-1 p-2 bg-white rounded shadow-inner">
                    {result.steps.map((step, index) => (
                      <p key={index}>{step}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
            <FaInfoCircle className="mr-2" /> Features & Usage
          </h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between binary and decimal (signed/unsigned)</li>
            <li>Supports input in binary or decimal format</li>
            <li>Bit lengths: 4, 8, 16, 32</li>
            <li>Shows detailed conversion steps for negative numbers</li>
            <li>Copy results to clipboard</li>
            <li>Signed range: [-2^(n-1) to 2^(n-1)-1], Unsigned: [0 to 2^n-1]</li>
            <li>Example: 1010 (8-bit) = -6 (signed) or 10 (unsigned)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToTwosComplement;