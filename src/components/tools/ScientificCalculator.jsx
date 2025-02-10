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
      setResult(eval(input).toString()); // Using eval (Ensure proper input validation for security)
    } catch {
      setResult("Error");
    }
  };

  const handleFunction = (func) => {
    try {
      let calculatedValue = "";
      switch (func) {
        case "sqrt":
          calculatedValue = Math.sqrt(eval(input));
          break;
        case "log":
          calculatedValue = Math.log10(eval(input));
          break;
        case "ln":
          calculatedValue = Math.log(eval(input));
          break;
        case "sin":
          calculatedValue = Math.sin(eval(input));
          break;
        case "cos":
          calculatedValue = Math.cos(eval(input));
          break;
        case "tan":
          calculatedValue = Math.tan(eval(input));
          break;
        case "exp":
          calculatedValue = Math.exp(eval(input));
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
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">
      

      <div className="mb-3 p-3 bg-gray-100 rounded-lg text-right text-xl">
        {input || "0"}
      </div>
      <div className="mb-3 p-3 bg-gray-200 rounded-lg text-right text-lg">
        {result || "Result"}
      </div>

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

        {/* Digits and Basic Operators */}
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
        <button className="col-span-4 btn bg-red-500 hover:bg-red-600" onClick={handleClear}>
          Clear
        </button>
      </div>

      <style jsx>{`
        .btn {
          background: #f3f4f6;
          padding: 10px;
          font-size: 18px;
          font-weight: bold;
          border-radius: 6px;
          text-align: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn:hover {
          background: #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default ScientificCalculator;
