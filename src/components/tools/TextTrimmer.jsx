"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaCut,
} from "react-icons/fa";

const TextTrimmer = () => {
  const [inputText, setInputText] = useState("");
  const [trimmedText, setTrimmedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    trimType: "characters", // characters, words, lines, custom, sentences
    trimLength: 50,
    trimDirection: "end",   // start, end, both
    customPattern: "",
    ellipsis: true,
    applyToLines: false,
    preserveWhitespace: false, // Preserve internal whitespace
    trimSentences: false,      // Trim to sentence boundaries
  });

  const trimText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to trim" };
    }

    if (options.trimLength < 1) {
      return { error: "Trim length must be at least 1" };
    }

    let resultLines = options.applyToLines ? text.split("\n") : [text];
    let trimmedLines = [];

    for (let line of resultLines) {
      let trimmedLine = options.preserveWhitespace ? line : line.trim();

      switch (options.trimType) {
        case "characters":
          if (trimmedLine.length > options.trimLength) {
            if (options.trimDirection === "both") {
              const halfLength = Math.floor(options.trimLength / 2);
              trimmedLine = trimmedLine.slice(0, halfLength) + trimmedLine.slice(-halfLength);
              if (options.ellipsis) trimmedLine = "..." + trimmedLine + "...";
            } else {
              trimmedLine = options.trimDirection === "start"
                ? trimmedLine.slice(-options.trimLength)
                : trimmedLine.slice(0, options.trimLength);
              if (options.ellipsis) {
                trimmedLine = options.trimDirection === "start" ? "..." + trimmedLine : trimmedLine + "...";
              }
            }
          }
          break;
        case "words":
          const words = trimmedLine.split(/\s+/).filter(w => w.length > 0);
          if (words.length > options.trimLength) {
            if (options.trimDirection === "both") {
              const halfLength = Math.floor(options.trimLength / 2);
              trimmedLine = [...words.slice(0, halfLength), ...words.slice(-halfLength)].join(" ");
              if (options.ellipsis) trimmedLine = "... " + trimmedLine + " ...";
            } else {
              trimmedLine = options.trimDirection === "start"
                ? words.slice(-options.trimLength).join(" ")
                : words.slice(0, options.trimLength).join(" ");
              if (options.ellipsis) {
                trimmedLine = options.trimDirection === "start" ? "... " + trimmedLine : trimmedLine + " ...";
              }
            }
          }
          break;
        case "lines":
          if (options.applyToLines) {
            trimmedLine = line;
          } else {
            const lines = text.split("\n").filter(l => l.trim().length > 0);
            if (lines.length > options.trimLength) {
              if (options.trimDirection === "both") {
                const halfLength = Math.floor(options.trimLength / 2);
                trimmedLine = [...lines.slice(0, halfLength), ...lines.slice(-halfLength)].join("\n");
                if (options.ellipsis) trimmedLine = "...\n" + trimmedLine + "\n...";
              } else {
                trimmedLine = options.trimDirection === "start"
                  ? lines.slice(-options.trimLength).join("\n")
                  : lines.slice(0, options.trimLength).join("\n");
                if (options.ellipsis) {
                  trimmedLine = options.trimDirection === "start" ? "...\n" + trimmedLine : trimmedLine + "\n...";
                }
              }
            }
          }
          break;
        case "sentences":
          const sentences = trimmedLine.match(/[^.!?]+[.!?]+|\S+$/g) || [trimmedLine];
          if (sentences.length > options.trimLength) {
            if (options.trimDirection === "both") {
              const halfLength = Math.floor(options.trimLength / 2);
              trimmedLine = [...sentences.slice(0, halfLength), ...sentences.slice(-halfLength)].join(" ");
              if (options.ellipsis) trimmedLine = "... " + trimmedLine + " ...";
            } else {
              trimmedLine = options.trimDirection === "start"
                ? sentences.slice(-options.trimLength).join(" ")
                : sentences.slice(0, options.trimLength).join(" ");
              if (options.ellipsis) {
                trimmedLine = options.trimDirection === "start" ? "... " + trimmedLine : trimmedLine + " ...";
              }
            }
          }
          break;
        case "custom":
          if (!options.customPattern) {
            return { error: "Please enter a custom pattern for trimming" };
          }
          try {
            const regex = new RegExp(options.customPattern, "g");
            const matches = [...trimmedLine.matchAll(regex)].map(m => m[0]);
            if (matches.length > 0) {
              if (options.trimDirection === "both") {
                const halfLength = Math.floor(options.trimLength / 2);
                trimmedLine = matches.slice(0, halfLength).join(" ") + " " + matches.slice(-halfLength).join(" ");
                if (options.ellipsis && matches.length > options.trimLength) {
                  trimmedLine = "... " + trimmedLine + " ...";
                }
              } else {
                trimmedLine = options.trimDirection === "start"
                  ? matches.slice(-options.trimLength).join(" ")
                  : matches.slice(0, options.trimLength).join(" ");
                if (options.ellipsis && matches.length > options.trimLength) {
                  trimmedLine = options.trimDirection === "start" ? "... " + trimmedLine : trimmedLine + " ...";
                }
              }
            }
          } catch (err) {
            return { error: "Invalid custom regex pattern" };
          }
          break;
        default:
          return { error: "Invalid trim type" };
      }

      trimmedLines.push(trimmedLine);
    }

    let result = options.applyToLines && options.trimType === "lines"
      ? (options.trimDirection === "both"
          ? [...trimmedLines.slice(0, Math.floor(options.trimLength / 2)), ...trimmedLines.slice(-Math.floor(options.trimLength / 2))].join("\n")
          : (options.trimDirection === "start"
              ? trimmedLines.slice(-options.trimLength).join("\n")
              : trimmedLines.slice(0, options.trimLength).join("\n")))
      : trimmedLines.join("\n");

    if (options.trimType === "lines" && options.applyToLines && options.ellipsis && trimmedLines.length > options.trimLength) {
      result = options.trimDirection === "both" ? "...\n" + result + "\n..." : (options.trimDirection === "start" ? "...\n" + result : result + "\n...");
    }

    return {
      original: text,
      trimmed: result,
      changes: getChanges(text, result),
    };
  };

  const getChanges = (original, trimmed) => {
    const changes = [];
    if (original === trimmed) return ["No changes made"];

    changes.push(`Trimmed to ${options.trimLength} ${options.trimType} from ${options.trimDirection}`);
    if (options.applyToLines && original.includes("\n")) {
      changes.push("Applied to each line separately");
    }
    if (options.ellipsis && original.length > trimmed.length) {
      changes.push("Added ellipsis");
    }
    if (options.customPattern) {
      changes.push(`Used custom pattern: "${options.customPattern}"`);
    }
    if (options.preserveWhitespace) {
      changes.push("Preserved internal whitespace");
    }
    return changes;
  };

  const handleTrim = useCallback(async () => {
    setError("");
    setTrimmedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = trimText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setTrimmedText(result.trimmed);
        setHistory(prev => [...prev, { input: inputText, output: result.trimmed, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setTrimmedText("");
    setError("");
    setIsCopied(false);
    setOptions({
      trimType: "characters",
      trimLength: 50,
      trimDirection: "end",
      customPattern: "",
      ellipsis: true,
      applyToLines: false,
      preserveWhitespace: false,
      trimSentences: false,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, value) : value,
    }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trimmedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const exportTrimmedText = () => {
    const content = `Input: ${inputText}\nTrimmed: ${trimmedText}\n\nChanges:\n${trimText(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "trimmed_text.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const debouncedSetInputText = useCallback(debounce((value) => setInputText(value), 300), []);

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Trimmer
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Trim:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => debouncedSetInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-48 resize-y transition-all"
              placeholder="e.g., The quick brown fox jumps over the lazy dog."
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Trimming Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Trim Type:</label>
                <select
                  value={options.trimType}
                  onChange={(e) => handleOptionChange("trimType", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="characters">Characters</option>
                  <option value="words">Words</option>
                  <option value="lines">Lines</option>
                  <option value="sentences">Sentences</option>
                  <option value="custom">Custom Pattern</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Trim Length:</label>
                <input
                  type="number"
                  value={options.trimLength}
                  onChange={(e) => handleOptionChange("trimLength", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="1"
                  max="1000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Trim Direction:</label>
                <select
                  value={options.trimDirection}
                  onChange={(e) => handleOptionChange("trimDirection", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="start">Start</option>
                  <option value="end">End</option>
                  <option value="both">Both</option>
                </select>
              </div>
              {options.trimType === "custom" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Pattern (regex):</label>
                  <input
                    type="text"
                    value={options.customPattern}
                    onChange={(e) => handleOptionChange("customPattern", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., [aeiou]"
                  />
                </div>
              )}
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.ellipsis}
                  onChange={() => handleOptionChange("ellipsis", !options.ellipsis)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <span>Add Ellipsis</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.applyToLines}
                  onChange={() => handleOptionChange("applyToLines", !options.applyToLines)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <span>Apply to Lines Separately</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.preserveWhitespace}
                  onChange={() => handleOptionChange("preserveWhitespace", !options.preserveWhitespace)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <span>Preserve Whitespace</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleTrim}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-teal-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              <FaCut className="inline mr-2" />
              {isLoading ? "Trimming..." : "Trim Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {trimmedText && (
              <button
                onClick={exportTrimmedText}
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
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center" role="alert">
            {error}
          </div>
        )}

        {/* Output Display */}
        {trimmedText && (
          <div className="mt-8 p-6 bg-teal-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Trimmed Text
            </h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-all">
              {trimmedText}
            </pre>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {trimText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={handleCopy}
              className={`mt-4 w-full py-2 text-white rounded-lg font-semibold transition-all ${
                isCopied ? "bg-green-500 hover:bg-green-600" : "bg-teal-500 hover:bg-teal-600"
              }`}
            >
              <FaCopy className="inline mr-2" />
              {isCopied ? "Copied!" : "Copy Trimmed Text"}
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Trims (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    Trimmed to {entry.options.trimLength} {entry.options.trimType}: "{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}"
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setTrimmedText(entry.output);
                      setOptions(entry.options);
                    }}
                    className="text-teal-500 hover:text-teal-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-teal-100 rounded-lg border border-teal-300">
          <h3 className="font-semibold text-teal-700">Features</h3>
          <ul className="list-disc list-inside text-teal-600 text-sm">
            <li>Trim by characters, words, lines, sentences, or custom pattern</li>
            <li>Trim from start, end, or both</li>
            <li>Ellipsis and line-by-line options</li>
            <li>Preserve whitespace control</li>
            <li>Export trimmed text</li>
            <li>History of last 5 trims</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextTrimmer;