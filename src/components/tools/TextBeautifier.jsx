"use client";

import { useState } from "react";
import {
  FaCopy,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaBrush,
  FaUndo,
  FaTextHeight,
  FaSearch,
  FaEraser,
  FaDownload,
  FaHashtag,
  FaCode,
} from "react-icons/fa";

const TextBeautifier = () => {
  const [text, setText] = useState("");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  const beautifyText = (input) => {
    if (!input.trim()) return "";
    let formattedText = input.replace(/\s+/g, " ").trim();
    formattedText = formattedText.replace(/(^|[.!?]\s+)([a-z])/g, (match) =>
      match.toUpperCase()
    );
    formattedText = formattedText.replace(/([,.!?])([^\s])/g, "$1 $2");
    return formattedText;
  };

  const toUpperCase = () => setText(text.toUpperCase());
  const toLowerCase = () => setText(text.toLowerCase());

  const toTitleCase = () => {
    setText(text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()));
  };

  const toSentenceCase = () => {
    setText(
      text
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s*\w)/g, (char) => char.toUpperCase())
    );
  };

  const reverseText = () => setText(text.split("").reverse().join(""));
  const removeExtraSpaces = () => setText(text.replace(/\s+/g, " ").trim());
  const removeLineBreaks = () => setText(text.replace(/\n+/g, " "));

  const alternateCase = () =>
    setText(
      text
        .split("")
        .map((char, index) =>
          index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
        )
        .join("")
    );

  const removeNumbers = () => setText(text.replace(/\d+/g, ""));
  const removeSpecialChars = () => setText(text.replace(/[^\w\s]/gi, ""));

  const toCamelCase = () =>
    setText(
      text
        .toLowerCase()
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
          index === 0 ? word.toLowerCase() : word.toUpperCase()
        )
        .replace(/\s+/g, "")
    );

  const toSnakeCase = () => setText(text.toLowerCase().replace(/\s+/g, "_"));

  const toKebabCase = () => setText(text.toLowerCase().replace(/\s+/g, "-"));

  const handleFindReplace = () => {
    if (findText && replaceText) {
      setText(text.replace(new RegExp(findText, "gi"), replaceText));
    }
  };

  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "text.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => setText("");

  return (
    <div className="mx-auto p-5 bg-white shadow-lg rounded-2xl">
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Type or paste text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      <div className="flex items-center gap-2 mt-3">
        <input
          type="text"
          placeholder="Find"
          className="w-1/3 p-2 border rounded-lg focus:ring-primary"
          value={findText}
          onChange={(e) => setFindText(e.target.value)}
        />
        <input
          type="text"
          placeholder="Replace"
          className="w-1/3 p-2 border rounded-lg focus:ring-primary"
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded-lg border bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text hover:border-secondary transition flex items-center justify-center"
          onClick={handleFindReplace}
        >
          <FaSearch className="mr-2 text-primary" />
          <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            Replace
          </span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <button
          className="px-4 py-2 rounded-lg border bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text hover:border-secondary transition flex items-center justify-center"
          onClick={() => setText(beautifyText(text))}
        >
          <FaBrush className="mr-2 text-primary" /> Beautify
        </button>
        <button
          className="px-4 py-2 rounded-lg border bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text hover:border-secondary transition flex items-center justify-center"
          onClick={toUpperCase}
        >
          <FaArrowUp className="mr-2 text-primary" /> Uppercase
        </button>
        <button
          className="px-4 py-2 rounded-lg border bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text hover:border-secondary transition flex items-center justify-center"
          onClick={toLowerCase}
        >
          <FaArrowDown className="mr-2 text-primary" /> Lowercase
        </button>
        <button
          className="px-4 py-2 rounded-lg border bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text hover:border-secondary transition flex items-center justify-center"
          onClick={toTitleCase}
        >
          <FaTextHeight className="mr-2 text-primary" /> Title Case
        </button>
        <button
          className="px-4 py-2 rounded-lg border bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text hover:border-secondary transition flex items-center justify-center"
          onClick={toSentenceCase}
        >
          <FaTextHeight className="mr-2 text-primary" /> Sentence Case
        </button>
        <button
          className="px-4 py-2 rounded-lg border bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text hover:border-secondary transition flex items-center justify-center"
          onClick={reverseText}
        >
          <FaUndo className="mr-2 text-primary" /> Reverse
        </button>
        <button
          className="px-4 py-2 rounded-lg border bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text hover:border-secondary transition flex items-center justify-center"
          onClick={removeExtraSpaces}
        >
          <FaEraser className="mr-2 text-primary" /> Remove Spaces
        </button>
        <button
          className="px-4 py-2 rounded-lg border bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text hover:border-secondary transition flex items-center justify-center"
          onClick={removeLineBreaks}
        >
          <FaEraser className="mr-2 text-primary" /> Remove Line Breaks
        </button>
        <button
          className="px-4 py-2 rounded-lg border bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text hover:border-secondary transition flex items-center justify-center"
          onClick={alternateCase}
        >
          <FaUndo className="mr-2 text-primary" /> Alternate Case
        </button>
        <button
          className="px-4 py-2 rounded-lg border bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text hover:border-secondary transition flex items-center justify-center"
          onClick={removeNumbers}
        >
          <FaHashtag className="mr-2 text-primary" /> Remove Numbers
        </button>
        <button
          className="px-4 py-2 rounded-lg border bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text hover:border-secondary transition flex items-center justify-center"
          onClick={removeSpecialChars}
        >
          <FaEraser className="mr-2 text-primary" /> Remove Special Characters
        </button>
        <button
          className="px-4 py-2 rounded-lg border bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text hover:border-secondary transition flex items-center justify-center"
          onClick={toCamelCase}
        >
          <FaCode className="mr-2 text-primary" /> Camel Case
        </button>
        <button
          className="px-4 py-2 rounded-lg border bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text hover:border-secondary transition flex items-center justify-center"
          onClick={toSnakeCase}
        >
          <FaCode className="mr-2 text-primary" /> Snake Case
        </button>
        <button
          className="px-4 py-2 rounded-lg border bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text hover:border-secondary transition flex items-center justify-center"
          onClick={toKebabCase}
        >
          <FaCode className="mr-2 text-primary" /> Kebab Case
        </button>
        <button
          className="px-4 py-2 rounded-lg border bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text hover:border-secondary transition flex items-center justify-center"
          onClick={handleCopy}
        >
          <FaCopy className="mr-2 text-primary" /> Copy
        </button>
        <button
          className="px-4 py-2 rounded-lg border bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text hover:border-secondary transition flex items-center justify-center"
          onClick={handleDownload}
        >
          <FaDownload className="mr-2 text-primary" /> Download
        </button>
        <button
          className="px-4 py-2 rounded-lg border bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text hover:border-secondary transition flex items-center justify-center"
          onClick={handleClear}
        >
          <FaTrash className="mr-2 text-primary" /> Clear
        </button>
      </div>

      {/* Word & Character Count */}
      <div className="flex justify-around items-center text-secondary text-sm mt-2">
        <p>
          Words:{" "}
          <span className="text-primary">
            {text ? text.trim().split(/\s+/).length : 0}
          </span>
        </p>
        <p>
          Characters: <span className="text-primary">{text.length}</span>
        </p>
      </div>
    </div>
  );
};

export default TextBeautifier;
