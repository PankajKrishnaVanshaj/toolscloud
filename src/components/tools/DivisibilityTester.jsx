"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCheck, FaTimes, FaCalculator, FaSync } from "react-icons/fa";

const DivisibilityTester = () => {
  const [number, setNumber] = useState("");
  const [divisor, setDivisor] = useState("");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [testMode, setTestMode] = useState("single"); // Single or multiple divisors
  const [multipleDivisors, setMultipleDivisors] = useState("2,3,4,5,6,9,10"); // Default common divisors

  // Divisibility rules
  const divisibilityRules = {
    2: "A number is divisible by 2 if its last digit is even (0, 2, 4, 6, 8).",
    3: "A number is divisible by 3 if the sum of its digits is divisible by 3.",
    4: "A number is divisible by 4 if the last two digits form a number divisible by 4.",
    5: "A number is divisible by 5 if its last digit is 0 or 5.",
    6: "A number is divisible by 6 if it is divisible by both 2 and 3.",
    7: "A number is divisible by 7 if doubling the last digit and subtracting it from the rest is divisible by 7 (repeat if needed).",
    8: "A number is divisible by 8 if the last three digits form a number divisible by 8.",
    9: "A number is divisible by 9 if the sum of its digits is divisible by 9.",
    10: "A number is divisible by 10 if its last digit is 0.",
  };

  // Test divisibility for a single divisor
  const testDivisibilitySingle = useCallback((num, div) => {
    const steps = [`Testing if ${num} is divisible by ${div}:`];
    const isDivisible = num % div === 0;
    const quotient = Math.floor(num / div);
    const remainder = num % div;
    steps.push(`${num} ÷ ${div} = ${quotient} remainder ${remainder}`);
    steps.push(
      `Since remainder is ${remainder}, ${num} is ${isDivisible ? "" : "not "}divisible by ${div}.`
    );

    if (divisibilityRules[div]) {
      steps.push(`Rule for ${div}: ${divisibilityRules[div]}`);
      const numStr = num.toString();

      switch (div) {
        case 2:
          const lastDigit = numStr.slice(-1);
          steps.push(
            `Last digit is ${lastDigit}, which is ${parseInt(lastDigit) % 2 === 0 ? "even" : "odd"}.`
          );
          break;
        case 3:
        case 9:
          const digitSum = numStr.split("").reduce((sum, digit) => sum + parseInt(digit), 0);
          steps.push(`Sum of digits: ${numStr.split("").join(" + ")} = ${digitSum}`);
          steps.push(
            `${digitSum} % ${div} = ${digitSum % div}, so it is ${
              digitSum % div === 0 ? "" : "not "
            }divisible by ${div}.`
          );
          break;
        case 4:
          const lastTwoDigits = numStr.length > 1 ? numStr.slice(-2) : numStr;
          steps.push(`Last two digits: ${lastTwoDigits}`);
          steps.push(`${lastTwoDigits} % 4 = ${parseInt(lastTwoDigits) % 4}`);
          break;
        case 5:
          const lastDigit5 = numStr.slice(-1);
          steps.push(
            `Last digit is ${lastDigit5}, which ${
              lastDigit5 === "0" || lastDigit5 === "5" ? "is" : "is not"
            } 0 or 5.`
          );
          break;
        case 6:
          const lastDigit6 = numStr.slice(-1);
          const digitSum6 = numStr.split("").reduce((sum, digit) => sum + parseInt(digit), 0);
          steps.push(
            `Check for 2: Last digit ${lastDigit6} is ${
              parseInt(lastDigit6) % 2 === 0 ? "even" : "odd"
            }.`
          );
          steps.push(`Check for 3: Sum of digits = ${digitSum6}, ${digitSum6} % 3 = ${digitSum6 % 3}.`);
          break;
        case 7:
          const lastDigit7 = parseInt(numStr.slice(-1));
          const rest7 = parseInt(numStr.slice(0, -1) || "0");
          const check7 = rest7 - 2 * lastDigit7;
          steps.push(`Check for 7: ${rest7} - 2 × ${lastDigit7} = ${check7}`);
          steps.push(`${check7} % 7 = ${Math.abs(check7 % 7)}`);
          break;
        case 8:
          const lastThreeDigits = numStr.length > 2 ? numStr.slice(-3) : numStr;
          steps.push(`Last three digits: ${lastThreeDigits}`);
          steps.push(`${lastThreeDigits} % 8 = ${parseInt(lastThreeDigits) % 8}`);
          break;
        case 10:
          const lastDigit10 = numStr.slice(-1);
          steps.push(
            `Last digit is ${lastDigit10}, which ${lastDigit10 === "0" ? "is" : "is not"} 0.`
          );
          break;
        default:
          break;
      }
    }

    return { isDivisible, steps };
  }, []);

  // Test divisibility for multiple divisors
  const testDivisibilityMultiple = useCallback(
    (num, divisors) => {
      const results = divisors.map((div) => ({
        divisor: div,
        ...testDivisibilitySingle(num, div),
      }));
      return results;
    },
    [testDivisibilitySingle]
  );

  // Handle input changes
  const handleNumberChange = (e) => {
    const value = e.target.value;
    setNumber(value);
    setResult(null);
    setErrors((prev) => ({
      ...prev,
      number: value && (isNaN(parseInt(value)) || parseInt(value) < 0)
        ? "Must be a non-negative integer"
        : "",
    }));
  };

  const handleDivisorChange = (e) => {
    const value = e.target.value;
    setDivisor(value);
    setResult(null);
    setErrors((prev) => ({
      ...prev,
      divisor: value && (isNaN(parseInt(value)) || parseInt(value) <= 0)
        ? "Must be a positive integer"
        : "",
    }));
  };

  const handleMultipleDivisorsChange = (e) => {
    const value = e.target.value;
    setMultipleDivisors(value);
    setResult(null);
    setErrors((prev) => ({
      ...prev,
      multipleDivisors: value && !/^\d+(,\d+)*$/.test(value) ? "Use comma-separated integers" : "",
    }));
  };

  // Validate inputs
  const isValid = useMemo(() => {
    const num = parseInt(number);
    if (testMode === "single") {
      const div = parseInt(divisor);
      return (
        number &&
        !isNaN(num) &&
        num >= 0 &&
        divisor &&
        !isNaN(div) &&
        div > 0 &&
        Object.values(errors).every((err) => !err)
      );
    } else {
      const divisors = multipleDivisors
        .split(",")
        .map((d) => parseInt(d.trim()))
        .filter((d) => !isNaN(d) && d > 0);
      return (
        number &&
        !isNaN(num) &&
        num >= 0 &&
        divisors.length > 0 &&
        Object.values(errors).every((err) => !err)
      );
    }
  }, [number, divisor, multipleDivisors, testMode, errors]);

  // Test divisibility
  const test = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({ ...prev, general: "Please provide valid inputs" }));
      return;
    }

    const num = parseInt(number);
    if (testMode === "single") {
      const div = parseInt(divisor);
      const testResult = testDivisibilitySingle(num, div);
      setResult(testResult);
    } else {
      const divisors = multipleDivisors
        .split(",")
        .map((d) => parseInt(d.trim()))
        .filter((d) => !isNaN(d) && d > 0);
      const testResults = testDivisibilityMultiple(num, divisors);
      setResult(testResults);
    }
  };

  // Reset state
  const reset = () => {
    setNumber("");
    setDivisor("");
    setMultipleDivisors("2,3,4,5,6,9,10");
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setTestMode("single");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Divisibility Tester
        </h1>

        {/* Test Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Test Mode</label>
          <select
            value={testMode}
            onChange={(e) => setTestMode(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="single">Single Divisor</option>
            <option value="multiple">Multiple Divisors</option>
          </select>
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
            <input
              type="number"
              step="1"
              value={number}
              onChange={handleNumberChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 15"
              aria-label="Number to test"
            />
            {errors.number && <p className="text-red-600 text-sm mt-1">{errors.number}</p>}
          </div>

          {testMode === "single" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Divisor</label>
              <input
                type="number"
                step="1"
                value={divisor}
                onChange={handleDivisorChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 3"
                aria-label="Divisor"
              />
              {errors.divisor && <p className="text-red-600 text-sm mt-1">{errors.divisor}</p>}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Divisors (comma-separated)
              </label>
              <input
                type="text"
                value={multipleDivisors}
                onChange={handleMultipleDivisorsChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2,3,4,5"
                aria-label="Multiple divisors"
              />
              {errors.multipleDivisors && (
                <p className="text-red-600 text-sm mt-1">{errors.multipleDivisors}</p>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={test}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Test
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
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Result:</h2>
            {testMode === "single" ? (
              <div>
                <p className="text-center text-xl flex items-center justify-center gap-2">
                  {number} is {result.isDivisible ? "" : "not "}divisible by {divisor}
                  {result.isDivisible ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <FaTimes className="text-red-500" />
                  )}
                </p>
                <button
                  onClick={() => setShowSteps(!showSteps)}
                  className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
                >
                  {showSteps ? "Hide Steps" : "Show Steps"}
                </button>
                {showSteps && (
                  <ul className="mt-2 text-sm list-disc list-inside">
                    {result.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div>
                {result.map(({ divisor, isDivisible, steps }, index) => (
                  <div key={index} className="mb-4">
                    <p className="text-lg flex items-center gap-2">
                      {number} is {isDivisible ? "" : "not "}divisible by {divisor}
                      {isDivisible ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                    </p>
                    <button
                      onClick={() => setShowSteps(showSteps === divisor ? false : divisor)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {showSteps === divisor ? "Hide Steps" : "Show Steps"}
                    </button>
                    {showSteps === divisor && (
                      <ul className="mt-2 text-sm list-disc list-inside">
                        {steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Test single or multiple divisors</li>
            <li>Detailed step-by-step explanations</li>
            <li>Supports common divisibility rules (2-10)</li>
            <li>Real-time input validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DivisibilityTester;