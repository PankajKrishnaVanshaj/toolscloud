"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaEdit,
} from "react-icons/fa";

const synonymDictionary = {
  happy: ["joyful", "content", "elated", "cheerful"],
  sad: ["sorrowful", "downcast", "gloomy", "melancholic"],
  big: ["large", "substantial", "massive", "grand"],
  small: ["tiny", "modest", "slight", "compact"],
  good: ["excellent", "superb", "splendid", "admirable"],
  bad: ["poor", "dreadful", "subpar", "lousy"],
  quick: ["swift", "brisk", "prompt", "hasty"],
  slow: ["gradual", "leisurely", "lagging", "unhurried"],
  begin: ["start", "launch", "initiate", "embark"],
  end: ["conclude", "terminate", "finalize", "cease"],
  make: ["create", "construct", "formulate", "craft"],
  use: ["employ", "utilize", "apply", "implement"],
  think: ["consider", "ponder", "reflect", "contemplate"],
  say: ["state", "express", "declare", "mention"],
  go: ["proceed", "travel", "move", "advance"],
};

const TextParaphraser = () => {
  const [inputText, setInputText] = useState("");
  const [paraphrasedText, setParaphrasedText] = useState("");
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    intensity: "medium",       // low, medium, high
    customSynonyms: "",        // Custom word:synonym pairs
    swapWords: true,           // Allow word swapping
    preservePunctuation: true, // Preserve original punctuation
  });

  const paraphraseText = useCallback((text) => {
    if (!text.trim()) {
      return { error: "Please provide text to paraphrase" };
    }

    if (text.length > 2000) {
      return { error: "Text exceeds 2000 character limit" };
    }

    // Parse custom synonyms
    const customSynonymDict = {};
    options.customSynonyms.split(",").forEach(pair => {
      const [word, synonym] = pair.split(":").map(s => s.trim().toLowerCase());
      if (word && synonym) customSynonymDict[word] = [synonym];
    });

    const combinedDictionary = { ...synonymDictionary, ...customSynonymDict };
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
    const changes = [];
    const intensityThreshold = { low: 0.5, medium: 0.3, high: 0.1 }[options.intensity];

    let paraphrasedSentences = sentences.map((sentence) => {
      const words = sentence.trim().split(/\s+/);
      let swapped = false;

      const paraphrasedWords = words.map((word, index) => {
        const cleanWord = word.toLowerCase().replace(/[^a-z']/gi, "");
        const synonyms = combinedDictionary[cleanWord];
        const originalPunctuation = word.match(/[^a-zA-Z']/g)?.join("") || "";

        if (synonyms && synonyms.length > 0 && Math.random() > intensityThreshold) {
          const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
          changes.push(`"${cleanWord}" → "${synonym}"`);
          return options.preservePunctuation ? `${synonym}${originalPunctuation}` : synonym;
        }

        if (
          options.swapWords &&
          index > 0 &&
          !swapped &&
          Math.random() > 0.85 &&
          !/[.!?]/.test(words[index - 1]) &&
          words[index].length > 2 &&
          words[index - 1].length > 2
        ) {
          swapped = true;
          changes.push(`Swapped "${words[index - 1]}" and "${word}"`);
          return options.preservePunctuation
            ? `${words[index]} ${words[index - 1]}`
            : words[index].replace(/[^a-zA-Z']/g, "") + " " + words[index - 1].replace(/[^a-zA-Z']/g, "");
        }

        return word;
      });

      return paraphrasedWords.join(" ").trim();
    });

    let finalText = paraphrasedSentences.join(" ");
    if (options.preservePunctuation) {
      finalText = finalText.replace(/([.!?])\s*/g, "$1 ").trim();
    } else {
      finalText = finalText.replace(/[.!?]+/g, ". ").trim();
    }
    finalText = finalText.charAt(0).toUpperCase() + finalText.slice(1);

    return {
      original: text,
      paraphrased: finalText,
      steps: changes.length > 0 ? changes : ["No significant changes made"],
    };
  }, [options]);

  const handleParaphrase = async () => {
    setError("");
    setParaphrasedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const calcResult = paraphraseText(inputText);

      if (calcResult.error) {
        setError(calcResult.error);
      } else {
        setParaphrasedText(calcResult.paraphrased);
        setResult(calcResult);
        setHistory(prev => [...prev, { input: inputText, result: calcResult, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setParaphrasedText("");
    setError("");
    setShowDetails(false);
    setResult(null);
    setOptions({
      intensity: "medium",
      customSynonyms: "",
      swapWords: true,
      preservePunctuation: true,
    });
  };

  const exportParaphrase = () => {
    const content = `Original Text:\n${result.original}\n\nParaphrased Text:\n${result.paraphrased}\n\nChanges:\n${result.steps.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `paraphrased_text_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full  transition-all duration-300">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Text Paraphraser
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Your Text (max 2000 characters):
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-40 sm:h-48 resize-y transition-all"
              placeholder="e.g., The quick brown fox jumps over the lazy dog."
              maxLength={2000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/2000
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Paraphrasing Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Paraphrasing Intensity:</label>
                <select
                  value={options.intensity}
                  onChange={(e) => setOptions(prev => ({ ...prev, intensity: e.target.value }))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Synonyms (word:synonym):</label>
                <input
                  type="text"
                  value={options.customSynonyms}
                  onChange={(e) => setOptions(prev => ({ ...prev, customSynonyms: e.target.value }))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., run:sprint, jump:leap"
                />
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.swapWords}
                  onChange={() => setOptions(prev => ({ ...prev, swapWords: !prev.swapWords }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Swap Words</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.preservePunctuation}
                  onChange={() => setOptions(prev => ({ ...prev, preservePunctuation: !prev.preservePunctuation }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Preserve Punctuation</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleParaphrase}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              <FaEdit className="inline mr-2" />
              {isLoading ? "Processing..." : "Paraphrase"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {paraphrasedText && (
              <button
                onClick={exportParaphrase}
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

        {/* Result Display */}
        {paraphrasedText && (
          <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">Paraphrased Result:</h2>
            <p className="mt-3 text-lg text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {paraphrasedText}
            </p>
            <div className="text-center mt-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-indigo-600 hover:underline focus:outline-none"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>
            </div>
            {showDetails && result && (
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-medium">Paraphrasing Process:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Original: "{result.original}"</li>
                  {result.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                  <li>Result: "{result.paraphrased}"</li>
                </ul>
              </div>
            )}
            <button
              onClick={() => navigator.clipboard.writeText(paraphrasedText)}
              className="mt-4 w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy to Clipboard
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Paraphrases (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>"{entry.input.slice(0, 20)}..." → "{entry.result.paraphrased.slice(0, 20)}..."</span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setParaphrasedText(entry.result.paraphrased);
                      setResult(entry.result);
                      setOptions(entry.options);
                    }}
                    className="text-indigo-500 hover:text-indigo-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-indigo-100 rounded-lg border border-indigo-300">
          <h3 className="font-semibold text-indigo-700">Features</h3>
          <ul className="list-disc list-inside text-indigo-600 text-sm">
            <li>Adjustable paraphrasing intensity (low, medium, high)</li>
            <li>Custom synonym support (word:synonym pairs)</li>
            <li>Word swapping and punctuation preservation options</li>
            <li>Detailed change tracking</li>
            <li>Export results and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextParaphraser;