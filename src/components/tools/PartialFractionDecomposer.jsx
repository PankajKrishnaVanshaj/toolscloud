"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaEye, FaEyeSlash } from "react-icons/fa";

const PartialFractionDecomposer = () => {
  const [numerator, setNumerator] = useState({ a: "", b: "" }); // ax + b
  const [denominator, setDenominator] = useState({ c: "", d: "", e: "" }); // cx^2 + dx + e
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(2); // New: control precision
  const [simplifyFractions, setSimplifyFractions] = useState(true); // New: toggle fraction simplification

  // Greatest Common Divisor for fraction simplification
  const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      [a, b] = [b, a % b];
    }
    return a;
  };

  // Simplify a fraction
  const simplifyFraction = (num, den) => {
    const divisor = gcd(num, den);
    return [num / divisor, den / divisor];
  };

  // Decompose the rational function
  const decompose = useCallback(() => {
    const steps = ["Decomposing the rational function into partial fractions:"];
    const numA = parseFloat(numerator.a) || 0;
    const numB = parseFloat(numerator.b) || 0;
    const denC = parseFloat(denominator.c) || 0;
    const denD = parseFloat(denominator.d) || 0;
    const denE = parseFloat(denominator.e) || 0;

    // Validation
    if (denC === 0) {
      return { error: "Denominator must be a valid quadratic (x² term required)" };
    }

    steps.push(`Given: (${numA}x + ${numB}) / (${denC}x² + ${denD}x + ${denE})`);

    // Factor the denominator: cx^2 + dx + e
    const discriminant = denD * denD - 4 * denC * denE;
    steps.push(`Discriminant = ${denD}² - 4 * ${denC} * ${denE} = ${discriminant}`);

    if (discriminant < 0) {
      // Irreducible quadratic case
      steps.push("Discriminant < 0: Denominator is an irreducible quadratic.");
      steps.push("Form: (Ax + B) / (cx² + dx + e)");
      const A = numA / denC;
      const B = numB / denC;
      steps.push(`Equate: ${numA}x + ${numB} = A(${denC}x² + ${denD}x + ${denE}) + B`);
      steps.push(`A = ${numA} / ${denC} = ${A.toFixed(decimalPlaces)}`);
      steps.push(`B = ${numB} / ${denC} = ${B.toFixed(decimalPlaces)}`);
      const decomposition = `(${A.toFixed(decimalPlaces)}x + ${B.toFixed(decimalPlaces)}) / (${denC}x² + ${denD}x + ${denE})`;
      return { decomposition, steps };
    }

    const root1 = (-denD + Math.sqrt(discriminant)) / (2 * denC);
    const root2 = (-denD - Math.sqrt(discriminant)) / (2 * denC);
    steps.push(`Roots: x = ${root1.toFixed(decimalPlaces)}, x = ${root2.toFixed(decimalPlaces)}`);
    steps.push(`Denominator factors as ${denC} * (x - ${root1.toFixed(decimalPlaces)})(x - ${root2.toFixed(decimalPlaces)})`);

    if (Math.abs(root1 - root2) < 1e-6) {
      // Repeated linear factor
      steps.push("Repeated root detected.");
      steps.push(`Form: A / (x - ${root1.toFixed(decimalPlaces)}) + B / (x - ${root1.toFixed(decimalPlaces)})²`);
      const r = root1;
      const A = numB / (denC * r * r);
      const B = numA - A * denC * r;

      steps.push(`Equate: ${numA}x + ${numB} = A(${denC}x - ${denC * r}) + B`);
      steps.push(`x⁰: ${numB} = ${A.toFixed(decimalPlaces)} * ${-denC * r} + ${B.toFixed(decimalPlaces)}`);
      steps.push(`x¹: ${numA} = ${A.toFixed(decimalPlaces)} * ${denC}`);
      steps.push(`A = ${A.toFixed(decimalPlaces)}, B = ${B.toFixed(decimalPlaces)}`);

      let decomposition = `${A.toFixed(decimalPlaces)} / (x - ${r.toFixed(decimalPlaces)}) + ${B.toFixed(decimalPlaces)} / (x - ${r.toFixed(decimalPlaces)})²`;
      if (simplifyFractions) {
        const [A_num, A_den] = simplifyFraction(A * 100, 100);
        const [B_num, B_den] = simplifyFraction(B * 100, 100);
        decomposition = `${A_num}/${A_den} / (x - ${r.toFixed(decimalPlaces)}) + ${B_num}/${B_den} / (x - ${r.toFixed(decimalPlaces)})²`;
      }
      return { decomposition, steps };
    } else {
      // Distinct linear factors
      steps.push(`Form: A / (x - ${root1.toFixed(decimalPlaces)}) + B / (x - ${root2.toFixed(decimalPlaces)})`);
      const A = (numA * root2 - numB) / (denC * (root2 - root1));
      const B = (numB - numA * root1) / (denC * (root2 - root1));

      steps.push(`Equate: ${numA}x + ${numB} = A(x - ${root2.toFixed(decimalPlaces)}) + B(x - ${root1.toFixed(decimalPlaces)})`);
      steps.push(`x¹: ${numA} = A + B`);
      steps.push(`x⁰: ${numB} = ${-A * root2} + ${-B * root1}`);
      steps.push(`Solve: A = ${A.toFixed(decimalPlaces)}, B = ${B.toFixed(decimalPlaces)}`);

      let decomposition = `${A.toFixed(decimalPlaces)} / (x - ${root1.toFixed(decimalPlaces)}) + ${B.toFixed(decimalPlaces)} / (x - ${root2.toFixed(decimalPlaces)})`;
      if (simplifyFractions) {
        const [A_num, A_den] = simplifyFraction(A * 100, 100);
        const [B_num, B_den] = simplifyFraction(B * 100, 100);
        decomposition = `${A_num}/${A_den} / (x - ${root1.toFixed(decimalPlaces)}) + ${B_num}/${B_den} / (x - ${root2.toFixed(decimalPlaces)})`;
      }
      return { decomposition, steps };
    }
  }, [numerator, denominator, decimalPlaces, simplifyFractions]);

  // Handle input changes
  const handleInputChange = (type, field) => (e) => {
    const value = e.target.value;
    if (type === "numerator") {
      setNumerator((prev) => ({ ...prev, [field]: value }));
    } else {
      setDenominator((prev) => ({ ...prev, [field]: value }));
    }
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [`${type}${field}`]: "Must be a number" }));
    } else {
      setErrors((prev) => ({ ...prev, [`${type}${field}`]: "" }));
    }
  };

  // Validate inputs
  const isValid = useMemo(() => {
    const numA = parseFloat(numerator.a) || 0;
    const numB = parseFloat(numerator.b) || 0;
    const denC = parseFloat(denominator.c) || 0;
    const denD = parseFloat(denominator.d) || 0;
    const denE = parseFloat(denominator.e) || 0;

    return (
      !isNaN(numA) &&
      !isNaN(numB) &&
      !isNaN(denC) &&
      !isNaN(denD) &&
      !isNaN(denE) &&
      denC !== 0 &&
      Object.values(errors).every((err) => !err)
    );
  }, [numerator, denominator, errors]);

  // Perform decomposition
  const decomposeFraction = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please provide valid coefficients (denominator must be quadratic)" });
      return;
    }

    const calcResult = decompose();
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setNumerator({ a: "", b: "" });
    setDenominator({ c: "", d: "", e: "" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setDecimalPlaces(2);
    setSimplifyFractions(true);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Partial Fraction Decomposer
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Numerator (ax + b)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["a", "b"].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    {field === "a" ? "a (x)" : "b (constant)"}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={numerator[field]}
                    onChange={handleInputChange("numerator", field)}
                    className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder={field === "a" ? "e.g., 1" : "e.g., 2"}
                    aria-label={`Coefficient of ${field === "a" ? "x" : "constant"} in numerator`}
                  />
                  {errors[`numerator${field}`] && (
                    <p className="text-red-600 text-sm mt-1">{errors[`numerator${field}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Denominator (cx² + dx + e)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {["c", "d", "e"].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    {field === "c" ? "c (x²)" : field === "d" ? "d (x)" : "e (constant)"}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={denominator[field]}
                    onChange={handleInputChange("denominator", field)}
                    className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder={field === "c" ? "e.g., 1" : field === "d" ? "e.g., -3" : "e.g., 2"}
                    aria-label={`Coefficient of ${field === "c" ? "x²" : field === "d" ? "x" : "constant"} in denominator`}
                  />
                  {errors[`denominator${field}`] && (
                    <p className="text-red-600 text-sm mt-1">{errors[`denominator${field}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Places ({decimalPlaces})
              </label>
              <input
                type="range"
                min="1"
                max="6"
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={simplifyFractions}
                  onChange={(e) => setSimplifyFractions(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Simplify Fractions</span>
              </label>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={decomposeFraction}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Decompose
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
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700 text-center">{errors.general}</p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Partial Fractions</h2>
            <p className="text-center text-xl font-mono mt-2">{result.decomposition}</p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="flex items-center mx-auto mt-2 text-blue-600 hover:underline"
            >
              {showSteps ? <FaEyeSlash className="mr-1" /> : <FaEye className="mr-1" />}
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-4 text-sm list-disc list-inside bg-white p-4 rounded-md shadow-inner">
                {result.steps.map((step, i) => (
                  <li key={i} className="mb-1">{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Decomposes linear/quadratic into partial fractions</li>
            <li>Handles distinct, repeated, and irreducible factors</li>
            <li>Customizable decimal precision</li>
            <li>Optional fraction simplification</li>
            <li>Detailed step-by-step solution</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PartialFractionDecomposer;