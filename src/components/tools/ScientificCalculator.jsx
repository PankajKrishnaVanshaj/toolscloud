"use client";
import React, { useState, useCallback } from "react";
import { FaBackspace, FaMemory, FaSync } from "react-icons/fa";

const ScientificCalculator = () => {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [memory, setMemory] = useState(0);
  const [isRad, setIsRad] = useState(true);
  const [history, setHistory] = useState([]);
  const [isScientificMode, setIsScientificMode] = useState(true);

  // Handle number and decimal input
  const handleNumber = useCallback((num) => {
    setDisplay((prev) => (prev === "0" || prev === "Error" ? num : prev + num));
    setExpression((prev) => prev + num);
  }, []);

  // Handle operators
  const handleOperator = useCallback((op) => {
    if (display === "Error") return;
    setDisplay(op);
    setExpression((prev) => prev + ` ${op} `);
  }, [display]);

  // Handle scientific functions
  const handleFunction = useCallback(
    (func) => {
      if (display === "Error") return;
      try {
        const num = parseFloat(display);
        let result;
        switch (func) {
          case "sin":
            result = isRad ? Math.sin(num) : Math.sin((num * Math.PI) / 180);
            break;
          case "cos":
            result = isRad ? Math.cos(num) : Math.cos((num * Math.PI) / 180);
            break;
          case "tan":
            result = isRad ? Math.tan(num) : Math.tan((num * Math.PI) / 180);
            break;
          case "asin":
            result = isRad ? Math.asin(num) : (Math.asin(num) * 180) / Math.PI;
            break;
          case "acos":
            result = isRad ? Math.acos(num) : (Math.acos(num) * 180) / Math.PI;
            break;
          case "atan":
            result = isRad ? Math.atan(num) : (Math.atan(num) * 180) / Math.PI;
            break;
          case "ln":
            result = Math.log(num);
            break;
          case "log":
            result = Math.log10(num);
            break;
          case "sqrt":
            result = Math.sqrt(num);
            break;
          case "cbrt":
            result = Math.cbrt(num);
            break;
          case "square":
            result = num * num;
            break;
          case "cube":
            result = num * num * num;
            break;
          case "exp":
            result = Math.exp(num);
            break;
          case "pow":
            result = Math.pow(num, parseFloat(prompt("Enter exponent:")));
            break;
          case "fact":
            result = factorial(num);
            break;
          default:
            return;
        }
        if (!isFinite(result) || isNaN(result)) throw new Error("Invalid result");
        setDisplay(result.toFixed(6));
        setExpression(`${func}(${num}) = ${result.toFixed(6)}`);
        setHistory((prev) => [...prev, `${func}(${num}) = ${result.toFixed(6)}`].slice(-5));
      } catch {
        setDisplay("Error");
        setExpression("Error");
      }
    },
    [display, isRad]
  );

  // Factorial function
  const factorial = (n) => {
    if (!Number.isInteger(n) || n < 0) return NaN;
    if (n === 0) return 1;
    return n * factorial(n - 1);
  };

  // Handle parentheses
  const handleParenthesis = useCallback((type) => {
    if (display === "Error") return;
    setDisplay(type);
    setExpression((prev) => prev + type);
  }, [display]);

  // Calculate result
  const calculate = useCallback(() => {
    if (display === "Error") return;
    try {
      const sanitizedExpr = expression
        .replace(/π/g, Math.PI)
        .replace(/e/g, Math.E);
      const result = eval(sanitizedExpr); // Use with caution; consider a math parser for production
      if (!isFinite(result) || isNaN(result)) throw new Error("Invalid result");
      setDisplay(result.toFixed(6));
      setExpression(`${sanitizedExpr} = ${result.toFixed(6)}`);
      setHistory((prev) => [...prev, `${sanitizedExpr} = ${result.toFixed(6)}`].slice(-5));
    } catch {
      setDisplay("Error");
      setExpression("Error");
    }
  }, [expression]);

  // Clear all
  const clear = () => {
    setDisplay("0");
    setExpression("");
  };

  // Backspace
  const backspace = () => {
    if (display === "Error") {
      clear();
      return;
    }
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    setExpression((prev) => (prev.length > 1 ? prev.slice(0, -1) : ""));
  };

  // Memory functions
  const handleMemory = useCallback(
    (action) => {
      const num = parseFloat(display);
      if (isNaN(num)) return;
      switch (action) {
        case "M+":
          setMemory((prev) => prev + num);
          break;
        case "M-":
          setMemory((prev) => prev - num);
          break;
        case "MR":
          setDisplay(memory.toFixed(6));
          setExpression(memory.toString());
          break;
        case "MC":
          setMemory(0);
          break;
        default:
          break;
      }
    },
    [display, memory]
  );

  // Toggle radians/degrees
  const toggleAngleUnit = () => setIsRad((prev) => !prev);

  // Toggle scientific mode
  const toggleScientificMode = () => setIsScientificMode((prev) => !prev);

  const buttons = isScientificMode
    ? [
        ["sin", "cos", "tan", "asin", "acos"],
        ["atan", "ln", "log", "sqrt", "cbrt"],
        ["square", "cube", "exp", "pow", "fact"],
        ["7", "8", "9", "/", "π"],
        ["4", "5", "6", "*", "e"],
        ["1", "2", "3", "-", "("],
        ["0", ".", "=", "+", ")"],
        ["M+", "M-", "MR", "MC", "Rad/Deg"],
      ]
    : [
        ["7", "8", "9", "/", "π"],
        ["4", "5", "6", "*", "e"],
        ["1", "2", "3", "-", "("],
        ["0", ".", "=", "+", ")"],
        ["M+", "M-", "MR", "MC", "Mode"],
      ];

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-gray-800">
          Scientific Calculator
        </h1>

        {/* Display */}
        <div className="mb-6">
          <div className="w-full p-4 bg-gray-100 rounded-lg text-right text-xl sm:text-2xl font-mono text-gray-800 break-all">
            {expression || display}
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{isRad ? "Radians" : "Degrees"}</span>
            <span>Memory: {memory.toFixed(2)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {buttons.map((row, rowIndex) =>
            row.map((btn, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => {
                  if (/[0-9]/.test(btn)) handleNumber(btn);
                  else if (btn === ".") handleNumber(btn);
                  else if (["+", "-", "*", "/"].includes(btn)) handleOperator(btn);
                  else if (
                    [
                      "sin",
                      "cos",
                      "tan",
                      "asin",
                      "acos",
                      "atan",
                      "ln",
                      "log",
                      "sqrt",
                      "cbrt",
                      "square",
                      "cube",
                      "exp",
                      "pow",
                      "fact",
                    ].includes(btn)
                  )
                    handleFunction(btn);
                  else if (btn === "(" || btn === ")") handleParenthesis(btn);
                  else if (btn === "=") calculate();
                  else if (btn === "C") clear();
                  else if (btn === "π") {
                    setDisplay(Math.PI.toFixed(6));
                    setExpression("π");
                  } else if (btn === "e") {
                    setDisplay(Math.E.toFixed(6));
                    setExpression("e");
                  } else if (["M+", "M-", "MR", "MC"].includes(btn)) handleMemory(btn);
                  else if (btn === "Rad/Deg") toggleAngleUnit();
                  else if (btn === "Mode") toggleScientificMode();
                  else if (btn === "⌫") backspace();
                }}
                className={`p-2 sm:p-3 rounded-lg text-center font-semibold text-sm sm:text-base transition-all ${
                  [
                    "sin",
                    "cos",
                    "tan",
                    "asin",
                    "acos",
                    "atan",
                    "ln",
                    "log",
                    "sqrt",
                    "cbrt",
                    "square",
                    "cube",
                    "exp",
                    "pow",
                    "fact",
                  ].includes(btn)
                    ? "bg-purple-500 text-white hover:bg-purple-600"
                    : ["+", "-", "*", "/", "=", "(", ")"].includes(btn)
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : ["M+", "M-", "MR", "MC"].includes(btn)
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : btn === "C" || btn === "⌫"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : btn === "Rad/Deg" || btn === "Mode"
                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {btn === "sqrt"
                  ? "√"
                  : btn === "cbrt"
                  ? "∛"
                  : btn === "square"
                  ? "x²"
                  : btn === "cube"
                  ? "x³"
                  : btn === "pow"
                  ? "xʸ"
                  : btn === "fact"
                  ? "n!"
                  : btn === "C"
                  ? <FaSync />
                  : btn === "⌫"
                  ? <FaBackspace />
                  : btn}
              </button>
            ))
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Calculation History</h3>
            <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
              {history.slice().reverse().map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Basic and scientific operations</li>
            <li>Toggle between radians and degrees</li>
            <li>Memory functions (M+, M-, MR, MC)</li>
            <li>Calculation history (last 5)</li>
            <li>Backspace and mode switching</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScientificCalculator;