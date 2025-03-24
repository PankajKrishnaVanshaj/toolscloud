"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaCopy, FaCheck } from "react-icons/fa";

const FractionSimplifier = () => {
  const [inputs, setInputs] = useState({ numerator: "", denominator: "" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [format, setFormat] = useState("fraction"); // fraction, decimal, mixed
  const [copied, setCopied] = useState(false);

  // Calculate GCD using Euclidean algorithm
  const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  };

  // Simplify the fraction and generate additional formats
  const simplifyFraction = useCallback((numer, denom) => {
    const steps = ["Simplifying the fraction:"];
    const numerator = parseInt(numer);
    const denominator = parseInt(denom);

    if (isNaN(numerator) || isNaN(denominator)) {
      return { error: "Numerator and denominator must be integers" };
    }
    if (denominator === 0) {
      return { error: "Denominator cannot be zero" };
    }

    steps.push(`Original fraction: ${numerator}/${denominator}`);

    // Handle negative fractions
    const sign = numerator < 0 !== denominator < 0 ? -1 : 1;
    const absNumer = Math.abs(numerator);
    const absDenom = Math.abs(denominator);

    // Calculate GCD
    const divisor = gcd(absNumer, absDenom);
    steps.push(`Find GCD of ${absNumer} and ${absDenom} = ${divisor}`);

    // Simplify
    const simplifiedNumer = (sign * absNumer) / divisor;
    const simplifiedDenom = absDenom / divisor;
    steps.push(`Divide numerator and denominator by ${divisor}:`);
    steps.push(`${numerator} / ${divisor} = ${simplifiedNumer}`);
    steps.push(`${denominator} / ${divisor} = ${simplifiedDenom}`);

    // Additional formats
    const decimal = simplifiedNumer / simplifiedDenom;
    const whole = Math.floor(Math.abs(simplifiedNumer) / simplifiedDenom);
    const mixedNumer = Math.abs(simplifiedNumer) % simplifiedDenom;
    const mixed = whole
      ? `${sign < 0 ? "-" : ""}${whole} ${mixedNumer}/${simplifiedDenom}`
      : null;

    steps.push(`Simplified fraction: ${simplifiedNumer}/${simplifiedDenom}`);
    steps.push(`Decimal form: ${decimal.toFixed(3)}`);
    if (mixed) steps.push(`Mixed number: ${mixed}`);

    return {
      simplifiedNumer,
      simplifiedDenom,
      decimal,
      mixed,
      steps,
    };
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);
    setCopied(false);

    if (value && (isNaN(parseInt(value)) || !Number.isInteger(parseFloat(value)))) {
      setErrors((prev) => ({ ...prev, [field]: "Must be an integer" }));
    } else if (field === "denominator" && value && parseInt(value) === 0) {
      setErrors((prev) => ({ ...prev, [field]: "Cannot be zero" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    return (
      inputs.numerator &&
      !isNaN(parseInt(inputs.numerator)) &&
      Number.isInteger(parseFloat(inputs.numerator)) &&
      inputs.denominator &&
      !isNaN(parseInt(inputs.denominator)) &&
      Number.isInteger(parseFloat(inputs.denominator)) &&
      parseInt(inputs.denominator) !== 0 &&
      Object.values(errors).every((err) => !err)
    );
  }, [inputs, errors]);

  // Simplify fraction
  const simplify = () => {
    setErrors({});
    setResult(null);
    setCopied(false);

    if (!isValid) {
      setErrors({ general: "Please provide valid integer inputs (denominator ≠ 0)" });
      return;
    }

    const calcResult = simplifyFraction(inputs.numerator, inputs.denominator);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setInputs({ numerator: "", denominator: "" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setFormat("fraction");
    setCopied(false);
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (!result) return;
    let text = "";
    switch (format) {
      case "fraction":
        text = `${result.simplifiedNumer}/${result.simplifiedDenom}`;
        break;
      case "decimal":
        text = result.decimal.toString();
        break;
      case "mixed":
        text = result.mixed || `${result.simplifiedNumer}/${result.simplifiedDenom}`;
        break;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Fraction Simplifier
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {["numerator", "denominator"].map((field) => (
            <div key={field} className="flex items-center gap-2">
              <label className="w-28 text-gray-700 capitalize">{field}:</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="1"
                  value={inputs[field]}
                  onChange={handleInputChange(field)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., ${field === "numerator" ? "12" : "18"}`}
                  aria-label={field}
                />
                {errors[field] && (
                  <p className="text-red-600 text-sm mt-1">{errors[field]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="fraction">Fraction</option>
            <option value="decimal">Decimal</option>
            <option value="mixed">Mixed Number</option>
          </select>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={simplify}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Simplify
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">
              Result:
            </h2>
            <p className="text-center text-xl mb-2">
              {format === "fraction" && `${result.simplifiedNumer}/${result.simplifiedDenom}`}
              {format === "decimal" && result.decimal.toFixed(3)}
              {format === "mixed" &&
                (result.mixed || `${result.simplifiedNumer}/${result.simplifiedDenom}`)}
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showSteps ? "Hide Steps" : "Show Steps"}
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center text-sm text-blue-600 hover:underline"
              >
                {copied ? (
                  <>
                    <FaCheck className="mr-1" /> Copied
                  </>
                ) : (
                  <>
                    <FaCopy className="mr-1" /> Copy
                  </>
                )}
              </button>
            </div>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside transition-opacity">
                {result.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Simplify fractions with GCD calculation</li>
            <li>Multiple display formats: Fraction, Decimal, Mixed Number</li>
            <li>Step-by-step simplification process</li>
            <li>Copy result to clipboard</li>
            <li>Real-time input validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FractionSimplifier;