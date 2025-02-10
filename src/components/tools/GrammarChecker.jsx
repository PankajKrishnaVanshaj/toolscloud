"use client";

import { useState } from "react";

const grammarRules = [
  { pattern: /\bi am\b/gi, replacement: "I am" },
  { pattern: /\bi dont\b/gi, replacement: "I don't" },
  { pattern: /\bi cant\b/gi, replacement: "I can't" },
  { pattern: /\bi wont\b/gi, replacement: "I won't" },
  { pattern: /\bim\b/gi, replacement: "I'm" },
  { pattern: /\bi have got\b/gi, replacement: "I have" },
  { pattern: /\byour\b/gi, replacement: "you're (or your, depending on context)" },
  { pattern: /\btheir\b/gi, replacement: "they're (or their, depending on context)" },
  { pattern: /\bshould of\b/gi, replacement: "should have" },
  { pattern: /\bcould of\b/gi, replacement: "could have" },
];

const GrammarChecker = () => {
  const [text, setText] = useState("");
  const [correctedText, setCorrectedText] = useState("");

  const checkGrammar = () => {
    let corrected = text;
    grammarRules.forEach(({ pattern, replacement }) => {
      corrected = corrected.replace(pattern, `<span class="text-red-500 underline">${replacement}</span>`);
    });
    setCorrectedText(corrected);
  };

  return (
    <div className="mx-auto p-5 bg-white shadow-lg rounded-2xl">

      {/* Textarea */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type or paste text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      {/* Check Grammar Button */}
      <button
        className="mt-3 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        onClick={checkGrammar}
      >
        Check Grammar
      </button>

      {/* Display corrected text */}
      <div
        className="mt-3 p-3 border rounded-lg bg-gray-100"
        dangerouslySetInnerHTML={{ __html: correctedText || text }}
      ></div>
    </div>
  );
};

export default GrammarChecker;
