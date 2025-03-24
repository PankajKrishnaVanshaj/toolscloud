"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy, FaDownload } from "react-icons/fa";
import { saveAs } from "file-saver"; // For downloading results

const BinaryBitRotator = () => {
  const [input, setInput] = useState("");
  const [bitLength, setBitLength] = useState(8);
  const [shiftAmount, setShiftAmount] = useState(1);
  const [direction, setDirection] = useState("left");
  const [result, setResult] = useState("");
  const [decimalResult, setDecimalResult] = useState("");
  const [hexResult, setHexResult] = useState("");
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState("");
  const [showSteps, setShowSteps] = useState(true);
  const bitLengths = [8, 16, 32, 64];

  const padBinary = (bin, length) => {
    return bin.padStart(length, "0").slice(-length);
  };

  const rotateBits = useCallback((binary, amount, dir) => {
    const normalizedBinary = padBinary(binary, bitLength);
    const stepsArray = [normalizedBinary];
    let current = normalizedBinary;

    amount = amount % bitLength; // Normalize shift amount
    if (amount === 0) return { final: current, steps: stepsArray };

    for (let i = 0; i < amount; i++) {
      if (dir === "left") {
        current = current.slice(1) + current[0];
      } else {
        current = current[current.length - 1] + current.slice(0, -1);
      }
      stepsArray.push(current);
    }

    return { final: current, steps: stepsArray };
  }, [bitLength]);

  const handleRotate = useCallback(() => {
    setError("");
    setSteps([]);
    setResult("");
    setDecimalResult("");
    setHexResult("");

    let binary;
    if (/^[01]+$/.test(input)) {
      binary = input;
    } else if (/^[0-9]+$/.test(input)) {
      binary = parseInt(input, 10).toString(2);
    } else if (/^0x[0-9A-Fa-f]+$/.test(input)) {
      binary = parseInt(input, 16).toString(2);
    } else {
      setError("Invalid input: Use binary (0s and 1s), decimal, or hex (0x prefix)");
      return;
    }

    if (binary.length > bitLength) {
      setError(`Input exceeds ${bitLength}-bit length`);
      return;
    }

    const { final, steps } = rotateBits(binary, shiftAmount, direction);
    setResult(final);
    setSteps(steps);
    setDecimalResult(parseInt(final, 2).toString(10));
    setHexResult("0x" + parseInt(final, 2).toString(16).toUpperCase());
  }, [input, bitLength, shiftAmount, direction]);

  const handleInputChange = (value) => {
    setInput(value);
    setError("");
  };

  const reset = () => {
    setInput("");
    setBitLength(8);
    setShiftAmount(1);
    setDirection("left");
    setResult("");
    setDecimalResult("");
    setHexResult("");
    setSteps([]);
    setError("");
    setShowSteps(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const downloadResults = () => {
    const content = `Input: ${input}\nBit Length: ${bitLength}\nShift Amount: ${shiftAmount}\nDirection: ${direction}\n\nResults:\nBinary: ${result}\nDecimal: ${decimalResult}\nHex: ${hexResult}\n\nSteps:\n${steps.map((step, index) => `Step ${index}: ${step}`).join("\n")}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `bit-rotation-${Date.now()}.txt`);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary Bit Rotator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input (Binary, Decimal, or Hex)
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="e.g., 1010, 10, or 0xA"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bit Length
                </label>
                <select
                  value={bitLength}
                  onChange={(e) => setBitLength(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {bitLengths.map((len) => (
                    <option key={len} value={len}>{len}-bit</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shift Amount
                </label>
                <input
                  type="number"
                  value={shiftAmount}
                  onChange={(e) => setShiftAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Direction
                </label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleRotate}
              disabled={!input}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Rotate Bits
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadResults}
              disabled={!result}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
          </div>

          {/* Results Section */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Results</h2>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Binary", value: result },
                  { label: "Decimal", value: decimalResult },
                  { label: "Hex", value: hexResult },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <p>
                      <span className="font-medium">{label}:</span> {value}
                    </p>
                    <button
                      onClick={() => copyToClipboard(value)}
                      className="p-1 text-gray-500 hover:text-blue-500"
                      title="Copy to clipboard"
                    >
                      <FaCopy />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps Section */}
          {steps.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-blue-800">Rotation Steps</h2>
                <label className="flex items-center text-sm text-blue-700">
                  <input
                    type="checkbox"
                    checked={showSteps}
                    onChange={(e) => setShowSteps(e.target.checked)}
                    className="mr-2 accent-blue-500"
                  />
                  Show Steps
                </label>
              </div>
              {showSteps && (
                <div className="space-y-2 text-sm font-mono max-h-48 overflow-y-auto">
                  {steps.map((step, index) => (
                    <p key={index} className={index === steps.length - 1 ? "font-bold" : ""}>
                      Step {index}: {step} {index === steps.length - 1 && "(Final)"}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports 8, 16, 32, 64-bit lengths</li>
            <li>Input: binary, decimal, or hex (0x prefix)</li>
            <li>Rotate bits left or right with step-by-step visualization</li>
            <li>Outputs in binary, decimal, and hex with copy functionality</li>
            <li>Download results as a text file</li>
            <li>Toggleable steps display</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryBitRotator;