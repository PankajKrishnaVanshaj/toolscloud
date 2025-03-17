"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaDownload, FaSync } from "react-icons/fa";

const SequenceGenerator = () => {
  const [type, setType] = useState("arithmetic");
  const [inputs, setInputs] = useState({
    first: "",
    diff: "",
    ratio: "",
    terms: "",
    second: "",
  });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [isLoading, setIsLoading] = useState(false);

  // Generate sequence based on type
  const generateSequence = useCallback(
    (type, inputs) => {
      const steps = [`Generating ${type} sequence:`];
      const terms = parseInt(inputs.terms);
      const dp = parseInt(decimalPlaces);

      if (isNaN(terms) || terms <= 0) {
        return { error: "Number of terms must be a positive integer" };
      }

      let sequence = [];

      if (type === "arithmetic") {
        const first = parseFloat(inputs.first);
        const diff = parseFloat(inputs.diff);
        if (isNaN(first) || isNaN(diff)) {
          return { error: "First term and difference must be valid numbers" };
        }
        steps.push(`First term = ${first}, Common difference = ${diff}`);
        steps.push(`Formula: a_n = a_1 + (n-1)d`);
        for (let n = 0; n < terms; n++) {
          const term = first + n * diff;
          sequence.push(term.toFixed(dp));
          if (n < 5) steps.push(`Term ${n + 1}: ${first} + ${n} * ${diff} = ${term.toFixed(dp)}`);
        }
        if (terms > 5) steps.push(`...and so on up to ${terms} terms`);
      } else if (type === "geometric") {
        const first = parseFloat(inputs.first);
        const ratio = parseFloat(inputs.ratio);
        if (isNaN(first) || isNaN(ratio)) {
          return { error: "First term and ratio must be valid numbers" };
        }
        steps.push(`First term = ${first}, Common ratio = ${ratio}`);
        steps.push(`Formula: a_n = a_1 * r^(n-1)`);
        for (let n = 0; n < terms; n++) {
          const term = first * Math.pow(ratio, n);
          sequence.push(term.toFixed(dp));
          if (n < 5) steps.push(`Term ${n + 1}: ${first} * ${ratio}^${n} = ${term.toFixed(dp)}`);
        }
        if (terms > 5) steps.push(`...and so on up to ${terms} terms`);
      } else if (type === "fibonacci") {
        const first = parseFloat(inputs.first) || 0;
        const second = parseFloat(inputs.second) || 1;
        if (isNaN(first) || isNaN(second)) {
          return { error: "First and second terms must be valid numbers" };
        }
        steps.push(`Starting with ${first}, ${second}`);
        steps.push(`Formula: a_n = a_(n-1) + a_(n-2)`);
        sequence.push(first.toFixed(dp));
        if (terms > 1) sequence.push(second.toFixed(dp));
        for (let n = 2; n < terms; n++) {
          const term = parseFloat(sequence[n - 1]) + parseFloat(sequence[n - 2]);
          sequence.push(term.toFixed(dp));
          if (n < 5)
            steps.push(`Term ${n + 1}: ${sequence[n - 1]} + ${sequence[n - 2]} = ${term.toFixed(dp)}`);
        }
        if (terms > 5) steps.push(`...and so on up to ${terms} terms`);
      } else if (type === "triangular") {
        steps.push(`Formula: a_n = n(n+1)/2`);
        for (let n = 1; n <= terms; n++) {
          const term = (n * (n + 1)) / 2;
          sequence.push(term.toFixed(dp));
          if (n < 5) steps.push(`Term ${n}: ${n} * (${n} + 1) / 2 = ${term.toFixed(dp)}`);
        }
        if (terms > 5) steps.push(`...and so on up to ${terms} terms`);
      } else if (type === "square") {
        steps.push(`Formula: a_n = n^2`);
        for (let n = 1; n <= terms; n++) {
          const term = Math.pow(n, 2);
          sequence.push(term.toFixed(dp));
          if (n < 5) steps.push(`Term ${n}: ${n}^2 = ${term.toFixed(dp)}`);
        }
        if (terms > 5) steps.push(`...and so on up to ${terms} terms`);
      }

      return { sequence, steps };
    },
    [decimalPlaces]
  );

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a number" }));
    } else if (
      field === "terms" &&
      value &&
      (parseInt(value) <= 0 || !Number.isInteger(parseFloat(value)))
    ) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a positive integer" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate inputs
  const isValid = useMemo(() => {
    const termsValid =
      inputs.terms &&
      !isNaN(parseInt(inputs.terms)) &&
      parseInt(inputs.terms) > 0 &&
      Number.isInteger(parseFloat(inputs.terms));
    if (!termsValid) return false;

    switch (type) {
      case "arithmetic":
        return (
          inputs.first &&
          !isNaN(parseFloat(inputs.first)) &&
          inputs.diff &&
          !isNaN(parseFloat(inputs.diff)) &&
          Object.values(errors).every((err) => !err)
        );
      case "geometric":
        return (
          inputs.first &&
          !isNaN(parseFloat(inputs.first)) &&
          inputs.ratio &&
          !isNaN(parseFloat(inputs.ratio)) &&
          Object.values(errors).every((err) => !err)
        );
      case "fibonacci":
        return (
          (!inputs.first || !isNaN(parseFloat(inputs.first))) &&
          (!inputs.second || !isNaN(parseFloat(inputs.second))) &&
          Object.values(errors).every((err) => !err)
        );
      case "triangular":
      case "square":
        return Object.values(errors).every((err) => !err);
      default:
        return false;
    }
  }, [type, inputs, errors]);

  // Generate sequence with simulated delay
  const generate = async () => {
    setErrors({});
    setResult(null);
    setIsLoading(true);

    if (!isValid) {
      setErrors({ general: "Please provide valid inputs for the selected sequence type" });
      setIsLoading(false);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulated processing
    const genResult = generateSequence(type, inputs);
    if (genResult.error) {
      setErrors({ general: genResult.error });
    } else {
      setResult(genResult);
    }
    setIsLoading(false);
  };

  // Reset state
  const reset = () => {
    setType("arithmetic");
    setInputs({ first: "", diff: "", ratio: "", terms: "", second: "" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setDecimalPlaces(2);
    setIsLoading(false);
  };

  // Download sequence as text file
  const downloadSequence = () => {
    if (!result) return;
    const blob = new Blob([result.sequence.join(", ")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}-sequence-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Sequence Generator
        </h1>

        {/* Type Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["arithmetic", "geometric", "fibonacci", "triangular", "square"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1 rounded-md transition-colors ${
                type === t
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {["arithmetic", "geometric", "fibonacci"].includes(type) && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="w-32 text-gray-700 font-medium">First Term:</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.first}
                  onChange={handleInputChange("first")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder={type === "fibonacci" ? "e.g., 0 (optional)" : "e.g., 2"}
                />
                {errors.first && <p className="text-red-600 text-sm mt-1">{errors.first}</p>}
              </div>
            </div>
          )}
          {type === "fibonacci" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="w-32 text-gray-700 font-medium">Second Term:</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.second}
                  onChange={handleInputChange("second")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1 (optional)"
                />
                {errors.second && (
                  <p className="text-red-600 text-sm mt-1">{errors.second}</p>
                )}
              </div>
            </div>
          )}
          {type === "arithmetic" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="w-32 text-gray-700 font-medium">Difference:</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.diff}
                  onChange={handleInputChange("diff")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                />
                {errors.diff && <p className="text-red-600 text-sm mt-1">{errors.diff}</p>}
              </div>
            </div>
          )}
          {type === "geometric" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="w-32 text-gray-700 font-medium">Ratio:</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.ratio}
                  onChange={handleInputChange("ratio")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2"
                />
                {errors.ratio && <p className="text-red-600 text-sm mt-1">{errors.ratio}</p>}
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-32 text-gray-700 font-medium">Terms:</label>
            <div className="flex-1">
              <input
                type="number"
                step="1"
                value={inputs.terms}
                onChange={handleInputChange("terms")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10"
              />
              {errors.terms && <p className="text-red-600 text-sm mt-1">{errors.terms}</p>}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-32 text-gray-700 font-medium">Decimal Places:</label>
            <div className="flex-1">
              <input
                type="number"
                min="0"
                max="6"
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(Math.max(0, Math.min(6, e.target.value)))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={generate}
            disabled={!isValid || isLoading}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <span className="animate-spin inline-block h-5 w-5 border-t-2 border-white rounded-full"></span>
            ) : (
              "Generate"
            )}
          </button>
          <button
            onClick={reset}
            disabled={isLoading}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          {result && (
            <button
              onClick={downloadSequence}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          )}
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">Sequence:</h2>
            <p className="text-center text-xl break-words">{result.sequence.join(", ")}</p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-4 text-sm list-disc list-inside bg-white p-4 rounded-md shadow-inner">
                {result.steps.map((step, i) => (
                  <li key={i} className="text-gray-600">
                    {step}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports Arithmetic, Geometric, Fibonacci, Triangular, and Square sequences</li>
            <li>Customizable decimal places</li>
            <li>Step-by-step generation explanation</li>
            <li>Download sequence as text file</li>
            <li>Real-time input validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SequenceGenerator;