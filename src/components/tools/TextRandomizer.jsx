"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaRandom,
} from "react-icons/fa";

const TextRandomizer = () => {
  const [inputText, setInputText] = useState("");
  const [randomizedText, setRandomizedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    randomizeType: "words",   // characters, words, lines, sentences
    applyToLines: true,
    preserveCase: true,
    seed: "",
    preserveSpaces: true,     // Preserve original spacing between elements
    limitRandomization: 0,    // Limit number of items to randomize (0 = all)
    reverseAfter: false,      // Reverse the result after randomization
  });

  const shuffleArray = (array, seed) => {
    let shuffled = [...array];
    let random = Math.random;
    if (seed) {
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

  const randomizeText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to randomize" };
    }

    let resultLines = options.applyToLines ? text.split("\n") : [text];
    let randomizedLines = [];

    for (let line of resultLines) {
      let randomizedLine = line;
      let items;

      switch (options.randomizeType) {
        case "characters":
          items = line.split("");
          if (options.limitRandomization > 0 && items.length > options.limitRandomization) {
            items = items.slice(0, options.limitRandomization);
          }
          randomizedLine = shuffleArray(items, options.seed).join("");
          break;
        case "words":
          const wordMatches = line.match(options.preserveSpaces ? /(\S+\s*)/g : /\S+/g) || [];
          items = wordMatches.map(match => match);
          if (options.limitRandomization > 0 && items.length > options.limitRandomization) {
            items = items.slice(0, options.limitRandomization);
          }
          randomizedLine = shuffleArray(items, options.seed).join("");
          break;
        case "lines":
          randomizedLine = line; // Handled below if not line-by-line
          break;
        case "sentences":
          items = line.split(/(?<=\.|\?|!)\s+/).filter(s => s.length > 0);
          if (options.limitRandomization > 0 && items.length > options.limitRandomization) {
            items = items.slice(0, options.limitRandomization);
          }
          randomizedLine = shuffleArray(items, options.seed).join(" ");
          break;
        default:
          return { error: "Invalid randomize type" };
      }

      if (!options.preserveCase) {
        randomizedLine = randomizedLine.toLowerCase();
      }

      randomizedLines.push(randomizedLine);
    }

    if (options.randomizeType === "lines" && !options.applyToLines) {
      if (options.limitRandomization > 0 && resultLines.length > options.limitRandomization) {
        resultLines = resultLines.slice(0, options.limitRandomization);
      }
      randomizedLines = shuffleArray(resultLines, options.seed);
    }

    if (options.reverseAfter) {
      randomizedLines = randomizedLines.reverse();
    }

    const result = randomizedLines.join("\n");

    return {
      original: text,
      randomized: result,
      changes: getChanges(text, result),
    };
  };

  const getChanges = (original, randomized) => {
    const changes = [];
    if (original === randomized) return ["No changes made"];

    changes.push(`Randomized ${options.randomizeType}`);
    if (options.applyToLines && original.includes("\n")) {
      changes.push("Applied to each line separately");
    }
    if (!options.preserveCase) {
      changes.push("Converted to lowercase");
    }
    if (options.preserveSpaces) {
      changes.push("Preserved original spacing");
    }
    if (options.limitRandomization > 0) {
      changes.push(`Limited to ${options.limitRandomization} items`);
    }
    if (options.seed) {
      changes.push(`Used seed "${options.seed}"`);
    }
    if (options.reverseAfter) {
      changes.push("Reversed after randomization");
    }
    return changes;
  };

  const handleRandomize = useCallback(async () => {
    setError("");
    setRandomizedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = randomizeText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setRandomizedText(result.randomized);
        setHistory(prev => [...prev, { input: inputText, output: result.randomized, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setRandomizedText("");
    setError("");
    setOptions({
      randomizeType: "words",
      applyToLines: true,
      preserveCase: true,
      seed: "",
      preserveSpaces: true,
      limitRandomization: 0,
      reverseAfter: false,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const exportRandomizedText = () => {
    const content = `Input Text:\n${inputText}\n\nRandomized Text:\n${randomizedText}\n\nChanges:\n${randomizeText(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `randomized_text_${options.randomizeType}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full ">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Randomizer
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Randomize:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-48 resize-y transition-all"
              placeholder="e.g., Hello World\nThis is a test. Another sentence."
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Randomization Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Randomize Type:</label>
                <select
                  value={options.randomizeType}
                  onChange={(e) => handleOptionChange("randomizeType", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="characters">Characters</option>
                  <option value="words">Words</option>
                  <option value="lines">Lines</option>
                  <option value="sentences">Sentences</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Seed (optional):</label>
                <input
                  type="text"
                  value={options.seed}
                  onChange={(e) => handleOptionChange("seed", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., xyz123"
                  maxLength="20"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Limit Items (0 = all):</label>
                <input
                  type="number"
                  value={options.limitRandomization}
                  onChange={(e) => handleOptionChange("limitRandomization", Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.applyToLines}
                    onChange={() => handleOptionChange("applyToLines", !options.applyToLines)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span>Apply to Lines Separately</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.preserveCase}
                    onChange={() => handleOptionChange("preserveCase", !options.preserveCase)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span>Preserve Case</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.preserveSpaces}
                    onChange={() => handleOptionChange("preserveSpaces", !options.preserveSpaces)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span>Preserve Spaces</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.reverseAfter}
                    onChange={() => handleOptionChange("reverseAfter", !options.reverseAfter)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span>Reverse After</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleRandomize}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <FaRandom className="inline mr-2" />
              {isLoading ? "Randomizing..." : "Randomize Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {randomizedText && (
              <button
                onClick={exportRandomizedText}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
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

        {/* Output Display */}
        {randomizedText && (
          <div className="mt-8 p-6 bg-green-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Randomized Text
            </h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-all max-h-64 overflow-auto">
              {randomizedText}
            </pre>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {randomizeText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(randomizedText)}
              className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Randomized Text
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Randomizations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.options.randomizeType}: "{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}"
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setRandomizedText(entry.output);
                      setOptions(entry.options);
                    }}
                    className="text-green-500 hover:text-green-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-300">
          <h3 className="font-semibold text-green-700">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm">
            <li>Randomize characters, words, lines, or sentences</li>
            <li>Line-by-line or full-text randomization</li>
            <li>Preserve case and spacing options</li>
            <li>Seeded randomization for reproducibility</li>
            <li>Limit items, reverse after, export, and history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextRandomizer;