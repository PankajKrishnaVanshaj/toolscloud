"use client";

import { useState, useEffect } from "react";
import { FaCopy, FaTrash, FaFileExport } from "react-icons/fa";

const findDuplicates = (text) => {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  const characters = text.replace(/\s+/g, "").length;

  const wordMap = {};
  const sentenceMap = {};

  words.forEach((word) => {
    wordMap[word] = (wordMap[word] || 0) + 1;
  });

  sentences.forEach((sentence) => {
    const trimmedSentence = sentence.trim();
    sentenceMap[trimmedSentence] = (sentenceMap[trimmedSentence] || 0) + 1;
  });

  const duplicateWords = Object.entries(wordMap).filter(
    ([_, count]) => count > 1
  );
  const duplicateSentences = Object.entries(sentenceMap).filter(
    ([_, count]) => count > 1
  );
  const frequentWords = Object.entries(wordMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5 most frequent words

  return {
    duplicateWords,
    duplicateSentences,
    wordCount: words.length,
    sentenceCount: sentences.length,
    characterCount: characters,
    frequentWords,
  };
};

const calculateReadingTime = (wordCount) => {
  const wordsPerMinute = 200;
  return (wordCount / wordsPerMinute).toFixed(2);
};

const TextDuplicatorChecker = () => {
  const [text, setText] = useState("");
  const [stats, setStats] = useState({
    duplicateWords: [],
    duplicateSentences: [],
    wordCount: 0,
    sentenceCount: 0,
    characterCount: 0,
    frequentWords: [],
  });

  useEffect(() => {
    setStats(findDuplicates(text));
  }, [text]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    alert("Text copied to clipboard!");
  };

  const clearText = () => {
    setText("");
    setStats({
      duplicateWords: [],
      duplicateSentences: [],
      wordCount: 0,
      sentenceCount: 0,
      characterCount: 0,
      frequentWords: [],
    });
  };

  const exportTextFile = () => {
    let exportContent = `Text Content:\n${text}\n\n`;

    if (stats.duplicateWords.length > 0) {
      exportContent += "Duplicate Words:\n";
      stats.duplicateWords.forEach(([word, count]) => {
        exportContent += ` "${word}" appears ${count} times\n`;
      });
      exportContent += "\n";
    }

    if (stats.duplicateSentences.length > 0) {
      exportContent += "Duplicate Sentences:\n";
      stats.duplicateSentences.forEach(([sentence, count]) => {
        exportContent += ` "${sentence}" appears ${count} times\n`;
      });
      exportContent += "\n";
    }

    if (stats.frequentWords.length > 0) {
      exportContent += "Top 5 Frequent Words:\n";
      stats.frequentWords.forEach(([word, count]) => {
        exportContent += ` "${word}" appears ${count} times\n`;
      });
      exportContent += "\n";
    }

    exportContent += `Word Count: ${stats.wordCount}\n`;
    exportContent += `Sentence Count: ${stats.sentenceCount}\n`;
    exportContent += `Character Count (excluding spaces): ${stats.characterCount}\n`;
    exportContent += `Estimated Reading Time: ${calculateReadingTime(
      stats.wordCount
    )} min\n`;

    const blob = new Blob([exportContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "text_analysis.txt";
    link.click();
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-2xl">
      {/* Textarea */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Type or paste text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      {/* Buttons */}
      <div className="flex gap-3 mt-3">
        <button
          className="flex-1 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text px-4 py-2 shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={copyToClipboard}
        >
          <FaCopy className="inline mr-2 text-secondary" /> Copy
        </button>
        <button
          className="flex-1 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text px-4 py-2 shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={exportTextFile}
        >
          <FaFileExport className="inline mr-2 text-secondary" /> Export
        </button>
        <button
          className="flex-1 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text px-4 py-2 shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={clearText}
        >
          <FaTrash className="inline mr-2 text-secondary" /> Clear
        </button>
      </div>

      {/* Word, Sentence & Character Count */}
      <div className="flex flex-wrap justify-between gap-3 mt-3 p-3 border rounded-lg bg-gray-50 text-secondary">
        <p>
          📌 Word Count:{" "}
          <strong className="text-primary">{stats.wordCount}</strong>
        </p>
        <p>
          📌 Sentence Count:{" "}
          <strong className="text-primary">{stats.sentenceCount}</strong>
        </p>
        <p>
          📌 Character Count (excluding spaces):{" "}
          <strong className="text-primary">{stats.characterCount}</strong>
        </p>
        <p>
          📖 Estimated Reading Time:{" "}
          <strong className="text-primary">
            {calculateReadingTime(stats.wordCount)} min
          </strong>
        </p>
      </div>

      {/* Most Frequent Words */}
      {stats.frequentWords.length > 0 && (
        <div className="mt-3 p-3 border rounded-lg bg-yellow-100">
          <h3 className="font-semibold">Top 5 Frequent Words:</h3>
          <ul className="list-disc ml-5">
            {stats.frequentWords.map(([word, count], index) => (
              <li key={index}>
                "{word}" appears <strong>{count}</strong> times
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Duplicate Words */}
      {stats.duplicateWords.length > 0 && (
        <div className="mt-3 p-3 border rounded-lg bg-red-100">
          <h3 className="font-semibold">Duplicate Words Found:</h3>
          <ul className="list-disc ml-5">
            {stats.duplicateWords.map(([word, count], index) => (
              <li key={index}>
                "{word}" appears <strong>{count}</strong> times
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Duplicate Sentences */}
      {stats.duplicateSentences.length > 0 && (
        <div className="mt-3 p-3 border rounded-lg bg-orange-100">
          <h3 className="font-semibold">Duplicate Sentences Found:</h3>
          <ul className="list-disc ml-5">
            {stats.duplicateSentences.map(([sentence, count], index) => (
              <li key={index}>
                "{sentence}" appears <strong>{count}</strong> times
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No Duplicates */}
      {stats.duplicateWords.length === 0 &&
        stats.duplicateSentences.length === 0 &&
        text && (
          <div className="mt-3 p-3 border rounded-lg bg-green-100">
            ✅ No duplicates found!
          </div>
        )}
    </div>
  );
};

export default TextDuplicatorChecker;
