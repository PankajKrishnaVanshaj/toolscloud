"use client";

import { useState } from "react";
import {
  FaCopy,
  FaEraser,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaRedo,
  FaAlignJustify,
  FaFont,
} from "react-icons/fa";

const TextCaseConverter = () => {
  const [text, setText] = useState("");

  // Convert to UPPERCASE
  const toUpperCase = () => setText(text.toUpperCase());

  // Convert to lowercase
  const toLowerCase = () => setText(text.toLowerCase());

  // Capitalize Each Word (Title Case)
  const toTitleCase = () => {
    setText(text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()));
  };

  // Convert to Sentence case (first letter capitalized)
  const toSentenceCase = () => {
    setText(
      text
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s*\w)/g, (char) => char.toUpperCase())
    );
  };

  // Reverse Text
  const toReverseText = () => {
    setText(text.split("").reverse().join(""));
  };

  // Remove Extra Spaces
  const removeExtraSpaces = () => {
    setText(text.replace(/\s+/g, " ").trim());
  };

  // Copy to Clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    alert("Text copied to clipboard!");
  };

  // Clear Text
  const clearText = () => setText("");

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-2xl">
      {/* Textarea */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Type or paste your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      {/* Word & Character Count */}
      <div className="text-secondary mt-2 text-sm">
        <span>
          {" "}
          Words: {text.trim() ? text.trim().split(/\s+/).length : 0} |{" "}
        </span>
        <span>Characters: {text.length}</span>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-2 items-center mt-4">
        <button
          className="flex items-center gap-2 px-6 py-1.5 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={toUpperCase}
        >
          <FaSortAlphaUp className="text-secondary"/> UPPERCASE
        </button>
        <button
          className="flex items-center gap-2 px-6 py-1.5 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={toLowerCase}
        >
          <FaSortAlphaDown className="text-secondary"/> lowercase
        </button>
        <button
          className="flex items-center gap-2 px-6 py-1.5 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={toTitleCase}
        >
          <FaFont className="text-secondary"/> Title Case
        </button>
        <button
          className="flex items-center gap-2 px-6 py-1.5 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={toSentenceCase}
        >
          <FaAlignJustify className="text-secondary"/> Sentence case
        </button>
        <button
          className="flex items-center gap-2 px-6 py-1.5 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={toReverseText}
        >
          <FaRedo className="text-secondary"/> Reverse Text
        </button>
        <button
          className="flex items-center gap-2 px-6 py-1.5 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={removeExtraSpaces}
        >
          <FaAlignJustify className="text-secondary"/> Remove Spaces
        </button>
        <button
          className="flex items-center gap-2 px-6 py-1.5 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={copyToClipboard}
        >
          <FaCopy className="text-secondary"/> Copy
        </button>
        <button
          className="flex items-center gap-2 px-6 py-1.5 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={clearText}
        >
          <FaEraser className="text-secondary"/> Clear
        </button>
      </div>
    </div>
  );
};

export default TextCaseConverter;
