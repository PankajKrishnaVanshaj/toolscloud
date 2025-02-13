"use client";

import { useState } from "react";
import { FaSpellCheck, FaClipboard, FaEraser } from "react-icons/fa";

// Default Dictionary for Spell Checking
const defaultDictionary = new Set([
  "hello",
  "world",
  "react",
  "javascript",
  "spell",
  "checker",
  "example",
  "beautiful",
  "function",
  "component",
  "text",
  "editor",
  "message",
]);

const SpellChecker = () => {
  const [text, setText] = useState("");
  const [checkedText, setCheckedText] = useState(""); // Store checked text
  const [customDictionary, setCustomDictionary] = useState(new Set());

  // Merge default and custom dictionary
  const fullDictionary = new Set([...defaultDictionary, ...customDictionary]);

  // Function to check spelling
  const checkSpelling = (input) => {
    return input
      .split(/\s+/)
      .map((word) => {
        const cleanedWord = word.replace(/[^a-zA-Z]/g, ""); // Remove punctuation
        return fullDictionary.has(cleanedWord.toLowerCase())
          ? word
          : `<span class="text-red-500 underline cursor-pointer">${word}</span>`;
      })
      .join(" ");
  };

  const handleCheckSpelling = () => {
    setCheckedText(checkSpelling(text));
  };

  const handleMisspelledClick = (event) => {
    if (event.target.tagName === "SPAN") {
      const incorrectWord = event.target.innerText.trim();
      const userCorrection = prompt(
        `Enter the correct spelling for "${incorrectWord}":`,
        incorrectWord
      );
      if (userCorrection) {
        setCustomDictionary((prev) =>
          new Set(prev).add(userCorrection.toLowerCase())
        );
        setText((prev) => prev.replace(incorrectWord, userCorrection));
        setCheckedText(
          checkSpelling(text.replace(incorrectWord, userCorrection))
        );
      }
    }
  };

  const clearText = () => {
    setText("");
    setCheckedText("");
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    alert("Text copied to clipboard!");
  };

  return (
    <div className="mx-auto p-4 bg-white shadow-lg rounded-2xl">
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Type or paste text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      <div className="flex flex-wrap gap-3 mt-3">
        <button
          className="flex-1 px-4 py-2 rounded-lg border hover:border-secondary transition flex items-center justify-center"
          onClick={handleCheckSpelling}
        >
          <FaSpellCheck className="text-primary mr-2" />
          <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            Check Spelling
          </span>
        </button>
        <button
          className="flex-1 px-4 py-2 rounded-lg border hover:border-secondary transition flex items-center justify-center"
          onClick={copyText}
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
      </div>

      <div
        className="mt-3 p-3 border rounded-lg bg-gray-50 cursor-pointer h-40 overflow-auto"
        dangerouslySetInnerHTML={{ __html: checkedText }}
        onClick={handleMisspelledClick}
      ></div>

      <p className="mt-3 text-sm text-gray-600">
        Click on a red word to correct it or add it to the dictionary.
      </p>

      {/* Coming Soon Section */}
      <div className="mt-5 p-4 bg-blue-100 rounded-lg border border-blue-300">
        <h3 className="font-semibold text-blue-700">New Features Coming Soon</h3>
        <p className="text-sm text-blue-600">
          Stay tuned for future updates including:
        </p>
        <ul className="list-disc list-inside text-blue-600">
          <li>Synonym Suggestions</li>
          <li>Dictionary Integration</li>
          <li>Improved Correction Algorithms</li>
        </ul>
      </div>
    </div>
  );
};

export default SpellChecker;
