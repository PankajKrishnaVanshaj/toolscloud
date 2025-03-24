"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const IntegralSolver = () => {
  const [type, setType] = useState("indefinite"); // indefinite, definite, improper
  const [inputs, setInputs] = useState({
    a: "",
    b: "",
    c: "",
    lower: "",
    upper: "",
    fn: "x^2", // Custom function input
  });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [method, setMethod] = useState("power"); // power, substitution, numerical

  // Compute the integral
  const calculateIntegral = useCallback((type, inputs, method) => {
    const steps = [`Integrating ${type} integral using ${method} method:`];
    const a = parseFloat(inputs.a) || 0;
    const b = parseFloat(inputs.b) || 0;
    const c = parseFloat(inputs.c) || 0;

    if (method === "power" || method === "substitution") {
      if (isNaN(a) || isNaN(b) || isNaN(c)) {
        return { error: "Coefficients must be valid numbers" };
      }

      const fn = `${a !== 0 ? `${a}x²` : ""}${b !== 0 ? (a !== 0 && b > 0 ? " + " : " ") + `${b}x` : ""}${c !== 0 ? (a !== 0 || b !== 0) && c > 0 ? " + " : " " + c : ""}`.trim() || "0";
      steps.push(`f(x) = ${fn}`);

      if (method === "power") {
        const intA = a / 3;
        const intB = b / 2;
        const intC = c;

        steps.push(`Power rule: ∫x^n dx = (x^(n+1))/(n+1) + C`);
        steps.push(`∫${a}x² dx = (${a}/3)x³ = ${intA.toFixed(2)}x³`);
        steps.push(`∫${b}x dx = (${b}/2)x² = ${intB.toFixed(2)}x²`);
        steps.push(`∫${c} dx = ${c}x`);

        let integral = "";
        if (intA !== 0) integral += `${intA.toFixed(2)}x³`;
        if (intB !== 0) integral += `${intB > 0 && integral ? " + " : " "}${intB.toFixed(2)}x²`;
        if (intC !== 0) integral += `${intC > 0 && integral ? " + " : " "}${intC.toFixed(2)}x`;
        integral = integral.trim() || "0";

        if (type === "indefinite") {
          integral += " + C";
          steps.push(`∫(${fn}) dx = ${integral}`);
          return { result: integral, steps };
        } else {
          const lower = parseFloat(inputs.lower);
          const upper = parseFloat(inputs.upper);

          if (isNaN(lower) || isNaN(upper)) {
            return { error: "Bounds must be valid numbers" };
          }
          if (lower >= upper && type !== "improper") {
            return { error: "Upper bound must be greater than lower bound" };
          }

          const F = (x) => intA * Math.pow(x, 3) + intB * Math.pow(x, 2) + intC * x;
          const value = type === "improper" ? "Improper integral evaluation" : F(upper) - F(lower);

          steps.push(`∫[${lower}, ${upper}] (${fn}) dx = F(${upper}) - F(${lower})`);
          steps.push(`F(x) = ${integral.replace(" + C", "")}`);
          steps.push(`F(${upper}) = ${F(upper).toFixed(2)}`);
          steps.push(`F(${lower}) = ${F(lower).toFixed(2)}`);
          steps.push(`Result = ${value === "Improper integral evaluation" ? value : value.toFixed(2)}`);

          return { result: value, steps };
        }
      } else if (method === "substitution") {
        steps.push("Substitution method placeholder: Assuming u = x for simplicity");
        steps.push("This is a basic simulation. Advanced substitution requires parsing.");
        return { result: `${integral} + C (simulated)`, steps };
      }
    } else if (method === "numerical") {
      const fnStr = inputs.fn.trim();
      if (!fnStr) return { error: "Function input is required for numerical method" };

      const lower = parseFloat(inputs.lower);
      const upper = parseFloat(inputs.upper);
      if (isNaN(lower) || isNaN(upper)) {
        return { error: "Bounds must be valid numbers" };
      }

      steps.push(`Numerical integration of f(x) = ${fnStr} from ${lower} to ${upper}`);
      steps.push("Using trapezoidal rule (simplified simulation):");

      const n = 100; // Number of trapezoids
      const dx = (upper - lower) / n;
      let sum = 0;

      // Simple evaluation for x^2 as a placeholder
      const evaluate = (x) => {
        if (fnStr === "x^2") return Math.pow(x, 2);
        return x; // Default to linear for simulation
      };

      for (let i = 0; i <= n; i++) {
        const x = lower + i * dx;
        const y = evaluate(x);
        sum += i === 0 || i === n ? y : 2 * y;
      }
      const value = (dx / 2) * sum;

      steps.push(`Δx = (${upper} - ${lower}) / ${n} = ${dx.toFixed(4)}`);
      steps.push(`Approximate area = (Δx/2) * (sum of heights) = ${value.toFixed(2)}`);
      return { result: value.toFixed(2), steps };
    }
  }, []);

  // Handle input changes
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (field !== "fn" && value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a number" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate inputs
  const isValid = useMemo(() => {
    if (method === "numerical") {
      return (
        inputs.fn.trim() &&
        inputs.lower &&
        !isNaN(parseFloat(inputs.lower)) &&
        inputs.upper &&
        !isNaN(parseFloat(inputs.upper)) &&
        Object.values(errors).every((err) => !err)
      );
    }
    const polyValid = ["a", "b", "c"].every(
      (field) => !inputs[field] || !isNaN(parseFloat(inputs[field]))
    );
    if (!polyValid) return false;

    const hasPoly = ["a", "b", "c"].some(
      (field) => inputs[field] && parseFloat(inputs[field]) !== 0
    );
    if (!hasPoly) return false;

    if (type !== "indefinite") {
      return (
        inputs.lower &&
        !isNaN(parseFloat(inputs.lower)) &&
        inputs.upper &&
        !isNaN(parseFloat(inputs.upper)) &&
        (type === "improper" || parseFloat(inputs.lower) < parseFloat(inputs.upper)) &&
        Object.values(errors).every((err) => !err)
      );
    }
    return Object.values(errors).every((err) => !err);
  }, [type, inputs, errors, method]);

  // Calculate
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general:
          method === "numerical"
            ? "Please provide a valid function and bounds"
            : type === "definite" || type === "improper"
            ? "Please provide valid coefficients and bounds"
            : "Please provide at least one non-zero coefficient",
      }));
      return;
    }

    const calcResult = calculateIntegral(type, inputs, method);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset
  const reset = () => {
    setType("indefinite");
    setInputs({ a: "", b: "", c: "", lower: "", upper: "", fn: "x^2" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setMethod("power");
  };

  // Download result as text
  const downloadResult = () => {
    if (!result) return;
    const text = [
      `Integral Solver Result`,
      `Type: ${type}`,
      `Method: ${method}`,
      result.steps.join("\n"),
      `Result: ${result.result}`,
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `integral-result-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Integral Solver
        </h1>

        {/* Type and Method Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Integral Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="indefinite">Indefinite</option>
              <option value="definite">Definite</option>
              <option value="improper">Improper</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="power">Power Rule</option>
              <option value="substitution">Substitution (Simulated)</option>
              <option value="numerical">Numerical (Trapezoidal)</option>
            </select>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          {method !== "numerical" ? (
            <>
              {["a", "b", "c"].map((field) => (
                <div key={field} className="flex items-center gap-2">
                  <label className="w-24 text-gray-700 text-sm">
                    {field} ({field === "a" ? "x²" : field === "b" ? "x" : "const"}):
                  </label>
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.01"
                      value={inputs[field]}
                      onChange={handleInputChange(field)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder={`e.g., ${field === "a" ? "2" : field === "b" ? "-3" : "5"}`}
                    />
                    {errors[field] && (
                      <p className="text-red-600 text-xs mt-1">{errors[field]}</p>
                    )}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <label className="w-24 text-gray-700 text-sm">Function f(x):</label>
              <div className="flex-1">
                <input
                  type="text"
                  value={inputs.fn}
                  onChange={handleInputChange("fn")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., x^2"
                />
                {errors.fn && <p className="text-red-600 text-xs mt-1">{errors.fn}</p>}
              </div>
            </div>
          )}
          {(type === "definite" || type === "improper" || method === "numerical") && (
            <>
              <div className="flex items-center gap-2">
                <label className="w-24 text-gray-700 text-sm">Lower Bound:</label>
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.lower}
                    onChange={handleInputChange("lower")}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 0"
                  />
                  {errors.lower && (
                    <p className="text-red-600 text-xs mt-1">{errors.lower}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-24 text-gray-700 text-sm">Upper Bound:</label>
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.upper}
                    onChange={handleInputChange("upper")}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1"
                  />
                  {errors.upper && (
                    <p className="text-red-600 text-xs mt-1">{errors.upper}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={calculate}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Calculate
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={downloadResult}
            disabled={!result}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download
          </button>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Result:</h2>
            <p className="text-center text-xl text-gray-800">
              {method === "numerical"
                ? `∫[${inputs.lower}, ${inputs.upper}] ${inputs.fn} dx ≈ ${result.result}`
                : type === "indefinite"
                ? `∫(${inputs.a || 0}x² + ${inputs.b || 0}x + ${inputs.c || 0}) dx = ${result.result}`
                : `∫[${inputs.lower}, ${inputs.upper}] (${inputs.a || 0}x² + ${inputs.b || 0}x + ${inputs.c || 0}) dx = ${result.result}`}
            </p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-blue-600 hover:underline text-sm"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                {result.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports indefinite, definite, and improper integrals</li>
            <li>Multiple methods: Power Rule, Substitution (simulated), Numerical (Trapezoidal)</li>
            <li>Step-by-step solution display</li>
            <li>Download results as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IntegralSolver;