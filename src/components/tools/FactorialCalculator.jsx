"use client";

import { useState } from "react";

const FactorialCalculator = () => {
  const [number, setNumber] = useState("");
  const [result, setResult] = useState("");

  // Function to calculate factorial
  const calculateFactorial = (num) => {
    if (num < 0) return "Undefined (Negative number)";
    if (num === 0 || num === 1) return 1;
    let factorial = 1;
    for (let i = 2; i <= num; i++) {
      factorial *= i;
    }
    return factorial;
  };

  const handleCalculate = () => {
    const num = parseInt(number, 10);
    if (isNaN(num) || num < 0) {
      setResult("Enter a valid non-negative integer");
    } else {
      setResult(calculateFactorial(num));
    }
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      <input
        type="number"
        className="w-full p-2 border rounded mb-4"
        placeholder="Enter a number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        min="0"
      />

      <button className="w-full p-2 bg-blue-500 text-white rounded" onClick={handleCalculate}>
        Calculate
      </button>

      <div className="mt-4 p-3 bg-gray-100 rounded text-lg text-center">
        {result !== "" ? `Factorial: ${result}` : "Result will appear here"}
      </div>
    </div>
  );
};

export default FactorialCalculator;
