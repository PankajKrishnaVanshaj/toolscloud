"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaDownload,
  FaUndo,
  FaRedo,
  FaTrash,
  FaSyncAlt,
} from "react-icons/fa";

const TextReverser = () => {
  const [inputText, setInputText] = useState("");
  const [reversedText, setReversedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1); // Fixed syntax here
  const [options, setOptions] = useState({
    reverseType: "characters", // characters, words, lines, sentences
    applyToLines: true,
    preserveCase: true,
    ignoreWhitespace: false,
    reversePunctuation: false,
  });

  const updateHistory = useCallback((newText) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ input: inputText, options: { ...options }, output: newText });
    setHistory(newHistory.slice(-10)); // Limit to 10 entries
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, inputText, options]);

  const reverseText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to reverse" };
    }

    let resultLines = options.applyToLines ? text.split("\n") : [text];
    let reversedLines = [];

    for (let line of resultLines) {
      let reversedLine = line;

      switch (options.reverseType) {
        case "characters":
          let chars = line.split("");
          if (!options.reversePunctuation) {
            const punctuation = chars.map((c, i) => /[.!?,;:]/.test(c) ? i : -1).filter(i => i !== -1);
            reversedLine = chars.reverse().join("");
            if (punctuation.length) {
              let temp = reversedLine.split("");
              punctuation.forEach(pos => {
                const originalPos = line.length - 1 - pos;
                temp[pos] = line[pos];
                if (originalPos !== pos) temp[originalPos] = reversedLine[originalPos];
              });
              reversedLine = temp.join("");
            }
          } else {
            reversedLine = chars.reverse().join("");
          }
          break;
        case "words":
          let words = options.ignoreWhitespace ? line.split(/\s+/).filter(w => w) : line.split(" ");
          reversedLine = words.reverse().join(" ");
          break;
        case "lines":
          reversedLine = line; // Handled later if not line-by-line
          break;
        case "sentences":
          const sentences = line.match(/[^.!?]+[.!?]+|\S+/g) || [line];
          reversedLine = sentences.reverse().join(" ");
          break;
        default:
          return { error: "Invalid reverse type" };
      }

      if (!options.preserveCase) {
        reversedLine = reversedLine.toLowerCase();
      }

      reversedLines.push(reversedLine);
    }

    if (options.reverseType === "lines" && !options.applyToLines) {
      reversedLines = reversedLines.reverse();
    }

    const result = reversedLines.join("\n");

    return {
      original: text,
      reversed: result,
      changes: getChanges(text, result),
    };
  };

  const getChanges = (original, reversed) => {
    const changes = [];
    if (original === reversed) return ["No changes made"];
    changes.push(`Reversed ${options.reverseType}`);
    if (options.applyToLines && original.includes("\n")) changes.push("Applied to each line separately");
    if (!options.preserveCase) changes.push("Converted to lowercase");
    if (options.ignoreWhitespace && options.reverseType === "words") changes.push("Ignored extra whitespace");
    if (!options.reversePunctuation && options.reverseType === "characters") changes.push("Preserved punctuation positions");
    return changes;
  };

  const handleReverse = async () => {
    setError("");
    setReversedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = reverseText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setReversedText(result.reversed);
      updateHistory(result.reversed);
    } catch (err) {
      setError("An error occurred while reversing the text");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setInputText(history[historyIndex - 1].input);
      setOptions(history[historyIndex - 1].options);
      setReversedText(history[historyIndex - 1].output);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setInputText(history[historyIndex + 1].input);
      setOptions(history[historyIndex + 1].options);
      setReversedText(history[historyIndex + 1].output);
    }
  };

  const reset = () => {
    setInputText("");
    setReversedText("");
    setError("");
    setHistory([]);
    setHistoryIndex(-1);
    setOptions({
      reverseType: "characters",
      applyToLines: true,
      preserveCase: true,
      ignoreWhitespace: false,
      reversePunctuation: false,
    });
  };

  const handleCopy = () => {
    if (reversedText) {
      navigator.clipboard.writeText(reversedText);
      alert("Reversed text copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (reversedText) {
      const blob = new Blob([reversedText], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `reversed_text_${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white p-4 sm:p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center text-gray-900">
          Advanced Text Reverser
        </h1>

        {/* Input Section */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Enter Text to Reverse:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-32 sm:h-40 resize-y transition-all text-sm sm:text-base"
              placeholder="e.g., Hello World\nThis is a test"
              maxLength={5000}
            />
            <div className="text-right text-xs sm:text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm sm:text-base font-medium text-gray-700">Reversal Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1">Reverse Type:</label>
                <select
                  value={options.reverseType}
                  onChange={(e) => handleOptionChange("reverseType", e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                >
                  <option value="characters">Characters</option>
                  <option value="words">Words</option>
                  <option value="lines">Lines</option>
                  <option value="sentences">Sentences</option>
                </select>
              </div>
              <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.applyToLines}
                  onChange={() => handleOptionChange("applyToLines", !options.applyToLines)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <span>Apply to Lines Separately</span>
              </label>
              <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.preserveCase}
                  onChange={() => handleOptionChange("preserveCase", !options.preserveCase)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <span>Preserve Case</span>
              </label>
              <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.ignoreWhitespace}
                  onChange={() => handleOptionChange("ignoreWhitespace", !options.ignoreWhitespace)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <span>Ignore Extra Whitespace</span>
              </label>
              <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.reversePunctuation}
                  onChange={() => handleOptionChange("reversePunctuation", !options.reversePunctuation)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <span>Reverse Punctuation</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={handleReverse}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 flex-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm sm:text-base ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <FaSyncAlt /> {isLoading ? "Reversing..." : "Reverse Text"}
            </button>
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 flex-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base disabled:bg-gray-400"
            >
              <FaUndo /> Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 flex-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base disabled:bg-gray-400"
            >
              <FaRedo /> Redo
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 flex-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base disabled:opacity-50"
            >
              <FaTrash /> Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 sm:mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Output Display */}
        {reversedText && (
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-teal-50 rounded-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-center">
              Reversed Text
            </h2>
            <pre className="mt-3 text-sm sm:text-lg text-gray-700 whitespace-pre-wrap break-all">
              {reversedText}
            </pre>
            <div className="mt-4 text-xs sm:text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {reverseText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 flex-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm sm:text-base"
              >
                <FaCopy /> Copy
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 flex-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm sm:text-base"
              >
                <FaDownload /> Download
              </button>
            </div>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-teal-100 rounded-lg border border-teal-300">
          <h3 className="font-semibold text-teal-700 text-sm sm:text-base">Features</h3>
          <ul className="list-disc list-inside text-teal-600 text-xs sm:text-sm">
            <li>Reverse by characters, words, lines, or sentences</li>
            <li>Custom options (case, whitespace, punctuation)</li>
            <li>Undo/redo history (up to 10 steps)</li>
            <li>Copy or download reversed text</li>
            <li>Responsive design for all devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextReverser;