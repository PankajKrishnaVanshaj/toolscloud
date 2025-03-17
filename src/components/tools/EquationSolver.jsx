"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const EquationSolver = () => {
  const [equationType, setEquationType] = useState("linear");
  const [inputs, setInputs] = useState({
    linearA: "", linearB: "", linearC: "",
    quadA: "", quadB: "", quadC: "",
    cubicA: "", cubicB: "", cubicC: "", cubicD: "",
    systemA1: "", systemB1: "", systemC1: "",
    systemA2: "", systemB2: "", systemC2: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [history, setHistory] = useState([]);

  // Generic input handler
  const handleInputChange = (field) => (e) => {
    setInputs((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Solve Linear: ax + b = c
  const solveLinear = (a, b, c) => {
    const aNum = parseFloat(a), bNum = parseFloat(b), cNum = parseFloat(c);
    if (isNaN(aNum) || isNaN(bNum) || isNaN(cNum)) return { error: "Invalid numbers" };
    if (aNum === 0) return { error: "Coefficient 'a' cannot be zero" };
    const x = (cNum - bNum) / aNum;
    const steps = [
      `${aNum}x + ${bNum} = ${cNum}`,
      `${aNum}x = ${(cNum - bNum).toFixed(2)}`,
      `x = ${x.toFixed(2)}`,
    ];
    return { solution: x.toFixed(2), steps, type: "linear" };
  };

  // Solve Quadratic: ax² + bx + c = 0
  const solveQuadratic = (a, b, c) => {
    const aNum = parseFloat(a), bNum = parseFloat(b), cNum = parseFloat(c);
    if (isNaN(aNum) || isNaN(bNum) || isNaN(cNum)) return { error: "Invalid numbers" };
    if (aNum === 0) return { error: "Coefficient 'a' cannot be zero" };
    const discriminant = bNum * bNum - 4 * aNum * cNum;
    const steps = [
      `${aNum}x² + ${bNum}x + ${cNum} = 0`,
      `Δ = ${bNum}² - 4 × ${aNum} × ${cNum} = ${discriminant.toFixed(2)}`,
    ];
    if (discriminant < 0) {
      const real = (-bNum / (2 * aNum)).toFixed(2);
      const imag = (Math.sqrt(-discriminant) / (2 * aNum)).toFixed(2);
      steps.push(`x₁ = ${real} + ${imag}i`, `x₂ = ${real} - ${imag}i`);
      return { solutions: [`${real} + ${imag}i`, `${real} - ${imag}i`], steps, type: "quadratic" };
    }
    const x1 = ((-bNum + Math.sqrt(discriminant)) / (2 * aNum)).toFixed(2);
    const x2 = ((-bNum - Math.sqrt(discriminant)) / (2 * aNum)).toFixed(2);
    steps.push(`x₁ = ${x1}`, `x₂ = ${x2}`);
    return { solutions: [x1, x2], steps, type: "quadratic" };
  };

  // Solve Cubic: ax³ + bx² + cx + d = 0 (Simplified - one real root via Cardano's method approximation)
  const solveCubic = (a, b, c, d) => {
    const aNum = parseFloat(a), bNum = parseFloat(b), cNum = parseFloat(c), dNum = parseFloat(d);
    if (isNaN(aNum) || isNaN(bNum) || isNaN(cNum) || isNaN(dNum)) return { error: "Invalid numbers" };
    if (aNum === 0) return { error: "Coefficient 'a' cannot be zero" };
    // Simplified Newton-Raphson approximation for one real root
    let x = 0;
    const steps = [`${aNum}x³ + ${bNum}x² + ${cNum}x + ${dNum} = 0`];
    for (let i = 0; i < 10; i++) {
      const fx = aNum * x ** 3 + bNum * x ** 2 + cNum * x + dNum;
      const dfx = 3 * aNum * x ** 2 + 2 * bNum * x + cNum;
      if (dfx === 0) break;
      x = x - fx / dfx;
      steps.push(`Iteration ${i + 1}: x ≈ ${x.toFixed(2)}`);
    }
    return { solution: x.toFixed(2), steps, type: "cubic", note: "Approximation (one real root)" };
  };

  // Solve System of Equations: a1x + b1y = c1, a2x + b2y = c2
  const solveSystem = (a1, b1, c1, a2, b2, c2) => {
    const a1Num = parseFloat(a1), b1Num = parseFloat(b1), c1Num = parseFloat(c1),
      a2Num = parseFloat(a2), b2Num = parseFloat(b2), c2Num = parseFloat(c2);
    if ([a1Num, b1Num, c1Num, a2Num, b2Num, c2Num].some(isNaN)) return { error: "Invalid numbers" };
    const det = a1Num * b2Num - a2Num * b1Num;
    if (det === 0) return { error: "No unique solution (determinant is zero)" };
    const x = ((c1Num * b2Num - c2Num * b1Num) / det).toFixed(2);
    const y = ((a1Num * c2Num - a2Num * c1Num) / det).toFixed(2);
    const steps = [
      `${a1Num}x + ${b1Num}y = ${c1Num}`,
      `${a2Num}x + ${b2Num}y = ${c2Num}`,
      `Determinant = ${a1Num} × ${b2Num} - ${a2Num} × ${b1Num} = ${det}`,
      `x = (${c1Num} × ${b2Num} - ${c2Num} × ${b1Num}) / ${det} = ${x}`,
      `y = (${a1Num} × ${c2Num} - ${a2Num} × ${c1Num}) / ${det} = ${y}`,
    ];
    return { solutions: { x, y }, steps, type: "system" };
  };

  const calculate = useCallback(() => {
    setError("");
    setResult(null);
    let calcResult;

    switch (equationType) {
      case "linear":
        if (!inputs.linearA || !inputs.linearB || !inputs.linearC) {
          setError("All fields required for linear equation");
          return;
        }
        calcResult = solveLinear(inputs.linearA, inputs.linearB, inputs.linearC);
        break;
      case "quadratic":
        if (!inputs.quadA || !inputs.quadB || !inputs.quadC) {
          setError("All fields required for quadratic equation");
          return;
        }
        calcResult = solveQuadratic(inputs.quadA, inputs.quadB, inputs.quadC);
        break;
      case "cubic":
        if (!inputs.cubicA || !inputs.cubicB || !inputs.cubicC || !inputs.cubicD) {
          setError("All fields required for cubic equation");
          return;
        }
        calcResult = solveCubic(inputs.cubicA, inputs.cubicB, inputs.cubicC, inputs.cubicD);
        break;
      case "system":
        if (!inputs.systemA1 || !inputs.systemB1 || !inputs.systemC1 || !inputs.systemA2 || !inputs.systemB2 || !inputs.systemC2) {
          setError("All fields required for system of equations");
          return;
        }
        calcResult = solveSystem(inputs.systemA1, inputs.systemB1, inputs.systemC1, inputs.systemA2, inputs.systemB2, inputs.systemC2);
        break;
      default:
        return;
    }

    if (calcResult.error) {
      setError(calcResult.error);
    } else {
      setResult(calcResult);
      setHistory((prev) => [...prev, { ...calcResult, timestamp: new Date().toLocaleString() }].slice(-5));
    }
  }, [equationType, inputs]);

  const reset = () => {
    setInputs({
      linearA: "", linearB: "", linearC: "",
      quadA: "", quadB: "", quadC: "",
      cubicA: "", cubicB: "", cubicC: "", cubicD: "",
      systemA1: "", systemB1: "", systemC1: "",
      systemA2: "", systemB2: "", systemC2: "",
    });
    setEquationType("linear");
    setResult(null);
    setError("");
    setShowDetails(false);
  };

  const downloadResult = () => {
    if (!result) return;
    const text = [
      `Equation Type: ${result.type}`,
      result.type === "system" ? `Solutions: x = ${result.solutions.x}, y = ${result.solutions.y}` : `Solution(s): ${Array.isArray(result.solutions) ? result.solutions.join(", ") : result.solution}`,
      "Steps:",
      ...result.steps,
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `equation-solution-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Equation Solver
        </h1>

        {/* Equation Type Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["linear", "quadratic", "cubic", "system"].map((type) => (
            <button
              key={type}
              onClick={() => setEquationType(type)}
              className={`px-3 py-1 rounded-lg text-sm sm:text-base ${
                equationType === type ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          {equationType === "linear" && (
            <div className="space-y-4">
              <InputField label="a (x)" value={inputs.linearA} onChange={handleInputChange("linearA")} />
              <InputField label="b" value={inputs.linearB} onChange={handleInputChange("linearB")} />
              <InputField label="c" value={inputs.linearC} onChange={handleInputChange("linearC")} />
            </div>
          )}
          {equationType === "quadratic" && (
            <div className="space-y-4">
              <InputField label="a (x²)" value={inputs.quadA} onChange={handleInputChange("quadA")} />
              <InputField label="b (x)" value={inputs.quadB} onChange={handleInputChange("quadB")} />
              <InputField label="c" value={inputs.quadC} onChange={handleInputChange("quadC")} />
            </div>
          )}
          {equationType === "cubic" && (
            <div className="space-y-4">
              <InputField label="a (x³)" value={inputs.cubicA} onChange={handleInputChange("cubicA")} />
              <InputField label="b (x²)" value={inputs.cubicB} onChange={handleInputChange("cubicB")} />
              <InputField label="c (x)" value={inputs.cubicC} onChange={handleInputChange("cubicC")} />
              <InputField label="d" value={inputs.cubicD} onChange={handleInputChange("cubicD")} />
            </div>
          )}
          {equationType === "system" && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">Equation 1: a₁x + b₁y = c₁</div>
              <InputField label="a₁ (x)" value={inputs.systemA1} onChange={handleInputChange("systemA1")} />
              <InputField label="b₁ (y)" value={inputs.systemB1} onChange={handleInputChange("systemB1")} />
              <InputField label="c₁" value={inputs.systemC1} onChange={handleInputChange("systemC1")} />
              <div className="text-sm text-gray-600">Equation 2: a₂x + b₂y = c₂</div>
              <InputField label="a₂ (x)" value={inputs.systemA2} onChange={handleInputChange("systemA2")} />
              <InputField label="b₂ (y)" value={inputs.systemB2} onChange={handleInputChange("systemB2")} />
              <InputField label="c₂" value={inputs.systemC2} onChange={handleInputChange("systemC2")} />
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Solve
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
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Solution:</h2>
            {result.type === "system" ? (
              <p className="text-center text-xl">x = {result.solutions.x}, y = {result.solutions.y}</p>
            ) : (
              <p className="text-center text-xl">
                {Array.isArray(result.solutions) ? result.solutions.join(", ") : result.solution}
                {result.note && <span className="text-sm text-gray-500"> ({result.note})</span>}
              </p>
            )}
            <div className="text-center mt-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showDetails ? "Hide Steps" : "Show Steps"}
              </button>
            </div>
            {showDetails && (
              <div className="mt-2 text-sm">
                <p className="font-medium">Steps:</p>
                <ul className="list-disc list-inside space-y-1">
                  {result.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Recent Solutions</h3>
            <ul className="text-sm space-y-2 max-h-40 overflow-y-auto">
              {history.map((item, index) => (
                <li key={index} className="border-b py-1">
                  {item.timestamp}: {item.type} -{" "}
                  {item.type === "system"
                    ? `x = ${item.solutions.x}, y = ${item.solutions.y}`
                    : Array.isArray(item.solutions)
                    ? item.solutions.join(", ")
                    : item.solution}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Solve Linear, Quadratic, Cubic, and Systems of Equations</li>
            <li>Step-by-step solutions</li>
            <li>Download results as text file</li>
            <li>Recent solutions history (last 5)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Reusable Input Component
const InputField = ({ label, value, onChange }) => (
  <div className="flex items-center gap-2">
    <label className="w-24 text-gray-700 text-sm sm:text-base">{label}:</label>
    <input
      type="number"
      step="0.01"
      value={value}
      onChange={onChange}
      className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
      placeholder={`e.g., ${label.includes("a") ? "1" : "0"}`}
    />
  </div>
);

export default EquationSolver;