"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload, FaInfoCircle } from "react-icons/fa";

const BinaryToHammingCode = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [parityBits, setParityBits] = useState(4); // Default to 4 parity bits
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSteps, setShowSteps] = useState(false); // Toggle for detailed steps

  const validateBinary = (binary) => /^[01]+$/.test(binary);

  const calculateHammingCode = useCallback((binary) => {
    const dataBits = binary.length;
    const minParityBits = Math.ceil(Math.log2(dataBits + Math.ceil(Math.log2(dataBits + 1)) + 1));
    if (parityBits < minParityBits) {
      return { error: `Need at least ${minParityBits} parity bits for ${dataBits} data bits` };
    }

    const totalBits = dataBits + parityBits;
    const hamming = new Array(totalBits + 1).fill(0); // 1-based indexing
    let dataIndex = 0;
    const parityPositions = [];
    const paritySteps = [];

    // Place data bits, skipping parity positions
    for (let i = 1; i <= totalBits; i++) {
      if (isPowerOfTwo(i)) {
        parityPositions.push(i);
      } else {
        hamming[i] = parseInt(binary[dataIndex]);
        dataIndex++;
      }
    }

    // Calculate parity bits with steps
    for (let p = 0; p < parityBits; p++) {
      const parityPos = 2 ** p;
      let parity = 0;
      const bitsChecked = [];
      for (let i = parityPos; i <= totalBits; i += 2 * parityPos) {
        for (let j = i; j < i + parityPos && j <= totalBits; j++) {
          parity ^= hamming[j];
          bitsChecked.push(j);
        }
      }
      hamming[parityPos] = parity;
      paritySteps.push({
        position: parityPos,
        bitsChecked,
        result: parity,
      });
    }

    const hammingCode = hamming.slice(1).join("");
    return {
      original: binary,
      hammingCode,
      parityPositions,
      totalBits,
      paritySteps,
    };
  }, [parityBits]);

  const isPowerOfTwo = (n) => (n & (n - 1)) === 0 && n !== 0;

  const handleConvert = () => {
    setError("");
    setResult(null);

    if (!binaryInput) {
      setError("Please enter a binary number");
      return;
    }

    if (!validateBinary(binaryInput)) {
      setError("Invalid binary input: use only 0s and 1s");
      return;
    }

    const hammingResult = calculateHammingCode(binaryInput);
    if (hammingResult.error) {
      setError(hammingResult.error);
    } else {
      setResult(hammingResult);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleConvert();
  };

  const reset = () => {
    setBinaryInput("");
    setParityBits(4);
    setResult(null);
    setError("");
    setShowSteps(false);
  };

  const downloadResult = () => {
    if (!result) return;
    const text = `
Binary to Hamming Code Result
----------------------------
Original Binary: ${result.original}
Hamming Code: ${result.hammingCode}
Total Bits: ${result.totalBits}
Parity Bit Positions: ${result.parityPositions.join(", ")}
${showSteps ? "\nParity Calculation Steps:\n" + result.paritySteps.map(step => 
  `P${step.position}: XOR of bits at ${step.bitsChecked.join(", ")} = ${step.result}`).join("\n") : ""}
    `.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `hamming-encoded-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Hamming Code Converter
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input
              </label>
              <input
                type="text"
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                placeholder="e.g., 1011001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Parity Bits
              </label>
              <select
                value={parityBits}
                onChange={(e) => setParityBits(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} (Max data bits: {2 ** n - n - 1})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate
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
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Hamming Code Result</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Original Binary:</p>
                <p className="font-mono">{result.original}</p>
              </div>
              <div>
                <p className="font-medium">Hamming Code:</p>
                <p className="font-mono">{result.hammingCode}</p>
                <p>Total Bits: {result.totalBits}</p>
              </div>
              <div>
                <p className="font-medium">Detailed Breakdown:</p>
                <div className="font-mono text-xs">
                  <p>
                    Position:{" "}
                    {Array.from({ length: result.totalBits }, (_, i) =>
                      String(i + 1).padStart(2, " ")
                    ).join(" ")}
                  </p>
                  <p>
                    Bits:{" "}
                    {result.hammingCode
                      .split("")
                      .map((bit, i) => (
                        <span
                          key={i}
                          className={result.parityPositions.includes(i + 1) ? "text-blue-600" : ""}
                        >
                          {bit.padStart(2, " ")}
                        </span>
                      ))}
                  </p>
                  <p>
                    Type:{" "}
                    {Array.from({ length: result.totalBits }, (_, i) => (
                      <span
                        key={i}
                        className={result.parityPositions.includes(i + 1) ? "text-blue-600" : ""}
                      >
                        {result.parityPositions.includes(i + 1) ? "P" : "D"}
                        {String("").padStart(2, " ")}
                      </span>
                    ))}
                  </p>
                  <p className="text-gray-500">P = Parity, D = Data</p>
                </div>
              </div>
              <div>
                <p className="font-medium">Parity Bit Positions:</p>
                <p>{result.parityPositions.join(", ")}</p>
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
                  <span className="font-medium">Show Parity Calculation Steps</span>
                </label>
                {showSteps && (
                  <div className="mt-2 p-4 bg-white rounded-md border">
                    <h3 className="font-semibold mb-2">Parity Calculation Steps:</h3>
                    <ul className="list-disc list-inside space-y-2 text-xs">
                      {result.paritySteps.map((step, idx) => (
                        <li key={idx}>
                          Parity P{step.position}: XOR of bits at positions{" "}
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
            <li>Converts binary to Hamming Code with error correction</li>
            <li>Customizable parity bits (3-8)</li>
            <li>Shows detailed breakdown and parity calculation steps</li>
            <li>Download results as a text file</li>
            <li>Example: 1011 with 4 parity bits → 00110110011</li>
            <li>Parity positions: 1, 2, 4, 8, etc.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToHammingCode;