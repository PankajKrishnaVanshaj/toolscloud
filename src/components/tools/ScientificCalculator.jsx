'use client'
import React, { useState } from 'react';

const ScientificCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [memory, setMemory] = useState(0);
  const [isRad, setIsRad] = useState(true); // Toggle between radians and degrees

  // Handle number and decimal input
  const handleNumber = (num) => {
    setDisplay((prev) => (prev === '0' || prev === 'Error') ? num : prev + num);
    setExpression((prev) => prev + num);
  };

  // Handle operators
  const handleOperator = (op) => {
    if (display === 'Error') return;
    setDisplay(op);
    setExpression((prev) => prev + ` ${op} `);
  };

  // Handle scientific functions
  const handleFunction = (func) => {
    if (display === 'Error') return;
    try {
      const num = parseFloat(display);
      let result;
      switch (func) {
        case 'sin':
          result = isRad ? Math.sin(num) : Math.sin(num * Math.PI / 180);
          break;
        case 'cos':
          result = isRad ? Math.cos(num) : Math.cos(num * Math.PI / 180);
          break;
        case 'tan':
          result = isRad ? Math.tan(num) : Math.tan(num * Math.PI / 180);
          break;
        case 'ln':
          result = Math.log(num);
          break;
        case 'log':
          result = Math.log10(num);
          break;
        case 'sqrt':
          result = Math.sqrt(num);
          break;
        case 'square':
          result = num * num;
          break;
        case 'cube':
          result = num * num * num;
          break;
        case 'exp':
          result = Math.exp(num);
          break;
        default:
          return;
      }
      if (!isFinite(result) || isNaN(result)) throw new Error('Invalid result');
      setDisplay(result.toFixed(6));
      setExpression(`${func}(${num}) = ${result.toFixed(6)}`);
    } catch {
      setDisplay('Error');
      setExpression('Error');
    }
  };

  // Handle parentheses
  const handleParenthesis = (type) => {
    if (display === 'Error') return;
    setDisplay(type);
    setExpression((prev) => prev + type);
  };

  // Calculate result
  const calculate = () => {
    if (display === 'Error') return;
    try {
      // Replace scientific notation and evaluate safely
      const sanitizedExpr = expression
        .replace(/π/g, Math.PI)
        .replace(/e/g, Math.E);
      const result = eval(sanitizedExpr); // Note: eval is used here for simplicity; in production, use a safer parser
      if (!isFinite(result) || isNaN(result)) throw new Error('Invalid result');
      setDisplay(result.toFixed(6));
      setExpression(`${sanitizedExpr} = ${result.toFixed(6)}`);
    } catch {
      setDisplay('Error');
      setExpression('Error');
    }
  };

  // Clear display and expression
  const clear = () => {
    setDisplay('0');
    setExpression('');
  };

  // Memory functions
  const handleMemory = (action) => {
    const num = parseFloat(display);
    if (isNaN(num)) return;
    switch (action) {
      case 'M+':
        setMemory((prev) => prev + num);
        break;
      case 'M-':
        setMemory((prev) => prev - num);
        break;
      case 'MR':
        setDisplay(memory.toFixed(6));
        setExpression(memory.toString());
        break;
      case 'MC':
        setMemory(0);
        break;
      default:
        break;
    }
  };

  // Toggle radians/degrees
  const toggleAngleUnit = () => {
    setIsRad((prev) => !prev);
  };

  const buttons = [
    ['sin', 'cos', 'tan', 'π', 'e'],
    ['ln', 'log', 'sqrt', '(', ')'],
    ['square', 'cube', 'exp', 'M+', 'M-'],
    ['7', '8', '9', '/', 'MR'],
    ['4', '5', '6', '*', 'MC'],
    ['1', '2', '3', '-', 'C'],
    ['0', '.', '=', '+', 'Rad/Deg']
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
          Scientific Calculator
        </h1>

        {/* Display */}
        <div className="mb-4">
          <div className="w-full p-3 bg-gray-100 rounded-lg text-right text-xl font-mono text-gray-800 break-all">
            {expression || display}
          </div>
          <div className="text-sm text-gray-600 text-right mt-1">
            {isRad ? 'Radians' : 'Degrees'} | Memory: {memory}
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-5 gap-2">
          {buttons.map((row, rowIndex) =>
            row.map((btn, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => {
                  if (/[0-9]/.test(btn)) handleNumber(btn);
                  else if (btn === '.') handleNumber(btn);
                  else if (['+', '-', '*', '/'].includes(btn)) handleOperator(btn);
                  else if (['sin', 'cos', 'tan', 'ln', 'log', 'sqrt', 'square', 'cube', 'exp'].includes(btn)) handleFunction(btn);
                  else if (btn === '(' || btn === ')') handleParenthesis(btn);
                  else if (btn === '=') calculate();
                  else if (btn === 'C') clear();
                  else if (btn === 'π') { setDisplay(Math.PI.toFixed(6)); setExpression('π'); }
                  else if (btn === 'e') { setDisplay(Math.E.toFixed(6)); setExpression('e'); }
                  else if (['M+', 'M-', 'MR', 'MC'].includes(btn)) handleMemory(btn);
                  else if (btn === 'Rad/Deg') toggleAngleUnit();
                }}
                className={`p-3 rounded-lg text-center font-semibold transition-all ${
                  ['sin', 'cos', 'tan', 'ln', 'log', 'sqrt', 'square', 'cube', 'exp'].includes(btn)
                    ? 'bg-purple-200 hover:bg-purple-300'
                    : ['+', '-', '*', '/', '=', '(', ')'].includes(btn)
                    ? 'bg-blue-200 hover:bg-blue-300'
                    : ['M+', 'M-', 'MR', 'MC'].includes(btn)
                    ? 'bg-green-200 hover:bg-green-300'
                    : btn === 'C'
                    ? 'bg-red-200 hover:bg-red-300'
                    : btn === 'Rad/Deg'
                    ? 'bg-yellow-200 hover:bg-yellow-300'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {btn === 'sqrt' ? '√' : btn === 'square' ? 'x²' : btn === 'cube' ? 'x³' : btn}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ScientificCalculator;