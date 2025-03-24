"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaDownload, FaChartLine } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading result

const QuadraticEquationSolver = () => {
  const [inputs, setInputs] = useState({ a: "", b: "", c: "" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [precision, setPrecision] = useState(2);
  const [showGraphInfo, setShowGraphInfo] = useState(false);
  const resultRef = React.useRef(null);

  // Solve quadratic equation: ax² + bx + c = 0
  const solveQuadratic = useCallback(
    (a, b, c) => {
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      const cNum = parseFloat(c);
      const steps = [`Solving ${aNum}x² + ${bNum}x + ${cNum} = 0:`];

      if (isNaN(aNum) || isNaN(bNum) || isNaN(cNum)) {
        return { error: "All coefficients must be valid numbers" };
      }
      if (aNum === 0) {
        return { error: "Coefficient of x² (a) cannot be zero for a quadratic equation" };
      }

      // Calculate discriminant: b² - 4ac
      const discriminant = bNum * bNum - 4 * aNum * cNum;
      steps.push(`Discriminant (Δ) = ${bNum}² - 4 × ${aNum} × ${cNum} = ${discriminant}`);

      // Additional graph-related info
      const vertexX = (-bNum / (2 * aNum)).toFixed(precision);
      const vertexY = (aNum * vertexX * vertexX + bNum * vertexX + cNum).toFixed(precision);
      const graphInfo = {
        vertex: `(${vertexX}, ${vertexY})`,
        axisOfSymmetry: `x = ${vertexX}`,
        direction: aNum > 0 ? "Upward" : "Downward",
      };

      // Quadratic formula: x = [-b ± √(b² - 4ac)] / (2a)
      if (discriminant < 0) {
        const realPart = (-bNum / (2 * aNum)).toFixed(precision);
        const imagPart = (Math.sqrt(-discriminant) / (2 * aNum)).toFixed(precision);
        steps.push(`Δ < 0: Complex roots`);
        steps.push(`x = (${-bNum} ± √(${discriminant})) / (2 × ${aNum})`);
        steps.push(`x₁ = ${realPart} + ${imagPart}i, x₂ = ${realPart} - ${imagPart}i`);
        return {
          roots: [`${realPart} + ${imagPart}i`, `${realPart} - ${imagPart}i`],
          steps,
          type: "complex",
          graphInfo,
        };
      } else if (discriminant === 0) {
        const root = (-bNum / (2 * aNum)).toFixed(precision);
        steps.push(`Δ = 0: One real root`);
        steps.push(`x = -${bNum} / (2 × ${aNum}) = ${root}`);
        return { roots: [root], steps, type: "real", graphInfo };
      } else {
        const root1 = ((-bNum + Math.sqrt(discriminant)) / (2 * aNum)).toFixed(precision);
        const root2 = ((-bNum - Math.sqrt(discriminant)) / (2 * aNum)).toFixed(precision);
        steps.push(`Δ > 0: Two real roots`);
        steps.push(`x = (${-bNum} ± √${discriminant}) / (2 × ${aNum})`);
        steps.push(`x₁ = ${root1}, x₂ = ${root2}`);
        return { roots: [root1, root2], steps, type: "real", graphInfo };
      }
    },
    [precision]
  );

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (!value) {
      setErrors((prev) => ({ ...prev, [field]: "This field is required" }));
    } else if (isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a valid number" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    return ["a", "b", "c"].every(
      (field) => inputs[field] && !isNaN(parseFloat(inputs[field])) && !errors[field]
    );
  }, [inputs, errors]);

  // Solve the equation
  const solve = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please fill all fields with valid numbers" });
      return;
    }

    const calcResult = solveQuadratic(inputs.a, inputs.b, inputs.c);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setInputs({ a: "", b: "", c: "" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setShowGraphInfo(false);
    setPrecision(2);
  };

  // Download result as image
  const downloadResult = () => {
    if (resultRef.current && result) {
      html2canvas(resultRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `quadratic-solution-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Quadratic Equation Solver
        </h1>

        {/* Input Section */}
        <div className="space-y-4">
          {["a", "b", "c"].map((field) => (
            <div key={field} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="w-32 text-gray-700 font-medium">
                {field} ({field === "a" ? "x²" : field === "b" ? "x" : "constant"}):
              </label>
              <div className="flex-1 w-full">
                <input
                  type="number"
                  step="0.01"
                  value={inputs[field]}
                  onChange={handleInputChange(field)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., ${field === "a" ? "1" : field === "b" ? "-5" : "6"}`}
                  aria-label={`${field} coefficient`}
                />
                {errors[field] && (
                  <p className="text-red-600 text-sm mt-1">{errors[field]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision (decimals)
              </label>
              <input
                type="number"
                min="0"
                max="6"
                value={precision}
                onChange={(e) => setPrecision(Math.max(0, Math.min(6, e.target.value)))}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={solve}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Solve
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          {result && (
            <button
              onClick={downloadResult}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          )}
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div ref={resultRef} className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Roots:</h2>
            <p className="text-center text-xl sm:text-2xl font-medium text-gray-800">
              {result.roots.length === 1
                ? `x = ${result.roots[0]}`
                : `x₁ = ${result.roots[0]}, x₂ = ${result.roots[1]}`}
            </p>
            <div className="flex justify-center gap-4 mt-2">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showSteps ? "Hide Steps" : "Show Steps"}
              </button>
              <button
                onClick={() => setShowGraphInfo(!showGraphInfo)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showGraphInfo ? "Hide Graph Info" : "Show Graph Info"}
              </button>
            </div>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside text-gray-600">
                {result.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}
            {showGraphInfo && result.graphInfo && (
              <div className="mt-2 p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
                <h3 className="font-semibold text-gray-700">Graph Information:</h3>
                <p>Vertex: {result.graphInfo.vertex}</p>
                <p>Axis of Symmetry: {result.graphInfo.axisOfSymmetry}</p>
                <p>Opens: {result.graphInfo.direction}</p>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Solves quadratic equations with real or complex roots</li>
            <li>Adjustable precision for decimal places</li>
            <li>Step-by-step solution process</li>
            <li>Graph information (vertex, axis, direction)</li>
            <li>Download result as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuadraticEquationSolver;