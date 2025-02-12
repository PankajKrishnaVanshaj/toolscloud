"use client";

import { useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { FaCheck, FaTimes } from "react-icons/fa";

const validateQuotes = (text) => {
  const errors = [];
  const doubleQuotes = (text.match(/"/g) || []).length;
  const singleQuotes = (text.match(/'/g) || []).length;

  if (doubleQuotes % 2 !== 0) {
    errors.push('Mismatched double quotes (") found.');
  }
  if (singleQuotes % 2 !== 0) {
    errors.push("Mismatched single quotes (') found.");
  }

  return errors;
};

const validateBrackets = (text, bracketType) => {
  const errors = [];
  const stack = [];
  const bracketPairs = {
    all: { "(": ")", "[": "]", "{": "}", "<": ">" },
    parentheses: { "(": ")" },
    curly: { "{": "}" },
    square: { "[": "]" },
    angle: { "<": ">" },
  };

  const selectedBrackets = bracketPairs[bracketType] || bracketPairs["all"];

  for (let char of text) {
    if (selectedBrackets[char]) {
      stack.push(char);
    } else if (Object.values(selectedBrackets).includes(char)) {
      if (selectedBrackets[stack.pop()] !== char) {
        errors.push(`Mismatched ${bracketType} brackets found.`);
        break;
      }
    }
  }
  if (stack.length > 0) {
    errors.push(`Unmatched opening ${bracketType} bracket(s) found.`);
  }

  return errors;
};

const QuoteValidator = () => {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState([]);
  const [options, setOptions] = useState({
    quotes: true,
    brackets: false,
    parentheses: false,
    curly: false,
    square: false,
    angle: false,
  });

  const validateText = () => {
    let validationErrors = [];

    if (options.quotes) {
      validationErrors = [...validationErrors, ...validateQuotes(text)];
    }
    if (options.brackets) {
      validationErrors = [
        ...validationErrors,
        ...validateBrackets(text, "all"),
      ];
    }
    if (options.parentheses) {
      validationErrors = [
        ...validationErrors,
        ...validateBrackets(text, "parentheses"),
      ];
    }
    if (options.curly) {
      validationErrors = [
        ...validationErrors,
        ...validateBrackets(text, "curly"),
      ];
    }
    if (options.square) {
      validationErrors = [
        ...validationErrors,
        ...validateBrackets(text, "square"),
      ];
    }
    if (options.angle) {
      validationErrors = [
        ...validationErrors,
        ...validateBrackets(text, "angle"),
      ];
    }

    setErrors(validationErrors);
  };

  const handleCheckboxChange = (option) => {
    setOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  const clearText = () => {
    setText("");
    setErrors([]);
  };

  return (
    <div className="mx-auto p-4 bg-white shadow-lg rounded-2xl">
      {/* Validation Options */}
      <div className="mb-3">
        <label className="block bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text font-medium mb-1">
          Choose Validation Options:
        </label>
        <div className="flex flex-wrap gap-5 text-sm">
          {[
            { label: "Brackets (All)", value: "brackets" },
            { label: "Quotes", value: "quotes" },
            { label: "Parentheses ( )", value: "parentheses" },
            { label: "Curly Braces { }", value: "curly" },
            { label: "Square Brackets [ ]", value: "square" },
            { label: "Angle Brackets < >", value: "angle" },
          ].map(({ label, value }) => (
            <label key={value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="accent-primary"
                checked={options[value]}
                onChange={() => handleCheckboxChange(value)}
              />
              <span className="text-secondary">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        className={`w-full h-40 p-3 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary ${
          errors.length > 0 ? "border-red-500" : "border-gray-300"
        }`}
        placeholder='Type or paste text here... (e.g., "Hello, world!")'
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 mt-3">
        <button
          className="flex-1 px-4 py-2 rounded-lg border hover:border-secondary transition flex items-center justify-center"
          onClick={validateText}
        >
          <FaCheck className="text-primary mr-2" />
          <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            Validate{" "}
          </span>
        </button>
        <button
          className="flex-1 px-4 py-2 rounded-lg border hover:border-secondary transition flex items-center justify-center"
          onClick={clearText}
        >
          <FaTimes className="text-primary mr-2" />
          <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            Reset{" "}
          </span>
        </button>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-3 p-3 border rounded-lg bg-red-100 text-red-700">
          <h3 className="font-semibold flex items-center">
            <FaTimesCircle className="mr-2" /> Errors Found:
          </h3>
          <ul className="list-disc ml-5">
            {errors.map((error, index) => (
              <li key={index}>❌ {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Message */}
      {errors.length === 0 && text && (
        <div className="mt-3 p-3 border rounded-lg bg-green-100 text-green-700 flex items-center">
          <FaCheckCircle className="mr-2" /> ✅ No errors found!
        </div>
      )}
    </div>
  );
};

export default QuoteValidator;
