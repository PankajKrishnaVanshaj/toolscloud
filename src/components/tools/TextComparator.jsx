"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaSync,
} from "react-icons/fa";

const TextComparator = () => {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [comparisonResult, setComparisonResult] = useState({ left: [], right: [] });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    ignoreCase: false,
    trimLines: true,
    ignoreEmpty: true,
    ignoreWhitespace: false, // Ignore all whitespace differences
    wordLevelDiff: false,    // Show word-level differences
    highlightWords: true,    // Highlight differing words
  });

  const compareText = (text1, text2) => {
    if (!text1.trim() || !text2.trim()) {
      return { error: "Please enter text in both fields to compare" };
    }

    let lines1 = text1.split("\n");
    let lines2 = text2.split("\n");

    if (options.trimLines) {
      lines1 = lines1.map(line => line.trim());
      lines2 = lines2.map(line => line.trim());
    }
    if (options.ignoreEmpty) {
      lines1 = lines1.filter(line => line.length > 0);
      lines2 = lines2.filter(line => line.length > 0);
    }
    if (lines1.length === 0 || lines2.length === 0) {
      return { error: "No valid lines to compare after filtering" };
    }

    const left = [];
    const right = [];
    let i = 0, j = 0;

    while (i < lines1.length || j < lines2.length) {
      const line1 = i < lines1.length ? lines1[i] : "";
      const line2 = j < lines2.length ? lines2[j] : "";
      let compare1 = options.ignoreCase && line1 ? line1.toLowerCase() : line1;
      let compare2 = options.ignoreCase && line2 ? line2.toLowerCase() : line2;

      if (options.ignoreWhitespace) {
        compare1 = compare1.replace(/\s+/g, " ").trim();
        compare2 = compare2.replace(/\s+/g, " ").trim();
      }

      if (i >= lines1.length) {
        left.push({ type: "empty", text: "" });
        right.push({ type: "added", text: line2 });
        j++;
      } else if (j >= lines2.length) {
        left.push({ type: "removed", text: line1 });
        right.push({ type: "empty", text: "" });
        i++;
      } else if (compare1 === compare2) {
        left.push({ type: "unchanged", text: line1 });
        right.push({ type: "unchanged", text: line2 });
        i++;
        j++;
      } else {
        let diff = { type: "changed", text: line1 };
        let diff2 = { type: "changed", text: line2 };
        if (options.wordLevelDiff && options.highlightWords) {
          const words1 = line1.split(/\s+/);
          const words2 = line2.split(/\s+/);
          diff.words = compareWords(words1, words2);
          diff2.words = compareWords(words2, words1);
        }
        let foundMatch = false;
        for (let k = j; k < Math.min(j + 5, lines2.length); k++) {
          const comp = options.ignoreCase ? lines2[k].toLowerCase() : lines2[k];
          if (compare1 === (options.ignoreWhitespace ? comp.replace(/\s+/g, " ").trim() : comp)) {
            while (j < k) {
              left.push({ type: "empty", text: "" });
              right.push({ type: "added", text: lines2[j] });
              j++;
            }
            foundMatch = true;
            break;
          }
        }
        if (!foundMatch) {
          for (let k = i; k < Math.min(i + 5, lines1.length); k++) {
            const comp = options.ignoreCase ? lines1[k].toLowerCase() : lines1[k];
            if (compare2 === (options.ignoreWhitespace ? comp.replace(/\s+/g, " ").trim() : comp)) {
              while (i < k) {
                left.push({ type: "removed", text: lines1[i] });
                right.push({ type: "empty", text: "" });
                i++;
              }
              foundMatch = true;
              break;
            }
          }
        }
        if (!foundMatch) {
          left.push(diff);
          right.push(diff2);
          i++;
          j++;
        }
      }
    }

    return { left, right };
  };

  const compareWords = (words1, words2) => {
    const result = words1.map(word => ({ text: word, status: "unchanged" }));
    const wordMap2 = new Map();
    words2.forEach(word => wordMap2.set(word, (wordMap2.get(word) || 0) + 1));

    words1.forEach((word, idx) => {
      const compareWord = options.ignoreCase ? word.toLowerCase() : word;
      if (!wordMap2.has(compareWord) || wordMap2.get(compareWord) === 0) {
        result[idx].status = "removed";
      } else {
        wordMap2.set(compareWord, wordMap2.get(compareWord) - 1);
      }
    });

    words2.forEach(word => {
      if (wordMap2.get(options.ignoreCase ? word.toLowerCase() : word) > 0) {
        result.push({ text: word, status: "added" });
        wordMap2.set(options.ignoreCase ? word.toLowerCase() : word, wordMap2.get(options.ignoreCase ? word.toLowerCase() : word) - 1);
      }
    });

    return result;
  };

  const handleCompare = useCallback(async () => {
    setError("");
    setComparisonResult({ left: [], right: [] });
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = compareText(text1, text2);

      if (result.error) {
        setError(result.error);
      } else {
        setComparisonResult(result);
        setHistory(prev => [...prev, { text1, text2, result, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An error occurred while comparing the text");
    } finally {
      setIsLoading(false);
    }
  }, [text1, text2, options]);

  const reset = () => {
    setText1("");
    setText2("");
    setComparisonResult({ left: [], right: [] });
    setError("");
  };

  const handleOptionChange = (option) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const exportComparison = () => {
    const content = [
      "Text Comparison Result",
      "=====================",
      "Text 1 (Original):",
      text1,
      "",
      "Text 2 (Modified):",
      text2,
      "",
      "Differences:",
      ...comparisonResult.left.map((l, idx) => {
        const r = comparisonResult.right[idx];
        if (l.type === "unchanged" && r.type === "unchanged") return null;
        return `${l.type === "removed" ? "-" : " "} "${l.text}" | ${r.type === "added" ? "+" : " "} "${r.text}"`;
      }).filter(Boolean),
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "text_comparison.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">
          Advanced Text Comparator
        </h1>

        {/* Input Section */}
        <div className="space-y-6 flex-grow">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <label className="block text-gray-700 font-medium mb-2">
                Text 1 (Original):
              </label>
              <textarea
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-48 resize-y transition-all"
                placeholder="Enter first text here..."
                maxLength={10000}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {text1.length}/10000 characters
              </div>
            </div>
            <div className="w-full md:W-1/2">
              <label className="block text-gray-700 font-medium mb-2">
                Text 2 (Modified):
              </label>
              <textarea
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-48 resize-y transition-all"
                placeholder="Enter second text here..."
                maxLength={10000}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {text2.length}/10000 characters
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Comparison Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.ignoreCase}
                  onChange={() => handleOptionChange("ignoreCase")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Ignore Case</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.trimLines}
                  onChange={() => handleOptionChange("trimLines")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Trim Lines</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.ignoreEmpty}
                  onChange={() => handleOptionChange("ignoreEmpty")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Ignore Empty Lines</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.ignoreWhitespace}
                  onChange={() => handleOptionChange("ignoreWhitespace")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Ignore Whitespace</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.wordLevelDiff}
                  onChange={() => handleOptionChange("wordLevelDiff")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Word-Level Diff</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.highlightWords}
                  onChange={() => handleOptionChange("highlightWords")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  disabled={!options.wordLevelDiff}
                />
                <span>Highlight Words {options.wordLevelDiff ? "" : "(Requires Word-Level Diff)"}</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleCompare}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <FaSync className="inline mr-2" />
              {isLoading ? "Comparing..." : "Compare Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {comparisonResult.left.length > 0 && (
              <button
                onClick={exportComparison}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
              >
                <FaDownload className="inline mr-2" />
                Export
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Comparison Result */}
        {comparisonResult.left.length > 0 && comparisonResult.right.length > 0 && (
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
                Original Text
              </h2>
              <div className="p-4 border border-gray-300 rounded-lg bg-white h-64 overflow-auto">
                {comparisonResult.left.map((line, index) => (
                  <div
                    key={index}
                    className={`p-1 flex flex-wrap ${
                      line.type === "removed" ? "bg-red-100" :
                      line.type === "added" ? "bg-gray-100 opacity-50" :
                      line.type === "changed" ? "bg-yellow-100" : "bg-white"
                    }`}
                  >
                    {line.words ? (
                      line.words.map((word, wIdx) => (
                        <span
                          key={wIdx}
                          className={`mr-1 ${
                            word.status === "removed" ? "bg-red-200" :
                            word.status === "added" ? "bg-green-200" : ""
                          }`}
                        >
                          {word.text}
                        </span>
                      ))
                    ) : (
                      line.text || "\u00A0"
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
                Modified Text
              </h2>
              <div className="p-4 border border-gray-300 rounded-lg bg-white h-64 overflow-auto">
                {comparisonResult.right.map((line, index) => (
                  <div
                    key={index}
                    className={`p-1 flex flex-wrap ${
                      line.type === "added" ? "bg-green-100" :
                      line.type === "removed" ? "bg-gray-100 opacity-50" :
                      line.type === "changed" ? "bg-yellow-100" : "bg-white"
                    }`}
                  >
                    {line.words ? (
                      line.words.map((word, wIdx) => (
                        <span
                          key={wIdx}
                          className={`mr-1 ${
                            word.status === "removed" ? "bg-red-200" :
                            word.status === "added" ? "bg-green-200" : ""
                          }`}
                        >
                          {word.text}
                        </span>
                      ))
                    ) : (
                      line.text || "\u00A0"
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Comparisons (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    "{entry.text1.slice(0, 20)}..." vs "{entry.text2.slice(0, 20)}..."
                  </span>
                  <button
                    onClick={() => {
                      setText1(entry.text1);
                      setText2(entry.text2);
                      setComparisonResult(entry.result);
                      setOptions(entry.options);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Line-by-line text comparison</li>
            <li>Word-level differences with highlighting</li>
            <li>Customizable comparison options</li>
            <li>Export comparison results</li>
            <li>History of last 5 comparisons</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextComparator;