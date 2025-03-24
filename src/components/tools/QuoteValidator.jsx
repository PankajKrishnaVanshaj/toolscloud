"use client";

import { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaCheck,
  FaTimes,
  FaDownload,
  FaCog,
} from "react-icons/fa";

const validateQuotes = (text) => {
  const errors = [];
  let doubleQuoteCount = 0;
  let singleQuoteCount = 0;
  const positions = [];

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '"') {
      doubleQuoteCount++;
      positions.push({ type: 'double', index: i });
    } else if (text[i] === "'") {
      singleQuoteCount++;
      positions.push({ type: 'single', index: i });
    }
  }

  if (doubleQuoteCount % 2 !== 0) {
    errors.push({
      message: 'Mismatched double quotes (") found.',
      positions: positions.filter(p => p.type === 'double'),
    });
  }
  if (singleQuoteCount % 2 !== 0) {
    errors.push({
      message: "Mismatched single quotes (') found.",
      positions: positions.filter(p => p.type === 'single'),
    });
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
  const positions = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (selectedBrackets[char]) {
      stack.push({ char, index: i });
      positions.push({ type: 'open', char, index: i });
    } else if (Object.values(selectedBrackets).includes(char)) {
      if (stack.length === 0 || selectedBrackets[stack.pop().char] !== char) {
        errors.push({
          message: `Mismatched ${bracketType} brackets found.`,
          positions: [{ type: 'close', char, index: i }],
        });
        break;
      }
      positions.push({ type: 'close', char, index: i });
    }
  }
  if (stack.length > 0) {
    errors.push({
      message: `Unmatched opening ${bracketType} bracket(s) found.`,
      positions: stack.map(s => ({ type: 'open', char: s.char, index: s.index })),
    });
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
    ignoreCodeBlocks: false,
  });
  const [showDetails, setShowDetails] = useState(false);
  const [highlightedText, setHighlightedText] = useState("");

  useEffect(() => {
    validateText();
  }, [text, options]);

  const validateText = () => {
    let validationErrors = [];
    let processedText = text;

    if (options.ignoreCodeBlocks) {
      processedText = processedText.replace(/```[\s\S]*?```/g, ""); // Ignore code blocks
    }

    if (options.quotes) {
      validationErrors = [...validationErrors, ...validateQuotes(processedText)];
    }
    if (options.brackets) {
      validationErrors = [...validationErrors, ...validateBrackets(processedText, "all")];
    }
    if (options.parentheses) {
      validationErrors = [...validationErrors, ...validateBrackets(processedText, "parentheses")];
    }
    if (options.curly) {
      validationErrors = [...validationErrors, ...validateBrackets(processedText, "curly")];
    }
    if (options.square) {
      validationErrors = [...validationErrors, ...validateBrackets(processedText, "square")];
    }
    if (options.angle) {
      validationErrors = [...validationErrors, ...validateBrackets(processedText, "angle")];
    }

    setErrors(validationErrors);
    highlightErrors(processedText, validationErrors);
  };

  const highlightErrors = (inputText, validationErrors) => {
    let highlighted = inputText;
    validationErrors.forEach((error) => {
      error.positions.forEach((pos) => {
        const start = pos.index;
        const end = start + 1;
        highlighted =
          highlighted.substring(0, start) +
          `<span class="bg-red-200 text-red-700">${highlighted[start]}</span>` +
          highlighted.substring(end);
      });
    });
    setHighlightedText(highlighted);
  };

  const handleCheckboxChange = (option) => {
    setOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  const clearText = () => {
    setText("");
    setErrors([]);
    setHighlightedText("");
  };

  const downloadReport = () => {
    const report = [
      "Validation Report",
      "==================",
      `Text: ${text}`,
      "",
      "Errors:",
      errors.length > 0
        ? errors.map((e) => `- ${e.message} (Positions: ${e.positions.map(p => p.index).join(", ")})`).join("\n")
        : "No errors found.",
    ].join("\n");
    const blob = new Blob([report], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "quote_validation_report.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-xl rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Quote & Bracket Validator</h2>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 text-blue-500 hover:text-blue-700"
        >
          <FaCog />
        </button>
      </div>

      {/* Validation Options */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <label className="block text-gray-700 font-medium mb-2">
          Validation Options:
        </label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Quotes (' \")", value: "quotes" },
            { label: "All Brackets", value: "brackets" },
            { label: "Parentheses ( )", value: "parentheses" },
            { label: "Curly Braces { }", value: "curly" },
            { label: "Square Brackets [ ]", value: "square" },
            { label: "Angle Brackets < >", value: "angle" },
            { label: "Ignore Code Blocks (```)", value: "ignoreCodeBlocks" },
          ].map(({ label, value }) => (
            <label key={value} className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                className="accent-blue-500"
                checked={options[value]}
                onChange={() => handleCheckboxChange(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        className={`w-full h-48 p-4 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors.length > 0 ? "border-red-500" : "border-gray-300"
        }`}
        placeholder='Type or paste text here... (e.g., "Hello {world}!")'
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 mt-4">
        <button
          className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition flex items-center justify-center"
          onClick={validateText}
        >
          <FaCheck className="mr-2" />
          Validate
        </button>
        <button
          className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition flex items-center justify-center"
          onClick={clearText}
        >
          <FaTimes className="mr-2" />
          Reset
        </button>
        <button
          className="flex-1 px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition flex items-center justify-center"
          onClick={downloadReport}
        >
          <FaDownload className="mr-2" />
          Download Report
        </button>
      </div>

      {/* Results */}
      <div className="mt-4">
        <div
          className="p-4 border rounded-lg bg-gray-50 h-48 overflow-auto"
          dangerouslySetInnerHTML={{ __html: highlightedText || text }}
        />
        {errors.length > 0 ? (
          <div className="mt-3 p-3 border rounded-lg bg-red-100 text-red-700">
            <h3 className="font-semibold flex items-center">
              <FaTimesCircle className="mr-2" /> Errors Found:
            </h3>
            <ul className="list-disc ml-5">
              {errors.map((error, index) => (
                <li key={index}>
                  ❌ {error.message}
                  {showDetails && (
                    <span className="text-sm ml-2">
                      (Positions: {error.positions.map(p => p.index).join(", ")})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : text ? (
          <div className="mt-3 p-3 border rounded-lg bg-green-100 text-green-700 flex items-center">
            <FaCheckCircle className="mr-2" /> ✅ No errors found!
          </div>
        ) : null}
      </div>

      {/* Features Info */}
      <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
        <h3 className="font-semibold text-blue-700">Features</h3>
        <ul className="list-disc list-inside text-blue-600 text-sm">
          <li>Real-time validation of quotes and brackets</li>
          <li>Highlight errors in text</li>
          <li>Support for multiple bracket types</li>
          <li>Option to ignore code blocks</li>
          <li>Detailed error positions (toggle with gear icon)</li>
          <li>Downloadable validation report</li>
        </ul>
      </div>
    </div>
  );
};

export default QuoteValidator;