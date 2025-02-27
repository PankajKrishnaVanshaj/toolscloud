"use client";
import React, { useState } from "react";

const TextAnalyzer = () => {
  const [inputText, setInputText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    includeReadability: true,
    showWordFreq: true,
    showCharFreq: false,
    ignoreCase: true,
  });

  // Analyze text
  const analyzeText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to analyze" };
    }

    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chars = text.split("");

    // Basic counts
    const charCount = text.length;
    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const avgWordLength = wordCount > 0 ? (chars.filter(c => /[a-zA-Z]/.test(c)).length / wordCount).toFixed(2) : 0;

    // Word frequency
    const wordFreq = {};
    words.forEach(word => {
      const key = options.ignoreCase ? word.toLowerCase() : word;
      wordFreq[key] = (wordFreq[key] || 0) + 1;
    });
    const sortedWordFreq = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 10);

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
      .slice(0, 10);

    // Readability (Flesch Reading Ease)
    let readability = null;
    if (options.includeReadability && wordCount > 0 && sentenceCount > 0) {
      const syllables = words.reduce((count, word) => count + countSyllables(word), 0);
      readability = {
        fleschReadingEase: 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllables / wordCount),
      };
      readability.fleschReadingEase = Math.round(readability.fleschReadingEase * 10) / 10;
    }

    return {
      charCount,
      wordCount,
      sentenceCount,
      avgWordLength,
      wordFreq: sortedWordFreq,
      charFreq: sortedCharFreq,
      readability,
    };
  };

  // Simple syllable counting (approximation)
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

  const handleAnalyze = async () => {
    setError("");
    setAnalysis(null);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = analyzeText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setAnalysis(result);
    } catch (err) {
      setError("An error occurred while analyzing the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setAnalysis(null);
    setError("");
  };

  const handleOptionChange = (option) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Analyzer
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-y transition-all"
              placeholder="e.g., The quick brown fox jumps over the lazy dog."
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Analysis Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Analyzing..." : "Analyze Text"}
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

        {/* Analysis Display */}
        {analysis && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Text Analysis
            </h2>
            <div className="mt-4 text-gray-700 space-y-4">
              <div>
                <p><strong>Characters:</strong> {analysis.charCount}</p>
                <p><strong>Words:</strong> {analysis.wordCount}</p>
                <p><strong>Sentences:</strong> {analysis.sentenceCount}</p>
                <p><strong>Average Word Length:</strong> {analysis.avgWordLength}</p>
              </div>

              {options.includeReadability && analysis.readability && (
                <div>
                  <p className="font-medium">Readability:</p>
                  <p>Flesch Reading Ease: {analysis.readability.fleschReadingEase} (0-100, higher = easier)</p>
                </div>
              )}

              {options.showWordFreq && analysis.wordFreq.length > 0 && (
                <div>
                  <p className="font-medium">Top Words:</p>
                  <ul className="list-disc list-inside">
                    {analysis.wordFreq.map(([word, count], index) => (
                      <li key={index}>{word}: {count}</li>
                    ))}
                  </ul>
                </div>
              )}

              {options.showCharFreq && analysis.charFreq.length > 0 && (
                <div>
                  <p className="font-medium">Top Characters:</p>
                  <ul className="list-disc list-inside">
                    {analysis.charFreq.map(([char, count], index) => (
                      <li key={index}>{char}: {count}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(analysis, null, 2))}
              className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
            >
              Copy Analysis to Clipboard (JSON)
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextAnalyzer;