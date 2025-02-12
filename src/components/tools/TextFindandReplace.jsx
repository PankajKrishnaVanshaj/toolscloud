"use client";

import { useState } from "react";
import {  FaExchangeAlt, FaUndo, FaTrash } from "react-icons/fa";

const TextFindandReplace = () => {
  const [text, setText] = useState("");
  const [findWord, setFindWord] = useState("");
  const [replaceWord, setReplaceWord] = useState("");
  const [prevText, setPrevText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);

  // Function to count occurrences of the findWord
  const countOccurrences = () => {
    if (!findWord.trim()) return 0;
    const regex = new RegExp(findWord, caseSensitive ? "g" : "gi");
    return (text.match(regex) || []).length;
  };

  // Function to highlight found words dynamically
  const getHighlightedText = () => {
    if (!findWord.trim()) return text;
    const regex = new RegExp(`(${findWord})`, caseSensitive ? "g" : "gi");

    return text.split(regex).map((part, index) =>
      part.match(regex) ? (
        <span key={index} className="bg-yellow-300 text-black px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Function to handle replace operation
  const handleReplace = () => {
    if (!findWord.trim()) return;
    setPrevText(text); // Store previous text for undo functionality
    const regex = new RegExp(findWord, caseSensitive ? "g" : "gi");
    setText(text.replace(regex, replaceWord));
  };

  // Function to clear text and inputs
  const handleClearAll = () => {
    setText("");
    setFindWord("");
    setReplaceWord("");
  };

  // Function to undo last replace
  const handleUndo = () => {
    setText(prevText);
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-2xl">
      {/* Textarea */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Enter your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      {/* Find & Replace Fields */}
      <div className="flex flex-wrap gap-2 my-4">
        <input
          type="text"
          placeholder="Find word..."
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          value={findWord}
          onChange={(e) => setFindWord(e.target.value)}
        />
        <input
          type="text"
          placeholder="Replace with..."
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          value={replaceWord}
          onChange={(e) => setReplaceWord(e.target.value)}
        />
      </div>

      {/* Buttons & Toggle */}
      <div className="flex flex-wrap gap-2">
        <button
          className="flex-1 px-4 py-2 rounded-lg border hover:border-secondary transition flex items-center justify-center"
          onClick={handleReplace}
        >
          <FaExchangeAlt className="mr-2 text-secondary" />{" "}
          <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            Replace
          </span>
        </button>
        <button
          className="flex-1 px-4 py-2 rounded-lg border hover:border-secondary transition flex items-center justify-center"
          onClick={handleUndo}
        >
          <FaUndo className="mr-2 text-secondary" />{" "}
          <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            Undo
          </span>
        </button>
        <button
          className="flex-1 px-4 py-2 rounded-lg border hover:border-secondary transition flex items-center justify-center"
          onClick={handleClearAll}
        >
          <FaTrash className="mr-2 text-secondary" />{" "}
          <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            Clear All
          </span>
        </button>
      </div>

      {/* Case Sensitivity Toggle */}
      <div className="flex items-center mt-4">
        <input
          type="checkbox"
          id="caseSensitive"
          checked={caseSensitive}
          onChange={() => setCaseSensitive(!caseSensitive)}
          className="mr-2"
        />
        <label
          htmlFor="caseSensitive"
          className="text-sm bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text"
        >
          Case Sensitive
        </label>
      </div>

      {/* Word Count Display */}
      <p className="mt-2 text-sm text-secondary">
        ✏️ Word Count: {text.split(/\s+/).filter(Boolean).length} | 🔍 Matches:{" "}
        {countOccurrences()}
      </p>

      {/* Highlighted Text Display */}
      <div className="mt-4 p-3 bg-gray-100 border rounded-lg break-words">
        {getHighlightedText()}
      </div>
    </div>
  );
};

export default TextFindandReplace;
