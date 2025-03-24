"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const BinaryToBitwiseMask = () => {
  const [input, setInput] = useState("");
  const [mask, setMask] = useState("");
  const [operation, setOperation] = useState("AND");
  const [bitLength, setBitLength] = useState(8);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [base, setBase] = useState("binary"); // Input base: binary, decimal, hex
  const [showSteps, setShowSteps] = useState(false); // Toggle step-by-step explanation

  const validateInput = (value, baseType) => {
    if (baseType === "binary") return /^[01]+$/.test(value);
    if (baseType === "decimal") return /^\d+$/.test(value);
    if (baseType === "hex") return /^[0-9A-Fa-f]+$/.test(value);
    return false;
  };

  const convertToBinary = (value, baseType) => {
    if (baseType === "binary") return value;
    if (baseType === "decimal") return parseInt(value, 10).toString(2);
    if (baseType === "hex") return parseInt(value, 16).toString(2);
    return value;
  };

  const padBinary = (binary, length) => binary.padStart(length, "0");

  const binaryToDecimal = (binary) => parseInt(binary, 2);

  const decimalToBinary = (decimal, length) =>
    decimal.toString(2).padStart(length, "0");

  const performBitwiseOperation = useCallback(() => {
    setError("");
    setResult(null);

    if (!input || (!mask && operation !== "NOT")) {
      setError(
        "Please enter an input" + (operation !== "NOT" ? " and mask" : "")
      );
      return;
    }

    if (!validateInput(input, base) || (mask && !validateInput(mask, base))) {
      setError(`Invalid ${base} input`);
      return;
    }

    const binaryInput = convertToBinary(input, base);
    const binaryMask = operation === "NOT" ? "" : convertToBinary(mask, base);
    const paddedInput = padBinary(binaryInput, bitLength);
    const paddedMask = operation === "NOT" ? "" : padBinary(binaryMask, bitLength);
    const inputDecimal = binaryToDecimal(paddedInput);
    const maskDecimal = operation === "NOT" ? 0 : binaryToDecimal(paddedMask);

    if (inputDecimal >= 2 ** bitLength || maskDecimal >= 2 ** bitLength) {
      setError(`Input or mask exceeds ${bitLength}-bit limit`);
      return;
    }

    let resultDecimal;
    switch (operation) {
      case "AND":
        resultDecimal = inputDecimal & maskDecimal;
        break;
      case "OR":
        resultDecimal = inputDecimal | maskDecimal;
        break;
      case "XOR":
        resultDecimal = inputDecimal ^ maskDecimal;
        break;
      case "NOT":
        resultDecimal = ~inputDecimal & ((1 << bitLength) - 1);
        break;
      case "NAND":
        resultDecimal = ~(inputDecimal & maskDecimal) & ((1 << bitLength) - 1);
        break;
      case "NOR":
        resultDecimal = ~(inputDecimal | maskDecimal) & ((1 << bitLength) - 1);
        break;
      default:
        setError("Invalid operation");
        return;
    }

    const binaryResult = decimalToBinary(resultDecimal, bitLength);

    setResult({
      input: paddedInput,
      mask: paddedMask,
      inputDecimal,
      maskDecimal,
      resultDecimal,
      binaryResult,
      operation,
      steps: generateSteps(paddedInput, paddedMask, operation, bitLength),
    });
  }, [input, mask, operation, bitLength, base]);

  const generateSteps = (input, mask, op, length) => {
    const steps = [];
    if (op === "NOT") {
      for (let i = 0; i < length; i++) {
        steps.push(`Bit ${i}: ${input[i]} → ${input[i] === "0" ? "1" : "0"}`);
      }
    } else {
      for (let i = 0; i < length; i++) {
        const a = input[i];
        const b = mask[i];
        let r;
        switch (op) {
          case "AND":
            r = a === "1" && b === "1" ? "1" : "0";
            break;
          case "OR":
            r = a === "1" || b === "1" ? "1" : "0";
            break;
          case "XOR":
            r = a !== b ? "1" : "0";
            break;
          case "NAND":
            r = !(a === "1" && b === "1") ? "1" : "0";
            break;
          case "NOR":
            r = !(a === "1" || b === "1") ? "1" : "0";
            break;
        }
        steps.push(`Bit ${i}: ${a} ${op} ${b} = ${r}`);
      }
    }
    return steps;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performBitwiseOperation();
  };

  const reset = () => {
    setInput("");
    setMask("");
    setOperation("AND");
    setBitLength(8);
    setBase("binary");
    setResult(null);
    setError("");
    setShowSteps(false);
  };

  const downloadResult = () => {
    if (!result) return;
    const text = [
      `Input: ${result.input} (Dec: ${result.inputDecimal}, Hex: 0x${result.inputDecimal.toString(16).toUpperCase()})`,
      result.mask ? `Mask: ${result.mask} (Dec: ${result.maskDecimal}, Hex: 0x${result.maskDecimal.toString(16).toUpperCase()})` : "",
      `Operation: ${result.operation}`,
      `Result: ${result.binaryResult} (Dec: ${result.resultDecimal}, Hex: 0x${result.resultDecimal.toString(16).toUpperCase()})`,
      showSteps && result.steps ? "\nSteps:\n" + result.steps.join("\n") : "",
    ].filter(Boolean).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `bitwise-result-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Bitwise Operation Calculator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input ({base})
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`e.g., ${base === "binary" ? "1010" : base === "decimal" ? "10" : "A"}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {operation !== "NOT" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mask ({base})
                </label>
                <input
                  type="text"
                  value={mask}
                  onChange={(e) => setMask(e.target.value)}
                  placeholder={`e.g., ${base === "binary" ? "1100" : base === "decimal" ? "12" : "C"}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Base
              </label>
              <select
                value={base}
                onChange={(e) => setBase(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="binary">Binary</option>
                <option value="decimal">Decimal</option>
                <option value="hex">Hexadecimal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operation
              </label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
                <option value="XOR">XOR</option>
                <option value="NOT">NOT</option>
                <option value="NAND">NAND</option>
                <option value="NOR">NOR</option>
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
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            {result && (
              <button
                type="button"
                onClick={downloadResult}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="font-medium">Input:</p>
                <p>Binary: {result.input}</p>
                <p>Decimal: {result.inputDecimal}</p>
                <p>Hex: 0x{result.inputDecimal.toString(16).toUpperCase()}</p>
              </div>
              {operation !== "NOT" && (
                <div>
                  <p className="font-medium">Mask:</p>
                  <p>Binary: {result.mask}</p>
                  <p>Decimal: {result.maskDecimal}</p>
                  <p>Hex: 0x{result.maskDecimal.toString(16).toUpperCase()}</p>
                </div>
              )}
              <div className="sm:col-span-2">
                <p className="font-medium">Result ({operation}):</p>
                <p>Binary: {result.binaryResult}</p>
                <p>Decimal: {result.resultDecimal}</p>
                <p>Hex: 0x{result.resultDecimal.toString(16).toUpperCase()}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="font-medium">Operation Visualization:</p>
                <div className="font-mono text-xs bg-white p-2 rounded border">
                  <p>{result.input} (Input)</p>
                  {operation !== "NOT" && <p>{result.mask} (Mask)</p>}
                  <p className="border-t border-gray-300">
                    {"-".repeat(bitLength)}
                  </p>
                  <p>{result.binaryResult} ({operation})</p>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showSteps}
                    onChange={(e) => setShowSteps(e.target.checked)}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Show Step-by-Step
                  </span>
                </label>
                {showSteps && (
                  <ul className="list-disc list-inside mt-2 text-xs">
                    {result.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports Binary, Decimal, and Hex input</li>
            <li>Operations: AND, OR, XOR, NOT, NAND, NOR</li>
            <li>Adjustable bit length: 4, 8, 16, 32</li>
            <li>Step-by-step operation breakdown</li>
            <li>Download results as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToBitwiseMask;