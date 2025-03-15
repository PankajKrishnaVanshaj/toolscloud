"use client";
import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading results

const BinaryAdditionCalculator = () => {
  const [inputs, setInputs] = useState(["", ""]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [bitLength, setBitLength] = useState(8);
  const [showSteps, setShowSteps] = useState(true);
  const [baseDisplay, setBaseDisplay] = useState(["binary", "decimal", "hex"]);
  const resultRef = React.useRef(null);

  const validateBinary = (binary) => /^[01]+$/.test(binary);

  const padBinary = (binary, length) => binary.padStart(length, "0");

  const binaryToDecimal = (binary) => parseInt(binary, 2);

  const decimalToBinary = (decimal, length) =>
    decimal.toString(2).padStart(length, "0");

  const performBinaryAddition = useCallback(() => {
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

    const paddedInputs = validInputs.map((binary) => padBinary(binary, bitLength));
    let carry = 0;
    let binaryResult = "";
    const steps = [];

    for (let i = bitLength - 1; i >= 0; i--) {
      const bits = paddedInputs.map((input) => parseInt(input[i]));
      const sum = bits.reduce((acc, bit) => acc + bit, 0) + carry;
      const bitResult = sum % 2;
      carry = Math.floor(sum / 2);
      binaryResult = bitResult + binaryResult;
      steps.unshift({
        position: bitLength - i,
        bits: bits.map((bit) => bit.toString()),
        carryIn: i === bitLength - 1 ? "0" : carry.toString(),
        sum: sum.toString(),
        bitResult: bitResult.toString(),
        carryOut: carry.toString(),
      });
    }

    const decimalResult = binaryToDecimal(binaryResult);
    setResult({
      inputs: paddedInputs,
      decimals: paddedInputs.map(binaryToDecimal),
      binaryResult,
      decimalResult,
      steps,
      overflow: carry > 0,
    });

    if (carry > 0) {
      setError("Overflow detected: Result exceeds selected bit length");
    }
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
    setBaseDisplay(["binary", "decimal", "hex"]);
  };

  const downloadResult = () => {
    if (resultRef.current) {
      html2canvas(resultRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `binary-addition-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performBinaryAddition();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Binary Addition Calculator
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
                  placeholder={`Binary ${index + 1} (e.g., 1010)`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {inputs.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeInput(index)}
                    className="mt-2 sm:mt-0 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addInput}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <FaPlus className="mr-2" /> Add Input
            </button>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                Display Bases
              </label>
              <div className="flex flex-wrap gap-2">
                {["binary", "decimal", "hex"].map((base) => (
                  <label key={base} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={baseDisplay.includes(base)}
                      onChange={() =>
                        setBaseDisplay((prev) =>
                          prev.includes(base)
                            ? prev.filter((b) => b !== base)
                            : [...prev, base]
                        )
                      }
                      className="mr-1 accent-blue-500"
                    />
                    <span className="text-sm capitalize">{base}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showSteps}
                  onChange={(e) => setShowSteps(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Show Steps
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Reset
            </button>
            {result && (
              <button
                type="button"
                onClick={downloadResult}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
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
          <div ref={resultRef} className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Results:</h2>
            <div className="space-y-6 text-sm">
              <div>
                <p className="font-medium">Inputs (Padded):</p>
                <div className="grid gap-2">
                  {result.inputs.map((input, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="font-mono">{input}</span>
                      <span className="text-gray-500">
                        (decimal: {result.decimals[index]})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium">Addition Result:</p>
                <div className="flex flex-col gap-2">
                  {baseDisplay.includes("binary") && (
                    <p>
                      Binary: {result.binaryResult}{" "}
                      {result.overflow && <span className="text-red-500">(overflow)</span>}
                    </p>
                  )}
                  {baseDisplay.includes("decimal") && (
                    <p>Decimal: {result.decimalResult}</p>
                  )}
                  {baseDisplay.includes("hex") && (
                    <p>
                      Hex:{" "}
                      {result.decimalResult
                        .toString(16)
                        .toUpperCase()
                        .padStart(Math.ceil(bitLength / 4), "0")}
                    </p>
                  )}
                </div>
              </div>
              {showSteps && (
                <div>
                  <p className="font-medium">Step-by-Step Calculation:</p>
                  <div className="font-mono text-xs overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border-b p-2">Position</th>
                          {result.inputs.map((_, i) => (
                            <th key={i} className="border-b p-2">
                              Input {i + 1}
                            </th>
                          ))}
                          <th className="border-b p-2">Carry In</th>
                          <th className="border-b p-2">Sum</th>
                          <th className="border-b p-2">Bit Result</th>
                          <th className="border-b p-2">Carry Out</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.steps.map((step, index) => (
                          <tr key={index} className="hover:bg-gray-100">
                            <td className="p-2 text-center">{step.position}</td>
                            {step.bits.map((bit, i) => (
                              <td key={i} className="p-2 text-center">
                                {bit}
                              </td>
                            ))}
                            <td className="p-2 text-center">{step.carryIn}</td>
                            <td className="p-2 text-center">{step.sum}</td>
                            <td className="p-2 text-center">{step.bitResult}</td>
                            <td className="p-2 text-center">{step.carryOut}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
            <li>Multiple binary number addition</li>
            <li>Custom bit length (4, 8, 16, 32)</li>
            <li>Toggleable step-by-step calculation</li>
            <li>Customizable result display (binary, decimal, hex)</li>
            <li>Overflow detection</li>
            <li>Download results as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryAdditionCalculator;