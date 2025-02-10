"use client";

import { useState } from "react";

const EquationSolver = () => {
  const [equation, setEquation] = useState("");
  const [solution, setSolution] = useState("");

  const solveEquation = () => {
    try {
      // Convert equation into solvable format
      let formattedEquation = equation.replace(/\s+/g, "").replace("=", "-(") + ")";
      const solve = new Function("x", `return ${formattedEquation};`);
      
      // Use binary search to find the root
      let x = 0;
      let left = -1000, right = 1000, mid;
      while (right - left > 1e-6) {
        mid = (left + right) / 2;
        if (solve(mid) * solve(left) <= 0) right = mid;
        else left = mid;
      }
      setSolution(`x ≈ ${mid.toFixed(6)}`);
    } catch (error) {
      setSolution("Invalid Equation");
    }
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">
      
      <input
        type="text"
        className="w-full p-2 border rounded mb-4"
        placeholder="Enter equation (e.g., 2x+5=15)"
        value={equation}
        onChange={(e) => setEquation(e.target.value)}
      />
      
      <button className="w-full p-2 bg-blue-500 text-white rounded" onClick={solveEquation}>
        Solve
      </button>
      
      <div className="mt-4 p-3 bg-gray-100 rounded text-lg text-center">
        {solution || "Solution will appear here"}
      </div>
    </div>
  );
};

export default EquationSolver;
