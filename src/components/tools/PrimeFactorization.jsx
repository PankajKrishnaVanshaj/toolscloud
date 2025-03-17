"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaDownload, FaEye, FaEyeSlash } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading result

const PrimeFactorization = () => {
  const [number, setNumber] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSteps, setShowSteps] = useState(false);
  const [format, setFormat] = useState("multiplication"); // multiplication or exponential
  const resultRef = React.useRef(null);

  // Compute prime factorization
  const factorize = useCallback((num) => {
    const steps = [`Factorizing ${num}:`];
    let n = parseInt(num);
    const factors = {};

    if (isNaN(n) || n <= 0) {
      return { error: "Please enter a positive integer" };
    }
    if (n === 1) {
      steps.push("1 has no prime factors.");
      return { factors: {}, steps };
    }

    // Trial division
    while (n % 2 === 0) {
      factors[2] = (factors[2] || 0) + 1;
      steps.push(`${n} ÷ 2 = ${n / 2}`);
      n /= 2;
    }
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      while (n % i === 0) {
        factors[i] = (factors[i] || 0) + 1;
        steps.push(`${n} ÷ ${i} = ${n / i}`);
        n /= i;
      }
    }
    if (n > 2) {
      factors[n] = (factors[n] || 0) + 1;
      steps.push(`Remaining factor: ${n}`);
    }

    // Construct factorization strings
    const multiplication = Object.keys(factors)
      .flatMap((factor) => Array(factors[factor]).fill(factor))
      .join(" × ");
    const exponential = Object.entries(factors)
      .map(([factor, count]) => (count > 1 ? `${factor}^${count}` : factor))
      .join(" × ");

    steps.push(`Prime factorization (multiplication): ${multiplication}`);
    steps.push(`Prime factorization (exponential): ${exponential}`);

    return { factors, steps, multiplication, exponential };
  }, []);

  // Handle input change with validation
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNumber(value);
    setResult(null);
    setError("");

    if (value && (isNaN(parseInt(value)) || parseInt(value) <= 0 || !Number.isInteger(parseFloat(value)))) {
      setError("Please enter a positive integer");
    }
  };

  // Check if input is valid
  const isValid = useMemo(() => {
    return (
      number &&
      !isNaN(parseInt(number)) &&
      parseInt(number) > 0 &&
      Number.isInteger(parseFloat(number)) &&
      !error
    );
  }, [number, error]);

  // Perform factorization
  const calculate = () => {
    setError("");
    setResult(null);

    if (!isValid) {
      setError("Please enter a valid positive integer");
      return;
    }

    const calcResult = factorize(number);
    if (calcResult.error) {
      setError(calcResult.error);
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setNumber("");
    setResult(null);
    setError("");
    setShowSteps(false);
    setFormat("multiplication");
  };

  // Download result as image
  const downloadResult = () => {
    if (resultRef.current && result) {
      html2canvas(resultRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `prime-factorization-${number}-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Prime Factorization Tool
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <label className="w-32 text-gray-700 font-medium">Number:</label>
            <div className="flex-1 w-full">
              <input
                type="number"
                step="1"
                value={number}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 60"
                aria-label="Number to factorize"
              />
              {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
            </div>
          </div>

          {/* Format Selection */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <label className="w-32 text-gray-700 font-medium">Display Format:</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full sm:flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="multiplication">Multiplication (2 × 2 × 3)</option>
              <option value="exponential">Exponential (2² × 3)</option>
            </select>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              disabled={!isValid}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Factorize
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all font-semibold flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            {result && (
              <button
                onClick={downloadResult}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            )}
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div ref={resultRef} className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Prime Factorization:</h2>
            <p className="text-center text-xl sm:text-2xl font-mono">
              {number} = {format === "multiplication" ? result.multiplication || "1" : result.exponential || "1"}
            </p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              {showSteps ? <FaEyeSlash /> : <FaEye />}
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside text-gray-600 max-h-40 overflow-y-auto">
                {result.steps.map((step, i) => (
                  <li key={i} className="py-1">{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Factorize positive integers into prime factors</li>
            <li>Two display formats: multiplication and exponential</li>
            <li>Step-by-step factorization process</li>
            <li>Download result as PNG</li>
            <li>Input validation and error handling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PrimeFactorization;