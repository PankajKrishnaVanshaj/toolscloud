"use client";
import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaSync } from "react-icons/fa";

const BinaryToBitwiseString = () => {
  const [inputs, setInputs] = useState(["", ""]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [bitLength, setBitLength] = useState(8);
  const [selectedOperation, setSelectedOperation] = useState("OR");
  const [displayMode, setDisplayMode] = useState("detailed"); // New: simple or detailed view
  const operations = ["AND", "OR", "XOR", "NOT", "NAND", "NOR", "XNOR"]; // Extended operations

  // Validation and conversion utilities
  const validateBinary = (binary) => /^[01]+$/.test(binary);
  const padBinary = (binary, length) => binary.padStart(length, "0");
  const binaryToDecimal = (binary) => parseInt(binary, 2);
  const decimalToBinary = (decimal, length) => {
    const binary = (decimal >>> 0).toString(2);
    return padBinary(binary, length);
  };

  // Perform bitwise operation
  const performBitwiseOperation = useCallback(() => {
    setError("");
    setResult(null);

    const validInputs = inputs.filter((input) => input.trim() !== "");
    if (validInputs.length === 0 || (selectedOperation !== "NOT" && validInputs.length < 2)) {
      setError(
        `Please enter ${selectedOperation === "NOT" ? "at least one" : "at least two"} binary number${selectedOperation === "NOT" ? "" : "s"}`
      );
      return;
    }

    for (const input of validInputs) {
      if (!validateBinary(input)) {
        setError(`Invalid binary input: ${input}`);
        return;
      }
    }

    const paddedInputs = validInputs.map((binary) => padBinary(binary, bitLength));
    const decimals = paddedInputs.map(binaryToDecimal);

    let resultDecimal;
    switch (selectedOperation) {
      case "AND":
        resultDecimal = decimals.reduce((acc, curr) => acc & curr);
        break;
      case "OR":
        resultDecimal = decimals.reduce((acc, curr) => acc | curr);
        break;
      case "XOR":
        resultDecimal = decimals.reduce((acc, curr) => acc ^ curr);
        break;
      case "NOT":
        resultDecimal = ~decimals[0] & ((1 << bitLength) - 1);
        break;
      case "NAND":
        resultDecimal = ~(decimals.reduce((acc, curr) => acc & curr)) & ((1 << bitLength) - 1);
        break;
      case "NOR":
        resultDecimal = ~(decimals.reduce((acc, curr) => acc | curr)) & ((1 << bitLength) - 1);
        break;
      case "XNOR":
        resultDecimal = ~(decimals.reduce((acc, curr) => acc ^ curr)) & ((1 << bitLength) - 1);
        break;
      default:
        setError("Invalid operation");
        return;
    }

    const binaryResult = decimalToBinary(resultDecimal, bitLength);
    setResult({
      inputs: paddedInputs,
      decimals,
      resultDecimal,
      binaryResult,
      operation: selectedOperation,
    });
  }, [inputs, selectedOperation, bitLength]);

  // Input management
  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const addInput = () => setInputs([...inputs, ""]);
  const removeInput = (index) => {
    if (inputs.length > (selectedOperation === "NOT" ? 1 : 2)) {
      setInputs(inputs.filter((_, i) => i !== index));
    }
  };

  const reset = () => {
    setInputs(selectedOperation === "NOT" ? [""] : ["", ""]);
    setResult(null);
    setError("");
    setBitLength(8);
    setSelectedOperation("OR");
    setDisplayMode("detailed");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performBitwiseOperation();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Binary Bitwise Calculator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Operation and Display Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bitwise Operation
              </label>
              <select
                value={selectedOperation}
                onChange={(e) => {
                  setSelectedOperation(e.target.value);
                  setInputs(
                    e.target.value === "NOT" && inputs.length > 1 ? [inputs[0]] : inputs
                  );
                }}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {operations.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Mode
              </label>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="simple">Simple</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            {inputs.map((input, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={`Binary ${index + 1} (e.g., 1010)`}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  disabled={selectedOperation === "NOT" && index > 0}
                />
                {inputs.length > (selectedOperation === "NOT" ? 1 : 2) && (
                  <button
                    type="button"
                    onClick={() => removeInput(index)}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            {selectedOperation !== "NOT" && (
              <button
                type="button"
                onClick={addInput}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                <FaPlus /> Add Input
              </button>
            )}
          </div>

          {/* Bit Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bit Length ({bitLength}-bit)
            </label>
            <input
              type="range"
              min="4"
              max="32"
              step="4"
              value={bitLength}
              onChange={(e) => setBitLength(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Results ({result.operation}):</h2>
            {displayMode === "simple" ? (
              <div className="space-y-2">
                <p>
                  Binary: <span className="font-mono">{result.binaryResult}</span>
                </p>
                <p>Decimal: {result.resultDecimal}</p>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium">Inputs:</p>
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
                  <p className="font-medium">Result:</p>
                  <div className="space-y-2">
                    <p>
                      Binary:{" "}
                      <span className="font-mono">{result.binaryResult}</span>
                    </p>
                    <p>Decimal: {result.resultDecimal}</p>
                    <p>
                      Hex:{" "}
                      {result.resultDecimal
                        .toString(16)
                        .toUpperCase()
                        .padStart(Math.ceil(bitLength / 4), "0")}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Visualization:</p>
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                    {result.inputs.map((input, index) => (
                      <p key={index}>{input} ({index + 1})</p>
                    ))}
                    <p className="border-t border-gray-300">
                      {"-".repeat(bitLength)}
                    </p>
                    <p>{result.binaryResult} ({result.operation})</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Operations: AND, OR, XOR, NOT, NAND, NOR, XNOR</li>
            <li>Adjustable bit length (4-32 bits)</li>
            <li>Multiple inputs for multi-operand operations</li>
            <li>Simple or detailed result display</li>
            <li>Binary, decimal, and hex output</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToBitwiseString;