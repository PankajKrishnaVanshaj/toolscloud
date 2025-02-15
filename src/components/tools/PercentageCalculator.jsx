"use client";

import { useState } from "react";

const PercentageCalculator = () => {
  const [num, setNum] = useState("");
  const [percentage, setPercentage] = useState("");
  const [initialValue, setInitialValue] = useState("");
  const [finalValue, setFinalValue] = useState("");
  const [operation, setOperation] = useState("percentOf");
  const [result, setResult] = useState(null);

  // Function to calculate percentage
  const calculate = () => {
    let res = 0;

    switch (operation) {
      case "percentOf":
        if (!num || !percentage) return setResult("Please fill in all fields.");
        res = (percentage / 100) * num;
        break;
      case "percentChange":
        if (!initialValue || !finalValue) return setResult("Please fill in all fields.");
        res = ((finalValue - initialValue) / initialValue) * 100;
        break;
      case "findTotal":
        if (!num || !percentage) return setResult("Please fill in all fields.");
        res = (num / percentage) * 100;
        break;
      case "increaseByPercentage":
        if (!num || !percentage) return setResult("Please fill in all fields.");
        res = num * (1 + percentage / 100);
        break;
      case "decreaseByPercentage":
        if (!num || !percentage) return setResult("Please fill in all fields.");
        res = num * (1 - percentage / 100);
        break;
      case "reversePercentage":
        if (!num || !initialValue) return setResult("Please fill in all fields.");
        res = (num / initialValue) * 100;
        break;
      default:
        res = "Invalid Operation";
    }

    setResult(res.toFixed(2));
  };

  // Clear all fields
  const clearFields = () => {
    setNum("");
    setPercentage("");
    setInitialValue("");
    setFinalValue("");
    setResult(null);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-center">Percentage Calculator</h2>

      <div className="mb-4">
        <label className="font-medium">Select Calculation:</label>
        <select
          className="w-full p-2 border rounded mt-2"
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
        >
          <option value="percentOf">Find Percentage of a Number</option>
          <option value="percentChange">Calculate Percentage Change</option>
          <option value="findTotal">Find Total from Percentage</option>
          <option value="increaseByPercentage">Increase by Percentage</option>
          <option value="decreaseByPercentage">Decrease by Percentage</option>
          <option value="reversePercentage">Find What Percentage One Number is of Another</option>
        </select>
      </div>

      {operation === "percentOf" && (
        <div className="flex flex-col gap-3">
          <input
            type="number"
            placeholder="Enter Number"
            value={num}
            onChange={(e) => setNum(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Enter Percentage"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      {operation === "percentChange" && (
        <div className="flex flex-col gap-3">
          <input
            type="number"
            placeholder="Enter Initial Value"
            value={initialValue}
            onChange={(e) => setInitialValue(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Enter Final Value"
            value={finalValue}
            onChange={(e) => setFinalValue(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      {operation === "findTotal" && (
        <div className="flex flex-col gap-3">
          <input
            type="number"
            placeholder="Enter Percentage"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Enter Partial Value"
            value={num}
            onChange={(e) => setNum(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      {["increaseByPercentage", "decreaseByPercentage"].includes(operation) && (
        <div className="flex flex-col gap-3">
          <input
            type="number"
            placeholder="Enter Number"
            value={num}
            onChange={(e) => setNum(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Enter Percentage"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      {operation === "reversePercentage" && (
        <div className="flex flex-col gap-3">
          <input
            type="number"
            placeholder="Enter Part Value"
            value={num}
            onChange={(e) => setNum(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Enter Total Value"
            value={initialValue}
            onChange={(e) => setInitialValue(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      <button
        className="w-full mt-4 p-2 bg-primary text-white rounded"
        onClick={calculate}
      >
        Calculate
      </button>

      <button
        className="w-full mt-2 p-2 bg-gray-300 rounded"
        onClick={clearFields}
      >
        Clear
      </button>

      {result !== null && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-center">
          <h3 className="text-lg font-medium">Result: {result}</h3>
        </div>
      )}
    </div>
  );
};

export default PercentageCalculator;
