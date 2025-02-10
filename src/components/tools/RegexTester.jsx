"use client";

import { useState } from "react";

const RegexTester = () => {
  const [text, setText] = useState("");
  const [regexPattern, setRegexPattern] = useState("");
  const [matches, setMatches] = useState([]);

  const handleTestRegex = () => {
    try {
      const regex = new RegExp(regexPattern, "g");
      const foundMatches = text.match(regex) || [];
      setMatches(foundMatches);
    } catch (error) {
      setMatches([]);
    }
  };

  return (
    <div className="mx-auto p-5 bg-white shadow-lg rounded-2xl">

      {/* Textarea for input text */}
      <textarea
        className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      {/* Input for regex pattern */}
      <input
        type="text"
        className="w-full mt-3 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter regex pattern (e.g., \d+ for numbers)"
        value={regexPattern}
        onChange={(e) => setRegexPattern(e.target.value)}
      />

      {/* Test button */}
      <button
        className="w-full mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        onClick={handleTestRegex}
      >
        Test Regex
      </button>

      {/* Display matches */}
      <div className="mt-3">
        <h3 className="text-lg font-medium">Matches Found: {matches.length}</h3>
        {matches.length > 0 && (
          <div className="mt-2 p-3 border rounded-lg bg-gray-100 text-sm overflow-x-auto">
            {matches.map((match, index) => (
              <span key={index} className="bg-yellow-300 px-1 mx-1 rounded">
                {match}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegexTester;
