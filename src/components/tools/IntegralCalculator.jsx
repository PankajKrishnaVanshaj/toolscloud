"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaSync, FaCalculator, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading result

const IntegralCalculator = () => {
  const [inputs, setInputs] = useState({ a: "", b: "", c: "" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [integrationType, setIntegrationType] = useState("indefinite");
  const [limits, setLimits] = useState({ lower: "", upper: "" });
  const resultRef = React.useRef(null);

  // Compute the integral of ax² + bx + c
  const calculateIntegral = useCallback(
    (a, b, c, lowerLimit = null, upperLimit = null) => {
      const aNum = parseFloat(a) || 0;
      const bNum = parseFloat(b) || 0;
      const cNum = parseFloat(c) || 0;
      const steps = [`Integrating ${aNum}x² + ${bNum}x + ${cNum}:`];

      if (isNaN(aNum) || isNaN(bNum) || isNaN(cNum)) {
        return { error: "All coefficients must be valid numbers" };
      }

      // Indefinite integral
      const intA = aNum / 3; // ∫ax² dx = (a/3)x³
      const intB = bNum / 2; // ∫bx dx = (b/2)x²
      const intC = cNum; // ∫c dx = cx

      steps.push(`Power rule: ∫x^n dx = (x^(n+1))/(n+1) + C`);
      steps.push(`∫${aNum}x² dx = (${aNum}/3)x³ = ${intA.toFixed(decimalPlaces)}x³`);
      steps.push(`∫${bNum}x dx = (${bNum}/2)x² = ${intB.toFixed(decimalPlaces)}x²`);
      steps.push(`∫${cNum} dx = ${cNum}x`);

      let integral = "";
      if (intA !== 0) integral += `${intA.toFixed(decimalPlaces)}x³`;
      if (intB !== 0) {
        if (integral && intB > 0) integral += " + ";
        integral += `${intB.toFixed(decimalPlaces)}x²`;
      }
      if (intC !== 0) {
        if (integral && intC > 0) integral += " + ";
        integral += `${intC.toFixed(decimalPlaces)}x`;
      }
      integral += integral ? " + C" : "C";

      steps.push(`Indefinite Integral: ${integral}`);

      // Definite integral if limits provided
      if (integrationType === "definite" && lowerLimit !== null && upperLimit !== null) {
        const lower = parseFloat(lowerLimit);
        const upper = parseFloat(upperLimit);
        if (isNaN(lower) || isNaN(upper)) {
          return { error: "Limits must be valid numbers" };
        }

        const evaluate = (x) => intA * Math.pow(x, 3) + intB * Math.pow(x, 2) + intC * x;
        const definiteResult = evaluate(upper) - evaluate(lower);

        steps.push(`Evaluating from ${lower} to ${upper}:`);
        steps.push(`F(${upper}) = ${evaluate(upper).toFixed(decimalPlaces)}`);
        steps.push(`F(${lower}) = ${evaluate(lower).toFixed(decimalPlaces)}`);
        steps.push(`Definite Integral = F(${upper}) - F(${lower}) = ${definiteResult.toFixed(decimalPlaces)}`);

        return { integral, definiteResult: definiteResult.toFixed(decimalPlaces), steps };
      }

      return { integral, steps };
    },
    [decimalPlaces, integrationType]
  );

  // Handle input changes
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a valid number" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle limit changes
  const handleLimitChange = (type) => (e) => {
    const value = e.target.value;
    setLimits((prev) => ({ ...prev, [type]: value }));
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [type]: "Must be a valid number" }));
    } else {
      setErrors((prev) => ({ ...prev, [type]: "" }));
    }
  };

  // Validate inputs
  const isValid = useMemo(() => {
    const hasNumber = ["a", "b", "c"].some(
      (field) => inputs[field] && !isNaN(parseFloat(inputs[field]))
    );
    const allValid = ["a", "b", "c"].every(
      (field) => !inputs[field] || !isNaN(parseFloat(inputs[field]))
    );
    const limitsValid =
      integrationType !== "definite" ||
      (["lower", "upper"].every((l) => limits[l] && !isNaN(parseFloat(limits[l]))));
    return (
      hasNumber &&
      allValid &&
      limitsValid &&
      Object.values(errors).every((err) => !err)
    );
  }, [inputs, errors, integrationType, limits]);

  // Perform integration
  const integrate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: "Please provide valid coefficients and limits (if applicable)",
      }));
      return;
    }

    const calcResult = calculateIntegral(
      inputs.a,
      inputs.b,
      inputs.c,
      integrationType === "definite" ? limits.lower : null,
      integrationType === "definite" ? limits.upper : null
    );
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setInputs({ a: "", b: "", c: "" });
    setLimits({ lower: "", upper: "" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setIntegrationType("indefinite");
    setDecimalPlaces(2);
  };

  // Download result
  const downloadResult = () => {
    if (resultRef.current) {
      html2canvas(resultRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `integral-result-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Construct original function string
  const getFunctionString = () => {
    const { a, b, c } = inputs;
    let fn = "";
    if (a && parseFloat(a) !== 0) fn += `${parseFloat(a)}x²`;
    if (b && parseFloat(b) !== 0) {
      if (fn && parseFloat(b) > 0) fn += " + ";
      fn += `${parseFloat(b)}x`;
    }
    if (c && parseFloat(c) !== 0) {
      if (fn && parseFloat(c) > 0) fn += " + ";
      fn += parseFloat(c);
    }
    return fn || "0";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Integral Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-4">
          {["a", "b", "c"].map((field) => (
            <div key={field} className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-32 text-gray-700 font-medium">
                {field} ({field === "a" ? "x²" : field === "b" ? "x" : "constant"}):
              </label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs[field]}
                  onChange={handleInputChange(field)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., ${field === "a" ? "3" : field === "b" ? "-2" : "5"}`}
                  aria-label={`${field} coefficient`}
                />
                {errors[field] && (
                  <p className="text-red-600 text-sm mt-1">{errors[field]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Integration Type and Limits */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Integration Type
              </label>
              <select
                value={integrationType}
                onChange={(e) => setIntegrationType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="indefinite">Indefinite</option>
                <option value="definite">Definite</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Places
              </label>
              <input
                type="number"
                min="0"
                max="6"
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(Math.max(0, Math.min(6, e.target.value)))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {integrationType === "definite" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lower Limit
                  </label>
                  <input
                    type="number"
                    value={limits.lower}
                    onChange={handleLimitChange("lower")}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., -1"
                  />
                  {errors.lower && (
                    <p className="text-red-600 text-sm mt-1">{errors.lower}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upper Limit
                  </label>
                  <input
                    type="number"
                    value={limits.upper}
                    onChange={handleLimitChange("upper")}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2"
                  />
                  {errors.upper && (
                    <p className="text-red-600 text-sm mt-1">{errors.upper}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={integrate}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Calculate
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          {result && (
            <button
              onClick={downloadResult}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          )}
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div
            ref={resultRef}
            className="mt-6 p-4 bg-blue-50 rounded-md transition-all"
          >
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <p className="text-center text-xl">
              {integrationType === "definite"
                ? `∫[${limits.lower},${limits.upper}] (${getFunctionString()}) dx = ${
                    result.definiteResult
                  }`
                : `∫(${getFunctionString()}) dx = ${result.integral}`}
            </p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
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
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate indefinite and definite integrals</li>
            <li>Adjustable decimal precision</li>
            <li>Step-by-step solution display</li>
            <li>Download result as PNG</li>
            <li>Real-time input validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IntegralCalculator;