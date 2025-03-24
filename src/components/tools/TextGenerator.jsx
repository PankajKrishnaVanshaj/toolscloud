"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaMagic,
} from "react-icons/fa";

const TextGenerator = () => {
  const [generatedText, setGeneratedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    generationType: "words",  // words, sentences, paragraphs, lorem, names, numbers
    count: 10,
    minLength: 3,
    maxLength: 10,
    capitalize: true,
    separator: " ",           // Separator between units
    includeNumbers: false,    // Include numbers in words/sentences
    prefix: "",               // Add prefix to each unit
    suffix: "",               // Add suffix to each unit
    customWords: "",          // Custom word bank (comma-separated)
  });

  // Expanded word bank for random generation
  const wordBank = [
    "apple", "banana", "cat", "dog", "elephant", "fish", "grape", "house", "ice", "jungle",
    "kite", "lemon", "mouse", "nest", "orange", "pear", "queen", "rabbit", "sun", "tree",
    "violet", "whale", "xray", "yellow", "zebra",
  ];

  // Name bank for name generation
  const nameBank = [
    "Alex", "Bella", "Charlie", "Dana", "Evan", "Fiona", "Greg", "Hannah", "Ian", "Julia",
    "Kieran", "Liam", "Mia", "Noah", "Olivia", "Paul", "Quinn", "Riley", "Sophie", "Tom",
  ];

  // Lorem Ipsum words
  const loremWords = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed",
    "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua",
    "enim", "ad", "minim", "veniam", "quis", "nostrud",
  ];

  const generateText = () => {
    if (options.count < 1 || options.count > 500) {
      return { error: "Count must be between 1 and 500" };
    }
    if (options.minLength < 1 || options.maxLength < options.minLength) {
      return { error: "Invalid length range: Min must be at least 1 and less than Max" };
    }

    let result = [];
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const customWords = options.customWords.split(",").map(w => w.trim()).filter(w => w);
    const activeWordBank = customWords.length > 0 ? customWords : wordBank;

    const addAffixes = (text) => `${options.prefix}${text}${options.suffix}`;

    switch (options.generationType) {
      case "words":
        for (let i = 0; i < options.count; i++) {
          const length = getRandomInt(options.minLength, options.maxLength);
          let word = options.includeNumbers && Math.random() > 0.7
            ? String(getRandomInt(1, 999))
            : activeWordBank[Math.floor(Math.random() * activeWordBank.length)];
          word = word.slice(0, length);
          result.push(addAffixes(word));
        }
        break;
      case "sentences":
        for (let i = 0; i < options.count; i++) {
          const wordCount = getRandomInt(options.minLength, options.maxLength);
          let sentence = [];
          for (let j = 0; j < wordCount; j++) {
            sentence.push(
              options.includeNumbers && Math.random() > 0.7
                ? String(getRandomInt(1, 999))
                : activeWordBank[Math.floor(Math.random() * activeWordBank.length)]
            );
          }
          let text = sentence.join(" ");
          if (options.capitalize) text = text.charAt(0).toUpperCase() + text.slice(1);
          result.push(addAffixes(text + "."));
        }
        break;
      case "paragraphs":
        for (let i = 0; i < options.count; i++) {
          const sentenceCount = getRandomInt(3, 6);
          let paragraph = [];
          for (let j = 0; j < sentenceCount; j++) {
            const wordCount = getRandomInt(options.minLength, options.maxLength);
            let sentence = [];
            for (let k = 0; k < wordCount; k++) {
              sentence.push(
                options.includeNumbers && Math.random() > 0.7
                  ? String(getRandomInt(1, 999))
                  : activeWordBank[Math.floor(Math.random() * activeWordBank.length)]
              );
            }
            let text = sentence.join(" ");
            if (options.capitalize) text = text.charAt(0).toUpperCase() + text.slice(1);
            paragraph.push(text + ".");
          }
          result.push(addAffixes(paragraph.join(" ")));
        }
        break;
      case "lorem":
        for (let i = 0; i < options.count; i++) {
          const wordCount = getRandomInt(options.minLength, options.maxLength);
          let sentence = [];
          for (let j = 0; j < wordCount; j++) {
            sentence.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
          }
          let text = sentence.join(" ");
          if (options.capitalize && i === 0) text = "Lorem " + text.slice(6);
          result.push(addAffixes(text + "."));
        }
        break;
      case "names":
        for (let i = 0; i < options.count; i++) {
          const name = nameBank[Math.floor(Math.random() * nameBank.length)];
          result.push(addAffixes(name));
        }
        break;
      case "numbers":
        for (let i = 0; i < options.count; i++) {
          const min = Math.pow(10, options.minLength - 1);
          const max = Math.pow(10, options.maxLength) - 1;
          const number = String(getRandomInt(min, max));
          result.push(addAffixes(number));
        }
        break;
      default:
        return { error: "Invalid generation type" };
    }

    return {
      text: options.generationType === "paragraphs" ? result.join("\n\n") : result.join(options.separator),
      count: result.length,
      changes: getChanges(result.length),
    };
  };

  const getChanges = (count) => {
    const changes = [`Generated ${count} ${options.generationType}`];
    if (options.customWords) changes.push("Used custom word bank");
    if (options.includeNumbers) changes.push("Included numbers");
    if (options.capitalize) changes.push("Capitalized units");
    if (options.prefix) changes.push(`Added prefix "${options.prefix}"`);
    if (options.suffix) changes.push(`Added suffix "${options.suffix}"`);
    if (options.separator !== " ") changes.push(`Used separator "${options.separator}"`);
    return changes;
  };

  const handleGenerate = useCallback(async () => {
    setError("");
    setGeneratedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = generateText();

      if (result.error) {
        setError(result.error);
      } else {
        setGeneratedText(result.text);
        setHistory(prev => [...prev, { output: result.text, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const reset = () => {
    setGeneratedText("");
    setError("");
    setOptions({
      generationType: "words",
      count: 10,
      minLength: 3,
      maxLength: 10,
      capitalize: true,
      separator: " ",
      includeNumbers: false,
      prefix: "",
      suffix: "",
      customWords: "",
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, value) : value,
    }));
  };

  const exportGeneratedText = () => {
    const content = `Generated Text (${options.generationType}):\n${generatedText}\n\nDetails:\n${generateText().changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `generated_${options.generationType}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Generator
        </h1>

        {/* Options Section */}
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Generation Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Generation Type:</label>
                <select
                  value={options.generationType}
                  onChange={(e) => handleOptionChange("generationType", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="words">Words</option>
                  <option value="sentences">Sentences</option>
                  <option value="paragraphs">Paragraphs</option>
                  <option value="lorem">Lorem Ipsum</option>
                  <option value="names">Names</option>
                  <option value="numbers">Numbers</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Count (1-500):</label>
                <input
                  type="number"
                  value={options.count}
                  onChange={(e) => handleOptionChange("count", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min Length:</label>
                <input
                  type="number"
                  value={options.minLength}
                  onChange={(e) => handleOptionChange("minLength", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max={options.maxLength}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Length:</label>
                <input
                  type="number"
                  value={options.maxLength}
                  onChange={(e) => handleOptionChange("maxLength", parseInt(e.target.value) || options.minLength)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min={options.minLength}
                  max="50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Separator:</label>
                <input
                  type="text"
                  value={options.separator}
                  onChange={(e) => handleOptionChange("separator", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength="5"
                  placeholder=" "
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prefix (optional):</label>
                <input
                  type="text"
                  value={options.prefix}
                  onChange={(e) => handleOptionChange("prefix", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength="10"
                  placeholder="e.g., @"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Suffix (optional):</label>
                <input
                  type="text"
                  value={options.suffix}
                  onChange={(e) => handleOptionChange("suffix", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength="10"
                  placeholder="e.g., !"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Words (comma-separated):</label>
                <input
                  type="text"
                  value={options.customWords}
                  onChange={(e) => handleOptionChange("customWords", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., foo, bar"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.capitalize}
                    onChange={() => handleOptionChange("capitalize", !options.capitalize)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Capitalize</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.includeNumbers}
                    onChange={() => handleOptionChange("includeNumbers", !options.includeNumbers)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Include Numbers</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              <FaMagic className="inline mr-2" />
              {isLoading ? "Generating..." : "Generate Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {generatedText && (
              <button
                onClick={exportGeneratedText}
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

        {/* Output Display */}
        {generatedText && (
          <div className="mt-8 p-6 bg-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Generated Text ({options.generationType})
            </h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-words max-h-64 overflow-auto">
              {generatedText}
            </pre>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Details:</p>
              <ul className="list-disc list-inside mt-2">
                {generateText().changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(generatedText)}
              className="mt-4 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Generated Text
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Generations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.options.generationType}: "{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}"
                  </span>
                  <button
                    onClick={() => {
                      setGeneratedText(entry.output);
                      setOptions(entry.options);
                    }}
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
          <h3 className="font-semibold text-purple-700">Features</h3>
          <ul className="list-disc list-inside text-purple-600 text-sm">
            <li>Generate words, sentences, paragraphs, lorem, names, or numbers</li>
            <li>Custom count, length range, and separator</li>
            <li>Include numbers, prefixes, suffixes, and custom words</li>
            <li>Capitalization and detailed change tracking</li>
            <li>Export generated text and history functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextGenerator;