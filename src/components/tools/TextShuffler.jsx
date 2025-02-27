"use client";
import React, { useState } from "react";

const TextShuffler = () => {
  const [inputText, setInputText] = useState("");
  const [shuffledText, setShuffledText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    shuffleType: "words",   // characters, words, lines
    applyToLines: true,     // Apply shuffling to each line separately
    preserveCase: true,     // Preserve original case
    seed: "",               // Optional seed for reproducible shuffling
  });

  // Fisher-Yates shuffle with optional seed
  const shuffleArray = (array, seed) => {
    let shuffled = [...array];
    let random = Math.random;
    if (seed) {
      // Simple seeded random function (not cryptographically secure)
      let s = parseInt(seed, 36) || 1;
      random = () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    }
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Shuffle text based on options
  const shuffleText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to shuffle" };
    }

    let resultLines = options.applyToLines ? text.split("\n") : [text];
    let shuffledLines = [];

    for (let line of resultLines) {
      let shuffledLine = line;

      switch (options.shuffleType) {
        case "characters":
          const chars = line.split("");
          shuffledLine = shuffleArray(chars, options.seed).join("");
          break;
        case "words":
          const words = line.split(/\s+/).filter(w => w.length > 0);
          shuffledLine = shuffleArray(words, options.seed).join(" ");
          break;
        case "lines":
          shuffledLine = line; // Lines are shuffled at the end if not line-by-line
          break;
        default:
          return { error: "Invalid shuffle type" };
      }

      if (!options.preserveCase) {
        shuffledLine = shuffledLine.toLowerCase();
      }

      shuffledLines.push(shuffledLine);
    }

    // Shuffle lines if type is "lines" and not applying to lines separately
    if (options.shuffleType === "lines" && !options.applyToLines) {
      shuffledLines = shuffleArray(resultLines, options.seed);
    }

    const result = shuffledLines.join("\n");

    return {
      original: text,
      shuffled: result,
      changes: getChanges(text, result),
    };
  };

  // Helper to identify changes made
  const getChanges = (original, shuffled) => {
    const changes = [];
    if (original === shuffled) return ["No changes made"];

    changes.push(`Shuffled ${options.shuffleType}`);
    if (options.applyToLines && original.includes("\n")) {
      changes.push("Applied to each line separately");
    }
    if (!options.preserveCase) {
      changes.push("Converted to lowercase");
    }
    if (options.seed) {
      changes.push(`Used seed "${options.seed}" for reproducible shuffling`);
    }
    return changes;
  };

  const handleShuffle = async () => {
    setError("");
    setShuffledText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = shuffleText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setShuffledText(result.shuffled);
    } catch (err) {
      setError("An error occurred while shuffling the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setShuffledText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Shuffler
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Shuffle:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-40 resize-y transition-all"
              placeholder="e.g., Hello World\nThis is a test"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Shuffling Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Shuffle Type:</label>
                <select
                  value={options.shuffleType}
                  onChange={(e) => handleOptionChange("shuffleType", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="characters">Characters</option>
                  <option value="words">Words</option>
                  <option value="lines">Lines</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Seed (optional):</label>
                <input
                  type="text"
                  value={options.seed}
                  onChange={(e) => handleOptionChange("seed", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., xyz123"
                  maxLength="20"
                />
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.applyToLines}
                  onChange={() => handleOptionChange("applyToLines", !options.applyToLines)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500"
                />
                <span>Apply to Lines Separately</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.preserveCase}
                  onChange={() => handleOptionChange("preserveCase", !options.preserveCase)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500"
                />
                <span>Preserve Case</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleShuffle}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isLoading ? "Shuffling..." : "Shuffle Text"}
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
        {shuffledText && (
          <div className="mt-8 p-6 bg-red-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Shuffled Text
            </h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-all">
              {shuffledText}
            </pre>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {shuffleText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(shuffledText)}
              className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold"
            >
              Copy Shuffled Text to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextShuffler;