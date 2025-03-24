"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaSync, FaCopy } from "react-icons/fa";

const ComplexNumberCalculator = () => {
  const [complexA, setComplexA] = useState({ real: "", imag: "" });
  const [complexB, setComplexB] = useState({ real: "", imag: "" });
  const [operation, setOperation] = useState("add");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [precision, setPrecision] = useState(4); // Decimal precision
  const [inputFormat, setInputFormat] = useState("rectangular"); // rectangular or polar

  // Calculate complex number operation
  const calculateComplex = useCallback(
    (a, b, op) => {
      const steps = [`Performing ${op} on complex numbers:`];
      let aReal = parseFloat(a.real) || 0;
      let aImag = parseFloat(a.imag) || 0;
      let bReal = parseFloat(b.real) || 0;
      let bImag = parseFloat(b.imag) || 0;

      // Convert from polar if needed
      if (inputFormat === "polar") {
        aReal = a.real * Math.cos((a.imag * Math.PI) / 180); // Magnitude * cos(angle)
        aImag = a.real * Math.sin((a.imag * Math.PI) / 180); // Magnitude * sin(angle)
        bReal = b.real * Math.cos((b.imag * Math.PI) / 180);
        bImag = b.real * Math.sin((b.imag * Math.PI) / 180);
        steps.push(`Converted A: ${a.real} ∠ ${a.imag}° to ${aReal.toFixed(precision)} + ${aImag.toFixed(precision)}i`);
        steps.push(`Converted B: ${b.real} ∠ ${b.imag}° to ${bReal.toFixed(precision)} + ${bImag.toFixed(precision)}i`);
      }

      // Validate inputs
      if (isNaN(aReal) || isNaN(aImag) || isNaN(bReal) || isNaN(bImag)) {
        return { error: "All parts must be valid numbers" };
      }

      steps.push(`A = ${aReal} + ${aImag}i`);
      steps.push(`B = ${bReal} + ${bImag}i`);

      let real, imag;
      if (op === "add") {
        real = aReal + bReal;
        imag = aImag + bImag;
        steps.push(`(${aReal} + ${aImag}i) + (${bReal} + ${bImag}i)`);
        steps.push(`= (${aReal} + ${bReal}) + (${aImag} + ${bImag})i`);
      } else if (op === "subtract") {
        real = aReal - bReal;
        imag = aImag - bImag;
        steps.push(`(${aReal} + ${aImag}i) - (${bReal} + ${bImag}i)`);
        steps.push(`= (${aReal} - ${bReal}) + (${aImag} - ${bImag})i`);
      } else if (op === "multiply") {
        real = aReal * bReal - aImag * bImag;
        imag = aReal * bImag + aImag * bReal;
        steps.push(`(${aReal} + ${aImag}i) * (${bReal} + ${bImag}i)`);
        steps.push(`= (${aReal} * ${bReal} - ${aImag} * ${bImag}) + (${aReal} * ${bImag} + ${aImag} * ${bReal})i`);
      } else if (op === "divide") {
        const denom = bReal * bReal + bImag * bImag;
        if (denom === 0) {
          return { error: "Division by zero (B = 0 + 0i)" };
        }
        real = (aReal * bReal + aImag * bImag) / denom;
        imag = (aImag * bReal - aReal * bImag) / denom;
        steps.push(`(${aReal} + ${aImag}i) / (${bReal} + ${bImag}i)`);
        steps.push(`Multiply by conjugate: (${bReal} - ${bImag}i) / (${bReal} - ${bImag}i)`);
        steps.push(`Numerator: (${aReal} * ${bReal} + ${aImag} * ${bImag}) + (${aImag} * ${bReal} - ${aReal} * ${bImag})i`);
        steps.push(`Denominator: ${bReal}^2 + ${bImag}^2 = ${denom}`);
      } else if (op === "conjugate") {
        real = aReal;
        imag = -aImag;
        steps.push(`Conjugate of A = ${aReal} + ${aImag}i`);
        steps.push(`= ${real} - ${Math.abs(imag)}i`);
        bReal = bImag = 0; // Ignore B for unary operation
      } else if (op === "magnitude") {
        real = Math.sqrt(aReal * aReal + aImag * aImag);
        imag = 0;
        steps.push(`Magnitude of A = √(${aReal}^2 + ${aImag}^2)`);
        steps.push(`= ${real}`);
        bReal = bImag = 0; // Ignore B
      }

      steps.push(`= ${real.toFixed(precision)} + ${imag.toFixed(precision)}i`);
      const magnitude = Math.sqrt(real * real + imag * imag);
      const angleRad = Math.atan2(imag, real);
      const angleDeg = (angleRad * 180 / Math.PI).toFixed(2);
      steps.push(`Polar form: Magnitude = √(${real}^2 + ${imag}^2) = ${magnitude.toFixed(precision)}`);
      steps.push(`Angle = atan2(${imag}, ${real}) = ${angleDeg}°`);

      return {
        result: { real: real.toFixed(precision), imag: imag.toFixed(precision) },
        polar: { magnitude: magnitude.toFixed(precision), angle: angleDeg },
        steps,
      };
    },
    [inputFormat, precision]
  );

  // Handle input changes with validation
  const handleInputChange = (complex, field) => (e) => {
    const value = e.target.value;
    const setter = complex === "A" ? setComplexA : setComplexB;
    setter((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [`${complex}${field}`]: "Must be a number" }));
    } else {
      setErrors((prev) => ({ ...prev, [`${complex}${field}`]: "" }));
    }
  };

  // Validate inputs
  const isValid = useMemo(() => {
    const requiredFields = operation === "conjugate" || operation === "magnitude" ? [complexA] : [complexA, complexB];
    return (
      requiredFields.every((c) => c.real && !isNaN(parseFloat(c.real)) && c.imag && !isNaN(parseFloat(c.imag))) &&
      Object.values(errors).every((err) => !err)
    );
  }, [complexA, complexB, errors, operation]);

  // Perform calculation
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please fill required fields with valid numbers" });
      return;
    }

    const calcResult = calculateComplex(complexA, complexB, operation);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setComplexA({ real: "", imag: "" });
    setComplexB({ real: "", imag: "" });
    setOperation("add");
    setResult(null);
    setErrors({});
    setShowSteps(false);
    setPrecision(4);
    setInputFormat("rectangular");
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (result) {
      const text = `${result.result.real} + ${result.result.imag}i\nPolar: ${result.polar.magnitude} ∠ ${result.polar.angle}°`;
      navigator.clipboard.writeText(text);
      alert("Result copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Complex Number Calculator
        </h1>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="add">Add</option>
              <option value="subtract">Subtract</option>
              <option value="multiply">Multiply</option>
              <option value="divide">Divide</option>
              <option value="conjugate">Conjugate (A only)</option>
              <option value="magnitude">Magnitude (A only)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input Format</label>
            <select
              value={inputFormat}
              onChange={(e) => setInputFormat(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="rectangular">Rectangular (a + bi)</option>
              <option value="polar">Polar (r ∠ θ°)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precision ({precision} decimals)
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Complex Number Inputs */}
        <div className="space-y-6 mb-6">
          {["A", "B"].map((c) => (
            <div key={c} className="space-y-2">
              <h3 className="text-gray-700 font-semibold">Complex Number {c}:</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    step="0.01"
                    value={c === "A" ? complexA.real : complexB.real}
                    onChange={handleInputChange(c, "real")}
                    disabled={c === "B" && (operation === "conjugate" || operation === "magnitude")}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder={inputFormat === "rectangular" ? "Real (a)" : "Magnitude (r)"}
                  />
                  {errors[`${c}real`] && (
                    <p className="text-red-600 text-sm mt-1">{errors[`${c}real`]}</p>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    step="0.01"
                    value={c === "A" ? complexA.imag : complexB.imag}
                    onChange={handleInputChange(c, "imag")}
                    disabled={c === "B" && (operation === "conjugate" || operation === "magnitude")}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder={inputFormat === "rectangular" ? "Imag (b)" : "Angle (θ°)"}
                  />
                  {errors[`${c}imag`] && (
                    <p className="text-red-600 text-sm mt-1">{errors[`${c}imag`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={calculate}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Calculate
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
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Result:</h2>
            <p className="text-xl text-center">
              {result.result.real} + {result.result.imag}i
            </p>
            <p className="text-sm text-gray-600 text-center mt-1">
              Polar: {result.polar.magnitude} ∠ {result.polar.angle}°
            </p>
            <div className="flex gap-2 justify-center mt-2">
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
                <FaCopy className="mr-1" /> Copy
              </button>
            </div>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside max-h-40 overflow-y-auto">
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
            <li>Operations: Add, Subtract, Multiply, Divide, Conjugate, Magnitude</li>
            <li>Input in Rectangular (a + bi) or Polar (r ∠ θ°) format</li>
            <li>Adjustable decimal precision (1-8)</li>
            <li>Step-by-step calculation breakdown</li>
            <li>Copy result to clipboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComplexNumberCalculator;