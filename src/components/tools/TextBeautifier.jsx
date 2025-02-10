"use client";

import { useState } from "react";

const TextBeautifier = () => {
  const [text, setText] = useState("");

  const beautifyText = (input) => {
    if (!input.trim()) return "";

    // Trim unnecessary spaces
    let formattedText = input.replace(/\s+/g, " ").trim();

    // Capitalize first letter of each sentence
    formattedText = formattedText.replace(/(^|[.!?]\s+)([a-z])/g, (match) =>
      match.toUpperCase()
    );

    // Ensure proper spacing after punctuation
    formattedText = formattedText.replace(/([,.!?])([^\s])/g, "$1 $2");

    return formattedText;
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

      {/* Beautify Button */}
      <button
        className="mt-3 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        onClick={() => setText(beautifyText(text))}
      >
        Beautify Text
      </button>
    </div>
  );
};

export default TextBeautifier;
