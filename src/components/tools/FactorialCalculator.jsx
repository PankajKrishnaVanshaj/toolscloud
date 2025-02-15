"use client";

import { useState } from "react";

// Memoization object to store calculated factorials
const factorialMemo = {};

const FactorialCalculator = () => {
  const [number, setNumber] = useState("");
  const [result, setResult] = useState("");
  const [sequence, setSequence] = useState("");

  // Function to calculate factorial using memoization and generate sequence
  const calculateFactorial = (num) => {
    if (num < 0) return "Undefined (Negative number)";
    if (num === 0 || num === 1) {
      setSequence("1");
      return 1;
    }

    // Check if result is already cached
    if (factorialMemo[num]) {
      setSequence(generateSequence(num));
      return factorialMemo[num];
    }

    let factorial = 1;
    for (let i = 2; i <= num; i++) {
      factorial *= i;
    }

    // Cache the result
    factorialMemo[num] = factorial;
    setSequence(generateSequence(num));
    return factorial;
  };

  // Function to generate factorial sequence (e.g., "1 × 2 × 3 × ... × n")
  const generateSequence = (num) => {
    let seq = "1";
    for (let i = 2; i <= num; i++) {
      seq += ` × ${i}`;
    }
    return `${num}! = ${seq}`;
  };

  const handleCalculate = () => {
    const num = parseInt(number, 10);
    if (isNaN(num) || num < 0) {
      setResult("Enter a valid non-negative integer");
      setSequence("");
    } else {
      const factorialResult = calculateFactorial(num);
      setResult(`Factorial of ${num} is ${factorialResult}`);
    }
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg max-w-md">
      <h1 className="text-2xl font-bold text-center mb-4">Factorial Calculator</h1>

      <input
        type="number"
        className="w-full p-2 border rounded mb-4"
        placeholder="Enter a number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        min="0"
      />

      <button
        className="w-full p-2 bg-primary text-white rounded hover:bg-primary/90 transition"
        onClick={handleCalculate}
      >
        Calculate
      </button>

      <div className="mt-4 p-3 bg-gray-100 rounded text-lg text-center font-mono border border-gray-300">
        {result !== "" ? result : "Result will appear here"}
      </div>

      {sequence && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-lg text-center h-48 overflow-auto text-secondary">
          {sequence}
        </div>
      )}
    </div>
  );
};

export default FactorialCalculator;
