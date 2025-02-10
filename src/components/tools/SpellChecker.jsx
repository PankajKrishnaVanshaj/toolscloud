"use client";

import { useState } from "react";

// Simple dictionary for spell-checking
const dictionary = new Set([
  "hello", "world", "react", "javascript", "spell", "checker", "example", 
  "beautiful", "function", "component", "text", "editor", "message"
]);

const SpellChecker = () => {
  const [text, setText] = useState("");

  // Function to check spelling
  const checkSpelling = (input) => {
    return input
      .split(" ")
      .map((word) => {
        const cleanedWord = word.replace(/[^a-zA-Z]/g, ""); // Remove punctuation
        return dictionary.has(cleanedWord.toLowerCase())
          ? word
          : `<span class="text-red-500 underline">${word}</span>`;
      })
      .join(" ");
  };

  return (
    <div className=" mx-auto p-5 bg-white shadow-lg rounded-2xl">

      {/* Textarea */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type or paste text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      {/* Spell Check Button */}
      <button
        className="mt-3 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        onClick={() => setText(text)}
      >
        Check Spelling
      </button>

      {/* Display corrected text */}
      <div
        className="mt-3 p-3 border rounded-lg bg-gray-100"
        dangerouslySetInnerHTML={{ __html: checkSpelling(text) }}
      ></div>
    </div>
  );
};

export default SpellChecker;
