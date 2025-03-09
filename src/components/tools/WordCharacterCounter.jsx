"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaChartBar,
} from "react-icons/fa";

const WordCharacterCounter = () => {
  const [text, setText] = useState("");
  const [options, setOptions] = useState({
    ignoreCase: true,          // Case-insensitive word counting
    excludePunctuation: false, // Exclude punctuation from words
    customDelimiter: "",       // Custom sentence delimiter
    showWordFrequency: false,  // Toggle word frequency table
  });

  // Text Analysis Functions
  const analyzeText = useCallback(() => {
    const trimmedText = text.trim();
    const wordPattern = options.excludePunctuation
      ? /[^\s.,!?;:"'(){}[\]]+/g
      : /\S+/g;
    const words = trimmedText.length === 0 ? [] : (trimmedText.match(wordPattern) || []);
    const sentenceDelimiter = options.customDelimiter || /[.!?]+/;
    const sentences = trimmedText.split(sentenceDelimiter).filter(Boolean);
    const paragraphs = trimmedText.split(/\n+/).filter(Boolean);

    const wordCount = words.length;
    const charCount = text.length;
    const charCountNoSpaces = text.replace(/\s/g, "").length;
    const sentenceCount = sentences.length;
    const paragraphCount = paragraphs.length;

    const avgWordLength = wordCount > 0 ? (charCountNoSpaces / wordCount).toFixed(2) : 0;
    const readingTime = wordCount > 0 ? (wordCount / 200).toFixed(2) : "0"; // 200 wpm
    const speakingTime = wordCount > 0 ? (wordCount / 130).toFixed(2) : "0"; // 130 wpm

    const longestWord = words.reduce((longest, word) => word.length > longest.length ? word : longest, "");
    const avgSentenceLength = sentenceCount > 0 ? (wordCount / sentenceCount).toFixed(2) : "0";

    const wordFrequency = words.reduce((freq, word) => {
      const normalizedWord = options.ignoreCase ? word.toLowerCase() : word;
      freq[normalizedWord] = (freq[normalizedWord] || 0) + 1;
      return freq;
    }, {});
    const mostFrequentWord = Object.keys(wordFrequency).length > 0
      ? Object.entries(wordFrequency).reduce((a, b) => b[1] > a[1] ? b : a, ["", 0])[0]
      : "N/A";
    const uniqueWordCount = new Set(Object.keys(wordFrequency)).size;
    const punctuationCount = (text.match(/[.,!?;:"'(){}[\]]/g) || []).length;

    const syllableCount = words.reduce((count, word) => {
      let matches = word.match(/[aeiouy]+/gi);
      return count + (matches ? matches.length : 0);
    }, 0);

    const fleschScore = sentenceCount > 0 && wordCount > 0
      ? (206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount)).toFixed(2)
      : "0";

    return {
      wordCount,
      charCount,
      charCountNoSpaces,
      sentenceCount,
      paragraphCount,
      avgWordLength,
      readingTime,
      speakingTime,
      longestWord,
      avgSentenceLength,
      mostFrequentWord,
      uniqueWordCount,
      punctuationCount,
      syllableCount,
      fleschScore,
      wordFrequency,
    };
  }, [text, options]);

  const stats = analyzeText();

  const handleReset = () => {
    setText("");
  };

  const handleExport = () => {
    const content = `Word Count: ${stats.wordCount}\nCharacters (with spaces): ${stats.charCount}\nCharacters (no spaces): ${stats.charCountNoSpaces}\nSentences: ${stats.sentenceCount}\nParagraphs: ${stats.paragraphCount}\nAvg. Word Length: ${stats.avgWordLength}\nAvg. Sentence Length: ${stats.avgSentenceLength}\nReading Time (min): ${stats.readingTime}\nSpeaking Time (min): ${stats.speakingTime}\nLongest Word: ${stats.longestWord || "N/A"}\nMost Frequent Word: ${stats.mostFrequentWord}\nUnique Words: ${stats.uniqueWordCount}\nPunctuation Count: ${stats.punctuationCount}\nSyllables: ${stats.syllableCount}\nFlesch Score: ${stats.fleschScore}${options.showWordFrequency ? `\n\nWord Frequency:\n${Object.entries(stats.wordFrequency).map(([word, count]) => `${word}: ${count}`).join("\n")}` : ""}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "text_stats.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full ">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Word & Character Counter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <textarea
            className="w-full h-48 sm:h-56 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y transition-all"
            placeholder="Type or paste text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="text-right text-xs sm:text-sm text-gray-500">
            {text.length}/10000 characters
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Counting Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.ignoreCase}
                  onChange={() => handleOptionChange("ignoreCase", !options.ignoreCase)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Ignore Case</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.excludePunctuation}
                  onChange={() => handleOptionChange("excludePunctuation", !options.excludePunctuation)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Exclude Punctuation in Words</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.showWordFrequency}
                  onChange={() => handleOptionChange("showWordFrequency", !options.showWordFrequency)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Show Word Frequency</span>
              </label>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Sentence Delimiter:</label>
                <input
                  type="text"
                  value={options.customDelimiter}
                  onChange={(e) => handleOptionChange("customDelimiter", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ;"
                  maxLength={5}
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleReset}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            <button
              onClick={handleExport}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
            >
              <FaDownload className="inline mr-2" />
              Export Stats
            </button>
          </div>
        </div>

        {/* Stats Display */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Words", value: stats.wordCount },
            { label: "Characters (with spaces)", value: stats.charCount },
            { label: "Characters (no spaces)", value: stats.charCountNoSpaces },
            { label: "Sentences", value: stats.sentenceCount },
            { label: "Paragraphs", value: stats.paragraphCount },
            { label: "Avg. Word Length", value: stats.avgWordLength },
            { label: "Avg. Sentence Length", value: stats.avgSentenceLength },
            { label: "Reading Time (min)", value: stats.readingTime },
            { label: "Speaking Time (min)", value: stats.speakingTime },
            { label: "Longest Word", value: stats.longestWord || "N/A" },
            { label: "Most Frequent Word", value: stats.mostFrequentWord },
            { label: "Unique Words", value: stats.uniqueWordCount },
            { label: "Punctuation Count", value: stats.punctuationCount },
            { label: "Syllables", value: stats.syllableCount },
            { label: "Flesch Score", value: stats.fleschScore },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-100 p-3 rounded-md text-center">
              <span className="font-medium text-gray-700">{label}:</span>{" "}
              <strong className="text-blue-600">{value}</strong>
            </div>
          ))}
        </div>

        {/* Word Frequency Table */}
        {options.showWordFrequency && stats.wordFrequency && Object.keys(stats.wordFrequency).length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center flex items-center justify-center">
              <FaChartBar className="mr-2" /> Word Frequency
            </h2>
            <div className="mt-3 max-h-64 overflow-auto">
              <table className="w-full text-sm text-gray-700">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="p-2 text-left">Word</th>
                    <th className="p-2 text-right">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.wordFrequency)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 50) // Limit to top 50 for performance
                    .map(([word, count]) => (
                      <tr key={word} className="border-t">
                        <td className="p-2">{word}</td>
                        <td className="p-2 text-right">{count}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Counts words, characters, sentences, paragraphs, and more</li>
            <li>Estimates reading/speaking time and readability (Flesch Score)</li>
            <li>Customizable counting with case, punctuation, and delimiters</li>
            <li>Word frequency analysis and export functionality</li>
            <li>Responsive design for all devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WordCharacterCounter;