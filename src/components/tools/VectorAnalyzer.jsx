"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaDownload, FaSync } from "react-icons/fa";

const VectorAnalyzer = () => {
  const [dimension, setDimension] = useState(2); // 2D or 3D
  const [vector, setVector] = useState(["", "", ""]); // [x, y, z]
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(4); // Precision control
  const [showGraph, setShowGraph] = useState(false); // Toggle for graphical representation

  // Analyze vector properties
  const analyzeVector = useCallback(
    (vec, dim) => {
      const steps = [`Analyzing ${dim}D vector:`];
      const components = vec.slice(0, dim).map((val) => parseFloat(val) || 0);

      // Validate inputs
      if (components.some(isNaN)) {
        return { error: "All components must be valid numbers" };
      }

      steps.push(`Vector = <${components.join(", ")}>`);

      // Magnitude
      const magnitude = Math.sqrt(components.reduce((sum, val) => sum + val * val, 0));
      steps.push(`Magnitude = √(${components.map((v) => `${v}^2`).join(" + ")})`);
      steps.push(
        `= √(${components.reduce((sum, v) => sum + v * v, 0).toFixed(decimalPlaces)}) = ${magnitude.toFixed(decimalPlaces)}`
      );

      // Unit vector
      let unitVector = null;
      if (magnitude === 0) {
        steps.push("Magnitude = 0: Unit vector is undefined.");
      } else {
        unitVector = components.map((v) => (v / magnitude).toFixed(decimalPlaces));
        steps.push(
          `Unit Vector = <${components.map((v) => `${v} / ${magnitude.toFixed(decimalPlaces)}`).join(", ")}>`
        );
        steps.push(`= <${unitVector.join(", ")}>`);
      }

      // Direction angles (3D only)
      let directionAngles = null;
      if (dim === 3 && magnitude !== 0) {
        directionAngles = components.map((v, i) => {
          const cosTheta = v / magnitude;
          const thetaRad = Math.acos(cosTheta);
          const thetaDeg = (thetaRad * 180 / Math.PI).toFixed(decimalPlaces);
          steps.push(
            `cos(θ_${["x", "y", "z"][i]}) = ${v} / ${magnitude.toFixed(decimalPlaces)} = ${cosTheta.toFixed(decimalPlaces)}`
          );
          steps.push(`θ_${["x", "y", "z"][i]} = arccos(${cosTheta.toFixed(decimalPlaces)}) = ${thetaDeg}°`);
          return thetaDeg;
        });
      }

      return { magnitude, unitVector, directionAngles, steps, components };
    },
    [decimalPlaces]
  );

  // Handle vector input changes
  const handleVectorChange = (index) => (e) => {
    const value = e.target.value;
    setVector((prev) => {
      const newVector = [...prev];
      newVector[index] = value;
      return newVector;
    });
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [index]: "Must be a number" }));
    } else {
      setErrors((prev) => ({ ...prev, [index]: "" }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    const activeComponents = dimension;
    return (
      vector.slice(0, activeComponents).every((val) => val && !isNaN(parseFloat(val))) &&
      Object.values(errors).every((err) => !err)
    );
  }, [vector, dimension, errors]);

  // Perform analysis
  const analyze = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: `Please fill all ${dimension} components with valid numbers`,
      }));
      return;
    }

    const calcResult = analyzeVector(vector, dimension);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setDimension(2);
    setVector(["", "", ""]);
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setShowGraph(false);
    setDecimalPlaces(4);
  };

  // Download results as text
  const downloadResults = () => {
    if (!result) return;
    const textContent = [
      `Vector Analysis (${dimension}D)`,
      `Vector: <${vector.slice(0, dimension).join(", ")}>`,
      `Magnitude: ${result.magnitude}`,
      `Unit Vector: ${result.unitVector ? `<${result.unitVector.join(", ")}>` : "Undefined"}`,
      ...(dimension === 3 && result.directionAngles
        ? [
            `Direction Angles:`,
            `θ_x = ${result.directionAngles[0]}°`,
            `θ_y = ${result.directionAngles[1]}°`,
            `θ_z = ${result.directionAngles[2]}°`,
          ]
        : []),
      "\nCalculation Steps:",
      ...result.steps,
    ].join("\n");

    const blob = new Blob([textContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `vector-analysis-${Date.now()}.txt`;
    link.click();
  };

  // Simple SVG graph for visualization
  const renderGraph = () => {
    if (!result || !result.components) return null;
    const size = 200;
    const scale = 50 / Math.max(...result.components.map(Math.abs), 1);
    const coords = result.components.map((v) => v * scale);
    const origin = size / 2;

    return (
      <svg width={size} height={size} className="mx-auto border rounded-lg">
        {/* Axes */}
        <line x1="0" y1={origin} x2={size} y2={origin} stroke="gray" strokeWidth="1" />
        <line x1={origin} y1="0" x2={origin} y2={size} stroke="gray" strokeWidth="1" />
        {dimension === 3 && (
          <line
            x1={origin - 20}
            y1={size - 20}
            x2={origin + 20}
            y2={size - 60}
            stroke="gray"
            strokeWidth="1"
          />
        )}
        {/* Vector */}
        <line
          x1={origin}
          y1={origin}
          x2={origin + coords[0]}
          y2={origin - coords[1]}
          stroke="blue"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />
        {dimension === 3 && (
          <line
            x1={origin}
            y1={origin}
            x2={origin + coords[0] * 0.7}
            y2={origin - coords[1] * 0.7 - coords[2] * 0.7}
            stroke="blue"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
        )}
        {/* Arrowhead */}
        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="blue" />
          </marker>
        </defs>
      </svg>
    );
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Vector Analyzer
        </h1>

        {/* Dimension Selection */}
        <div className="flex justify-center gap-4 mb-6">
          {[2, 3].map((dim) => (
            <button
              key={dim}
              onClick={() => setDimension(dim)}
              className={`px-4 py-2 rounded-md transition-colors ${
                dimension === dim ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {dim}D
            </button>
          ))}
        </div>

        {/* Vector Input */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {["x", "y", ...(dimension === 3 ? ["z"] : [])].map((comp, i) => (
              <div key={comp}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {comp.toUpperCase()}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={vector[i]}
                  onChange={handleVectorChange(i)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder={comp}
                  aria-label={`${comp}-component`}
                />
                {errors[i] && <p className="text-red-600 text-xs mt-1">{errors[i]}</p>}
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision
              </label>
              <select
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {[2, 4, 6].map((val) => (
                  <option key={val} value={val}>
                    {val} decimals
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={analyze}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Analyze
          </button>
          <button
            onClick={downloadResults}
            disabled={!result}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download
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
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Analysis Results</h2>
              <div className="text-sm space-y-2">
                <p>
                  <strong>Magnitude:</strong> {result.magnitude}
                </p>
                <p>
                  <strong>Unit Vector:</strong>{" "}
                  {result.unitVector ? `<${result.unitVector.join(", ")}>` : "Undefined (zero vector)"}
                </p>
                {dimension === 3 && result.directionAngles && (
                  <div>
                    <p>
                      <strong>Direction Angles:</strong>
                    </p>
                    <p>θ_x = {result.directionAngles[0]}°</p>
                    <p>θ_y = {result.directionAngles[1]}°</p>
                    <p>θ_z = {result.directionAngles[2]}°</p>
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-4 justify-center">
                <button
                  onClick={() => setShowSteps(!showSteps)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showSteps ? "Hide Steps" : "Show Steps"}
                </button>
                <button
                  onClick={() => setShowGraph(!showGraph)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showGraph ? "Hide Graph" : "Show Graph"}
                </button>
              </div>
              {showSteps && (
                <ul className="mt-2 text-sm list-disc list-inside">
                  {result.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              )}
            </div>
            {showGraph && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">
                  Vector Visualization
                </h3>
                {renderGraph()}
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Analyze 2D and 3D vectors</li>
            <li>Calculate magnitude, unit vector, and direction angles</li>
            <li>Adjustable decimal precision</li>
            <li>Step-by-step calculation breakdown</li>
            <li>Simple vector visualization</li>
            <li>Download results as text</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VectorAnalyzer;