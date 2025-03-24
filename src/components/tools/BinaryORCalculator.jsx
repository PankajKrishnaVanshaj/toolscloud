"use client";
import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaSync } from "react-icons/fa";

const BinaryORCalculator = () => {
  const [inputs, setInputs] = useState([{ value: "", base: "binary" }]);
  const [bitLength, setBitLength] = useState(8);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSteps, setShowSteps] = useState(false);

  const bases = [
    { name: "Binary", value: "binary", radix: 2, validator: /^[01]+$/ },
    { name: "Decimal", value: "decimal", radix: 10, validator: /^\d+$/ },
    { name: "Hexadecimal", value: "hex", radix: 16, validator: /^[0-9A-Fa-f]+$/ },
  ];

  const validateInput = (value, base) => {
    const validator = bases.find((b) => b.value === base).validator;
    return validator.test(value);
  };

  const convertToDecimal = (value, base) => {
    return parseInt(value, bases.find((b) => b.value === base).radix);
  };

  const padBinary = (binary, length) => binary.padStart(length, "0");

  const decimalToBinary = (decimal, length) =>
    decimal.toString(2).padStart(length, "0");

  const decimalToHex = (decimal, length) =>
    decimal.toString(16).toUpperCase().padStart(Math.ceil(length / 4), "0");

  const calculateOR = useCallback(() => {
    setError("");
    setResult(null);

    const validInputs = inputs.filter((input) => input.value.trim() !== "");
    if (validInputs.length < 2) {
      setError("Please enter at least two numbers");
      return;
    }

    const decimals = [];
    for (const input of validInputs) {
      if (!validateInput(input.value, input.base)) {
        setError(`Invalid ${input.base} input: ${input.value}`);
        return;
      }
      decimals.push(convertToDecimal(input.value, input.base));
    }

    const orResult = decimals.reduce((acc, curr) => acc | curr, 0);
    const binaryInputs = decimals.map((dec) => decimalToBinary(dec, bitLength));
    const binaryResult = decimalToBinary(orResult, bitLength);
    const hexResult = decimalToHex(orResult, bitLength);

    setResult({
      inputs: validInputs.map((input, index) => ({
        value: input.value,
        base: input.base,
        binary: binaryInputs[index],
        decimal: decimals[index],
      })),
      result: {
        decimal: orResult,
        binary: binaryResult,
        hex: hexResult,
      },
      steps: decimals.map((dec, idx) => ({
        step: idx === 0 ? "Initial" : `OR with Input ${idx + 1}`,
        binary: decimalToBinary(
          idx === 0 ? dec : decimals.slice(0, idx + 1).reduce((a, b) => a | b),
          bitLength
        ),
      })),
    });
  }, [inputs, bitLength]);

  const handleInputChange = (index, field, value) => {
    const newInputs = [...inputs];
    newInputs[index][field] = value;
    setInputs(newInputs);
  };

  const addInput = () => setInputs([...inputs, { value: "", base: "binary" }]);

  const removeInput = (index) => {
    if (inputs.length > 2) {
      setInputs(inputs.filter((_, i) => i !== index));
    }
  };

  const reset = () => {
    setInputs([{ value: "", base: "binary" }, { value: "", base: "binary" }]);
    setBitLength(8);
    setResult(null);
    setError("");
    setShowSteps(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateOR();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary OR Calculator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            {inputs.map((input, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4"
              >
                <select
                  value={input.base}
                  onChange={(e) => handleInputChange(index, "base", e.target.value)}
                  className="w-full sm:w-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {bases.map((base) => (
                    <option key={base.value} value={base.value}>
                      {base.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={input.value}
                  onChange={(e) => handleInputChange(index, "value", e.target.value)}
                  placeholder={`Number ${index + 1} (${input.base})`}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                {inputs.length > 2 && (
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
            <div className="flex gap-4">
              <button
                type="button"
                onClick={addInput}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                <FaPlus className="mr-2" /> Add Input
              </button>
              <button
                type="button"
                onClick={reset}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Bit Length Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bit Length
              </label>
              <select
                value={bitLength}
                onChange={(e) => setBitLength(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value={4}>4-bit</option>
                <option value={8}>8-bit</option>
                <option value={16}>16-bit</option>
                <option value={32}>32-bit</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showSteps}
                  onChange={(e) => setShowSteps(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Calculation Steps</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Calculate OR
          </button>
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
            <div className="space-y-6 text-sm">
              {/* Inputs */}
              <div>
                <p className="font-medium text-gray-700">Inputs:</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.inputs.map((input, index) => (
                    <div key={index} className="p-2 bg-white rounded-md shadow-sm">
                      <p>
                        <strong>{input.base.charAt(0).toUpperCase() + input.base.slice(1)}:</strong>{" "}
                        {input.value}
                      </p>
                      <p className="text-gray-600">Decimal: {input.decimal}</p>
                      <p className="text-gray-600">Binary: {input.binary}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Result */}
              <div>
                <p className="font-medium text-gray-700">OR Result:</p>
                <div className="p-2 bg-white rounded-md shadow-sm">
                  <p>Binary: <span className="font-mono">{result.result.binary}</span></p>
                  <p>Decimal: {result.result.decimal}</p>
                  <p>Hex: <span className="font-mono">{result.result.hex}</span></p>
                </div>
              </div>

              {/* Steps */}
              {showSteps && (
                <div>
                  <p className="font-medium text-gray-700">Calculation Steps (Binary):</p>
                  <div className="font-mono text-xs p-2 bg-white rounded-md shadow-sm">
                    {result.steps.map((step, idx) => (
                      <p key={idx}>
                        {step.step.padEnd(15, " ")}: {step.binary}
                      </p>
                    ))}
                    <p className="border-t border-gray-300 my-1"></p>
                    <p>Result{" ".padEnd(13, " ")}: {result.result.binary}</p>
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
            <li>Bitwise OR operation on multiple inputs</li>
            <li>Supports Binary, Decimal, and Hexadecimal inputs</li>
            <li>Custom bit length: 4, 8, 16, 32 bits</li>
            <li>Dynamic input addition/removal (minimum 2)</li>
            <li>Results in all three bases</li>
            <li>Optional step-by-step binary calculation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryORCalculator;