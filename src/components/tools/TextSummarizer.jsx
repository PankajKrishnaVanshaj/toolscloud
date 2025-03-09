"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaCompress,
} from "react-icons/fa";

const TextSummarizer = () => {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    summaryLength: 3,
    ignoreCommonWords: true,
    minSentenceLength: 5,
    scoringMethod: "frequency", // frequency, position, length
    preserveOrder: false,       // Preserve original sentence order in summary
    includeKeywords: "",        // Comma-separated keywords to prioritize
  });

  const stopWords = [
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of",
    "with", "by", "from", "is", "are", "was", "were", "be", "this", "that",
    "it", "he", "she", "they", "you", "we", "as", "not",
  ];

  const summarizeText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to summarize" };
    }

    if (options.summaryLength < 1) {
      return { error: "Summary length must be at least 1 sentence" };
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).map(s => s.trim() + ".");
    if (sentences.length < options.summaryLength) {
      return { error: "Text has fewer sentences than the requested summary length" };
    }

    const wordFreq = {};
    const keywords = options.includeKeywords.split(",").map(k => k.trim().toLowerCase()).filter(k => k);
    sentences.forEach(sentence => {
      const words = sentence.split(/\s+/).filter(w => w.length > 0);
      words.forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/gi, "");
        if (cleanWord && (!options.ignoreCommonWords || !stopWords.includes(cleanWord))) {
          wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
        }
      });
    });

    const sentenceScores = sentences.map((sentence, index) => {
      const words = sentence.split(/\s+/).filter(w => w.length > 0);
      if (words.length < options.minSentenceLength) return { sentence, score: 0, index };

      let score = 0;
      switch (options.scoringMethod) {
        case "frequency":
          score = words.reduce((acc, word) => {
            const cleanWord = word.toLowerCase().replace(/[^a-z]/gi, "");
            const baseScore = wordFreq[cleanWord] || 0;
            const keywordBonus = keywords.includes(cleanWord) ? 5 : 0; // Bonus for keywords
            return acc + baseScore + keywordBonus;
          }, 0) / words.length;
          break;
        case "position":
          score = (sentences.length - index) / sentences.length; // Higher score for earlier sentences
          break;
        case "length":
          score = words.length; // Favor longer sentences
          break;
        default:
          score = 0;
      }

      return { sentence, score, index };
    });

    let summarySentences = sentenceScores
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, options.summaryLength);

    if (options.preserveOrder) {
      summarySentences = summarySentences.sort((a, b) => a.index - b.index);
    }

    if (summarySentences.length === 0) {
      return { error: "No sentences meet the criteria for summarization" };
    }

    return {
      original: text,
      summary: summarySentences.map(s => s.sentence).join(" "),
      sentenceCount: summarySentences.length,
      changes: getChanges(summarySentences.length),
    };
  };

  const getChanges = (sentenceCount) => {
    const changes = [`Summarized to ${sentenceCount} sentences`];
    changes.push(`Scoring method: ${options.scoringMethod}`);
    if (options.ignoreCommonWords) changes.push("Ignored common words");
    if (options.preserveOrder) changes.push("Preserved original order");
    if (options.includeKeywords) changes.push(`Prioritized keywords: ${options.includeKeywords}`);
    return changes;
  };

  const handleSummarize = useCallback(async () => {
    setError("");
    setSummary("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = summarizeText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setSummary(result.summary);
        setHistory(prev => [...prev, { input: inputText, output: result.summary, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setSummary("");
    setError("");
    setOptions({
      summaryLength: 3,
      ignoreCommonWords: true,
      minSentenceLength: 5,
      scoringMethod: "frequency",
      preserveOrder: false,
      includeKeywords: "",
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, value) : value,
    }));
  };

  const exportSummary = () => {
    const content = `Original Text:\n${inputText}\n\nSummary:\n${summary}\n\nChanges:\n${summarizeText(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "text_summary.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Summarizer
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
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-48 resize-y transition-all"
              placeholder="e.g., The quick brown fox jumps over the lazy dog. This is a test sentence. Another sentence here."
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Summarization Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Summary Length (sentences):</label>
                <input
                  type="number"
                  value={options.summaryLength}
                  onChange={(e) => handleOptionChange("summaryLength", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Scoring Method:</label>
                <select
                  value={options.scoringMethod}
                  onChange={(e) => handleOptionChange("scoringMethod", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="frequency">Word Frequency</option>
                  <option value="position">Sentence Position</option>
                  <option value="length">Sentence Length</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prioritize Keywords (comma-separated):</label>
                <input
                  type="text"
                  value={options.includeKeywords}
                  onChange={(e) => handleOptionChange("includeKeywords", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., fox, test"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.ignoreCommonWords}
                    onChange={() => handleOptionChange("ignoreCommonWords", !options.ignoreCommonWords)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Ignore Common Words</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.preserveOrder}
                    onChange={() => handleOptionChange("preserveOrder", !options.preserveOrder)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Preserve Order</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleSummarize}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              <FaCompress className="inline mr-2" />
              {isLoading ? "Summarizing..." : "Summarize Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {summary && (
              <button
                onClick={exportSummary}
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
        {summary && (
          <div className="mt-8 p-6 bg-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Summary ({summarizeText(inputText).sentenceCount} sentences)
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap max-h-64 overflow-auto">
              {summary}
            </p>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {summarizeText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(summary)}
              className="mt-4 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Summary
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Summaries (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    "{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}"
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setSummary(entry.output);
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
            <li>Customizable summary length and sentence criteria</li>
            <li>Multiple scoring methods: frequency, position, length</li>
            <li>Ignore common words and prioritize keywords</li>
            <li>Preserve sentence order option</li>
            <li>Export summary and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextSummarizer;