"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaInfoCircle } from "react-icons/fa";

const BMICalculator = () => {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [unit, setUnit] = useState("metric");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [age, setAge] = useState(""); // New: Age for additional context
  const [gender, setGender] = useState(""); // New: Gender for potential future use

  // Calculate BMI and category
  const calculateBMI = useCallback((w, h) => {
    let weightInKg = parseFloat(w);
    let heightInMeters = parseFloat(h) / 100;

    if (unit === "imperial") {
      weightInKg = weightInKg * 0.453592; // lb to kg
      heightInMeters = heightInMeters * 0.0254; // in to m
    }

    const bmi = weightInKg / (heightInMeters * heightInMeters);
    if (!isFinite(bmi) || bmi <= 0) {
      return { error: "Invalid calculation - check your inputs" };
    }

    let category = "";
    let color = "";
    if (bmi < 18.5) {
      category = "Underweight";
      color = "text-blue-600";
    } else if (bmi < 25) {
      category = "Normal weight";
      color = "text-green-600";
    } else if (bmi < 30) {
      category = "Overweight";
      color = "text-yellow-600";
    } else {
      category = "Obese";
      color = "text-red-600";
    }

    return {
      bmi: bmi.toFixed(1),
      category,
      color,
      weightUsed: weightInKg.toFixed(2),
      heightUsed: heightInMeters.toFixed(2),
    };
  }, [unit]);

  const calculate = () => {
    setError("");
    setResult(null);

    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);

    if (isNaN(w) || isNaN(h)) {
      setError("Please enter valid numbers for weight and height");
      return;
    }
    if (w <= 0 || h <= 0) {
      setError("Weight and height must be positive");
      return;
    }
    if (age && (isNaN(a) || a <= 0 || a > 120)) {
      setError("Please enter a valid age (1-120)");
      return;
    }

    const calcResult = calculateBMI(w, h);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setWeight("");
    setHeight("");
    setUnit("metric");
    setAge("");
    setGender("");
    setResult(null);
    setError("");
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          BMI Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          {/* Unit Selection */}
          <div className="flex justify-center gap-2 sm:gap-4 mb-4">
            <button
              onClick={() => setUnit("metric")}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                unit === "metric"
                  ? "bg-cyan-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Metric (kg, cm)
            </button>
            <button
              onClick={() => setUnit("imperial")}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                unit === "imperial"
                  ? "bg-cyan-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Imperial (lb, in)
            </button>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-24 text-gray-700 font-medium">
                Weight ({unit === "metric" ? "kg" : "lb"}):
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder={`e.g., ${unit === "metric" ? "70" : "154"}`}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-24 text-gray-700 font-medium">
                Height ({unit === "metric" ? "cm" : "in"}):
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder={`e.g., ${unit === "metric" ? "170" : "67"}`}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-24 text-gray-700 font-medium">Age (optional):</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., 30"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-24 text-gray-700 font-medium">Gender (optional):</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition-all font-semibold flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-all font-semibold flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-cyan-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">BMI Results</h2>
            <div className="mt-4 space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold">BMI: {result.bmi}</p>
                <p className={`text-lg font-medium ${result.color}`}>
                  Category: {result.category}
                </p>
              </div>

              {/* Additional Info */}
              {age && gender && (
                <p className="text-sm text-gray-600 text-center">
                  Context: Age {age}, Gender: {gender}
                </p>
              )}

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-cyan-600 hover:underline flex items-center justify-center mx-auto"
                >
                  <FaInfoCircle className="mr-1" />
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm text-gray-600 space-y-4">
                  <div>
                    <p className="font-medium">Calculation Details:</p>
                    <ul className="list-disc list-inside">
                      <li>Weight used: {result.weightUsed} kg</li>
                      <li>Height used: {result.heightUsed} m</li>
                      <li>Formula: BMI = weight (kg) / (height (m))²</li>
                      <li>
                        BMI = {result.weightUsed} / ({result.heightUsed} ×{" "}
                        {result.heightUsed}) = {result.bmi}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">BMI Categories:</p>
                    <ul className="list-disc list-inside">
                      <li className="text-blue-600">Underweight: &lt; 18.5</li>
                      <li className="text-green-600">Normal weight: 18.5 - 24.9</li>
                      <li className="text-yellow-600">Overweight: 25 - 29.9</li>
                      <li className="text-red-600">Obese: ≥ 30</li>
                    </ul>
                  </div>
                  <p className="text-xs italic">
                    Note: BMI is a general indicator and may not reflect individual health
                    conditions. Consult a healthcare professional for a full assessment.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports metric (kg, cm) and imperial (lb, in) units</li>
            <li>Optional age and gender input</li>
            <li>Detailed calculation breakdown</li>
            <li>Color-coded BMI categories</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;