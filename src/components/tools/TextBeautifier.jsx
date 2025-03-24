"use client";

import { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaBrush,
  FaUndo,
  FaRedo,
  FaTextHeight,
  FaSearch,
  FaEraser,
  FaDownload,
  FaHashtag,
  FaCode,
  FaRandom,
  FaUpload,
  FaQuoteRight,
} from "react-icons/fa";

const TextBeautifier = () => {
  const [text, setText] = useState("");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [history, setHistory] = useState([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [options, setOptions] = useState({
    caseSensitiveReplace: false,
    regexReplace: false,
  });

  const updateHistory = useCallback(
    (newText) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newText);
      setHistory(newHistory.slice(-10)); // Limit to last 10 changes
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  const applyTransformation = (fn, label) => {
    const newText = fn(text);
    setText(newText);
    updateHistory(newText);
  };

  const beautifyText = (input) =>
    input
      .replace(/\s+/g, " ")
      .trim()
      .replace(/(^|[.!?]\s+)([a-z])/g, (match) => match.toUpperCase())
      .replace(/([,.!?])([^\s])/g, "$1 $2");

  const transformations = {
    beautify: () => applyTransformation(beautifyText, "Beautify"),
    toUpperCase: () => applyTransformation(t => t.toUpperCase(), "Uppercase"),
    toLowerCase: () => applyTransformation(t => t.toLowerCase(), "Lowercase"),
    toTitleCase: () =>
      applyTransformation(
        t => t.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()),
        "Title Case"
      ),
    toSentenceCase: () =>
      applyTransformation(
        t => t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, char => char.toUpperCase()),
        "Sentence Case"
      ),
    reverseText: () =>
      applyTransformation(t => t.split("").reverse().join(""), "Reverse"),
    removeExtraSpaces: () =>
      applyTransformation(t => t.replace(/\s+/g, " ").trim(), "Remove Spaces"),
    removeLineBreaks: () =>
      applyTransformation(t => t.replace(/\n+/g, " "), "Remove Line Breaks"),
    alternateCase: () =>
      applyTransformation(
        t =>
          t
            .split("")
            .map((char, i) => (i % 2 === 0 ? char.toUpperCase() : char.toLowerCase()))
            .join(""),
        "Alternate Case"
      ),
    randomCase: () =>
      applyTransformation(
        t =>
          t
            .split("")
            .map(char => (Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()))
            .join(""),
        "Random Case"
      ),
    removeNumbers: () =>
      applyTransformation(t => t.replace(/\d+/g, ""), "Remove Numbers"),
    removeSpecialChars: () =>
      applyTransformation(t => t.replace(/[^\w\s]/gi, ""), "Remove Special Chars"),
    toCamelCase: () =>
      applyTransformation(
        t =>
          t
            .toLowerCase()
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, i) =>
              i === 0 ? word.toLowerCase() : word.toUpperCase()
            )
            .replace(/\s+/g, ""),
        "Camel Case"
      ),
    toSnakeCase: () =>
      applyTransformation(t => t.toLowerCase().replace(/\s+/g, "_"), "Snake Case"),
    toKebabCase: () =>
      applyTransformation(t => t.toLowerCase().replace(/\s+/g, "-"), "Kebab Case"),
    addQuotes: () =>
      applyTransformation(t => `"${t.trim()}"`, "Add Quotes"),
  };

  const handleFindReplace = () => {
    if (!findText || !text) return;
    try {
      const flags = options.caseSensitiveReplace ? "g" : "gi";
      const regex = options.regexReplace
        ? new RegExp(findText, flags)
        : new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
      const newText = text.replace(regex, replaceText);
      setText(newText);
      updateHistory(newText);
    } catch (err) {
      alert("Invalid regex pattern");
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setText(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setText(history[historyIndex + 1]);
    }
  };

  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (text) {
      const blob = new Blob([text], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `beautified_text_${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        setText(content);
        updateHistory(content);
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    setText("");
    setHistory([""]);
    setHistoryIndex(0);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white shadow-lg rounded-2xl p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-gray-900">
          Advanced Text Beautifier
        </h1>

        {/* Textarea */}
        <textarea
          className="w-full h-32 sm:h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
          placeholder="Type or paste text here..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            updateHistory(e.target.value);
          }}
        ></textarea>

        {/* Find & Replace */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
          <input
            type="text"
            placeholder="Find"
            className="w-full sm:w-1/3 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
          />
          <input
            type="text"
            placeholder="Replace"
            className="w-full sm:w-1/3 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            <button
              className="w-full sm:w-auto px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center justify-center text-sm sm:text-base"
              onClick={handleFindReplace}
            >
              <FaSearch className="mr-2" /> Replace
            </button>
            <div className="flex gap-2">
              <label className="flex items-center text-xs sm:text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.caseSensitiveReplace}
                  onChange={() =>
                    setOptions(prev => ({ ...prev, caseSensitiveReplace: !prev.caseSensitiveReplace }))
                  }
                  className="mr-1"
                />
                Case Sensitive
              </label>
              <label className="flex items-center text-xs sm:text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.regexReplace}
                  onChange={() =>
                    setOptions(prev => ({ ...prev, regexReplace: !prev.regexReplace }))
                  }
                  className="mr-1"
                />
                Regex
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={transformations.beautify}
          >
            <FaBrush /> Beautify
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={transformations.toUpperCase}
          >
            <FaArrowUp /> Uppercase
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={transformations.toLowerCase}
          >
            <FaArrowDown /> Lowercase
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={transformations.toTitleCase}
          >
            <FaTextHeight /> Title Case
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={transformations.toSentenceCase}
          >
            <FaTextHeight /> Sentence Case
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={transformations.reverseText}
          >
            <FaUndo /> Reverse
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={transformations.removeExtraSpaces}
          >
            <FaEraser /> Remove Spaces
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={transformations.removeLineBreaks}
          >
            <FaEraser /> Remove Breaks
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={transformations.alternateCase}
          >
            <FaUndo /> Alternate Case
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={transformations.randomCase}
          >
            <FaRandom /> Random Case
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={transformations.removeNumbers}
          >
            <FaHashtag /> Remove Numbers
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={transformations.removeSpecialChars}
          >
            <FaEraser /> Remove Special
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={transformations.toCamelCase}
          >
            <FaCode /> Camel Case
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={transformations.toSnakeCase}
          >
            <FaCode /> Snake Case
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={transformations.toKebabCase}
          >
            <FaCode /> Kebab Case
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={transformations.addQuotes}
          >
            <FaQuoteRight /> Add Quotes
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
          >
            <FaUndo /> Undo
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
          >
            <FaRedo /> Redo
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={handleCopy}
            disabled={!text}
          >
            <FaCopy /> Copy
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={handleDownload}
            disabled={!text}
          >
            <FaDownload /> Download
          </button>
          <label
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-xs sm:text-sm flex-1 min-w-[120px] cursor-pointer"
          >
            <FaUpload /> Import
            <input
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleImport}
            />
          </label>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs sm:text-sm flex-1 min-w-[120px]"
            onClick={handleClear}
          >
            <FaTrash /> Clear
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row justify-around items-center text-gray-600 text-xs sm:text-sm mt-4">
          <p>
            Words: <span className="text-teal-600">{text ? text.trim().split(/\s+/).length : 0}</span>
          </p>
          <p>
            Characters: <span className="text-teal-600">{text.length}</span>
          </p>
          <p>
            Lines: <span className="text-teal-600">{text ? text.split("\n").length : 0}</span>
          </p>
        </div>

        {/* Features Info */}
        <div className="mt-6 p-4 bg-teal-100 rounded-lg border border-teal-300">
          <h3 className="font-semibold text-teal-700 text-sm sm:text-base">Features</h3>
          <ul className="list-disc list-inside text-teal-600 text-xs sm:text-sm">
            <li>Multiple text transformations (case, spacing, coding styles)</li>
            <li>Find & replace with regex and case sensitivity</li>
            <li>Undo/redo history (up to 10 steps)</li>
            <li>Copy, download, and import text</li>
            <li>Responsive design for all devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextBeautifier;