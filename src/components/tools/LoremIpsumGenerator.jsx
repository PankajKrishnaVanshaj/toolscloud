"use client";
import { useState } from "react";
import { FaCopy, FaCheck, FaTrash, FaFileAlt } from "react-icons/fa";

// Function to generate random Lorem Ipsum text
const generateLoremIpsum = (paragraphs, words) => {
  const loremBase =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

  const loremWords = loremBase.split(" ");

  return Array.from({ length: paragraphs })
    .map(() => {
      let sentence = Array.from({ length: words })
        .map(() => loremWords[Math.floor(Math.random() * loremWords.length)])
        .join(" ");

      // Ensure the first word is capitalized and end with a period
      return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
    })
    .join("\n\n");
};

const LoremIpsumGenerator = () => {
  const [text, setText] = useState("");
  const [paragraphs, setParagraphs] = useState(2);
  const [words, setWords] = useState(50);
  const [copied, setCopied] = useState(false);

  const generateText = () => {
    setText(generateLoremIpsum(paragraphs, words));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clearText = () => {
    setText("");
    setCopied(false);
  };

  return (
    <div className="mx-auto p-4 bg-white shadow-lg rounded-2xl">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
        <label className="flex items-center gap-2">
          <span className="text-secondary font-semibold">Paragraphs:</span>
          <input
            type="number"
            min="1"
            max="10"
            value={paragraphs}
            onChange={(e) => setParagraphs(Number(e.target.value))}
            className="border rounded-lg px-3 py-1 text-center focus:ring focus:ring-primary"
          />
        </label>

        <label className="flex items-center gap-2">
          <span className="text-secondary font-semibold">Words:</span>
          <input
            type="number"
            min="5"
            max="1500"
            value={words}
            onChange={(e) => setWords(Number(e.target.value))}
            className="border rounded-lg px-3 py-1 text-center focus:ring focus:ring-primary"
          />
        </label>

        <button
          onClick={generateText}
          className="flex-1 px-4 py-2 rounded-lg border hover:border-secondary transition flex items-center justify-center"
        >
          <FaFileAlt className="mr-2 text-primary" />
          <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text font-semibold">
            Generate Text
          </span>
        </button>
        <button
          onClick={clearText}
          className="flex-1 px-4 py-2 rounded-lg border hover:border-secondary transition flex items-center justify-center"
        >
          <FaTrash className="mr-2 text-primary" />
          <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text font-semibold">
            Clear
          </span>
        </button>
      </div>

      {/* Output Text */}
      {text && (
        <div className="relative mt-5 p-4 border rounded-lg bg-gray-100 text-left max-h-60 overflow-y-auto transition">
          {/* Copy Button */}
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 transition"
          >
            {copied ? (
              <FaCheck size={18} className="text-green-600" />
            ) : (
              <FaCopy size={18} />
            )}
          </button>

          <pre className="whitespace-pre-wrap text-gray-700">{text}</pre>
        </div>
      )}
    </div>
  );
};

export default LoremIpsumGenerator;
