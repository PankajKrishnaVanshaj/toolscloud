"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const DerivativeFinder = () => {
  const [functionInput, setFunctionInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSteps, setShowSteps] = useState(false);
  const [variable, setVariable] = useState("x"); // Allow differentiation with respect to different variables
  const [order, setOrder] = useState(1); // Derivative order (1st, 2nd, etc.)

  // Parse and differentiate the function
  const differentiateFunction = useCallback(
    (func, varName, derivOrder) => {
      const steps = [`Differentiating f(${varName}) = ${func} (Order ${derivOrder}):`];
      let currentFunc = func.replace(/\s+/g, "");
      let derivative = currentFunc;
      let isValid = true;

      for (let n = 0; n < derivOrder; n++) {
        const terms = derivative.split(/(?=[+-])/);
        let derivativeTerms = [];
        steps.push(
          `Applying power rule for ${n + 1}th derivative: d/d${varName} (a${varName}^n) = na${varName}^(n-1)`
        );

        terms.forEach((term, index) => {
          let coeff = 1,
            exp = 0,
            sign = term[0] === "-" ? -1 : 1;
          if (term[0] === "+" || term[0] === "-") term = term.slice(1);

          // Parse term (e.g., "3x^2", "-2x", "5")
          const match = term.match(
            new RegExp(`^(-?\\d*\\.?\\d*)(${varName})?(?:\\^(-?\\d*\\.?\\d*))?$`)
          );
          if (!match) {
            isValid = false;
            return;
          }

          const [, num, x, pow] = match;
          coeff = num ? parseFloat(num) * sign : (x ? sign : parseFloat(term) * sign);
          exp = pow ? parseFloat(pow) : (x ? 1 : 0);

          if (exp - n < 0) {
            steps.push(
              `Term ${index + 1}: ${sign === -1 ? "-" : ""}${num || ""}${x || ""}${
                pow ? "^" + pow : ""
              } → Derivative order exceeds exponent, result = 0`
            );
            derivativeTerms.push("0");
            return;
          }

          if (exp === 0) {
            steps.push(
              `Term ${index + 1}: ${sign === -1 ? "-" : ""}${num || ""}${x || ""}${
                pow ? "^" + pow : ""
              } → Constant, derivative = 0`
            );
            return;
          }

          let newCoeff = coeff;
          for (let i = 0; i <= n; i++) {
            newCoeff *= exp - i;
          }
          const newExp = exp - (n + 1);
          const derivTerm =
            newExp < 0
              ? "0"
              : newExp === 0
              ? newCoeff.toFixed(2)
              : `${newCoeff.toFixed(2)}${varName}${
                  newExp > 1 ? `^${newExp}` : ""
                }`;
          derivativeTerms.push(
            `${newCoeff >= 0 && index > 0 && derivTerm !== "0" ? "+" : ""}${derivTerm}`
          );
          steps.push(
            `Term ${index + 1}: ${sign === -1 ? "-" : ""}${num || ""}${x}${
              pow ? "^" + pow : ""
            } → ${newCoeff} * ${varName}^${newExp < 0 ? 0 : newExp} = ${derivTerm}`
          );
        });

        derivative = derivativeTerms.join("") || "0";
        if (!isValid) break;
      }

      if (!isValid || derivative === "") {
        return {
          error: `Invalid function format. Use terms like a${varName}^n, b${varName}, or c (e.g., 3${varName}^2 + 2${varName} - 1)`,
        };
      }

      steps.push(`f${"'".repeat(derivOrder)}(${varName}) = ${derivative}`);
      return { derivative, steps };
    },
    []
  );

  // Handle input changes
  const handleInputChange = (e) => {
    setFunctionInput(e.target.value);
    setResult(null);
    setError("");
  };

  const isValid = useMemo(() => functionInput.trim() !== "", [functionInput]);

  // Calculate derivative
  const calculate = () => {
    setError("");
    setResult(null);

    if (!isValid) {
      setError("Please enter a function");
      return;
    }

    const calcResult = differentiateFunction(functionInput, variable, order);
    if (calcResult.error) {
      setError(calcResult.error);
    } else {
      setResult(calcResult);
    }
  };

  // Download result as text
  const downloadResult = () => {
    if (!result) return;
    const text = [
      `Function: f(${variable}) = ${functionInput}`,
      `Derivative (Order ${order}): f${"'".repeat(order)}(${variable}) = ${
        result.derivative
      }`,
      "",
      "Steps:",
      ...result.steps,
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `derivative-${Date.now()}.txt`;
    link.click();
  };

  // Reset state
  const reset = () => {
    setFunctionInput("");
    setResult(null);
    setError("");
    setShowSteps(false);
    setVariable("x");
    setOrder(1);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Derivative Finder
        </h1>

        {/* Function Input and Settings */}
        <div className="space-y-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <label className="text-gray-700">f({variable}) =</label>
              <input
                type="text"
                value={functionInput}
                onChange={handleInputChange}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`e.g., 3${variable}^2 + 2${variable} - 1`}
                aria-label="Function input"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-700">Variable:</label>
              <input
                type="text"
                value={variable}
                onChange={(e) => setVariable(e.target.value.slice(0, 1) || "x")}
                className="w-16 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={1}
                aria-label="Variable"
              />
              <label className="text-gray-700 ml-4">Order:</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="5"
                className="w-20 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Derivative order"
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={calculate}
            disabled={!isValid || isValid && !variable}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Find Derivative
          </button>
          <button
            onClick={downloadResult}
            disabled={!result}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-all font-semibold flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Result
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all font-semibold flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">
              {order === 1
                ? "First Derivative:"
                : `${order}th Derivative:`}
            </h2>
            <p className="text-center text-xl">
              f{"'".repeat(order)}({variable}) = {result.derivative}
            </p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside transition-opacity max-h-64 overflow-y-auto">
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
            <li>Supports polynomial functions</li>
            <li>Custom variable selection</li>
            <li>Multiple derivative orders (1st to 5th)</li>
            <li>Step-by-step differentiation process</li>
            <li>Download results as text file</li>
          </ul>
        </div>

       
      </div>
    </div>
  );
};

export default DerivativeFinder;