"use client";

import { useState } from "react";

const WordCharacterCounter = () => {
  const [text, setText] = useState("");

  const trimmedText = text.trim();
  const words = trimmedText.length === 0 ? [] : trimmedText.split(/\s+/);
  const sentences = trimmedText.split(/[.!?]+/).filter(Boolean);
  const paragraphs = trimmedText.split(/\n+/).filter(Boolean);

  const wordCount = words.length;
  const charCount = text.length; // Includes spaces
  const charCountNoSpaces = text.replace(/\s/g, "").length; // Excludes spaces
  const sentenceCount = sentences.length;
  const paragraphCount = paragraphs.length;

  // Average Word Length
  const avgWordLength =
    wordCount > 0 ? (charCountNoSpaces / wordCount).toFixed(2) : 0;

  // Reading & Speaking Time (Estimation)
  const readingTime = wordCount > 0 ? (wordCount / 200).toFixed(2) : "0"; // 200 wpm
  const speakingTime = wordCount > 0 ? (wordCount / 130).toFixed(2) : "0"; // 130 wpm

  // Longest Word
  const longestWord = words.reduce((longest, word) =>
    word.length > longest.length ? word : longest,
    ""
  );

  // Average Sentence Length
  const avgSentenceLength =
    sentenceCount > 0 ? (wordCount / sentenceCount).toFixed(2) : "0";

  // Most Frequent Word
  const wordFrequency = words.reduce((freq, word) => {
    word = word.toLowerCase().replace(/[^a-zA-Z]/g, ""); // Normalize words
    if (word) {
      freq[word] = (freq[word] || 0) + 1;
    }
    return freq;
  }, {});

  const mostFrequentWord =
    Object.keys(wordFrequency).length > 0
      ? Object.entries(wordFrequency).reduce((a, b) => (b[1] > a[1] ? b : a), [
          "",
          0,
        ])[0]
      : "N/A";

  // Unique Words Count
  const uniqueWordCount = new Set(words.map((word) => word.toLowerCase())).size;

  // Punctuation Count
  const punctuationCount = (text.match(/[.,!?;:"'(){}[\]]/g) || []).length;

  // Approximate Syllable Count (Basic Estimation)
  const syllableCount = words.reduce((count, word) => {
    let matches = word.match(/[aeiouy]+/gi);
    return count + (matches ? matches.length : 0);
  }, 0);

  // Flesch Reading Ease Score (Higher score = easier to read)
  const fleschScore =
    sentenceCount > 0 && wordCount > 0
      ? (
          206.835 -
          1.015 * (wordCount / sentenceCount) -
          84.6 * (syllableCount / wordCount)
        ).toFixed(2)
      : "0";

  return (
    <div className="mx-auto p-4 bg-white shadow-lg rounded-2xl">
      <div className="flex flex-wrap my-1 gap-1.5 text-secondary text-sm">
        <div className="bg-gray-100 px-3 py-1 rounded-md text-center">
          <span className="font-medium">Words:</span>{" "}
          <strong className="text-primary">{wordCount}</strong>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-md text-center">
          <span className="font-medium">Characters (with spaces):</span>{" "}
          <strong className="text-primary">{charCount}</strong>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-md text-center">
          <span className="font-medium">Characters (without spaces):</span>{" "}
          <strong className="text-primary">{charCountNoSpaces}</strong>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-md text-center">
          <span className="font-medium">Sentences:</span>{" "}
          <strong className="text-primary">{sentenceCount}</strong>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-md text-center">
          <span className="font-medium">Paragraphs:</span>{" "}
          <strong className="text-primary">{paragraphCount}</strong>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-md text-center">
          <span className="font-medium">Avg. Word Length:</span>{" "}
          <strong className="text-primary">{avgWordLength}</strong>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-md text-center">
          <span className="font-medium">Avg. Sentence Length:</span>{" "}
          <strong className="text-primary">{avgSentenceLength}</strong>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-md text-center">
          <span className="font-medium">Reading Time (min):</span>{" "}
          <strong className="text-primary">{readingTime}</strong>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-md text-center">
          <span className="font-medium">Speaking Time (min):</span>{" "}
          <strong className="text-primary">{speakingTime}</strong>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-md text-center">
          <span className="font-medium">Longest Word:</span>{" "}
          <strong className="text-primary">{longestWord || "N/A"}</strong>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-md text-center">
          <span className="font-medium">Most Frequent Word:</span>{" "}
          <strong className="text-primary">{mostFrequentWord}</strong>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-md text-center">
          <span className="font-medium">Unique Words:</span>{" "}
          <strong className="text-primary">{uniqueWordCount}</strong>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-md text-center">
          <span className="font-medium">Punctuation Count:</span>{" "}
          <strong className="text-primary">{punctuationCount}</strong>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-md text-center">
          <span className="font-medium">Syllables:</span>{" "}
          <strong className="text-primary">{syllableCount}</strong>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-md text-center">
          <span className="font-medium">Flesch Score:</span>{" "}
          <strong className="text-primary">{fleschScore}</strong>
        </div>
      </div>

      <textarea
        className="w-full h-56 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type or paste text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
    </div>
  );
};

export default WordCharacterCounter;
