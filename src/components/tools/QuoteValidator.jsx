"use client";

import { useState } from "react";

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

const QuoteValidator = () => {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState([]);

  const checkQuotes = () => {
    setErrors(validateQuotes(text));
  };

  return (
    <div className="mx-auto p-5 bg-white shadow-lg rounded-2xl">

      {/* Textarea */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder='Type or paste text here... (e.g., "This is a quote")'
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      {/* Validate Button */}
      <button
        className="mt-3 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        onClick={checkQuotes}
      >
        Validate Quotes
      </button>

      {/* Display errors */}
      {errors.length > 0 && (
        <div className="mt-3 p-3 border rounded-lg bg-red-100 text-red-700">
          <h3 className="font-semibold">Errors Found:</h3>
          <ul className="list-disc ml-5">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Message */}
      {errors.length === 0 && text && (
        <div className="mt-3 p-3 border rounded-lg bg-green-100 text-green-700">
          ✅ No quote errors found!
        </div>
      )}
    </div>
  );
};

export default QuoteValidator;
