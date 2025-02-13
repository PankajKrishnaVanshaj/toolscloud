"use client";

import { useState } from "react";
import { FaClipboard, FaEraser, FaDownload } from "react-icons/fa";

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
  { pattern: /\bshould of\b/gi, replacement: "should have" },
  { pattern: /\bcould of\b/gi, replacement: "could have" },
  { pattern: /\bwould of\b/gi, replacement: "would have" },
  { pattern: /\bwhos\b/gi, replacement: "who's" },
];

const GrammarChecker = () => {
  const [text, setText] = useState("");
  const [correctedText, setCorrectedText] = useState("");

  // Function to check grammar
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

  const handleInputChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    setCorrectedText(checkGrammar(newText));
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    alert("Text copied to clipboard!");
  };

  // Clear text
  const clearText = () => {
    setText("");
    setCorrectedText("");
  };

  // Download as text file
  const downloadTextFile = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "grammar_checked_text.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="flex flex-wrap gap-3 mt-3">
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

      {/* Corrected text */}
      <div
        className="mt-3 p-3 border rounded-lg bg-gray-100 cursor-pointer min-h-[50px] h-40 overflow-auto"
        dangerouslySetInnerHTML={{ __html: correctedText || text }}
      ></div>

      {/* Coming Soon Section */}
      <div className="mt-5 p-4 bg-blue-100 rounded-lg border border-blue-300">
        <h3 className="font-semibold text-blue-700">
          Dictionary (Coming Soon)
        </h3>
        <p className="text-sm text-blue-600">
          A built-in dictionary feature will be added soon to help you explore
          word definitions and synonyms.
        </p>
      </div>
    </div>
  );
};

export default GrammarChecker;
