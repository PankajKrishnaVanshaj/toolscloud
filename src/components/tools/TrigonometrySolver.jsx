"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaAngleUp } from "react-icons/fa";

const TrigonometrySolver = () => {
  const [mode, setMode] = useState("side"); // side, angle, conversion, advanced
  const [inputs, setInputs] = useState({
    sideA: "",
    sideB: "",
    sideC: "",
    angle: "",
    value: "",
    function: "sin", // For advanced mode
  });
  const [unit, setUnit] = useState("degrees"); // degrees, radians
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Calculate trigonometric solution
  const calculateTrig = useCallback((mode, inputs, unit) => {
    const steps = [`Solving for ${mode} in ${unit}:`];
    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;

    if (mode === "side") {
      const sideA = parseFloat(inputs.sideA);
      const sideB = parseFloat(inputs.sideB);
      const angle = parseFloat(inputs.angle);
      const rad = unit === "degrees" ? toRad(angle) : angle;

      if (isNaN(sideA) || isNaN(angle) || sideA <= 0 || angle <= 0 || (unit === "degrees" && angle >= 90)) {
        return { error: "Side A and angle must be positive, angle < 90° (degrees)" };
      }

      steps.push(`Angle = ${angle}${unit === "degrees" ? "°" : " rad"} = ${rad.toFixed(4)} radians`);

      if (inputs.sideB === "" || isNaN(sideB)) {
        const hypotenuse = sideA / Math.cos(rad);
        steps.push(`cos(${angle}) = Adjacent / Hypotenuse`);
        steps.push(`Hypotenuse = ${sideA} / cos(${angle}) = ${hypotenuse.toFixed(2)}`);
        return { result: hypotenuse.toFixed(2), steps, label: "Hypotenuse" };
      } else if (sideB > 0) {
        const adjacent = sideB * Math.cos(rad);
        steps.push(`cos(${angle}) = Adjacent / ${sideB}`);
        steps.push(`Adjacent = ${sideB} * cos(${angle}) = ${adjacent.toFixed(2)}`);
        return { result: adjacent.toFixed(2), steps, label: "Adjacent" };
      }
    } else if (mode === "angle") {
      const sideA = parseFloat(inputs.sideA);
      const sideB = parseFloat(inputs.sideB);

      if (isNaN(sideA) || isNaN(sideB) || sideA <= 0 || sideB <= 0) {
        return { error: "Both sides must be positive numbers" };
      }

      let rad, deg;
      if (sideA < sideB) {
        rad = Math.asin(sideA / sideB);
        deg = toDeg(rad);
        steps.push(`sin(θ) = Opposite / Hypotenuse = ${sideA} / ${sideB}`);
        steps.push(`θ = arcsin(${sideA / sideB}) = ${unit === "degrees" ? deg.toFixed(2) + "°" : rad.toFixed(4) + " rad"}`);
      } else {
        rad = Math.acos(sideB / sideA);
        deg = toDeg(rad);
        steps.push(`cos(θ) = Adjacent / Hypotenuse = ${sideB} / ${sideA}`);
        steps.push(`θ = arccos(${sideB / sideA}) = ${unit === "degrees" ? deg.toFixed(2) + "°" : rad.toFixed(4) + " rad"}`);
      }
      return {
        result: unit === "degrees" ? deg.toFixed(2) : rad.toFixed(4),
        steps,
        label: `Angle (${unit})`,
      };
    } else if (mode === "conversion") {
      const value = parseFloat(inputs.value);
      if (isNaN(value)) return { error: "Value must be a valid number" };

      const rad = unit === "degrees" ? toRad(value) : value;
      const deg = unit === "degrees" ? value : toDeg(value);
      steps.push(`Converting ${value}${unit === "degrees" ? "°" : " rad"}:`);
      steps.push(`${value}° = ${rad.toFixed(4)} radians`);
      steps.push(`${value} rad = ${deg.toFixed(2)}°`);
      return {
        result: { degrees: deg.toFixed(2), radians: rad.toFixed(4) },
        steps,
        label: "Converted Values",
      };
    } else if (mode === "advanced") {
      const value = parseFloat(inputs.value);
      if (isNaN(value)) return { error: "Value must be a valid number" };

      const rad = unit === "degrees" ? toRad(value) : value;
      steps.push(`Input: ${value}${unit === "degrees" ? "°" : " rad"} = ${rad.toFixed(4)} radians`);
      
      let result;
      switch (inputs.function) {
        case "sin":
          result = Math.sin(rad);
          steps.push(`sin(${value}${unit === "degrees" ? "°" : " rad"}) = ${result.toFixed(4)}`);
          break;
        case "cos":
          result = Math.cos(rad);
          steps.push(`cos(${value}${unit === "degrees" ? "°" : " rad"}) = ${result.toFixed(4)}`);
          break;
        case "tan":
          result = Math.tan(rad);
          steps.push(`tan(${value}${unit === "degrees" ? "°" : " rad"}) = ${result.toFixed(4)}`);
          break;
        case "csc":
          result = 1 / Math.sin(rad);
          steps.push(`csc(${value}${unit === "degrees" ? "°" : " rad"}) = 1 / sin = ${result.toFixed(4)}`);
          break;
        case "sec":
          result = 1 / Math.cos(rad);
          steps.push(`sec(${value}${unit === "degrees" ? "°" : " rad"}) = 1 / cos = ${result.toFixed(4)}`);
          break;
        case "cot":
          result = 1 / Math.tan(rad);
          steps.push(`cot(${value}${unit === "degrees" ? "°" : " rad"}) = 1 / tan = ${result.toFixed(4)}`);
          break;
        default:
          return { error: "Invalid trigonometric function" };
      }
      return { result: result.toFixed(4), steps, label: `${inputs.function}(${value})` };
    }
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a number" }));
    } else if (field !== "sideB" && value && parseFloat(value) <= 0) {
      setErrors((prev) => ({ ...prev, [field]: "Must be positive" }));
    } else if (field === "angle" && unit === "degrees" && value && parseFloat(value) >= 90) {
      setErrors((prev) => ({ ...prev, [field]: "Must be < 90°" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate inputs
  const isValid = useMemo(() => {
    if (mode === "side") {
      return (
        inputs.sideA &&
        !isNaN(parseFloat(inputs.sideA)) &&
        parseFloat(inputs.sideA) > 0 &&
        inputs.angle &&
        !isNaN(parseFloat(inputs.angle)) &&
        parseFloat(inputs.angle) > 0 &&
        (unit === "degrees" ? parseFloat(inputs.angle) < 90 : true) &&
        (inputs.sideB === "" || (!isNaN(parseFloat(inputs.sideB)) && parseFloat(inputs.sideB) > 0)) &&
        Object.values(errors).every((err) => !err)
      );
    } else if (mode === "angle") {
      return (
        inputs.sideA &&
        !isNaN(parseFloat(inputs.sideA)) &&
        parseFloat(inputs.sideA) > 0 &&
        inputs.sideB &&
        !isNaN(parseFloat(inputs.sideB)) &&
        parseFloat(inputs.sideB) > 0 &&
        Object.values(errors).every((err) => !err)
      );
    } else if (mode === "conversion" || mode === "advanced") {
      return inputs.value && !isNaN(parseFloat(inputs.value)) && !errors.value;
    }
    return false;
  }, [mode, inputs, errors, unit]);

  // Perform calculation
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please provide valid inputs for the selected mode" });
      return;
    }

    const calcResult = calculateTrig(mode, inputs, unit);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setMode("side");
    setInputs({ sideA: "", sideB: "", sideC: "", angle: "", value: "", function: "sin" });
    setUnit("degrees");
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Trigonometry Solver
        </h1>

        {/* Mode and Unit Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="side">Find Side</option>
              <option value="angle">Find Angle</option>
              <option value="conversion">Deg ↔ Rad</option>
              <option value="advanced">Trig Functions</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="degrees">Degrees</option>
              <option value="radians">Radians</option>
            </select>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {mode === "side" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Side A (Adjacent)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.sideA}
                  onChange={handleInputChange("sideA")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                />
                {errors.sideA && <p className="text-red-600 text-sm mt-1">{errors.sideA}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Side B (Hypotenuse, optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.sideB}
                  onChange={handleInputChange("sideB")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5"
                />
                {errors.sideB && <p className="text-red-600 text-sm mt-1">{errors.sideB}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Angle</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.angle}
                  onChange={handleInputChange("angle")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder={unit === "degrees" ? "e.g., 30" : "e.g., 0.5236"}
                />
                {errors.angle && <p className="text-red-600 text-sm mt-1">{errors.angle}</p>}
              </div>
            </>
          )}
          {mode === "angle" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Side A (Opposite or Hypotenuse)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.sideA}
                  onChange={handleInputChange("sideA")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                />
                {errors.sideA && <p className="text-red-600 text-sm mt-1">{errors.sideA}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Side B (Hypotenuse or Adjacent)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.sideB}
                  onChange={handleInputChange("sideB")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5"
                />
                {errors.sideB && <p className="text-red-600 text-sm mt-1">{errors.sideB}</p>}
              </div>
            </>
          )}
          {(mode === "conversion" || mode === "advanced") && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Value</label>
              <input
                type="number"
                step="0.01"
                value={inputs.value}
                onChange={handleInputChange("value")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={unit === "degrees" ? "e.g., 45" : "e.g., 0.7854"}
              />
              {errors.value && <p className="text-red-600 text-sm mt-1">{errors.value}</p>}
            </div>
          )}
          {mode === "advanced" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Function</label>
              <select
                value={inputs.function}
                onChange={(e) => setInputs((prev) => ({ ...prev, function: e.target.value }))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="sin">Sine (sin)</option>
                <option value="cos">Cosine (cos)</option>
                <option value="tan">Tangent (tan)</option>
                <option value="csc">Cosecant (csc)</option>
                <option value="sec">Secant (sec)</option>
                <option value="cot">Cotangent (cot)</option>
              </select>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={calculate}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Calculate
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <p className="text-center text-xl text-blue-700">
              {mode === "conversion"
                ? `${result.result.degrees}° or ${result.result.radians} rad`
                : `${result.label}: ${result.result}${mode === "angle" ? (unit === "degrees" ? "°" : " rad") : ""}`}
            </p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline flex items-center justify-center gap-1"
            >
              <FaAngleUp className={`transition-transform ${showSteps ? "rotate-180" : ""}`} />
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
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Solve for sides or angles in right triangles</li>
            <li>Degree ↔ Radian conversion</li>
            <li>Advanced trig functions: sin, cos, tan, csc, sec, cot</li>
            <li>Unit selection (degrees/radians)</li>
            <li>Detailed step-by-step solutions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TrigonometrySolver;