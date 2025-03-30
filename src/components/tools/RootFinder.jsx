"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaSync, FaCalculator, FaEye, FaEyeSlash } from "react-icons/fa";

const RootFinder = () => {
  const [inputs, setInputs] = useState({ a: "", b: "", c: "" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [method, setMethod] = useState("quadratic");
  const [precision, setPrecision] = useState(4);

  // Quadratic Formula Method
  const quadraticFormula = useCallback((a, b, c) => {
    const steps = [`Using Quadratic Formula for ${a}x² + ${b}x + ${c} = 0:`];
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    const cNum = parseFloat(c);

    const discriminant = bNum * bNum - 4 * aNum * cNum;
    steps.push(`Discriminant (Δ) = b² - 4ac = ${bNum}² - 4 * ${aNum} * ${cNum} = ${discriminant}`);

    let roots;
    if (discriminant > 0) {
      const root1 = (-bNum + Math.sqrt(discriminant)) / (2 * aNum);
      const root2 = (-bNum - Math.sqrt(discriminant)) / (2 * aNum);
      roots = [root1.toFixed(precision), root2.toFixed(precision)];
      steps.push(`Δ > 0: Two real roots`);
      steps.push(`x = [-${bNum} ± √${discriminant}] / (2 * ${aNum})`);
      steps.push(`x₁ = ${roots[0]}, x₂ = ${roots[1]}`);
    } else if (discriminant === 0) {
      const root = (-bNum / (2 * aNum)).toFixed(precision);
      roots = [root];
      steps.push(`Δ = 0: One real root`);
      steps.push(`x = -${bNum} / (2 * ${aNum}) = ${root}`);
    } else {
      const realPart = (-bNum / (2 * aNum)).toFixed(precision);
      const imagPart = (Math.sqrt(-discriminant) / (2 * aNum)).toFixed(precision);
      roots = [`${realPart} + ${imagPart}i`, `${realPart} - ${imagPart}i`];
      steps.push(`Δ < 0: Two complex roots`);
      steps.push(`x = [-${bNum} ± √(${discriminant})] / (2 * ${aNum})`);
      steps.push(`x₁ = ${roots[0]}, x₂ = ${roots[1]}`);
    }

    const vertexX = (-bNum / (2 * aNum)).toFixed(precision);
    const vertexY = (aNum * vertexX * vertexX + bNum * vertexX + cNum).toFixed(precision);
    steps.push(`Vertex: (${vertexX}, ${vertexY})`);

    return { roots, steps, vertex: { x: vertexX, y: vertexY } };
  }, [precision]);

  // Factoring Method
  const factoringMethod = useCallback((a, b, c) => {
    const steps = [`Factoring ${a}x² + ${b}x + ${c} = 0:`];
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    const cNum = parseFloat(c);

    // Try to find factors
    const product = aNum * cNum;
    let factors = null;
    for (let i = -Math.abs(product); i <= Math.abs(product); i++) {
      if (i === 0) continue;
      const j = product / i;
      if (Number.isInteger(j) && i + j === bNum) {
        factors = [i, j];
        break;
      }
    }

    let roots;
    if (factors) {
      steps.push(`Find factors of ac (${product}) that add to b (${bNum}): ${factors[0]} and ${factors[1]}`);
      steps.push(`Rewrite: ${aNum}x² + ${factors[0]}x + ${factors[1]}x + ${cNum} = 0`);
      steps.push(`Group: (${aNum}x² + ${factors[0]}x) + (${factors[1]}x + ${cNum}) = 0`);
      
      const gcd1 = gcd(Math.abs(aNum), Math.abs(factors[0]));
      const gcd2 = gcd(Math.abs(factors[1]), Math.abs(cNum));
      const factor1 = `${aNum / gcd1}x + ${factors[0] / gcd1}`;
      const factor2 = `${factors[1] / gcd2}x + ${cNum / gcd2}`;
      
      steps.push(`Factor: ${gcd1}(${factor1}) + ${gcd2}(${factor2}) = 0`);
      roots = [(-factors[0] / gcd1 / aNum).toFixed(precision), (-cNum / factors[1]).toFixed(precision)];
      steps.push(`Roots from factors: x = ${roots[0]}, x = ${roots[1]}`);
    } else {
      steps.push("Cannot factor easily with integers. Using Quadratic Formula instead.");
      return quadraticFormula(a, b, c);
    }

    const vertexX = (-bNum / (2 * aNum)).toFixed(precision);
    const vertexY = (aNum * vertexX * vertexX + bNum * vertexX + cNum).toFixed(precision);
    steps.push(`Vertex: (${vertexX}, ${vertexY})`);

    return { roots, steps, vertex: { x: vertexX, y: vertexY } };
  }, [precision, quadraticFormula]);

  // Completing the Square Method
  const completingSquare = useCallback((a, b, c) => {
    const steps = [`Completing the square for ${a}x² + ${b}x + ${c} = 0:`];
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    const cNum = parseFloat(c);

    steps.push(`Divide by a (${aNum}): x² + ${bNum / aNum}x + ${cNum / aNum} = 0`);
    steps.push(`Move constant: x² + ${bNum / aNum}x = ${-cNum / aNum}`);
    const halfB = (bNum / (2 * aNum));
    const squareTerm = halfB * halfB;
    steps.push(`Add (${halfB})² = ${squareTerm} to both sides:`);
    steps.push(`x² + ${bNum / aNum}x + ${squareTerm} = ${-cNum / aNum} + ${squareTerm}`);
    steps.push(`Perfect square: (x + ${halfB})² = ${(-cNum / aNum + squareTerm).toFixed(precision)}`);

    const rightSide = -cNum / aNum + squareTerm;
    let roots;
    if (rightSide >= 0) {
      const sqrtTerm = Math.sqrt(rightSide);
      roots = [
        (-halfB + sqrtTerm).toFixed(precision),
        (-halfB - sqrtTerm).toFixed(precision)
      ].sort((x, y) => y - x); // Sort for consistency
      steps.push(`x + ${halfB} = ±${sqrtTerm.toFixed(precision)}`);
      steps.push(`x = ${roots[0]}, x = ${roots[1]}`);
    } else {
      const imagPart = Math.sqrt(-rightSide).toFixed(precision);
      roots = [`${-halfB.toFixed(precision)} + ${imagPart}i`, `${-halfB.toFixed(precision)} - ${imagPart}i`];
      steps.push(`x + ${halfB} = ±√(${rightSide}) = ±${imagPart}i`);
      steps.push(`x = ${roots[0]}, x = ${roots[1]}`);
    }

    const vertexX = (-bNum / (2 * aNum)).toFixed(precision);
    const vertexY = (aNum * vertexX * vertexX + bNum * vertexX + cNum).toFixed(precision);
    steps.push(`Vertex: (${vertexX}, ${vertexY})`);

    return { roots, steps, vertex: { x: vertexX, y: vertexY } };
  }, [precision]);

  // Helper function for GCD (used in factoring)
  const gcd = (a, b) => {
    while (b) {
      [a, b] = [b, a % b];
    }
    return a;
  };

  // Handle input changes
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a number" }));
    } else if (field === "a" && value && parseFloat(value) === 0) {
      setErrors((prev) => ({ ...prev, [field]: "Cannot be zero" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const isValid = useMemo(() => {
    return (
      inputs.a &&
      !isNaN(parseFloat(inputs.a)) &&
      parseFloat(inputs.a) !== 0 &&
      inputs.b &&
      !isNaN(parseFloat(inputs.b)) &&
      inputs.c &&
      !isNaN(parseFloat(inputs.c)) &&
      Object.values(errors).every((err) => !err)
    );
  }, [inputs, errors]);

  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please provide valid coefficients (a ≠ 0)" });
      return;
    }

    let calcResult;
    switch (method) {
      case "quadratic":
        calcResult = quadraticFormula(inputs.a, inputs.b, inputs.c);
        break;
      case "factoring":
        calcResult = factoringMethod(inputs.a, inputs.b, inputs.c);
        break;
      case "completing":
        calcResult = completingSquare(inputs.a, inputs.b, inputs.c);
        break;
      default:
        calcResult = quadraticFormula(inputs.a, inputs.b, inputs.c);
    }

    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  const reset = () => {
    setInputs({ a: "", b: "", c: "" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setMethod("quadratic");
    setPrecision(4);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Quadratic Root Finder
        </h1>

        {/* Input Section */}
        <div className="space-y-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["a", "b", "c"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.toUpperCase()} (
                  {field === "a" ? "x²" : field === "b" ? "x" : "constant"})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs[field]}
                  onChange={handleInputChange(field)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., ${field === "a" ? "1" : field === "b" ? "-5" : "6"}`}
                />
                {errors[field] && (
                  <p className="text-red-600 text-xs mt-1">{errors[field]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="quadratic">Quadratic Formula</option>
                <option value="factoring">Factoring</option>
                <option value="completing">Completing the Square</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision (decimals)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={precision}
                onChange={(e) => setPrecision(Math.max(0, Math.min(10, e.target.value)))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={calculate}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Find Roots
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
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Results:</h2>
            <p className="text-center text-xl font-medium">
              {result.roots.length === 1
                ? `x = ${result.roots[0]}`
                : `x₁ = ${result.roots[0]}, x₂ = ${result.roots[1]}`}
            </p>
            <p className="text-center text-sm mt-2">
              Vertex: ({result.vertex.x}, {result.vertex.y})
            </p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              {showSteps ? <FaEyeSlash /> : <FaEye />}
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside bg-white p-3 rounded-lg shadow-inner">
                {result.steps.map((step, i) => (
                  <li key={i} className="mb-1">
                    {step}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Finds real and complex roots of quadratic equations</li>
            <li>Supports Quadratic Formula, Factoring, and Completing the Square</li>
            <li>Step-by-step solution display</li>
            <li>Calculates vertex of the parabola</li>
            <li>Adjustable precision for results</li>
            <li>Real-time input validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RootFinder;