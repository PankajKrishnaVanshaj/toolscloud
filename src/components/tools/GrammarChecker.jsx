"use client";

import { useState, useEffect } from "react";
import {
  FaClipboard,
  FaEraser,
  FaCheckCircle,
  FaDownload,
  FaSync,
  FaSun,
  FaMoon,
} from "react-icons/fa";

// Grammar correction rules
const grammarRules = [
  { pattern: /\bi am\b/gi, replacement: "I am" },
  { pattern: /\bi dont\b/gi, replacement: "I don't" },
  { pattern: /\bi cant\b/gi, replacement: "I can't" },
  { pattern: /\bi wont\b/gi, replacement: "I won't" },
  { pattern: /\bim\b/gi, replacement: "I'm" },
  { pattern: /\bi have got\b/gi, replacement: "I have" },
  {
    pattern: /\byour\b/gi,
    replacement: "you're (or your, depending on context)",
  },
  {
    pattern: /\btheir\b/gi,
    replacement: "they're (or their, depending on context)",
  },
  { pattern: /\bshould of\b/gi, replacement: "should have" },
  { pattern: /\bcould of\b/gi, replacement: "could have" },
  { pattern: /\bwould of\b/gi, replacement: "would have" },
  {
    pattern: /\bthere\b/gi,
    replacement: "they're (or there, depending on context)",
  },
  { pattern: /\bwhos\b/gi, replacement: "who's" },
];

// Dictionary for synonyms
const synonyms = {
  happy: ["joyful", "cheerful", "content", "glad"],
  sad: ["unhappy", "depressed", "downcast", "gloomy"],
  fast: ["quick", "speedy", "swift", "rapid"],
  slow: ["lethargic", "sluggish", "unhurried"],
};

const GrammarChecker = () => {
  const [text, setText] = useState("");
  const [correctedText, setCorrectedText] = useState("");

  // Function to check grammar and highlight errors
  const checkGrammar = (input) => {
    let corrected = input;
    grammarRules.forEach(({ pattern, replacement }) => {
      corrected = corrected.replace(
        pattern,
        `<span class="text-red-500 underline cursor-pointer">${replacement}</span>`
      );
    });

    return corrected;
  };

  // Handle text input and live grammar checking
  const handleInputChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    setCorrectedText(checkGrammar(newText));
  };

  // Right-click correction
  const handleCorrectionClick = (event) => {
    event.preventDefault();
    if (event.target.tagName === "SPAN") {
      const correctedWord = event.target.innerText.trim();
      const originalText = text;
      setText(originalText.replace(event.target.innerText, correctedWord));
    }
  };

  // Copy text to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    alert("Text copied to clipboard!");
  };

  // Clear text
  const clearText = () => {
    setText("");
    setCorrectedText("");
  };

  // Download text as .txt file
  const downloadTextFile = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "grammar_checked_text.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get word count, sentence count, and readability score
  const getStats = () => {
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word !== "").length;
    const sentences = text
      .split(/[.!?]+/)
      .filter((sentence) => sentence.trim() !== "").length;
    const readability = words > 0 ? (words / sentences).toFixed(2) : "N/A";
    return { words, sentences, readability };
  };

  // Get synonyms
  const getSynonyms = (word) => {
    return synonyms[word.toLowerCase()] || [];
  };

  return (
    <div className="mx-auto p-4 bg-white shadow-lg rounded-2xl">
      {/* Textarea */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mt-3"
        placeholder="Type or paste text here..."
        value={text}
        onChange={handleInputChange}
      ></textarea>

      {/* Buttons */}
      <div className="flex gap-3 mt-3">
        <button
          className="flex-1 px-4 py-2 rounded-lg border hover:border-secondary transition flex items-center justify-center"
          onClick={copyToClipboard}
        >
          <FaClipboard className="mr-2 text-primary" />
          <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            Copy
          </span>
        </button>
        <button
          className="flex-1 px-4 py-2 rounded-lg border hover:border-secondary transition flex items-center justify-center"
          onClick={clearText}
        >
          <FaEraser className="mr-2 text-primary" />
          <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            Clear
          </span>
        </button>
        <button
          className="flex-1 px-4 py-2 rounded-lg border hover:border-secondary transition flex items-center justify-center"
          onClick={downloadTextFile}
        >
          <FaDownload className="mr-2 text-primary" />
          <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            Download
          </span>
        </button>
      </div>

      {/* Display corrected text */}
      <div
        className="mt-3 p-3 border rounded-lg bg-gray-100 cursor-pointer min-h-[50px] h-40 overflow-auto"
        dangerouslySetInnerHTML={{ __html: correctedText || text }}
        onContextMenu={handleCorrectionClick}
      ></div>

      {/* Synonyms */}
      <p className="mt-3 text-sm text-gray-600">
        Right-click on a red word to accept the correction.
      </p>

      {/* Stats */}
      <div className="mt-3 flex justify-between text-sm text-gray-500">
        <p>Words: {getStats().words}</p>
        <p>Sentences: {getStats().sentences}</p>
        <p>Readability: {getStats().readability}</p>
      </div>
    </div>
  );
};

export default GrammarChecker;
