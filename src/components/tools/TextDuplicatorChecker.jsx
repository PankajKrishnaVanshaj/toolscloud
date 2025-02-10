"use client";

import { useState } from "react";

const findDuplicates = (text) => {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];

  const wordMap = {};
  const sentenceMap = {};

  words.forEach((word) => {
    wordMap[word] = (wordMap[word] || 0) + 1;
  });

  sentences.forEach((sentence) => {
    const trimmedSentence = sentence.trim();
    sentenceMap[trimmedSentence] = (sentenceMap[trimmedSentence] || 0) + 1;
  });

  const duplicateWords = Object.entries(wordMap).filter(([_, count]) => count > 1);
  const duplicateSentences = Object.entries(sentenceMap).filter(([_, count]) => count > 1);

  return { duplicateWords, duplicateSentences };
};

const TextDuplicatorChecker = () => {
  const [text, setText] = useState("");
  const [duplicates, setDuplicates] = useState({ duplicateWords: [], duplicateSentences: [] });

  const checkDuplicates = () => {
    setDuplicates(findDuplicates(text));
  };

  return (
    <div className="mx-auto p-5 bg-white shadow-lg rounded-2xl">

      {/* Textarea */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type or paste text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      {/* Check Button */}
      <button
        className="mt-3 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        onClick={checkDuplicates}
      >
        Check Duplicates
      </button>

      {/* Display Duplicate Words */}
      {duplicates.duplicateWords.length > 0 && (
        <div className="mt-3 p-3 border rounded-lg bg-red-100 text-red-700">
          <h3 className="font-semibold">Duplicate Words Found:</h3>
          <ul className="list-disc ml-5">
            {duplicates.duplicateWords.map(([word, count], index) => (
              <li key={index}>
                "{word}" appears <strong>{count}</strong> times
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Display Duplicate Sentences */}
      {duplicates.duplicateSentences.length > 0 && (
        <div className="mt-3 p-3 border rounded-lg bg-yellow-100 text-yellow-700">
          <h3 className="font-semibold">Duplicate Sentences Found:</h3>
          <ul className="list-disc ml-5">
            {duplicates.duplicateSentences.map(([sentence, count], index) => (
              <li key={index}>
                "{sentence}" appears <strong>{count}</strong> times
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Message */}
      {duplicates.duplicateWords.length === 0 && duplicates.duplicateSentences.length === 0 && text && (
        <div className="mt-3 p-3 border rounded-lg bg-green-100 text-green-700">
          ✅ No duplicates found!
        </div>
      )}
    </div>
  );
};

export default TextDuplicatorChecker;
