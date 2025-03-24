"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaDownload, FaSync, FaEye, FaEyeSlash } from "react-icons/fa";

const BinomialTheoremExpander = () => {
  const [inputs, setInputs] = useState({ a: "", b: "", n: "" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [variableNames, setVariableNames] = useState({ a: "x", b: "y" });
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [expandedFormat, setExpandedFormat] = useState("simplified");

  // Calculate binomial coefficient (n choose k)
  const binomialCoefficient = (n, k) => {
    if (k === 0 || k === n) return 1;
    let result = 1;
    for (let i = 0; i < k; i++) {
      result *= (n - i) / (i + 1);
    }
    return Math.round(result);
  };

  // Expand binomial expression
  const expandBinomial = useCallback(
    (inputs) => {
      const a = parseFloat(inputs.a) || 0;
      const b = parseFloat(inputs.b) || 0;
      const n = parseInt(inputs.n);

      const steps = [
        `Expanding (${a}${variableNames.a} + ${b}${variableNames.b})^${n} using the Binomial Theorem:`,
        `Formula: (a + b)^n = Σ (n choose k) * a^(n-k) * b^k, k = 0 to ${n}`,
      ];

      if (
        isNaN(a) ||
        isNaN(b) ||
        isNaN(n) ||
        n < 0 ||
        !Number.isInteger(parseFloat(inputs.n))
      ) {
        return { error: "a and b must be numbers, n must be a non-negative integer" };
      }

      let expansion = [];
      let terms = [];

      for (let k = 0; k <= n; k++) {
        const coeff = binomialCoefficient(n, k);
        const aPower = n - k;
        const bPower = k;
        const termValue = coeff * Math.pow(a, aPower) * Math.pow(b, bPower);

        let term = "";
        if (coeff !== 0) {
          if (termValue === 0) continue;

          if (expandedFormat === "simplified") {
            term += coeff === 1 && (aPower > 0 || bPower > 0) ? "" : coeff;
            if (aPower > 0) {
              term += a === 1 && coeff === 1 ? "" : a === 1 ? "" : a;
              term += variableNames.a;
              if (aPower > 1) term += `^${aPower}`;
            }
            if (bPower > 0) term += term ? " + " : "";
            if (bPower > 0) {
              term += b === 1 && coeff === 1 ? "" : b === 1 ? "" : b;
              term += variableNames.b;
              if (bPower > 1) term += `^${bPower}`;
            }
            if (!term) term = termValue.toFixed(decimalPlaces);
          } else {
            term = `${coeff} * ${a}${variableNames.a}^${aPower} * ${b}${variableNames.b}^${bPower}`;
          }
          terms.push(termValue.toFixed(decimalPlaces));
          steps.push(
            `Term ${k}: (${n} choose ${k}) * ${a}^${aPower} * ${b}^${k} = ${coeff} * ${Math.pow(
              a,
              aPower
            ).toFixed(decimalPlaces)} * ${Math.pow(b, k).toFixed(
              decimalPlaces
            )} = ${termValue.toFixed(decimalPlaces)}`
          );
        }
        expansion.push(term || termValue.toFixed(decimalPlaces));
      }

      const expandedString = expansion
        .filter((t) => t)
        .join(" + ")
        .replace(/\+\s*-/, "- ");
      return { expanded: expandedString, terms, steps };
    },
    [variableNames, decimalPlaces, expandedFormat]
  );

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (field !== "n" && value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a number" }));
    } else if (
      field === "n" &&
      value &&
      (parseFloat(value) < 0 || !Number.isInteger(parseFloat(value)))
    ) {
      setErrors((prev) => ({
        ...prev,
        [field]: "Must be a non-negative integer",
      }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate inputs
  const isValid = useMemo(() => {
    return (
      (!inputs.a || !isNaN(parseFloat(inputs.a))) &&
      (!inputs.b || !isNaN(parseFloat(inputs.b))) &&
      inputs.n &&
      !isNaN(parseInt(inputs.n)) &&
      parseInt(inputs.n) >= 0 &&
      Number.isInteger(parseFloat(inputs.n)) &&
      Object.values(errors).every((err) => !err)
    );
  }, [inputs, errors]);

  // Perform expansion
  const expand = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({
        general: "Please provide valid inputs: a and b as numbers, n as a non-negative integer",
      });
      return;
    }

    const calcResult = expandBinomial(inputs);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setInputs({ a: "", b: "", n: "" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setVariableNames({ a: "x", b: "y" });
    setDecimalPlaces(2);
    setExpandedFormat("simplified");
  };

  // Download result as text file
  const downloadResult = () => {
    if (!result) return;
    const text = [
      `Binomial Expansion: (${inputs.a}${variableNames.a} + ${inputs.b}${variableNames.b})^${inputs.n}`,
      `Result: ${result.expanded}`,
      ...(showSteps ? ["\nSteps:"] : []),
      ...(showSteps ? result.steps : []),
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `binomial-expansion-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binomial Theorem Expander
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["a", "b"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {field} (term):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs[field]}
                    onChange={handleInputChange(field)}
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder={`e.g., ${field === "a" ? "1" : "2"}`}
                    aria-label={`${field} term`}
                  />
                  <input
                    type="text"
                    maxLength="2"
                    value={variableNames[field]}
                    onChange={(e) =>
                      setVariableNames((prev) => ({
                        ...prev,
                        [field]: e.target.value || field,
                      }))
                    }
                    className="w-12 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    aria-label={`${field} variable name`}
                  />
                </div>
                {errors[field] && (
                  <p className="text-red-600 text-xs mt-1">{errors[field]}</p>
                )}
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                n (exponent):
              </label>
              <input
                type="number"
                step="1"
                value={inputs.n}
                onChange={handleInputChange("n")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 3"
                aria-label="Exponent (n)"
              />
              {errors.n && (
                <p className="text-red-600 text-xs mt-1">{errors.n}</p>
              )}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Places
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={decimalPlaces}
                onChange={(e) =>
                  setDecimalPlaces(Math.max(0, Math.min(10, e.target.value)))
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                value={expandedFormat}
                onChange={(e) => setExpandedFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="simplified">Simplified</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={expand}
              disabled={!isValid}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Expand
            </button>
            <button
              onClick={downloadResult}
              disabled={!result}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-center">
              {errors.general}
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="p-4 bg-blue-50 rounded-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Expanded Form:
              </h2>
              <p className="text-center text-lg break-words">
                {result.expanded}
              </p>
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="flex items-center gap-2 mx-auto mt-2 text-blue-600 hover:underline"
              >
                {showSteps ? <FaEyeSlash /> : <FaEye />}
                {showSteps ? "Hide Steps" : "Show Steps"}
              </button>
              {showSteps && (
                <ul className="mt-2 text-sm list-disc list-inside bg-white p-4 rounded-md shadow-inner">
                  {result.steps.map((step, i) => (
                    <li key={i} className="mb-1">
                      {step}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Custom variable names for terms</li>
            <li>Adjustable decimal precision</li>
            <li>Simplified or detailed expansion format</li>
            <li>Step-by-step calculation breakdown</li>
            <li>Download result as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinomialTheoremExpander;