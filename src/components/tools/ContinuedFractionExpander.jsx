"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const ContinuedFractionExpander = () => {
  const [number, setNumber] = useState("");
  const [maxTerms, setMaxTerms] = useState("10");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [precision, setPrecision] = useState(6); // Decimal precision for convergents
  const [format, setFormat] = useState("semicolon"); // Display format for terms

  // Compute continued fraction expansion
  const expandContinuedFraction = useCallback(() => {
    const steps = ["Expanding as continued fraction:"];
    let num;

    // Parse input (decimal or fraction)
    if (number.includes("/")) {
      const [numerator, denominator] = number.split("/").map((n) => parseFloat(n.trim()));
      if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
        return { error: "Invalid fraction format (use e.g., 13/11)" };
      }
      num = numerator / denominator;
    } else {
      num = parseFloat(number);
    }

    if (isNaN(num) || num <= 0) {
      return { error: "Input must be a positive number" };
    }

    const terms = [];
    const convergents = [];
    let x = num;
    const limit = parseInt(maxTerms) || 10;

    steps.push(`Starting with ${num.toFixed(precision)}`);

    // Generate terms
    while (terms.length < limit && x !== 0) {
      const a = Math.floor(x);
      terms.push(a);
      steps.push(`Term ${terms.length}: ⌊${x.toFixed(precision)}⌋ = ${a}`);

      // Compute convergent
      let p = a,
        q = 1;
      for (let i = terms.length - 2; i >= 0; i--) {
        const tempP = p;
        p = terms[i] * p + (i === terms.length - 1 ? 1 : convergents[i].p);
        q = terms[i] * q + (i === terms.length - 1 ? 0 : convergents[i].q);
      }
      convergents.push({ p, q, value: p / q });
      steps.push(`Convergent ${terms.length}: ${p}/${q} = ${(p / q).toFixed(precision)}`);

      x = 1 / (x - a);
      if (!isFinite(x) || x < 1e-10) break;
    }

    steps.push(`Continued fraction: [${terms.join("; ")}]`);
    return { terms, convergents, steps };
  }, [number, maxTerms, precision]);

  // Handle input changes
  const handleNumberChange = (e) => {
    const value = e.target.value;
    setNumber(value);
    setResult(null);

    if (!value) {
      setErrors((prev) => ({ ...prev, number: "Number is required" }));
    } else if (value.includes("/") && !/^\d+\s*\/\s*\d+$/.test(value)) {
      setErrors((prev) => ({ ...prev, number: "Invalid fraction (e.g., 13/11)" }));
    } else if (
      !value.includes("/") &&
      (isNaN(parseFloat(value)) || parseFloat(value) <= 0)
    ) {
      setErrors((prev) => ({ ...prev, number: "Must be a positive number" }));
    } else {
      setErrors((prev) => ({ ...prev, number: "" }));
    }
  };

  const handleMaxTermsChange = (e) => {
    const value = e.target.value;
    setMaxTerms(value);
    setResult(null);

    if (value && (isNaN(parseInt(value)) || parseInt(value) <= 0)) {
      setErrors((prev) => ({ ...prev, maxTerms: "Must be a positive integer" }));
    } else {
      setErrors((prev) => ({ ...prev, maxTerms: "" }));
    }
  };

  const handlePrecisionChange = (e) => {
    const value = parseInt(e.target.value);
    setPrecision(Math.max(1, Math.min(12, value)));
    setResult(null);
  };

  // Validate inputs
  const isValid = useMemo(() => {
    const numValid =
      number &&
      ((number.includes("/") &&
        /^\d+\s*\/\s*\d+$/.test(number) &&
        parseFloat(number.split("/")[1]) !== 0) ||
        (!number.includes("/") && !isNaN(parseFloat(number)) && parseFloat(number) > 0));
    const termsValid = !maxTerms || (!isNaN(parseInt(maxTerms)) && parseInt(maxTerms) > 0);
    return numValid && termsValid && Object.values(errors).every((err) => !err);
  }, [number, maxTerms, errors]);

  // Generate expansion
  const expand = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({ ...prev, general: "Please provide valid inputs" }));
      return;
    }

    const expResult = expandContinuedFraction();
    if (expResult.error) {
      setErrors({ general: expResult.error });
    } else {
      setResult(expResult);
    }
  };

  // Reset state
  const reset = () => {
    setNumber("");
    setMaxTerms("10");
    setPrecision(6);
    setFormat("semicolon");
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  // Download result as text file
  const downloadResult = () => {
    if (!result) return;
    const text = [
      `Continued Fraction Expansion of ${number}`,
      `Max Terms: ${maxTerms}`,
      `Precision: ${precision} decimal places`,
      `\nContinued Fraction: [${result.terms.join(format === "semicolon" ? "; " : ", ")}]`,
      "\nConvergents:",
      ...result.convergents.map((c, i) => `${i + 1}: ${c.p}/${c.q} ≈ ${c.value.toFixed(precision)}`),
      "\nSteps:",
      ...result.steps,
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `continued-fraction-${number}-${Date.now()}.txt`;
    link.click();
  };

  // Format terms display
  const formattedTerms = result
    ? format === "semicolon"
      ? result.terms.join("; ")
      : result.terms.join(", ")
    : "";

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Continued Fraction Expander
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
              <input
                type="text"
                value={number}
                onChange={handleNumberChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 3.14159 or 13/11"
                aria-label="Number to expand"
              />
              {errors.number && (
                <p className="text-red-600 text-xs mt-1">{errors.number}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Terms
              </label>
              <input
                type="number"
                step="1"
                value={maxTerms}
                onChange={handleMaxTermsChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10"
                aria-label="Maximum number of terms"
              />
              {errors.maxTerms && (
                <p className="text-red-600 text-xs mt-1">{errors.maxTerms}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision (decimals)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={precision}
                onChange={handlePrecisionChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Term Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="semicolon">Semicolon (;)</option>
                <option value="comma">Comma (,)</option>
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={expand}
              disabled={!isValid}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
            >
              Expand
            </button>
            <button
              onClick={downloadResult}
              disabled={!result}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-all font-semibold flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all font-semibold flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">
              Continued Fraction:
            </h2>
            <p className="text-center text-xl font-mono">[ {formattedTerms} ]</p>
            <h3 className="text-md font-semibold text-gray-700 text-center mt-4">
              Convergents:
            </h3>
            <ul className="text-center text-sm space-y-1 max-h-40 overflow-y-auto font-mono">
              {result.convergents.map((conv, i) => (
                <li key={i}>{`${conv.p}/${conv.q} ≈ ${conv.value.toFixed(precision)}`}</li>
              ))}
            </ul>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-4 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Calculation Steps:</h4>
                <ul className="text-sm list-disc list-inside space-y-1 font-mono">
                  {result.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Supports decimals and fractions (e.g., 3.14159 or 13/11)</li>
            <li>Customizable max terms and decimal precision</li>
            <li>Choice of term separators (semicolon or comma)</li>
            <li>Detailed step-by-step breakdown</li>
            <li>Download results as a text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContinuedFractionExpander;