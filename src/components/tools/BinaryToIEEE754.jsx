"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync } from "react-icons/fa";

const BinaryToIEEE754 = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [decimalInput, setDecimalInput] = useState("");
  const [precision, setPrecision] = useState("single");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSteps, setShowSteps] = useState(false);
  const [inputFormat, setInputFormat] = useState("binary"); // "binary" or "hex"

  const validateBinary = (input, isHex = false) => {
    const length = precision === "single" ? 32 : 64;
    const hexLength = precision === "single" ? 8 : 16;

    if (isHex) {
      const hexRegex = /^[0-9A-Fa-f]+$/;
      if (!hexRegex.test(input)) {
        setError("Hex input must contain only 0-9 and A-F");
        return false;
      }
      if (input.length !== hexLength) {
        setError(`Hex input must be exactly ${hexLength} characters for ${precision} precision`);
        return false;
      }
      return true;
    }

    const binaryRegex = /^[01]+$/;
    if (!binaryRegex.test(input)) {
      setError("Binary input must contain only 0s and 1s");
      return false;
    }
    if (input.length !== length) {
      setError(`Binary input must be exactly ${length} bits for ${precision} precision`);
      return false;
    }
    return true;
  };

  const binaryToIEEE754 = useCallback((binary) => {
    const signBit = parseInt(binary[0], 2);
    const exponentBits = precision === "single" ? 8 : 11;
    const mantissaBits = precision === "single" ? 23 : 52;
    const bias = precision === "single" ? 127 : 1023;

    const exponentBinary = binary.slice(1, 1 + exponentBits);
    const mantissaBinary = binary.slice(1 + exponentBits);

    const exponent = parseInt(exponentBinary, 2);
    const adjustedExponent = exponent - bias;
    const isSubnormal = exponent === 0;
    const isSpecial = exponent === Math.pow(2, exponentBits) - 1;

    const mantissa = mantissaBinary
      .split("")
      .reduce((acc, bit, index) => acc + (bit === "1" ? Math.pow(2, -(index + 1)) : 0), 0);
    const implicitLeadingBit = isSubnormal ? 0 : isSpecial ? 0 : 1;
    const value = isSpecial
      ? mantissa === 0
        ? signBit === 0
          ? "Infinity"
          : "-Infinity"
        : "NaN"
      : Math.pow(-1, signBit) * (implicitLeadingBit + mantissa) * Math.pow(2, adjustedExponent);

    const steps = [
      `Input binary: ${binary.match(/.{1,8}/g)?.join(" ") || binary}`,
      `Sign bit: ${signBit} (${signBit === 0 ? "Positive" : "Negative"})`,
      `Exponent (binary): ${exponentBinary}`,
      `Exponent (decimal): ${exponent}, Adjusted: ${adjustedExponent} (Bias: ${bias})`,
      `Mantissa (binary): ${mantissaBinary}`,
      `Mantissa (decimal): ${implicitLeadingBit + mantissa}`,
      `Value: ${value}`,
    ];

    return {
      sign: signBit === 0 ? "+" : "-",
      exponentBinary,
      exponentDecimal: exponent,
      adjustedExponent,
      mantissaBinary,
      mantissaDecimal: implicitLeadingBit + mantissa,
      value: Number.isFinite(value) ? value : value,
      steps,
    };
  }, [precision]);

  const decimalToIEEE754 = useCallback((decimal) => {
    const num = parseFloat(decimal);
    if (isNaN(num)) {
      setError("Invalid decimal number");
      return null;
    }

    const isDouble = precision === "double";
    const bits = isDouble ? 64 : 32;
    const expBits = isDouble ? 11 : 8;
    const mantissaBits = isDouble ? 52 : 23;
    const bias = isDouble ? 1023 : 127;

    const sign = num >= 0 ? "0" : "1";
    const absNum = Math.abs(num);

    if (absNum === 0) return sign + "0".repeat(expBits) + "0".repeat(mantissaBits);
    if (!Number.isFinite(absNum))
      return sign + "1".repeat(expBits) + "0".repeat(mantissaBits);

    let exponent = Math.floor(Math.log2(absNum));
    let mantissa = absNum / Math.pow(2, exponent) - 1;
    let expBinary = (exponent + bias).toString(2).padStart(expBits, "0");

    if (exponent < -bias + 1) {
      mantissa = absNum / Math.pow(2, -bias + 1);
      expBinary = "0".repeat(expBits);
    } else if (exponent + bias >= Math.pow(2, expBits)) {
      return sign + "1".repeat(expBits) + "0".repeat(mantissaBits);
    }

    let mantBinary = "";
    for (let i = 0; i < mantissaBits; i++) {
      mantissa *= 2;
      mantBinary += Math.floor(mantissa);
      mantissa %= 1;
    }

    return sign + expBinary + mantBinary;
  }, [precision]);

  const handleConvert = () => {
    setError("");
    setResult(null);

    if (inputFormat === "binary") {
      if (!binaryInput) {
        setError("Please enter a binary number");
        return;
      }
      if (validateBinary(binaryInput)) {
        const conversion = binaryToIEEE754(binaryInput);
        setResult(conversion);
        setDecimalInput(conversion.value.toString());
      }
    } else {
      if (!binaryInput) {
        setError("Please enter a hexadecimal number");
        return;
      }
      if (validateBinary(binaryInput, true)) {
        const binary = parseInt(binaryInput, 16).toString(2).padStart(precision === "single" ? 32 : 64, "0");
        setBinaryInput(binary);
        const conversion = binaryToIEEE754(binary);
        setResult(conversion);
        setDecimalInput(conversion.value.toString());
      }
    }
  };

  const handleDecimalConvert = () => {
    setError("");
    setResult(null);
    if (!decimalInput) {
      setError("Please enter a decimal number");
      return;
    }
    const binary = decimalToIEEE754(decimalInput);
    if (binary) {
      setBinaryInput(binary);
      const conversion = binaryToIEEE754(binary);
      setResult(conversion);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const reset = () => {
    setBinaryInput("");
    setDecimalInput("");
    setPrecision("single");
    setResult(null);
    setError("");
    setShowSteps(false);
    setInputFormat("binary");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary/Hex to IEEE 754 Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {inputFormat === "binary" ? "Binary" : "Hexadecimal"} Input (
                {precision === "single" ? "32-bit" : "64-bit"})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={binaryInput}
                  onChange={(e) => setBinaryInput(e.target.value)}
                  placeholder={
                    inputFormat === "binary"
                      ? precision === "single"
                        ? "32-bit binary"
                        : "64-bit binary"
                      : precision === "single"
                      ? "8-char hex"
                      : "16-char hex"
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <button
                  onClick={handleConvert}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Convert
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Input
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={decimalInput}
                  onChange={(e) => setDecimalInput(e.target.value)}
                  placeholder="e.g., 3.14, -42, Infinity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleDecimalConvert}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Convert
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precision</label>
              <select
                value={precision}
                onChange={(e) => {
                  setPrecision(e.target.value);
                  reset();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="single">Single Precision (32-bit)</option>
                <option value="double">Double Precision (64-bit)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Input Format</label>
              <select
                value={inputFormat}
                onChange={(e) => {
                  setInputFormat(e.target.value);
                  setBinaryInput("");
                  setResult(null);
                  setError("");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="binary">Binary</option>
                <option value="hex">Hexadecimal</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Result Section */}
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">IEEE 754 Breakdown</h2>
            <div className="space-y-3 text-sm font-mono">
              <div className="flex items-center gap-2">
                <p>
                  <span className="font-bold">Sign:</span> {result.sign} ({binaryInput[0]})
                </p>
                <button
                  onClick={() => copyToClipboard(binaryInput[0])}
                  className="p-1 text-gray-500 hover:text-blue-500"
                >
                  <FaCopy />
                </button>
              </div>
              <p>
                <span className="font-bold">Exponent (Binary):</span> {result.exponentBinary}
              </p>
              <p>
                <span className="font-bold">Exponent (Decimal):</span> {result.exponentDecimal}
              </p>
              <p>
                <span className="font-bold">Adjusted Exponent:</span> {result.adjustedExponent}
              </p>
              <p>
                <span className="font-bold">Mantissa (Binary):</span>{" "}
                {result.mantissaBinary.match(/.{1,8}/g)?.join(" ") || result.mantissaBinary}
              </p>
              <p>
                <span className="font-bold">Mantissa (Decimal):</span>{" "}
                {result.mantissaDecimal.toFixed(6)}
              </p>
              <div className="flex items-center gap-2">
                <p>
                  <span className="font-bold">Value:</span>{" "}
                  {typeof result.value === "number" ? result.value.toPrecision(8) : result.value}
                </p>
                <button
                  onClick={() => copyToClipboard(result.value.toString())}
                  className="p-1 text-gray-500 hover:text-blue-500"
                >
                  <FaCopy />
                </button>
              </div>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={showSteps}
                  onChange={(e) => setShowSteps(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Show Conversion Steps</span>
              </label>
              {showSteps && (
                <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                  <h3 className="font-medium text-gray-700">Conversion Steps</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                    {result.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert binary or hex to IEEE 754 (single/double precision)</li>
            <li>Convert decimal to IEEE 754 binary</li>
            <li>Detailed breakdown with steps</li>
            <li>Copy sign or value to clipboard</li>
            <li>Handles special cases (NaN, Infinity, subnormals)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToIEEE754;