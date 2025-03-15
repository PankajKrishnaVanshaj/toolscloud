"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const BinaryDivisionCalculator = () => {
  const [dividend, setDividend] = useState("");
  const [divisor, setDivisor] = useState("");
  const [bitLength, setBitLength] = useState(8);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSteps, setShowSteps] = useState(true);
  const [base, setBase] = useState("binary"); // New: binary or decimal input
  const [isLoading, setIsLoading] = useState(false);

  const validateBinary = (binary) => /^[01]+$/.test(binary);
  const validateDecimal = (decimal) => /^\d+$/.test(decimal);

  const padBinary = (binary, length) => binary.padStart(length, "0");
  const binaryToDecimal = (binary) => parseInt(binary, 2);
  const decimalToBinary = (decimal, length) => decimal.toString(2).padStart(length, "0");

  const performBinaryDivision = useCallback(() => {
    setError("");
    setResult(null);
    setIsLoading(true);

    let dividendDec, divisorDec;

    // Validate and convert inputs based on base
    if (base === "binary") {
      if (!dividend || !divisor) {
        setError("Please enter both dividend and divisor");
        setIsLoading(false);
        return;
      }
      if (!validateBinary(dividend) || !validateBinary(divisor)) {
        setError("Invalid binary input: Use only 0s and 1s");
        setIsLoading(false);
        return;
      }
      dividendDec = binaryToDecimal(dividend);
      divisorDec = binaryToDecimal(divisor);
    } else {
      if (!dividend || !divisor) {
        setError("Please enter both dividend and divisor");
        setIsLoading(false);
        return;
      }
      if (!validateDecimal(dividend) || !validateDecimal(divisor)) {
        setError("Invalid decimal input: Use only numbers");
        setIsLoading(false);
        return;
      }
      dividendDec = parseInt(dividend);
      divisorDec = parseInt(divisor);
    }

    if (divisorDec === 0) {
      setError("Division by zero is not allowed");
      setIsLoading(false);
      return;
    }

    // Perform division
    const quotientDec = Math.floor(dividendDec / divisorDec);
    const remainderDec = dividendDec % divisorDec;

    const paddedDividend = decimalToBinary(dividendDec, bitLength);
    const paddedDivisor = decimalToBinary(divisorDec, bitLength);
    const quotientBin = decimalToBinary(quotientDec, bitLength);
    const remainderBin = decimalToBinary(remainderDec, bitLength);

    // Generate division steps
    const steps = [];
    let currentDividend = decimalToBinary(dividendDec, Math.max(dividend.length, bitLength));
    let stepDividend = "";

    for (let i = 0; i < currentDividend.length; i++) {
      stepDividend += currentDividend[i];
      const stepDividendDec = binaryToDecimal(stepDividend);
      const stepQuotientDigit = stepDividendDec >= divisorDec ? "1" : "0";
      const subtractValue = stepQuotientDigit === "1" ? divisorDec : 0;
      const stepResultDec = stepDividendDec - subtractValue;
      const stepResultBin = decimalToBinary(stepResultDec, stepDividend.length);

      steps.push({
        dividend: padBinary(stepDividend, currentDividend.length),
        subtract: subtractValue
          ? padBinary(decimalToBinary(divisorDec, stepDividend.length), currentDividend.length)
          : "0".repeat(currentDividend.length),
        result: padBinary(stepResultBin, currentDividend.length),
        quotientDigit: stepQuotientDigit,
      });

      stepDividend = stepResultBin;
    }

    setResult({
      dividend: paddedDividend,
      divisor: paddedDivisor,
      quotient: quotientBin,
      remainder: remainderBin,
      quotientDec,
      remainderDec,
      steps,
    });
    setIsLoading(false);
  }, [dividend, divisor, bitLength, base]);

  const handleSubmit = (e) => {
    e.preventDefault();
    performBinaryDivision();
  };

  const reset = () => {
    setDividend("");
    setDivisor("");
    setBitLength(8);
    setResult(null);
    setError("");
    setShowSteps(true);
    setBase("binary");
    setIsLoading(false);
  };

  const downloadResult = () => {
    if (!result) return;
    const textContent = `
Binary Division Result:
Dividend: ${result.dividend} (decimal: ${result.quotientDec})
Divisor: ${result.divisor} (decimal: ${binaryToDecimal(result.divisor)})
Quotient: ${result.quotient} (decimal: ${result.quotientDec})
Remainder: ${result.remainder} (decimal: ${result.remainderDec})
${showSteps ? "\nSteps:\n" + result.steps.map((step, i) => `Step ${i + 1}:\n  ${step.dividend}\n- ${step.subtract}\n  ${step.result} (Q: ${step.quotientDigit})`).join("\n") : ""}
    `.trim();
    const blob = new Blob([textContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `binary-division-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary Division Calculator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dividend ({base})
              </label>
              <input
                type="text"
                value={dividend}
                onChange={(e) => setDividend(e.target.value)}
                placeholder={base === "binary" ? "e.g., 1010" : "e.g., 10"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Divisor ({base})
              </label>
              <input
                type="text"
                value={divisor}
                onChange={(e) => setDivisor(e.target.value)}
                placeholder={base === "binary" ? "e.g., 10" : "e.g., 2"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Base
              </label>
              <select
                value={base}
                onChange={(e) => setBase(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="binary">Binary</option>
                <option value="decimal">Decimal</option>
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
                disabled={isLoading}
              >
                <option value={4}>4-bit</option>
                <option value={8}>8-bit</option>
                <option value={16}>16-bit</option>
                <option value={32}>32-bit</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showSteps}
                onChange={(e) => setShowSteps(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label className="text-sm font-medium text-gray-700">
                Show Steps
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" />
              {isLoading ? "Calculating..." : "Calculate"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadResult}
              disabled={!result || isLoading}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
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
            <div className="space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>
                  <span className="font-medium">Dividend:</span> {result.dividend} (dec:{" "}
                  {binaryToDecimal(result.dividend)})
                </p>
                <p>
                  <span className="font-medium">Divisor:</span> {result.divisor} (dec:{" "}
                  {binaryToDecimal(result.divisor)})
                </p>
                <p>
                  <span className="font-medium">Quotient:</span> {result.quotient} (dec:{" "}
                  {result.quotientDec})
                </p>
                <p>
                  <span className="font-medium">Remainder:</span> {result.remainder} (dec:{" "}
                  {result.remainderDec})
                </p>
              </div>
              {showSteps && (
                <div>
                  <p className="font-medium mb-2">Division Steps:</p>
                  <div className="font-mono text-xs bg-white p-4 rounded-md shadow-inner overflow-x-auto">
                    {result.steps.map((step, index) => (
                      <div key={index} className="mb-3">
                        <p className="text-gray-600">Step {index + 1}:</p>
                        <p>{step.dividend}</p>
                        <p>- {step.subtract}</p>
                        <p className="border-t border-gray-300 pt-1">
                          {step.result} (Q: {step.quotientDigit})
                        </p>
                      </div>
                    ))}
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
            <li>Supports binary or decimal input</li>
            <li>Customizable bit length (4, 8, 16, 32 bits)</li>
            <li>Detailed step-by-step division process</li>
            <li>Results in binary and decimal formats</li>
            <li>Download result as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryDivisionCalculator;