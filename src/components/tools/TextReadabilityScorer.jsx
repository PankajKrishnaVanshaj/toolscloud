"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaBook,
} from "react-icons/fa";

const TextReadabilityScorer = () => {
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    detailedBreakdown: false,     // Show word/sentence details
    customSyllableThreshold: 3,   // Threshold for complex words
    minSentenceLength: 1,         // Min words for a sentence to count
    includeStats: true,           // Include basic stats in output
  });

  const calculateReadability = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to analyze" };
    }

    const words = text.match(/\b\w+\b/g) || [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().split(/\s+/).length >= options.minSentenceLength);
    const syllables = words.reduce((count, word) => count + countSyllables(word), 0);

    const wordCount = words.length;
    const sentenceCount = sentences.length || 1; // Ensure at least 1 to avoid division by zero
    const syllableCount = syllables;

    if (wordCount < 1) {
      return { error: "Text must contain at least one word" };
    }

    const fleschReadingEase = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
    const fleschKincaidGrade = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;
    const complexWords = words.filter(word => countSyllables(word) >= options.customSyllableThreshold).length;
    const gunningFog = 0.4 * ((wordCount / sentenceCount) + 100 * (complexWords / wordCount));
    const smogIndex = 1.043 * Math.sqrt(complexWords * (30 / sentenceCount)) + 3.1291;

    const result = {
      wordCount,
      sentenceCount,
      syllableCount,
      complexWords,
      scores: {
        fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
        fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
        gunningFog: Math.round(gunningFog * 10) / 10,
        smogIndex: Math.round(smogIndex * 10) / 10,
      },
    };

    if (options.detailedBreakdown) {
      result.details = {
        words: words.map(word => ({ word, syllables: countSyllables(word) })),
        sentences: sentences.map(s => s.trim()),
      };
    }

    return result;
  };

  const countSyllables = (word) => {
    word = word.toLowerCase();
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
    setResults(null);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const analysis = calculateReadability(inputText);

      if (analysis.error) {
        setError(analysis.error);
      } else {
        setResults(analysis);
        setHistory(prev => [...prev, { input: inputText, results: analysis, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setResults(null);
    setError("");
    setOptions({
      detailedBreakdown: false,
      customSyllableThreshold: 3,
      minSentenceLength: 1,
      includeStats: true,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, value) : value,
    }));
  };

  const exportResults = () => {
    const content = [
      `Input Text:\n${inputText}`,
      options.includeStats && `Basic Statistics:\nWords: ${results.wordCount}\nSentences: ${results.sentenceCount}\nSyllables: ${results.syllableCount}\nComplex Words: ${results.complexWords}`,
      `Readability Scores:\nFlesch Reading Ease: ${results.scores.fleschReadingEase}\nFlesch-Kincaid Grade: ${results.scores.fleschKincaidGrade}\nGunning Fog: ${results.scores.gunningFog}\nSMOG Index: ${results.scores.smogIndex}`,
      options.detailedBreakdown && `Detailed Breakdown:\nWords:\n${results.details.words.map(w => `${w.word}: ${w.syllables}`).join("\n")}\nSentences:\n${results.details.sentences.join("\n")}`,
    ].filter(Boolean).join("\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `readability_analysis_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full ">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Text Readability Scorer
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 sm:h-48 resize-y transition-all"
              placeholder="e.g., The quick brown fox jumps over the lazy dog."
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Analysis Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min Sentence Length (words):</label>
                <input
                  type="number"
                  value={options.minSentenceLength}
                  onChange={(e) => handleOptionChange("minSentenceLength", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Complex Word Syllable Threshold:</label>
                <input
                  type="number"
                  value={options.customSyllableThreshold}
                  onChange={(e) => handleOptionChange("customSyllableThreshold", parseInt(e.target.value) || 3)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                />
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.detailedBreakdown}
                  onChange={() => handleOptionChange("detailedBreakdown", !options.detailedBreakdown)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Detailed Breakdown</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.includeStats}
                  onChange={() => handleOptionChange("includeStats", !options.includeStats)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Include Stats in Export</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <FaBook className="inline mr-2" />
              {isLoading ? "Analyzing..." : "Analyze"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {results && (
              <button
                onClick={exportResults}
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

        {/* Results Display */}
        {results && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">Readability Analysis</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.includeStats && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Basic Statistics:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>Words: {results.wordCount}</li>
                    <li>Sentences: {results.sentenceCount}</li>
                    <li>Syllables: {results.syllableCount}</li>
                    <li>Complex Words: {results.complexWords}</li>
                  </ul>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Readability Scores:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>Flesch Reading Ease: {results.scores.fleschReadingEase} (0-100)</li>
                  <li>Flesch-Kincaid Grade: {results.scores.fleschKincaidGrade}</li>
                  <li>Gunning Fog: {results.scores.gunningFog}</li>
                  <li>SMOG Index: {results.scores.smogIndex}</li>
                </ul>
              </div>
            </div>
            {options.detailedBreakdown && (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Word Breakdown:</p>
                  <div className="max-h-40 overflow-y-auto text-sm text-gray-700">
                    <ul className="list-disc list-inside">
                      {results.details.words.map((w, i) => (
                        <li key={i}>{w.word}: {w.syllables} syllables</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Sentences:</p>
                  <div className="max-h-40 overflow-y-auto text-sm text-gray-700">
                    <ul className="list-decimal list-inside">
                      {results.details.sentences.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Interpretation:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Flesch Reading Ease: Higher = easier (60-70 average)</li>
                <li>Grade Levels: US grade level needed to understand</li>
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(
                `Words: ${results.wordCount}\nSentences: ${results.sentenceCount}\nSyllables: ${results.syllableCount}\nFlesch Reading Ease: ${results.scores.fleschReadingEase}\nFlesch-Kincaid Grade: ${results.scores.fleschKincaidGrade}\nGunning Fog: ${results.scores.gunningFog}\nSMOG Index: ${results.scores.smogIndex}`
              )}
              className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Results
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
                    "{entry.input.slice(0, 20)}..." (Flesch: {entry.results.scores.fleschReadingEase})
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setResults(entry.results);
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
            <li>Multiple readability metrics (Flesch, Gunning Fog, SMOG)</li>
            <li>Customizable sentence length and complex word threshold</li>
            <li>Detailed word and sentence breakdown</li>
            <li>Exportable results with history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextReadabilityScorer;