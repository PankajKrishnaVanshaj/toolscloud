"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaDownload, FaSync, FaEye, FaEyeSlash } from "react-icons/fa";

const TaylorSeriesGenerator = () => {
  const [func, setFunc] = useState("sin"); // Function to expand
  const [center, setCenter] = useState("0"); // Center point a
  const [terms, setTerms] = useState("5"); // Number of terms
  const [precision, setPrecision] = useState("4"); // Decimal precision
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [variable, setVariable] = useState("x"); // Custom variable name

  // Factorial helper
  const factorial = (n) => {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  };

  // Derivative functions
  const getDerivative = (func, k, a) => {
    const x = parseFloat(a);
    switch (func) {
      case "sin":
        const sinCycle = k % 4;
        if (sinCycle === 0) return Math.sin(x);
        if (sinCycle === 1) return Math.cos(x);
        if (sinCycle === 2) return -Math.sin(x);
        if (sinCycle === 3) return -Math.cos(x);
        break;
      case "cos":
        const cosCycle = k % 4;
        if (cosCycle === 0) return Math.cos(x);
        if (cosCycle === 1) return -Math.sin(x);
        if (cosCycle === 2) return -Math.cos(x);
        if (cosCycle === 3) return Math.sin(x);
        break;
      case "exp":
        return Math.exp(x);
      case "ln":
        return k === 0 ? Math.log(Math.abs(x)) : (factorial(k - 1) * (-1) ** (k - 1)) / x ** k;
      case "sqrt":
        // Taylor series for sqrt(x) around a > 0
        if (x <= 0) return NaN;
        const sqrtA = Math.sqrt(x);
        if (k === 0) return sqrtA;
        let coeff = sqrtA;
        for (let i = 1; i <= k; i++) {
          coeff *= (1 - 2 * i) / (2 * i * x);
        }
        return coeff;
      default:
        return 0;
    }
  };

  // Generate Taylor series
  const generateTaylorSeries = useCallback(() => {
    const steps = [
      `Generating Taylor series for ${func === "exp" ? "e^" : func === "ln" ? "ln" : func === "sqrt" ? "√" : func}(${variable}) around ${variable} = ${center}:`,
    ];
    const a = parseFloat(center);
    const n = parseInt(terms);
    const prec = parseInt(precision);

    if (isNaN(a) || (func === "ln" && a <= 0) || (func === "sqrt" && a <= 0)) {
      return { error: "Center point must be a valid number (positive for ln and sqrt)" };
    }
    if (isNaN(n) || n <= 0 || !Number.isInteger(n)) {
      return { error: "Number of terms must be a positive integer" };
    }
    if (isNaN(prec) || prec < 0 || !Number.isInteger(prec)) {
      return { error: "Precision must be a non-negative integer" };
    }

    steps.push(`Formula: f(${variable}) = Σ [f^(k)(${a}) / k!] * (${variable} - ${a})^k from k = 0 to ${n - 1}`);

    const seriesTerms = [];
    for (let k = 0; k < n; k++) {
      const deriv = getDerivative(func, k, a);
      if (isNaN(deriv)) {
        return { error: `Derivative calculation failed for ${func} at ${variable} = ${a}` };
      }
      const coeff = deriv / factorial(k);
      const term =
        coeff === 0
          ? null
          : k === 0
          ? coeff.toFixed(prec)
          : `${coeff.toFixed(prec)} * (${variable} - ${a})${k > 1 ? `^${k}` : ""}`;
      if (term) seriesTerms.push(term);

      steps.push(
        `k = ${k}: f^(${k})(${a}) = ${deriv.toFixed(prec)}, ${k}! = ${factorial(k)}, Term = ${term || "0"}`
      );
    }

    const series = seriesTerms.join(" + ").replace(/\+\s*-/, "- ");
    steps.push(`Taylor Series: ${series}`);
    return { series, steps };
  }, [func, center, terms, precision, variable]);

  // Input validation
  const handleInputChange = (setter, field) => (e) => {
    const value = e.target.value;
    setter(value);
    setResult(null);
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateInputs = useMemo(() => {
    const a = parseFloat(center);
    const n = parseInt(terms);
    const p = parseInt(precision);
    return (
      !isNaN(a) &&
      (func !== "ln" || a > 0) &&
      (func !== "sqrt" || a > 0) &&
      !isNaN(n) &&
      n > 0 &&
      Number.isInteger(n) &&
      !isNaN(p) &&
      p >= 0 &&
      Number.isInteger(p) &&
      variable.trim().length > 0 &&
      Object.values(errors).every((err) => !err)
    );
  }, [center, terms, precision, func, variable, errors]);

  // Generate series
  const generate = () => {
    setErrors({});
    setResult(null);

    if (!validateInputs) {
      setErrors((prev) => ({
        ...prev,
        general: "Please provide valid inputs",
      }));
      return;
    }

    const genResult = generateTaylorSeries();
    if (genResult.error) {
      setErrors({ general: genResult.error });
    } else {
      setResult(genResult);
    }
  };

  // Download result as text
  const downloadResult = () => {
    if (!result) return;
    const text = [
      `Taylor Series for ${func === "exp" ? "e^" : func === "ln" ? "ln" : func === "sqrt" ? "√" : func}(${variable})`,
      `Center: ${center}`,
      `Terms: ${terms}`,
      `Precision: ${precision}`,
      "",
      `Series: ${result.series}`,
      "",
      "Steps:",
      ...result.steps,
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `taylor-series-${func}-${Date.now()}.txt`;
    link.click();
  };

  // Reset state
  const reset = () => {
    setFunc("sin");
    setCenter("0");
    setTerms("5");
    setPrecision("4");
    setVariable("x");
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Taylor Series Generator
        </h1>

        {/* Function Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {["sin", "cos", "exp", "ln", "sqrt"].map((f) => (
            <button
              key={f}
              onClick={() => setFunc(f)}
              className={`px-3 py-2 rounded-md transition-colors ${
                func === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {f === "exp" ? "eˣ" : f === "ln" ? "ln(x)" : f === "sqrt" ? "√x" : `${f}(x)`}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {[
            { label: "Center (a)", value: center, setter: setCenter, field: "center", step: "0.01" },
            { label: "Terms (n)", value: terms, setter: setTerms, field: "terms", step: "1" },
            { label: "Precision", value: precision, setter: setPrecision, field: "precision", step: "1" },
            { label: "Variable", value: variable, setter: setVariable, field: "variable", type: "text" },
          ].map(({ label, value, setter, field, step = "any", type = "number" }) => (
            <div key={field} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="w-28 text-sm font-medium text-gray-700">{label}:</label>
              <div className="flex-1">
                <input
                  type={type}
                  step={step}
                  value={value}
                  onChange={handleInputChange(setter, field)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., ${field === "center" ? "0" : field === "terms" ? "5" : field === "precision" ? "4" : "x"}`}
                  aria-label={label}
                />
                {errors[field] && <p className="text-red-600 text-sm mt-1">{errors[field]}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={generate}
            disabled={!validateInputs}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            Generate
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
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Taylor Series:</h2>
            <p className="text-sm sm:text-base break-words">{result.series}</p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="mt-4 text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              {showSteps ? <FaEyeSlash /> : <FaEye />}
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                {result.steps.map((step, i) => (
                  <li key={i} className="break-words">{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports sin(x), cos(x), eˣ, ln(x), and √x</li>
            <li>Customizable center point, terms, precision, and variable name</li>
            <li>Detailed step-by-step breakdown</li>
            <li>Download result as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TaylorSeriesGenerator;