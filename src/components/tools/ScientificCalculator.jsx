"use client";

import { useState } from "react";

const ScientificCalculator = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const handleClick = (value) => {
    setInput((prev) => prev + value);
  };

  const handleClear = () => {
    setInput("");
    setResult("");
  };

  const handleDelete = () => {
    setInput(input.slice(0, -1));
  };

  const handleEvaluate = () => {
    try {
      setResult(eval(input).toString());
    } catch {
      setResult("Error");
    }
  };

  // Factorial function
  const factorial = (num) => {
    if (num < 0) return "Error";
    if (num === 0 || num === 1) return 1;
    return num * factorial(num - 1);
  };

  const handleFunction = (func) => {
    try {
      let value = eval(input);
      let calculatedValue = "";

      switch (func) {
        case "sqrt":
          calculatedValue = Math.sqrt(value);
          break;
        case "log":
          calculatedValue = Math.log10(value);
          break;
        case "ln":
          calculatedValue = Math.log(value);
          break;
        case "sin":
          calculatedValue = Math.sin(value);
          break;
        case "cos":
          calculatedValue = Math.cos(value);
          break;
        case "tan":
          calculatedValue = Math.tan(value);
          break;
        case "exp":
          calculatedValue = Math.exp(value);
          break;
        case "pow2":
          calculatedValue = Math.pow(value, 2);
          break;
        case "percent":
          calculatedValue = value / 100;
          break;
        case "factorial":
          calculatedValue = factorial(value);
          break;
        default:
          calculatedValue = "Error";
      }
      setResult(calculatedValue.toString());
    } catch {
      setResult("Error");
    }
  };

  return (
    <div className="mx-auto p-6 bg-gray-100 shadow-lg rounded-lg max-w-md">
      <h1 className="text-2xl font-bold text-center mb-4">Scientific Calculator</h1>

      {/* Display Input */}
      <div className="mb-3 p-3 bg-white rounded-lg text-right text-xl font-mono border border-gray-300">
        {input || "0"}
      </div>
      {/* Display Result */}
      <div className="mb-3 p-3 bg-gray-200 rounded-lg text-right text-lg font-mono border border-gray-300">
        {result || "Result"}
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-4 gap-2">
        {/* Scientific Functions */}
        <button className="btn" onClick={() => handleFunction("sin")}>sin</button>
        <button className="btn" onClick={() => handleFunction("cos")}>cos</button>
        <button className="btn" onClick={() => handleFunction("tan")}>tan</button>
        <button className="btn" onClick={() => handleFunction("sqrt")}>√</button>

        <button className="btn" onClick={() => handleFunction("log")}>log</button>
        <button className="btn" onClick={() => handleFunction("ln")}>ln</button>
        <button className="btn" onClick={() => handleFunction("exp")}>exp</button>
        <button className="btn" onClick={handleDelete}>⌫</button>

        <button className="btn" onClick={() => handleFunction("pow2")}>x²</button>
        <button className="btn" onClick={() => handleFunction("percent")}>%</button>
        <button className="btn" onClick={() => handleFunction("factorial")}>n!</button>

        {/* Digits and Operators */}
        {["7", "8", "9", "/"].map((char) => (
          <button key={char} className="btn" onClick={() => handleClick(char)}>
            {char}
          </button>
        ))}
        {["4", "5", "6", "*"].map((char) => (
          <button key={char} className="btn" onClick={() => handleClick(char)}>
            {char}
          </button>
        ))}
        {["1", "2", "3", "-"].map((char) => (
          <button key={char} className="btn" onClick={() => handleClick(char)}>
            {char}
          </button>
        ))}
        {["0", ".", "+", "="].map((char) => (
          <button
            key={char}
            className="btn"
            onClick={char === "=" ? handleEvaluate : () => handleClick(char)}
          >
            {char}
          </button>
        ))}

        {/* Clear Button */}
        <button className="col-span-4 btn text-primary" onClick={handleClear}>
          Clear
        </button>
      </div>

      {/* Styling */}
      <style jsx>{`
        .btn {
          background-color: #f3f4f6;
          padding: 12px;
          font-size: 18px;
          font-weight: bold;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .btn:hover {
          background-color: #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default ScientificCalculator;
