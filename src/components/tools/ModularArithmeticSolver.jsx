"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaInfoCircle } from "react-icons/fa";

const ModularArithmeticSolver = () => {
  const [mode, setMode] = useState("basic"); // basic, congruence, inverse, exponentiation
  const [inputs, setInputs] = useState({ a: "", b: "", n: "", e: "" }); // Added e for exponentiation
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [history, setHistory] = useState([]);

  // Extended Euclidean Algorithm for GCD and coefficients
  const extendedGCD = (a, b) => {
    if (b === 0) return [a, 1, 0];
    const [gcd, x1, y1] = extendedGCD(b, a % b);
    const x = y1;
    const y = x1 - Math.floor(a / b) * y1;
    return [gcd, x, y];
  };

  // Modular exponentiation (a^e mod n)
  const modPow = (base, exponent, modulus) => {
    if (modulus === 1) return 0;
    let result = 1;
    base = base % modulus;
    const steps = [`Calculating ${base}^${exponent} mod ${modulus}:`];
    while (exponent > 0) {
      if (exponent % 2 === 1) {
        result = (result * base) % modulus;
        steps.push(`result = (${result} * ${base}) mod ${modulus} = ${result}`);
      }
      base = (base * base) % modulus;
      exponent = Math.floor(exponent / 2);
      steps.push(`base = (${base} * ${base}) mod ${modulus} = ${base}`);
    }
    return { result, steps };
  };

  // Calculate modular solution
  const calculateMod = useCallback((mode, inputs) => {
    const steps = [`Solving for ${mode}:`];
    const a = parseInt(inputs.a);
    const b = mode === "inverse" ? null : parseInt(inputs.b);
    const n = parseInt(inputs.n);
    const e = mode === "exponentiation" ? parseInt(inputs.e) : null;

    if (isNaN(n) || n <= 0) {
      return { error: "Modulus (n) must be a positive integer" };
    }

    if (mode === "basic") {
      if (isNaN(a) || isNaN(b)) return { error: "a and b must be integers" };
      const sum = a + b;
      const result = ((sum % n) + n) % n;
      steps.push(`(${a} + ${b}) = ${sum}`);
      steps.push(`${sum} mod ${n} = ${result}`);
      return { result, steps, label: `(${a} + ${b}) mod ${n}` };
    } else if (mode === "congruence") {
      if (isNaN(a) || isNaN(b)) return { error: "a and b must be integers" };
      const [gcd, x0] = extendedGCD(a, n);
      if (b % gcd !== 0) {
        steps.push(`gcd(${a}, ${n}) = ${gcd}`);
        steps.push(`${b} is not divisible by ${gcd}: No solution exists`);
        return { error: "No solution exists (b not divisible by gcd)", steps };
      }
      const x = ((x0 * (b / gcd)) % n + n) % n;
      steps.push(`${a}x ≡ ${b} (mod ${n})`);
      steps.push(`gcd(${a}, ${n}) = ${gcd}`);
      steps.push(`x = (${x0} * (${b} / ${gcd})) mod ${n} = ${x}`);
      return { result: x, steps, label: "x" };
    } else if (mode === "inverse") {
      if (isNaN(a)) return { error: "a must be an integer" };
      const [gcd, x] = extendedGCD(a, n);
      if (gcd !== 1) {
        steps.push(`gcd(${a}, ${n}) = ${gcd} ≠ 1: No modular inverse exists`);
        return { error: "No modular inverse exists (gcd ≠ 1)", steps };
      }
      const inverse = (x % n + n) % n;
      steps.push(`Find x such that ${a}x ≡ 1 (mod ${n})`);
      steps.push(`Using Extended Euclidean: gcd(${a}, ${n}) = ${gcd}`);
      steps.push(`Inverse = ${x} mod ${n} = ${inverse}`);
      return { result: inverse, steps, label: `${a}⁻¹ mod ${n}` };
    } else if (mode === "exponentiation") {
      if (isNaN(a) || isNaN(e)) return { error: "a and e must be integers" };
      if (e < 0) return { error: "Exponent (e) must be non-negative" };
      const { result, steps: powSteps } = modPow(a, e, n);
      steps.push(...powSteps);
      return { result, steps, label: `${a}^${e} mod ${n}` };
    }
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (value && isNaN(parseInt(value))) {
      setErrors((prev) => ({ ...prev, [field]: "Must be an integer" }));
    } else if (field === "n" && value && parseInt(value) <= 0) {
      setErrors((prev) => ({ ...prev, [field]: "Must be positive" }));
    } else if (field === "e" && value && parseInt(value) < 0) {
      setErrors((prev) => ({ ...prev, [field]: "Must be non-negative" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Check input validity
  const isValid = useMemo(() => {
    const nValid = inputs.n && !isNaN(parseInt(inputs.n)) && parseInt(inputs.n) > 0;
    if (!nValid) return false;

    switch (mode) {
      case "basic":
        return (
          inputs.a &&
          !isNaN(parseInt(inputs.a)) &&
          inputs.b &&
          !isNaN(parseInt(inputs.b)) &&
          Object.values(errors).every((err) => !err)
        );
      case "congruence":
        return (
          inputs.a &&
          !isNaN(parseInt(inputs.a)) &&
          inputs.b &&
          !isNaN(parseInt(inputs.b)) &&
          Object.values(errors).every((err) => !err)
        );
      case "inverse":
        return (
          inputs.a &&
          !isNaN(parseInt(inputs.a)) &&
          Object.values(errors).every((err) => !err)
        );
      case "exponentiation":
        return (
          inputs.a &&
          !isNaN(parseInt(inputs.a)) &&
          inputs.e &&
          !isNaN(parseInt(inputs.e)) &&
          parseInt(inputs.e) >= 0 &&
          Object.values(errors).every((err) => !err)
        );
      default:
        return false;
    }
  }, [mode, inputs, errors]);

  // Perform calculation
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please provide valid inputs for the selected mode" });
      return;
    }

    const calcResult = calculateMod(mode, inputs);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
      setHistory((prev) => [
        ...prev,
        { mode, inputs: { ...inputs }, result: calcResult.result },
      ].slice(-5)); // Keep last 5 calculations
    }
  };

  // Reset state
  const reset = () => {
    setMode("basic");
    setInputs({ a: "", b: "", n: "", e: "" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Modular Arithmetic Solver
        </h1>

        {/* Mode Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {["basic", "congruence", "inverse", "exponentiation"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`py-2 px-3 rounded-md text-sm transition-colors ${
                mode === m
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              {m === "basic"
                ? "Basic Mod"
                : m === "congruence"
                ? "Solve ax ≡ b"
                : m === "inverse"
                ? "Mod Inverse"
                : "Mod Power"}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {["a", mode !== "inverse" && "b", "n", mode === "exponentiation" && "e"]
            .filter(Boolean)
            .map((field) => (
              <div key={field} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="w-28 text-sm font-medium text-gray-700">
                  {field === "a"
                    ? "a:"
                    : field === "b"
                    ? "b:"
                    : field === "n"
                    ? "Modulus (n):"
                    : "Exponent (e):"}
                </label>
                <div className="flex-1 w-full">
                  <input
                    type="number"
                    step="1"
                    value={inputs[field]}
                    onChange={handleInputChange(field)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder={
                      field === "a"
                        ? "e.g., 5"
                        : field === "b"
                        ? "e.g., 3"
                        : field === "n"
                        ? "e.g., 4"
                        : "e.g., 2"
                    }
                    aria-label={`Value ${field}`}
                  />
                  {errors[field] && (
                    <p className="text-red-600 text-xs mt-1">{errors[field]}</p>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mb-6 p-4 bg-blue-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Result:</h2>
            <p className="text-center text-xl font-mono">
              {result.label} = {result.result}
            </p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
            >
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

        {/* Calculation History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Recent Calculations:</h3>
            <ul className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
              {history.slice().reverse().map((entry, index) => (
                <li key={index}>
                  {entry.mode === "basic"
                    ? `(${entry.inputs.a} + ${entry.inputs.b}) mod ${entry.inputs.n} = ${entry.result}`
                    : entry.mode === "congruence"
                    ? `${entry.inputs.a}x ≡ ${entry.inputs.b} (mod ${entry.inputs.n}) → x = ${entry.result}`
                    : entry.mode === "inverse"
                    ? `${entry.inputs.a}⁻¹ mod ${entry.inputs.n} = ${entry.result}`
                    : `${entry.inputs.a}^${entry.inputs.e} mod ${entry.inputs.n} = ${entry.result}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features and Info */}
        <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
            <FaInfoCircle className="mr-2" /> Features
          </h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Basic modular arithmetic (a + b mod n)</li>
            <li>Linear congruence solver (ax ≡ b mod n)</li>
            <li>Modular multiplicative inverse (a⁻¹ mod n)</li>
            <li>Modular exponentiation (a^e mod n)</li>
            <li>Step-by-step solutions</li>
            <li>Calculation history (last 5)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ModularArithmeticSolver;