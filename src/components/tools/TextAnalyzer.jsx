"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaSearch,
} from "react-icons/fa";

const TextAnalyzer = () => {
  const [inputText, setInputText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    includeReadability: true,
    showWordFreq: true,
    showCharFreq: false,
    ignoreCase: true,
    includeStats: true,       // Additional stats (unique words, syllables)
    topN: 10,                 // Number of top frequent items to show
    minWordLength: 1,         // Minimum word length for frequency
    showSentenceLength: false,// Show sentence length distribution
  });

  const analyzeText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to analyze" };
    }

    const words = text.split(/\s+/).filter(word => word.length >= options.minWordLength);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chars = text.split("");

    // Basic counts
    const charCount = text.length;
    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const avgWordLength = wordCount > 0 ? (chars.filter(c => /[a-zA-Z]/.test(c)).length / wordCount).toFixed(2) : 0;

    // Additional stats
    let uniqueWordCount = 0, syllableCount = 0;
    if (options.includeStats) {
      const uniqueWords = new Set(options.ignoreCase ? words.map(w => w.toLowerCase()) : words);
      uniqueWordCount = uniqueWords.size;
      syllableCount = words.reduce((count, word) => count + countSyllables(word), 0);
    }

    // Word frequency
    const wordFreq = {};
    words.forEach(word => {
      const key = options.ignoreCase ? word.toLowerCase() : word;
      wordFreq[key] = (wordFreq[key] || 0) + 1;
    });
    const sortedWordFreq = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, options.topN);

    // Character frequency
    const charFreq = {};
    chars.forEach(char => {
      if (/[a-zA-Z]/.test(char)) {
        const key = options.ignoreCase ? char.toLowerCase() : char;
        charFreq[key] = (charFreq[key] || 0) + 1;
      }
    });
    const sortedCharFreq = Object.entries(charFreq)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, options.topN);

    // Sentence length distribution
    let sentenceLengths = [];
    if (options.showSentenceLength) {
      sentenceLengths = sentences.map(s => s.split(/\s+/).filter(w => w.length > 0).length);
    }

    // Readability metrics
    let readability = null;
    if (options.includeReadability && wordCount > 0 && sentenceCount > 0) {
      const syllables = words.reduce((count, word) => count + countSyllables(word), 0);
      const fleschReadingEase = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllables / wordCount);
      const fleschKincaidGrade = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllables / wordCount) - 15.59;
      readability = {
        fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
        fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
      };
    }

    return {
      charCount,
      wordCount,
      sentenceCount,
      avgWordLength,
      uniqueWordCount,
      syllableCount,
      wordFreq: sortedWordFreq,
      charFreq: sortedCharFreq,
      sentenceLengths,
      readability,
    };
  };

  const countSyllables = (word) => {
    word = word.toLowerCase().replace(/[^a-z]/g, "");
    if (word.length <= 3) return 1;
    let syllables = 0;
    const vowels = "aeiouy";
    let prevCharWasVowel = false;
    for (let char of word) {
      const isVowel = vowels.includes(char);
      if (isVowel && !prevCharWasVowel) syllables++;
      prevCharWasVowel = isVowel;
    }
    if (word.endsWith("e")) syllables--;
    return Math.max(1, syllables);
  };

  const handleAnalyze = useCallback(async () => {
    setError("");
    setAnalysis(null);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = analyzeText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setAnalysis(result);
        setHistory(prev => [...prev, { input: inputText, output: result, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setAnalysis(null);
    setError("");
    setOptions({
      includeReadability: true,
      showWordFreq: true,
      showCharFreq: false,
      ignoreCase: true,
      includeStats: true,
      topN: 10,
      minWordLength: 1,
      showSentenceLength: false,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, value) : !prev[option],
    }));
  };

  const exportAnalysis = () => {
    const content = `Text Analysis:\n${JSON.stringify(analysis, null, 2)}\n\nInput Text:\n${inputText}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "text_analysis.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Analyzer
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Analyze:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-48 resize-y transition-all"
              placeholder="e.g., The quick brown fox jumps over the lazy dog."
              maxLength={20000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/20000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Analysis Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.includeReadability}
                  onChange={() => handleOptionChange("includeReadability")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Include Readability</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.showWordFreq}
                  onChange={() => handleOptionChange("showWordFreq")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Show Word Frequency</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.showCharFreq}
                  onChange={() => handleOptionChange("showCharFreq")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Show Character Frequency</span>
              </label>
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
                  checked={options.includeStats}
                  onChange={() => handleOptionChange("includeStats")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Include Additional Stats</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.showSentenceLength}
                  onChange={() => handleOptionChange("showSentenceLength")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Show Sentence Lengths</span>
              </label>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Top N Items:</label>
                <input
                  type="number"
                  value={options.topN}
                  onChange={(e) => handleOptionChange("topN", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min Word Length:</label>
                <input
                  type="number"
                  value={options.minWordLength}
                  onChange={(e) => handleOptionChange("minWordLength", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="20"
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <FaSearch className="inline mr-2" />
              {isLoading ? "Analyzing..." : "Analyze Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {analysis && (
              <button
                onClick={exportAnalysis}
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

        {/* Analysis Display */}
        {analysis && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg max-h-[60vh] overflow-auto">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Text Analysis
            </h2>
            <div className="mt-4 text-gray-700 space-y-6">
              <div>
                <p><strong>Characters:</strong> {analysis.charCount}</p>
                <p><strong>Words:</strong> {analysis.wordCount}</p>
                <p><strong>Sentences:</strong> {analysis.sentenceCount}</p>
                <p><strong>Average Word Length:</strong> {analysis.avgWordLength}</p>
                {options.includeStats && (
                  <>
                    <p><strong>Unique Words:</strong> {analysis.uniqueWordCount}</p>
                    <p><strong>Total Syllables:</strong> {analysis.syllableCount}</p>
                  </>
                )}
              </div>

              {options.includeReadability && analysis.readability && (
                <div>
                  <p className="font-medium">Readability:</p>
                  <p>Flesch Reading Ease: {analysis.readability.fleschReadingEase} (0-100, higher = easier)</p>
                  <p>Flesch-Kincaid Grade: {analysis.readability.fleschKincaidGrade} (US grade level)</p>
                </div>
              )}

              {options.showWordFreq && analysis.wordFreq.length > 0 && (
                <div>
                  <p className="font-medium">Top {options.topN} Words:</p>
                  <ul className="list-disc list-inside">
                    {analysis.wordFreq.map(([word, count], index) => (
                      <li key={index}>{word}: {count}</li>
                    ))}
                  </ul>
                </div>
              )}

              {options.showCharFreq && analysis.charFreq.length > 0 && (
                <div>
                  <p className="font-medium">Top {options.topN} Characters:</p>
                  <ul className="list-disc list-inside">
                    {analysis.charFreq.map(([char, count], index) => (
                      <li key={index}>{char}: {count}</li>
                    ))}
                  </ul>
                </div>
              )}

              {options.showSentenceLength && analysis.sentenceLengths.length > 0 && (
                <div>
                  <p className="font-medium">Sentence Lengths (words):</p>
                  <ul className="list-disc list-inside">
                    {analysis.sentenceLengths.map((length, index) => (
                      <li key={index}>Sentence {index + 1}: {length}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(analysis, null, 2))}
              className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Analysis (JSON)
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Analyses (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    "{entry.input.slice(0, 30)}{entry.input.length > 30 ? "..." : ""}" ({entry.output.wordCount} words)
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setAnalysis(entry.output);
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
            <li>Basic counts (chars, words, sentences)</li>
            <li>Readability scores (Flesch Reading Ease, Flesch-Kincaid)</li>
            <li>Word and character frequency analysis</li>
            <li>Additional stats (unique words, syllables)</li>
            <li>Sentence length distribution</li>
            <li>Export and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextAnalyzer;