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

const loremWords = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum",
];

const TextLoremIpsumGenerator = () => {
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    type: "paragraphs",
    count: 3,
    startWithLorem: true,
    minWordsPerSentence: 5,
    maxWordsPerSentence: 15,
    minSentencesPerParagraph: 3,
    maxSentencesPerParagraph: 8,
    customWords: "",           // User-defined word list
    capitalizeSentences: true,
    punctuationVariation: true, // Vary punctuation (.!?),
  });

  const generateLoremIpsum = () => {
    const {
      type, count, startWithLorem, minWordsPerSentence, maxWordsPerSentence,
      minSentencesPerParagraph, maxSentencesPerParagraph, customWords,
      capitalizeSentences, punctuationVariation,
    } = options;

    if (count < 1 || count > 100) {
      return { error: "Count must be between 1 and 100" };
    }
    if (minWordsPerSentence > maxWordsPerSentence) {
      return { error: "Min words per sentence must be less than or equal to max" };
    }
    if (type === "paragraphs" && minSentencesPerParagraph > maxSentencesPerParagraph) {
      return { error: "Min sentences per paragraph must be less than or equal to max" };
    }

    const wordList = customWords.trim()
      ? customWords.split(/[\s,]+/).filter(Boolean)
      : loremWords;
    const getRandomWord = () => wordList[Math.floor(Math.random() * wordList.length)];
    const getRandomLength = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const punctuations = punctuationVariation ? [".", "!", "?"] : ["."];
    const getRandomPunctuation = () => punctuations[Math.floor(Math.random() * punctuations.length)];

    let result = [];

    if (type === "paragraphs") {
      for (let i = 0; i < count; i++) {
        const sentences = getRandomLength(minSentencesPerParagraph, maxSentencesPerParagraph);
        let paragraph = [];
        for (let j = 0; j < sentences; j++) {
          const words = getRandomLength(minWordsPerSentence, maxWordsPerSentence);
          let sentence = [];
          if (j === 0 && i === 0 && startWithLorem && !customWords) {
            sentence.push("Lorem ipsum dolor sit amet");
          }
          while (sentence.length < words) {
            sentence.push(getRandomWord());
          }
          let sentenceText = sentence.join(" ") + getRandomPunctuation();
          if (capitalizeSentences) {
            sentenceText = sentenceText.charAt(0).toUpperCase() + sentenceText.slice(1);
          }
          paragraph.push(sentenceText);
        }
        result.push(paragraph.join(" "));
      }
      return result.join("\n\n");
    } else if (type === "sentences") {
      for (let i = 0; i < count; i++) {
        const words = getRandomLength(minWordsPerSentence, maxWordsPerSentence);
        let sentence = [];
        if (i === 0 && startWithLorem && !customWords) {
          sentence.push("Lorem ipsum dolor sit amet");
        }
        while (sentence.length < words) {
          sentence.push(getRandomWord());
        }
        let sentenceText = sentence.join(" ") + getRandomPunctuation();
        if (capitalizeSentences) {
          sentenceText = sentenceText.charAt(0).toUpperCase() + sentenceText.slice(1);
        }
        result.push(sentenceText);
      }
      return result.join(" ");
    } else {
      let words = [];
      if (startWithLorem && !customWords) {
        words.push("lorem");
      }
      while (words.length < count) {
        words.push(getRandomWord());
      }
      return words.join(" ");
    }
  };

  const handleGenerate = useCallback(async () => {
    setError("");
    setOutputText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = generateLoremIpsum();

      if (result.error) {
        setError(result.error);
      } else {
        setOutputText(result);
        setHistory(prev => [...prev, { output: result, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const reset = () => {
    setOutputText("");
    setError("");
    setOptions({
      type: "paragraphs",
      count: 3,
      startWithLorem: true,
      minWordsPerSentence: 5,
      maxWordsPerSentence: 15,
      minSentencesPerParagraph: 3,
      maxSentencesPerParagraph: 8,
      customWords: "",
      capitalizeSentences: true,
      punctuationVariation: true,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, value) : value,
    }));
  };

  const exportText = () => {
    const blob = new Blob([outputText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `lorem_ipsum_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Text Lorem Ipsum Generator
        </h1>

        {/* Options Section */}
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Generation Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Type:</label>
                <select
                  value={options.type}
                  onChange={(e) => handleOptionChange("type", e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="paragraphs">Paragraphs</option>
                  <option value="sentences">Sentences</option>
                  <option value="words">Words</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Count (1-100):</label>
                <input
                  type="number"
                  value={options.count}
                  onChange={(e) => handleOptionChange("count", Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  min="1"
                  max="100"
                />
              </div>
              {options.type !== "words" && (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Min Words/Sentence:</label>
                    <input
                      type="number"
                      value={options.minWordsPerSentence}
                      onChange={(e) => handleOptionChange("minWordsPerSentence", Math.max(1, Math.min(options.maxWordsPerSentence, parseInt(e.target.value) || 1)))}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      min="1"
                      max={options.maxWordsPerSentence}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Max Words/Sentence:</label>
                    <input
                      type="number"
                      value={options.maxWordsPerSentence}
                      onChange={(e) => handleOptionChange("maxWordsPerSentence", Math.max(options.minWordsPerSentence, parseInt(e.target.value) || 15))}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      min={options.minWordsPerSentence}
                      max="50"
                    />
                  </div>
                </>
              )}
              {options.type === "paragraphs" && (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Min Sentences/Paragraph:</label>
                    <input
                      type="number"
                      value={options.minSentencesPerParagraph}
                      onChange={(e) => handleOptionChange("minSentencesPerParagraph", Math.max(1, Math.min(options.maxSentencesPerParagraph, parseInt(e.target.value) || 3)))}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      min="1"
                      max={options.maxSentencesPerParagraph}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Max Sentences/Paragraph:</label>
                    <input
                      type="number"
                      value={options.maxSentencesPerParagraph}
                      onChange={(e) => handleOptionChange("maxSentencesPerParagraph", Math.max(options.minSentencesPerParagraph, parseInt(e.target.value) || 8))}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      min={options.minSentencesPerParagraph}
                      max="20"
                    />
                  </div>
                </>
              )}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Custom Words (comma-separated):</label>
                <textarea
                  value={options.customWords}
                  onChange={(e) => handleOptionChange("customWords", e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 h-20 resize-y"
                  placeholder="e.g., apple, banana, cherry"
                  maxLength={1000}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.startWithLorem}
                    onChange={() => handleOptionChange("startWithLorem", !options.startWithLorem)}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Start with "Lorem ipsum"</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.capitalizeSentences}
                    onChange={() => handleOptionChange("capitalizeSentences", !options.capitalizeSentences)}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Capitalize Sentences</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.punctuationVariation}
                    onChange={() => handleOptionChange("punctuationVariation", !options.punctuationVariation)}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Punctuation Variation (.!?)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-cyan-400 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-700"
              }`}
            >
              <FaRandom className="inline mr-2" />
              {isLoading ? "Generating..." : "Generate Lorem Ipsum"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {outputText && (
              <button
                onClick={exportText}
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
        {outputText && (
          <div className="mt-8 p-6 bg-cyan-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">Generated Lorem Ipsum</h2>
            <p className="mt-3 text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {outputText}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(outputText)}
              className="mt-4 w-full py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all font-semibold"
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
              <FaHistory className="mr-2" /> Recent Generations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>"{entry.output.slice(0, 20)}..." ({entry.options.type})</span>
                  <button
                    onClick={() => {
                      setOutputText(entry.output);
                      setOptions(entry.options);
                    }}
                    className="text-cyan-500 hover:text-cyan-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-cyan-100 rounded-lg border border-cyan-300">
          <h3 className="font-semibold text-cyan-700">Features</h3>
          <ul className="list-disc list-inside text-cyan-600 text-sm">
            <li>Generate paragraphs, sentences, or words</li>
            <li>Customizable word counts and sentence lengths</li>
            <li>Custom word lists and punctuation options</li>
            <li>Exportable text with history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextLoremIpsumGenerator;