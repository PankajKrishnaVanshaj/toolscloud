"use client";
import React, { useState } from "react";

const TextSummarizer = () => {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    summaryLength: 3,       // Number of sentences in summary
    ignoreCommonWords: true, // Ignore stop words in scoring
    minSentenceLength: 5,   // Minimum words per sentence to consider
  });

  // Common stop words to ignore (simplified list)
  const stopWords = [
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of",
    "with", "by", "from", "is", "are", "was", "were", "be", "this", "that",
  ];

  // Summarize text based on options
  const summarizeText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to summarize" };
    }

    if (options.summaryLength < 1) {
      return { error: "Summary length must be at least 1 sentence" };
    }

    // Split into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).map(s => s.trim() + ".");

    if (sentences.length < options.summaryLength) {
      return { error: "Text has fewer sentences than the requested summary length" };
    }

    // Calculate word frequency
    const wordFreq = {};
    sentences.forEach(sentence => {
      const words = sentence.split(/\s+/).filter(w => w.length > 0);
      words.forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/gi, "");
        if (cleanWord && (!options.ignoreCommonWords || !stopWords.includes(cleanWord))) {
          wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
        }
      });
    });

    // Score sentences based on word frequency
    const sentenceScores = sentences.map(sentence => {
      const words = sentence.split(/\s+/).filter(w => w.length >= options.minSentenceLength);
      if (words.length < options.minSentenceLength) return { sentence, score: 0 };
      const score = words.reduce((acc, word) => {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/gi, "");
        return acc + (wordFreq[cleanWord] || 0);
      }, 0) / words.length; // Normalize by sentence length
      return { sentence, score };
    });

    // Sort sentences by score and take top N
    const summarySentences = sentenceScores
      .filter(s => s.score > 0) // Exclude low-scoring sentences
      .sort((a, b) => b.score - a.score)
      .slice(0, options.summaryLength)
      .map(s => s.sentence);

    if (summarySentences.length === 0) {
      return { error: "No sentences meet the criteria for summarization" };
    }

    return {
      original: text,
      summary: summarySentences.join(" "),
      sentenceCount: summarySentences.length,
    };
  };

  const handleSummarize = async () => {
    setError("");
    setSummary("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
      const result = summarizeText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSummary(result.summary);
    } catch (err) {
      setError("An error occurred while summarizing the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setSummary("");
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
          Text Summarizer
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Summarize:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-40 resize-y transition-all"
              placeholder="e.g., The quick brown fox jumps over the lazy dog. This is a test sentence. Another sentence here."
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Summarization Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Summary Length (sentences):</label>
                <input
                  type="number"
                  value={options.summaryLength}
                  onChange={(e) => handleOptionChange("summaryLength", parseInt(e.target.value) || 1)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min Sentence Length (words):</label>
                <input
                  type="number"
                  value={options.minSentenceLength}
                  onChange={(e) => handleOptionChange("minSentenceLength", parseInt(e.target.value) || 1)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="50"
                />
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.ignoreCommonWords}
                  onChange={() => handleOptionChange("ignoreCommonWords", !options.ignoreCommonWords)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                />
                <span>Ignore Common Words</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleSummarize}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isLoading ? "Summarizing..." : "Summarize Text"}
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
        {summary && (
          <div className="mt-8 p-6 bg-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Summary
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap">
              {summary}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(summary)}
              className="mt-4 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold"
            >
              Copy Summary to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextSummarizer;