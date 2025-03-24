"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload, FaInfoCircle } from "react-icons/fa";

const HammingCodeToBinary = () => {
  const [hammingCode, setHammingCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [bitLength, setBitLength] = useState(7); // Default to (7,4) Hamming code
  const [showSteps, setShowSteps] = useState(false); // Toggle for detailed steps

  const calculateParityPositions = (length) => {
    const parityBits = [];
    for (let i = 0; i < length; i++) {
      if ((i & (i - 1)) === 0) parityBits.push(i); // Power of 2 positions
    }
    return parityBits;
  };

  const validateHammingCode = (code) => {
    if (!/^[01]+$/.test(code)) return false;
    const minLength = bitLength === 7 ? 7 : bitLength === 15 ? 15 : 31;
    return code.length === minLength;
  };

  const decodeHammingCode = useCallback((code) => {
    const parityPositions = calculateParityPositions(code.length);
    const parityCount = parityPositions.length;

    // Calculate syndrome with steps
    const syndromeSteps = [];
    const syndrome = [];
    for (let p of parityPositions) {
      let parity = 0;
      const bitsChecked = [];
      for (let i = p; i < code.length; i++) {
        if ((i + 1) & (p + 1)) {
          parity ^= parseInt(code[i]);
          bitsChecked.push(i + 1);
        }
      }
      syndrome.push(parity);
      syndromeSteps.push({
        position: p + 1,
        bitsChecked,
        result: parity,
      });
    }

    // Determine error position
    const errorPos = parseInt(syndrome.reverse().join(""), 2) - 1;
    let correctedCode = code;
    if (errorPos >= 0 && errorPos < code.length) {
      correctedCode =
        code.substring(0, errorPos) +
        (code[errorPos] === "0" ? "1" : "0") +
        code.substring(errorPos + 1);
    }

    // Extract data bits
    const dataBits = [];
    for (let i = 0; i < code.length; i++) {
      if (!parityPositions.includes(i)) {
        dataBits.push(correctedCode[i]);
      }
    }

    const binary = dataBits.join("");
    const decimal = parseInt(binary, 2);
    const hex = decimal.toString(16).toUpperCase().padStart(Math.ceil(binary.length / 4), "0");

    return {
      originalCode: code,
      syndrome: syndrome.reverse().join(""),
      errorPosition: errorPos >= 0 && errorPos < code.length ? errorPos + 1 : "None",
      correctedCode,
      binary,
      decimal,
      hex,
      parityPositions,
      syndromeSteps,
    };
  }, [bitLength]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!hammingCode) {
      setError("Please enter a Hamming code");
      return;
    }

    if (!validateHammingCode(hammingCode)) {
      setError(`Invalid Hamming code: Must be ${bitLength} bits of 0s and 1s`);
      return;
    }

    const decoded = decodeHammingCode(hammingCode);
    setResult(decoded);
  };

  const reset = () => {
    setHammingCode("");
    setResult(null);
    setError("");
    setShowSteps(false);
  };

  const downloadResult = () => {
    if (!result) return;
    const text = `
Hamming Code Decoder Result
-------------------------
Input Hamming Code: ${result.originalCode}
Syndrome: ${result.syndrome} (Error at position: ${result.errorPosition})
${result.errorPosition !== "None" ? `Corrected Code: ${result.correctedCode}\n` : ""}
Decoded Data:
- Binary: ${result.binary}
- Decimal: ${result.decimal}
- Hex: ${result.hex}
    `.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `hamming-decoded-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Hamming Code Decoder
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hamming Code
              </label>
              <input
                type="text"
                value={hammingCode}
                onChange={(e) => setHammingCode(e.target.value)}
                placeholder={`e.g., ${
                  bitLength === 7
                    ? "0110100"
                    : bitLength === 15
                    ? "011001101010101"
                    : "0110011010101010110011010101010"
                }`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code Length
              </label>
              <select
                value={bitLength}
                onChange={(e) => {
                  setBitLength(parseInt(e.target.value));
                  reset();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>7-bit (4 data, 3 parity)</option>
                <option value={15}>15-bit (11 data, 4 parity)</option>
                <option value={31}>31-bit (26 data, 5 parity)</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Decode
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              type="button"
              onClick={downloadResult}
              disabled={!result}
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
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Results</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Input Hamming Code:</p>
                <p className="font-mono">{result.originalCode}</p>
              </div>
              <div>
                <p className="font-medium">Syndrome:</p>
                <p className="font-mono">
                  {result.syndrome} (Error at position: {result.errorPosition})
                </p>
              </div>
              {result.errorPosition !== "None" && (
                <div>
                  <p className="font-medium">Corrected Code:</p>
                  <p className="font-mono">{result.correctedCode}</p>
                </div>
              )}
              <div>
                <p className="font-medium">Decoded Data:</p>
                <div className="flex flex-col gap-1 font-mono">
                  <p>Binary: {result.binary}</p>
                  <p>Decimal: {result.decimal}</p>
                  <p>Hex: {result.hex}</p>
                </div>
              </div>
              <div>
                <p className="font-medium">Bit Positions:</p>
                <div className="font-mono text-xs">
                  <p>
                    {result.correctedCode.split("").map((bit, i) => (
                      <span
                        key={i}
                        className={result.parityPositions.includes(i) ? "text-blue-600" : ""}
                      >
                        {bit}
                      </span>
                    ))}
                  </p>
                  <p>
                    {Array(result.correctedCode.length)
                      .fill(" ")
                      .map((_, i) => (
                        <span
                          key={i}
                          className={result.parityPositions.includes(i) ? "text-blue-600" : ""}
                        >
                          {result.parityPositions.includes(i) ? "P" : "D"}
                        </span>
                      ))}
                  </p>
                  <p className="text-gray-500">P = Parity, D = Data</p>
                </div>
              </div>
              {/* Detailed Steps */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSteps}
                    onChange={() => setShowSteps(!showSteps)}
                    className="accent-blue-500"
                  />
                  <span className="font-medium">Show Decoding Steps</span>
                </label>
                {showSteps && (
                  <div className="mt-2 p-4 bg-white rounded-md border">
                    <h3 className="font-semibold mb-2">Syndrome Calculation Steps:</h3>
                    <ul className="list-disc list-inside space-y-2 text-xs">
                      {result.syndromeSteps.map((step, idx) => (
                        <li key={idx}>
                          Parity Bit P{step.position}: XOR of bits at positions{" "}
                          {step.bitsChecked.join(", ")} = {step.result}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features & Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
            <FaInfoCircle /> Features & Usage
          </h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Decodes Hamming codes to binary, decimal, and hex</li>
            <li>Detects and corrects single-bit errors</li>
            <li>Supports (7,4), (15,11), and (31,26) Hamming codes</li>
            <li>Shows syndrome, error position, and detailed steps</li>
            <li>Download results as a text file</li>
            <li>Example: 0110100 → Binary: 1100 (Decimal: 12, Hex: C)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HammingCodeToBinary;