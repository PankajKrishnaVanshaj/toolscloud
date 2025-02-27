"use client";
import React, { useState } from "react";

const TextGenerator = () => {
  const [generatedText, setGeneratedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    generationType: "words",  // words, sentences, paragraphs, lorem
    count: 10,                // Number of units to generate
    minLength: 3,             // Minimum length for words/sentences
    maxLength: 10,            // Maximum length for words/sentences
    capitalize: true,         // Capitalize first letter of sentences/paragraphs
  });

  // Word bank for random generation
  const wordBank = [
    "apple", "banana", "cat", "dog", "elephant", "fish", "grape", "house", "ice", "jungle",
    "kite", "lemon", "mouse", "nest", "orange", "pear", "queen", "rabbit", "sun", "tree",
  ];

  // Lorem Ipsum words for lorem generation
  const loremWords = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed",
    "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua",
  ];

  // Generate text based on options
  const generateText = () => {
    if (options.count < 1 || options.count > 100) {
      return { error: "Count must be between 1 and 100" };
    }
    if (options.minLength < 1 || options.maxLength < options.minLength) {
      return { error: "Invalid length range: Min must be at least 1 and less than Max" };
    }

    let result = [];
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    switch (options.generationType) {
      case "words":
        for (let i = 0; i < options.count; i++) {
          const length = getRandomInt(options.minLength, options.maxLength);
          const word = wordBank[Math.floor(Math.random() * wordBank.length)];
          result.push(word.slice(0, length));
        }
        break;
      case "sentences":
        for (let i = 0; i < options.count; i++) {
          const wordCount = getRandomInt(options.minLength, options.maxLength);
          let sentence = [];
          for (let j = 0; j < wordCount; j++) {
            sentence.push(wordBank[Math.floor(Math.random() * wordBank.length)]);
          }
          let text = sentence.join(" ");
          if (options.capitalize) text = text.charAt(0).toUpperCase() + text.slice(1);
          result.push(text + ".");
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
              sentence.push(wordBank[Math.floor(Math.random() * wordBank.length)]);
            }
            let text = sentence.join(" ");
            if (options.capitalize) text = text.charAt(0).toUpperCase() + text.slice(1);
            paragraph.push(text + ".");
          }
          result.push(paragraph.join(" "));
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
          result.push(text + ".");
        }
        break;
      default:
        return { error: "Invalid generation type" };
    }

    return {
      text: options.generationType === "paragraphs" ? result.join("\n\n") : result.join(" "),
      count: result.length,
    };
  };

  const handleGenerate = async () => {
    setError("");
    setGeneratedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
      const result = generateText();

      if (result.error) {
        setError(result.error);
        return;
      }

      setGeneratedText(result.text);
    } catch (err) {
      setError("An error occurred while generating text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setGeneratedText("");
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
          Text Generator
        </h1>

        {/* Options Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Generation Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Generation Type:</label>
                <select
                  value={options.generationType}
                  onChange={(e) => handleOptionChange("generationType", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="words">Words</option>
                  <option value="sentences">Sentences</option>
                  <option value="paragraphs">Paragraphs</option>
                  <option value="lorem">Lorem Ipsum</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Count (1-100):</label>
                <input
                  type="number"
                  value={options.count}
                  onChange={(e) => handleOptionChange("count", parseInt(e.target.value) || 1)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min Length:</label>
                <input
                  type="number"
                  value={options.minLength}
                  onChange={(e) => handleOptionChange("minLength", parseInt(e.target.value) || 1)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min={options.minLength}
                  max="50"
                />
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.capitalize}
                  onChange={() => handleOptionChange("capitalize", !options.capitalize)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                />
                <span>Capitalize</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isLoading ? "Generating..." : "Generate Text"}
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
        {generatedText && (
          <div className="mt-8 p-6 bg-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Generated Text ({options.generationType})
            </h2>
            <p className="mt-3 text-gray-700 whitespace-pre-wrap break-words">
              {generatedText}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(generatedText)}
              className="mt-4 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold"
            >
              Copy Text to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextGenerator;