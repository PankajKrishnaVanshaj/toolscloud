"use client";

import { useState } from "react";

const EquationSolver = () => {
  const [equation, setEquation] = useState("");
  const [solution, setSolution] = useState("");

  const solveEquation = () => {
    try {
      if (!equation.includes("=")) {
        setSolution("Invalid Equation: must contain '='");
        return;
      }

      // Clean up the equation
      let formattedEquation = equation
        .replace(/\s+/g, "") // Remove spaces
        .replace(/(\d)([a-zA-Z])/g, "$1*$2") // Add '*' between number and variable (e.g., 2x -> 2*x)
        .replace("=", "-(") + ")"; // Transform equation to `lhs - (rhs)`

      const solve = new Function("x", `return ${formattedEquation};`);

      // Bisection method
      let left = -1000,
        right = 1000,
        mid,
        iterations = 1000;

      if (solve(left) * solve(right) > 0) {
        setSolution("No solution or multiple solutions");
        return;
      }

      while (right - left > 1e-6 && iterations > 0) {
        mid = (left + right) / 2;
        const fMid = solve(mid);

        if (fMid === 0) break;
        if (solve(left) * fMid < 0) right = mid;
        else left = mid;

        iterations--;
      }

      setSolution(`x ≈ ${mid.toFixed(6)}`);
    } catch (error) {
      setSolution("Invalid Equation");
    }
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg max-w-md">
      <h1 className="text-2xl font-bold text-center mb-4">Equation Solver</h1>
      
      <input
        type="text"
        className="w-full p-2 border border-gray-300 rounded mb-4"
        placeholder="Enter equation (e.g., 2x+5=15)"
        value={equation}
        onChange={(e) => setEquation(e.target.value)}
      />
      
      <button
        className="w-full p-2 bg-primary text-white rounded hover:bg-primary/90 transition"
        onClick={solveEquation}
      >
        Solve
      </button>
      
      <div className="mt-4 p-3 bg-gray-100 rounded text-lg text-center font-mono border border-gray-300">
        {solution || "Solution will appear here"}
      </div>
    </div>
  );
};

export default EquationSolver;
