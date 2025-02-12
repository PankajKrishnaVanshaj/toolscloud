"use client";

import { useState } from "react";
import { AiOutlineClear, AiOutlineSearch } from "react-icons/ai";

const RegexTester = () => {
  const [text, setText] = useState("");
  const [regexPattern, setRegexPattern] = useState("");
  const [matches, setMatches] = useState([]);
  const [regexError, setRegexError] = useState("");
  const [caseInsensitive, setCaseInsensitive] = useState(false);

  const handleTestRegex = () => {
    try {
      const flags = caseInsensitive ? "gi" : "g";
      const regex = new RegExp(regexPattern, flags);
      const foundMatches = [...text.matchAll(regex)];
      setMatches(foundMatches);
      setRegexError("");
    } catch (error) {
      setMatches([]);
      setRegexError("Invalid Regex Pattern");
    }
  };

  const handleClear = () => {
    setText("");
    setRegexPattern("");
    setMatches([]);
    setRegexError("");
  };

  const handleCopyToClipboard = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
  };

  // Function to highlight matches
  const getHighlightedText = () => {
    if (matches.length === 0) return text;

    let lastIndex = 0;
    const highlighted = [];

    matches.forEach((match, index) => {
      const startIndex = match.index;
      const endIndex = startIndex + match[0].length;

      // Add non-matched text before the match
      if (lastIndex < startIndex) {
        highlighted.push(
          <span key={`text-${lastIndex}`}>{text.slice(lastIndex, startIndex)}</span>
        );
      }

      // Add the matched text with highlighting
      highlighted.push(
        <span key={`match-${index}`} className="bg-yellow-300 px-1 rounded">
          {match[0]}
        </span>
      );

      lastIndex = endIndex;
    });

    // Add remaining text after the last match
    if (lastIndex < text.length) {
      highlighted.push(
        <span key={`text-end`}>{text.slice(lastIndex)}</span>
      );
    }

    return highlighted;
  };

  return (
    <div className="mx-auto p-4 bg-white shadow-lg rounded-2xl">

      <textarea
        className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      <input
        type="text"
        className="w-full mt-3 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter regex pattern (e.g., \\d+ for numbers)"
        value={regexPattern}
        onChange={(e) => setRegexPattern(e.target.value)}
      />

      <div className="flex items-center mt-3">
        <input
          type="checkbox"
          id="caseInsensitiveToggle"
          className="mr-2"
          checked={caseInsensitive}
          onChange={(e) => setCaseInsensitive(e.target.checked)}
        />
        <label htmlFor="caseInsensitiveToggle" className="text-secondary">
          Case Insensitive (Ignore Case)
        </label>
      </div>

      {regexError && <p className="text-red-500 mt-2">{regexError}</p>}

      <div className="flex gap-2 mt-3">
        <button
          className="flex items-center justify-center w-1/2 border hover:border-secondary bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text  px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          onClick={handleTestRegex}
          aria-label="Test Regex"
        >
          <AiOutlineSearch className="text-primary" />
          <span className="ml-2 ">Test Regex</span>
        </button>
        <button
          className="flex items-center justify-center w-1/2 border hover:border-secondary bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text  px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          onClick={handleClear}
          aria-label="Clear"
        >
          <AiOutlineClear className="text-primary" />
          <span className="ml-2">Clear</span>
        </button>
      </div>

      <div className="mt-3">
        <h3 className="text-lg font-medium text-secondary">Matches Found: {matches.length}</h3>
        {matches.length > 0 && (
          <div className="mt-2 p-3 border rounded-lg bg-gray-50 text-sm overflow-auto max-h-36 flex flex-wrap gap-x-5">
            {matches.map((match, index) => (
              <div key={index} className="mb-1 bg-white px-2 py-0.5 rounded-lg">
                <span className="bg-yellow-300 px-1 mx-1 rounded">
                  {match[0]} ({index})
                </span>
                <span className="text-gray-700 text-sm">
                  (Index: {match.index}, Length: {match[0].length})
                </span>
                <button
                  className="ml-2 text-primary underline"
                  onClick={() => handleCopyToClipboard(match[0])}
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 border rounded-lg bg-gray-50">
          <div className="mt-1 whitespace-pre-wrap max-h-40 overflow-auto">{getHighlightedText()}</div>
        </div>
      </div>
    </div>
  );
};

export default RegexTester;
