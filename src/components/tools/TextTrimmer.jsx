"use client";
import React, { useState } from "react";

const TextTrimmer = () => {
  const [inputText, setInputText] = useState("");
  const [trimmedText, setTrimmedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    trimType: "characters", // characters, words, lines, custom
    trimLength: 50,         // Length to trim to (characters, words, or lines)
    trimDirection: "end",   // start, end
    customPattern: "",      // Custom regex pattern for trimming
    ellipsis: true,         // Add "..." to indicate trimming
    applyToLines: false,    // Apply trimming to each line separately
  });

  // Trim text based on options
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
      let trimmedLine = line;

      switch (options.trimType) {
        case "characters":
          if (trimmedLine.length > options.trimLength) {
            trimmedLine = options.trimDirection === "start"
              ? trimmedLine.slice(-options.trimLength)
              : trimmedLine.slice(0, options.trimLength);
            if (options.ellipsis) {
              trimmedLine = options.trimDirection === "start" ? "..." + trimmedLine : trimmedLine + "...";
            }
          }
          break;
        case "words":
          const words = trimmedLine.split(/\s+/).filter(w => w.length > 0);
          if (words.length > options.trimLength) {
            trimmedLine = options.trimDirection === "start"
              ? words.slice(-options.trimLength).join(" ")
              : words.slice(0, options.trimLength).join(" ");
            if (options.ellipsis) {
              trimmedLine = options.trimDirection === "start" ? "... " + trimmedLine : trimmedLine + " ...";
            }
          }
          break;
        case "lines":
          if (options.applyToLines) {
            trimmedLine = line; // Handled at the line level below
          } else {
            const lines = text.split("\n").filter(l => l.trim().length > 0);
            trimmedLine = options.trimDirection === "start"
              ? lines.slice(-options.trimLength).join("\n")
              : lines.slice(0, options.trimLength).join("\n");
            if (options.ellipsis && lines.length > options.trimLength) {
              trimmedLine = options.trimDirection === "start" ? "...\n" + trimmedLine : trimmedLine + "\n...";
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
              trimmedLine = options.trimDirection === "start"
                ? trimmedLine.replace(regex, "").trim() + " " + matches.slice(-options.trimLength).join(" ")
                : matches.slice(0, options.trimLength).join(" ") + " " + trimmedLine.replace(regex, "").trim();
              if (options.ellipsis && matches.length > options.trimLength) {
                trimmedLine = options.trimDirection === "start" ? "... " + trimmedLine : trimmedLine + " ...";
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
      ? (options.trimDirection === "start"
          ? trimmedLines.slice(-options.trimLength).join("\n")
          : trimmedLines.slice(0, options.trimLength).join("\n"))
      : trimmedLines.join("\n");

    if (options.trimType === "lines" && options.applyToLines && options.ellipsis && trimmedLines.length > options.trimLength) {
      result = options.trimDirection === "start" ? "...\n" + result : result + "\n...";
    }

    return {
      original: text,
      trimmed: result,
      changes: getChanges(text, result),
    };
  };

  // Helper to identify changes made
  const getChanges = (original, trimmed) => {
    const changes = [];
    if (original === trimmed) return ["No changes made"];

    changes.push(`Trimmed to ${options.trimLength} ${options.trimType} from ${options.trimDirection}`);
    if (options.applyToLines && original.includes("\n")) {
      changes.push("Applied to each line separately");
    }
    if (options.ellipsis && original.length > trimmed.length) {
      changes.push("Added ellipsis to indicate trimming");
    }
    if (options.customPattern) {
      changes.push(`Used custom pattern: "${options.customPattern}"`);
    }
    return changes;
  };

  const handleTrim = async () => {
    setError("");
    setTrimmedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = trimText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setTrimmedText(result.trimmed);
    } catch (err) {
      setError("An error occurred while trimming the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setTrimmedText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, value) : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Trimmer
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Trim:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-40 resize-y transition-all"
              placeholder="e.g., The quick brown fox jumps over the lazy dog."
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Trimming Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Trim Type:</label>
                <select
                  value={options.trimType}
                  onChange={(e) => handleOptionChange("trimType", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="characters">Characters</option>
                  <option value="words">Words</option>
                  <option value="lines">Lines</option>
                  <option value="custom">Custom Pattern</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Trim Length:</label>
                <input
                  type="number"
                  value={options.trimLength}
                  onChange={(e) => handleOptionChange("trimLength", parseInt(e.target.value) || 1)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="1"
                  max="1000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Trim Direction:</label>
                <select
                  value={options.trimDirection}
                  onChange={(e) => handleOptionChange("trimDirection", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="start">Start</option>
                  <option value="end">End</option>
                </select>
              </div>
              {options.trimType === "custom" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Pattern (regex):</label>
                  <input
                    type="text"
                    value={options.customPattern}
                    onChange={(e) => handleOptionChange("customPattern", e.target.value)}
                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
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
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleTrim}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-teal-400 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              {isLoading ? "Trimming..." : "Trim Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-center">
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
              onClick={() => navigator.clipboard.writeText(trimmedText)}
              className="mt-4 w-full py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all font-semibold"
            >
              Copy Trimmed Text to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextTrimmer;