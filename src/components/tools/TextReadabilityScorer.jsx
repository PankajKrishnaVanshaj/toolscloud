"use client";
import React, { useState } from "react";

const TextReadabilityScorer = () => {
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate readability scores
  const calculateReadability = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to analyze" };
    }

    // Basic text analysis
    const words = text.match(/\b\w+\b/g) || [];
    const sentences = text.match(/[.!?]+/g) || [];
    const syllables = words.reduce((count, word) => {
      return count + countSyllables(word);
    }, 0);

    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const syllableCount = syllables;

    if (wordCount < 1 || sentenceCount < 1) {
      return { error: "Text must contain at least one sentence" };
    }

    // Flesch-Kincaid Reading Ease (higher = easier)
    const fleschReadingEase = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);

    // Flesch-Kincaid Grade Level
    const fleschKincaidGrade = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;

    // Gunning Fog Index
    const complexWords = words.filter(word => countSyllables(word) >= 3).length;
    const gunningFog = 0.4 * ((wordCount / sentenceCount) + 100 * (complexWords / wordCount));

    // SMOG Index
    const smogIndex = 1.043 * Math.sqrt(words.filter(word => countSyllables(word) >= 3).length * (30 / sentenceCount)) + 3.1291;

    return {
      wordCount,
      sentenceCount,
      syllableCount,
      scores: {
        fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
        fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
        gunningFog: Math.round(gunningFog * 10) / 10,
        smogIndex: Math.round(smogIndex * 10) / 10,
      },
    };
  };

  // Helper function to count syllables in a word
  const countSyllables = (word) => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    // Simple syllable counting algorithm
    let syllables = 0;
    const vowels = "aeiouy";
    let prevCharWasVowel = false;

    for (let char of word) {
      const isVowel = vowels.includes(char);
      if (isVowel && !prevCharWasVowel) syllables++;
      prevCharWasVowel = isVowel;
    }

    // Adjustments
    if (word.endsWith("e")) syllables--;
    return Math.max(1, syllables);
  };

  const handleAnalyze = async () => {
    setError("");
    setResults(null);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const analysis = calculateReadability(inputText);

      if (analysis.error) {
        setError(analysis.error);
        return;
      }

      setResults(analysis);
    } catch (err) {
      setError("An error occurred while analyzing the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setResults(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Readability Scorer
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
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
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
              {isLoading ? "Analyzing..." : "Analyze"}
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

        {/* Results Display */}
        {results && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Readability Analysis
            </h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Stats */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Basic Statistics:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>Words: {results.wordCount}</li>
                  <li>Sentences: {results.sentenceCount}</li>
                  <li>Syllables: {results.syllableCount}</li>
                </ul>
              </div>

              {/* Readability Scores */}
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

            {/* Interpretation */}
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Interpretation:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Flesch Reading Ease: Higher scores = easier to read (60-70 is average)</li>
                <li>Grade Levels: Approximate US grade level needed to understand</li>
              </ul>
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextReadabilityScorer;