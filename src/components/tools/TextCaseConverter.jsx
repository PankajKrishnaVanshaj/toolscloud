"use client";

import { useState, useCallback } from "react";
import {
  FaCopy,
  FaEraser,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaRedo,
  FaAlignJustify,
  FaFont,
  FaDownload,
  FaHistory,
  FaUndo,
  FaRandom,
  FaCompress,
} from "react-icons/fa";

const TextCaseConverter = () => {
  const [text, setText] = useState("");
  const [prevText, setPrevText] = useState("");
  const [history, setHistory] = useState([]);

  // Conversion Functions with History Tracking
  const applyConversion = useCallback(
    (convertFn, label) => {
      setPrevText(text);
      const newText = convertFn(text);
      setText(newText);
      setHistory(prev => [...prev, { text: text, operation: label }].slice(-5));
    },
    [text]
  );

  const toUpperCase = () => applyConversion(t => t.toUpperCase(), "Uppercase");
  const toLowerCase = () => applyConversion(t => t.toLowerCase(), "Lowercase");
  const toTitleCase = () =>
    applyConversion(
      t => t.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()),
      "Title Case"
    );
  const toSentenceCase = () =>
    applyConversion(
      t => t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, char => char.toUpperCase()),
      "Sentence Case"
    );
  const toReverseText = () =>
    applyConversion(t => t.split("").reverse().join(""), "Reverse Text");
  const removeExtraSpaces = () =>
    applyConversion(t => t.replace(/\s+/g, " ").trim(), "Remove Extra Spaces");
  const toCamelCase = () =>
    applyConversion(
      t =>
        t
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase()),
      "Camel Case"
    );
  const toSnakeCase = () =>
    applyConversion(
      t => t.replace(/\s+/g, "_").replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, ""),
      "Snake Case"
    );
  const toKebabCase = () =>
    applyConversion(
      t => t.replace(/\s+/g, "-").replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, ""),
      "Kebab Case"
    );
  const toRandomCase = () =>
    applyConversion(
      t =>
        t
          .split("")
          .map(char => (Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()))
          .join(""),
      "Random Case"
    );

  // Utility Functions
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    alert("Text copied to clipboard!");
  };

  const clearText = () => {
    setPrevText(text);
    setText("");
    setHistory(prev => [...prev, { text: text, operation: "Clear" }].slice(-5));
  };

  const undoLast = () => {
    if (prevText !== null) setText(prevText);
  };

  const exportText = () => {
    const content = `Current Text:\n${text}\n\nLast Operation:\n${history.length > 0 ? history[history.length - 1].operation : "None"}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `text_conversion_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white shadow-lg rounded-2xl p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-gray-900">
          Advanced Text Case Converter
        </h1>

        {/* Textarea */}
        <textarea
          className="w-full h-32 sm:h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
          placeholder="Type or paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>

        {/* Stats */}
        <div className="text-gray-600 mt-2 text-xs sm:text-sm">
          <span>Words: {text.trim() ? text.trim().split(/\s+/).length : 0} | </span>
          <span>Characters: {text.length}</span>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
          <button
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={toUpperCase}
          >
            <FaSortAlphaUp /> Uppercase
          </button>
          <button
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={toLowerCase}
          >
            <FaSortAlphaDown /> Lowercase
          </button>
          <button
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={toTitleCase}
          >
            <FaFont /> Title Case
          </button>
          <button
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={toSentenceCase}
          >
            <FaAlignJustify /> Sentence Case
          </button>
          <button
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={toCamelCase}
          >
            <FaFont /> Camel Case
          </button>
          <button
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={toSnakeCase}
          >
            <FaFont /> Snake Case
          </button>
          <button
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={toKebabCase}
          >
            <FaFont /> Kebab Case
          </button>
          <button
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={toRandomCase}
          >
            <FaRandom /> Random Case
          </button>
          <button
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={toReverseText}
          >
            <FaRedo /> Reverse Text
          </button>
          <button
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={removeExtraSpaces}
          >
            <FaCompress /> Remove Spaces
          </button>
          <button
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={copyToClipboard}
          >
            <FaCopy /> Copy
          </button>
          <button
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={exportText}
            disabled={!text}
          >
            <FaDownload /> Export
          </button>
          <button
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={undoLast}
            disabled={!prevText}
          >
            <FaUndo /> Undo
          </button>
          <button
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={clearText}
          >
            <FaEraser /> Clear
          </button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center text-sm sm:text-base">
              <FaHistory className="mr-2" /> Recent Conversions (Last 5)
            </h3>
            <ul className="mt-2 text-xs sm:text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{entry.operation}: "{entry.text.slice(0, 20)}{entry.text.length > 20 ? "..." : ""}"</span>
                  <button
                    onClick={() => setText(entry.text)}
                    className="text-purple-500 hover:text-purple-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-purple-100 rounded-lg border border-purple-300">
          <h3 className="font-semibold text-purple-700 text-sm sm:text-base">Features</h3>
          <ul className="list-disc list-inside text-purple-600 text-xs sm:text-sm">
            <li>Multiple case conversions (upper, lower, title, sentence, camel, snake, kebab, random)</li>
            <li>Text reversal and space normalization</li>
            <li>Copy, export, and undo functionality</li>
            <li>History tracking of last 5 operations</li>
            <li>Responsive design for all devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextCaseConverter;