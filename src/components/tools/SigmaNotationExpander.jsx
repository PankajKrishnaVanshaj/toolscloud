"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading result as image

const SigmaNotationExpander = () => {
  const [expression, setExpression] = useState(""); // e.g., "2*i + 1"
  const [start, setStart] = useState(""); // Start index
  const [end, setEnd] = useState(""); // End index (can be 'n')
  const [nValue, setNValue] = useState(""); // Specific n value if end is 'n'
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(2); // Control decimal precision
  const resultRef = React.useRef(null); // For downloading result

  // Parse and evaluate the expression for a given i
  const evaluateExpression = (expr, i) => {
    try {
      const safeExpr = expr.replace(/i/g, i); // Replace 'i' with current index
      // Enhanced evaluation with basic math functions
      const func = new Function(`return ${safeExpr}`);
      const value = func();
      if (typeof value !== "number" || isNaN(value)) throw new Error();
      return value;
    } catch {
      throw new Error("Invalid expression");
    }
  };

  // Expand and sum the sigma notation
  const expandSigma = useCallback(() => {
    const steps = ["Expanding sigma notation:"];
    const startNum = parseInt(start);
    let endNum = end.toLowerCase() === "n" ? parseInt(nValue) : parseInt(end);

    // Validation
    if (!expression) return { error: "Expression is required" };
    if (isNaN(startNum) || startNum < 0)
      return { error: "Start index must be a non-negative number" };
    if (end.toLowerCase() !== "n" && (isNaN(endNum) || endNum < startNum)) {
      return { error: "End index must be a number >= start index" };
    }
    if (end.toLowerCase() === "n" && (isNaN(endNum) || endNum < startNum)) {
      return { error: "n must be a number >= start index" };
    }

    steps.push(`∑(i=${startNum} to ${end}) ${expression}`);

    // Expand terms
    const terms = [];
    let sum = 0;
    for (let i = startNum; i <= endNum; i++) {
      try {
        const value = evaluateExpression(expression, i);
        terms.push(value.toFixed(decimalPlaces));
        sum += value;
        if (terms.length <= 5)
          steps.push(`i = ${i}: ${expression.replace(/i/g, i)} = ${value.toFixed(decimalPlaces)}`);
      } catch {
        return {
          error: 'Invalid expression format (use i as variable, e.g., "2*i + 1" or "Math.pow(i, 2)")',
        };
      }
    }
    if (terms.length > 5) steps.push(`...and ${terms.length - 5} more terms`);

    steps.push(`Expanded: ${terms.join(" + ")}`);
    steps.push(`Sum = ${sum.toFixed(decimalPlaces)}`);

    return { terms, sum: sum.toFixed(decimalPlaces), steps };
  }, [expression, start, end, nValue, decimalPlaces]);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    const setters = {
      expression: setExpression,
      start: setStart,
      end: setEnd,
      nValue: setNValue,
      decimalPlaces: setDecimalPlaces,
    };
    setters[field](value);
    setResult(null);

    if (field === "expression") {
      setErrors((prev) => ({ ...prev, expression: value ? "" : "Required" }));
    } else if (field === "start") {
      if (value && (isNaN(parseInt(value)) || parseInt(value) < 0)) {
        setErrors((prev) => ({ ...prev, start: "Must be a non-negative number" }));
      } else {
        setErrors((prev) => ({ ...prev, start: "" }));
      }
    } else if (field === "end") {
      if (value.toLowerCase() !== "n" && value && (isNaN(parseInt(value)) || parseInt(value) < parseInt(start))) {
        setErrors((prev) => ({ ...prev, end: "Must be >= start or 'n'" }));
      } else {
        setErrors((prev) => ({ ...prev, end: "" }));
      }
    } else if (field === "nValue" && end.toLowerCase() === "n") {
      if (value && (isNaN(parseInt(value)) || parseInt(value) < parseInt(start))) {
        setErrors((prev) => ({ ...prev, nValue: "Must be >= start" }));
      } else {
        setErrors((prev) => ({ ...prev, nValue: "" }));
      }
    } else if (field === "decimalPlaces") {
      const num = parseInt(value);
      if (value && (isNaN(num) || num < 0 || num > 10)) {
        setErrors((prev) => ({ ...prev, decimalPlaces: "Must be 0-10" }));
      } else {
        setErrors((prev) => ({ ...prev, decimalPlaces: "" }));
      }
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    const startNum = parseInt(start);
    const endNum = end.toLowerCase() === "n" ? parseInt(nValue) : parseInt(end);
    const decNum = parseInt(decimalPlaces);
    return (
      expression &&
      !isNaN(startNum) &&
      startNum >= 0 &&
      (end.toLowerCase() === "n"
        ? !isNaN(endNum) && endNum >= startNum
        : !isNaN(endNum) && endNum >= startNum) &&
      !isNaN(decNum) &&
      decNum >= 0 &&
      decNum <= 10 &&
      Object.values(errors).every((err) => !err)
    );
  }, [expression, start, end, nValue, decimalPlaces, errors]);

  // Expand and calculate
  const expand = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({ ...prev, general: "Please provide valid inputs" }));
      return;
    }

    const calcResult = expandSigma();
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setExpression("");
    setStart("");
    setEnd("");
    setNValue("");
    setDecimalPlaces(2);
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  // Download result as image
  const downloadResult = () => {
    if (resultRef.current && result) {
      html2canvas(resultRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `sigma-expansion-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Sigma Notation Expander
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {[
            { label: "Expression", value: expression, field: "expression", placeholder: "e.g., 2*i + 1 or Math.pow(i, 2)" },
            { label: "Start Index", value: start, field: "start", placeholder: "e.g., 1", type: "number" },
            { label: "End Index", value: end, field: "end", placeholder: "e.g., 5 or n" },
            ...(end.toLowerCase() === "n"
              ? [{ label: "n Value", value: nValue, field: "nValue", placeholder: "e.g., 5", type: "number" }]
              : []),
            { label: "Decimal Places", value: decimalPlaces, field: "decimalPlaces", type: "number", placeholder: "0-10" },
          ].map(({ label, value, field, placeholder, type = "text" }) => (
            <div key={field} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="w-32 text-sm font-medium text-gray-700">{label}:</label>
              <div className="flex-1">
                <input
                  type={type}
                  step={type === "number" ? "1" : undefined}
                  value={value}
                  onChange={handleInputChange(field)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder={placeholder}
                  aria-label={label}
                />
                {errors[field] && <p className="text-red-600 text-sm mt-1">{errors[field]}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={expand}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Expand
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          {result && (
            <button
              onClick={downloadResult}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center"
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <p className="text-center text-xl">Expanded: {result.terms.join(" + ")}</p>
            <p className="text-center text-xl mt-2">Sum = {result.sum}</p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside text-gray-700 transition-opacity">
                {result.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
            <li>Expand sigma notation with variable 'i'</li>
            <li>Support for basic math (e.g., Math.pow, Math.sqrt)</li>
            <li>Adjustable decimal precision</li>
            <li>Step-by-step expansion</li>
            <li>Download result as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SigmaNotationExpander;