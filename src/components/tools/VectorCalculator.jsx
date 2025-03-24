"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const VectorCalculator = () => {
  const [dimension, setDimension] = useState(2);
  const [vectorA, setVectorA] = useState(["", "", ""]);
  const [vectorB, setVectorB] = useState(["", "", ""]);
  const [operation, setOperation] = useState("add");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [magnitudeA, setMagnitudeA] = useState(null);
  const [magnitudeB, setMagnitudeB] = useState(null);
  const [angle, setAngle] = useState(null);

  // Calculate vector operation
  const calculateVectorOperation = useCallback((vecA, vecB, dim, op) => {
    const steps = [`Performing ${op} operation on vectors:`];
    const a = vecA.slice(0, dim).map((val) => parseFloat(val) || 0);
    const b = vecB.slice(0, dim).map((val) => parseFloat(val) || 0);

    if (a.some(isNaN) || b.some(isNaN)) {
      return { error: "All vector components must be valid numbers" };
    }

    steps.push(`Vector A = <${a.join(", ")}>`);
    steps.push(`Vector B = <${b.join(", ")}>`);

    let result, magnitudeA, magnitudeB, angle;

    if (op === "add") {
      result = a.map((val, i) => val + b[i]);
      steps.push(`Addition: <${a.map((val, i) => `${val} + ${b[i]}`).join(", ")}>`);
      steps.push(`Result: <${result.join(", ")}>`);
    } else if (op === "subtract") {
      result = a.map((val, i) => val - b[i]);
      steps.push(`Subtraction: <${a.map((val, i) => `${val} - ${b[i]}`).join(", ")}>`);
      steps.push(`Result: <${result.join(", ")}>`);
    } else if (op === "dot") {
      result = a.reduce((sum, val, i) => sum + val * b[i], 0);
      steps.push(`Dot Product: ${a.map((val, i) => `${val} * ${b[i]}`).join(" + ")}`);
      steps.push(`Result: ${result}`);
    } else if (op === "cross" && dim === 3) {
      const [ax, ay, az] = a;
      const [bx, by, bz] = b;
      result = [
        (ay * bz - az * by).toFixed(2),
        (az * bx - ax * bz).toFixed(2),
        (ax * by - ay * bx).toFixed(2),
      ];
      steps.push(`Cross Product: <(ay*bz - az*by), (az*bx - ax*bz), (ax*by - ay*bx)>`);
      steps.push(
        `= <(${ay}*${bz} - ${az}*${by}), (${az}*${bx} - ${ax}*${bz}), (${ax}*${by} - ${ay}*${bx})>`
      );
      steps.push(`Result: <${result.join(", ")}>`);
    } else if (op === "magnitude") {
      result = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0)).toFixed(2);
      steps.push(`Magnitude of A: √(${a.map((val) => `${val}^2`).join(" + ")})`);
      steps.push(`Result: ${result}`);
    }

    // Calculate magnitudes and angle for all operations except magnitude
    if (op !== "magnitude") {
      magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0)).toFixed(2);
      magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0)).toFixed(2);
      const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const cosTheta = dotProduct / (magnitudeA * magnitudeB);
      angle = (Math.acos(cosTheta) * (180 / Math.PI)).toFixed(2);
      steps.push(`Magnitude of A: ${magnitudeA}`);
      steps.push(`Magnitude of B: ${magnitudeB}`);
      steps.push(`Angle between vectors: ${angle}°`);
    }

    return {
      result,
      steps,
      scalar: op === "dot" || op === "magnitude",
      magnitudeA,
      magnitudeB,
      angle,
    };
  }, []);

  // Handle vector input changes
  const handleVectorChange = (vector, index) => (e) => {
    const value = e.target.value;
    const setter = vector === "A" ? setVectorA : setVectorB;
    setter((prev) => {
      const newVector = [...prev];
      newVector[index] = value;
      return newVector;
    });
    setResult(null);
    setMagnitudeA(null);
    setMagnitudeB(null);
    setAngle(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [`${vector}${index}`]: "Must be a number" }));
    } else {
      setErrors((prev) => ({ ...prev, [`${vector}${index}`]: "" }));
    }
  };

  // Input validation
  const isValid = useMemo(() => {
    const activeComponents = dimension;
    const aValid = vectorA
      .slice(0, activeComponents)
      .every((val) => val !== "" && !isNaN(parseFloat(val)));
    const bValid =
      operation !== "magnitude" &&
      vectorB
        .slice(0, activeComponents)
        .every((val) => val !== "" && !isNaN(parseFloat(val)));
    return operation === "magnitude" ? aValid : aValid && bValid && Object.values(errors).every((err) => !err);
  }, [vectorA, vectorB, dimension, errors, operation]);

  // Perform calculation
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: `Please fill all ${dimension} components of ${
          operation === "magnitude" ? "Vector A" : "both vectors"
        } with valid numbers`,
      }));
      return;
    }

    const calcResult = calculateVectorOperation(vectorA, vectorB, dimension, operation);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
      setMagnitudeA(calcResult.magnitudeA);
      setMagnitudeB(calcResult.magnitudeB);
      setAngle(calcResult.angle);
    }
  };

  // Reset state
  const reset = () => {
    setDimension(2);
    setVectorA(["", "", ""]);
    setVectorB(["", "", ""]);
    setOperation("add");
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setMagnitudeA(null);
    setMagnitudeB(null);
    setAngle(null);
  };

  // Download result as text
  const downloadResult = () => {
    if (!result) return;
    const text = [
      `Vector Calculator Result`,
      `Dimension: ${dimension}D`,
      `Operation: ${operation}`,
      `Vector A: <${vectorA.slice(0, dimension).join(", ")}>`,
      operation !== "magnitude" ? `Vector B: <${vectorB.slice(0, dimension).join(", ")}>` : "",
      `Result: ${result.scalar ? result.result : `<${result.result.join(", ")}>`}`,
      ...(result.magnitudeA ? [`Magnitude A: ${result.magnitudeA}`] : []),
      ...(result.magnitudeB ? [`Magnitude B: ${result.magnitudeB}`] : []),
      ...(result.angle ? [`Angle: ${result.angle}°`] : []),
      ...(showSteps ? ["Steps:"] : []),
      ...(showSteps ? result.steps : []),
    ]
      .filter(Boolean)
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `vector_calculation_${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Vector Calculator
        </h1>

        {/* Dimension Selection */}
        <div className="flex justify-center gap-4 mb-6">
          {[2, 3].map((dim) => (
            <button
              key={dim}
              onClick={() => setDimension(dim)}
              className={`px-4 py-2 rounded-md transition-colors ${
                dimension === dim
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {dim}D
            </button>
          ))}
        </div>

        {/* Operation Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {["add", "subtract", "dot", "cross", "magnitude"].map((op) => (
            <button
              key={op}
              onClick={() => setOperation(op)}
              disabled={op === "cross" && dimension !== 3}
              className={`px-3 py-2 rounded-md transition-colors ${
                operation === op
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              }`}
            >
              {op === "add"
                ? "Add"
                : op === "subtract"
                ? "Subtract"
                : op === "dot"
                ? "Dot"
                : op === "cross"
                ? "Cross"
                : "Magnitude"}
            </button>
          ))}
        </div>

        {/* Vector Inputs */}
        <div className="space-y-4 mb-6">
          {["A", ...(operation !== "magnitude" ? ["B"] : [])].map((vec) => (
            <div key={vec} className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-20 text-sm font-medium text-gray-700">
                Vector {vec}:
              </label>
              <div className="flex flex-1 gap-2">
                {["x", "y", ...(dimension === 3 ? ["z"] : [])].map((comp, i) => (
                  <div key={comp} className="flex-1">
                    <input
                      type="number"
                      step="0.01"
                      value={vec === "A" ? vectorA[i] : vectorB[i]}
                      onChange={handleVectorChange(vec, i)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-center text-sm"
                      placeholder={comp}
                      aria-label={`Vector ${vec} ${comp}-component`}
                    />
                    {errors[`${vec}${i}`] && (
                      <p className="text-red-600 text-xs mt-1">{errors[`${vec}${i}`]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
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
          <button
            onClick={downloadResult}
            disabled={!result}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result</h2>
            <p className="text-center text-xl font-mono">
              {result.scalar ? result.result : `<${result.result.join(", ")}>`}
            </p>
            {magnitudeA && magnitudeB && angle && operation !== "magnitude" && (
              <div className="mt-2 text-sm text-gray-600 text-center">
                <p>Magnitude A: {magnitudeA}</p>
                <p>Magnitude B: {magnitudeB}</p>
                <p>Angle: {angle}°</p>
              </div>
            )}
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside text-gray-600">
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
            <li>Supports 2D and 3D vectors</li>
            <li>Operations: Add, Subtract, Dot Product, Cross Product (3D), Magnitude</li>
            <li>Calculates magnitudes and angle between vectors</li>
            <li>Step-by-step calculation breakdown</li>
            <li>Download results as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VectorCalculator;