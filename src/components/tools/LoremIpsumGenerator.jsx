"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaCheck, FaTrash, FaFileAlt, FaHistory, FaUndo, FaDownload } from "react-icons/fa";

const generateLoremIpsum = (paragraphs, wordsPerParagraph, sentencesPerParagraph, style) => {
  const loremBase =
    "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum";

  const loremWords = loremBase.split(" ");

  const getRandomWord = () => loremWords[Math.floor(Math.random() * loremWords.length)];

  const generateSentence = (wordCount) => {
    let sentence = Array.from({ length: wordCount }, getRandomWord).join(" ");
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
  };

  return Array.from({ length: paragraphs })
    .map(() => {
      const sentences = Array.from(
        { length: sentencesPerParagraph || Math.floor(Math.random() * 3) + 1 }, // Random if 0
        () => generateSentence(Math.floor(wordsPerParagraph / (sentencesPerParagraph || 1)))
      ).join(" ");

      let paragraph = sentences;
      if (style === "uppercase") paragraph = paragraph.toUpperCase();
      else if (style === "lowercase") paragraph = paragraph.toLowerCase();

      return paragraph;
    })
    .join("\n\n");
};

const LoremIpsumGenerator = () => {
  const [text, setText] = useState("");
  const [paragraphs, setParagraphs] = useState(2);
  const [words, setWords] = useState(50);
  const [sentences, setSentences] = useState(0); // 0 for random
  const [style, setStyle] = useState("normal"); // normal, uppercase, lowercase
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const generateText = useCallback(() => {
    const newText = generateLoremIpsum(paragraphs, words, sentences, style);
    setText(newText);
    setCopied(false);
    setHistory((prev) => [
      ...prev,
      { text: newText, options: { paragraphs, words, sentences, style } },
    ].slice(-5));
  }, [paragraphs, words, sentences, style]);

  const copyToClipboard = () => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const clearText = () => {
    setText("");
    setCopied(false);
  };

  const downloadText = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lorem-ipsum-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreFromHistory = (entry) => {
    setText(entry.text);
    setParagraphs(entry.options.paragraphs);
    setWords(entry.options.words);
    setSentences(entry.options.sentences);
    setStyle(entry.options.style);
    setCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Lorem Ipsum Generator
        </h1>

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paragraphs (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={paragraphs}
                onChange={(e) => setParagraphs(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Words per Paragraph (5-1500)
              </label>
              <input
                type="number"
                min="5"
                max="1500"
                value={words}
                onChange={(e) => setWords(Math.max(5, Math.min(1500, Number(e.target.value) || 5)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sentences per Paragraph (0 for random)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={sentences}
                onChange={(e) => setSentences(Math.max(0, Math.min(10, Number(e.target.value) || 0)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Style Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="uppercase">Uppercase</option>
              <option value="lowercase">Lowercase</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateText}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaFileAlt className="mr-2" />
              Generate Text
            </button>
            {text && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md text-white transition-colors font-medium flex items-center justify-center ${
                    copied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  {copied ? <FaCheck className="mr-2" /> : <FaCopy className="mr-2" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadText}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearText}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Output Text */}
        {text && (
          <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50 max-h-80 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-gray-700">{text}</pre>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Generations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.options.paragraphs} paras, {entry.options.words} words,{" "}
                    {entry.options.sentences || "random"} sentences
                  </span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
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
            <li>Custom paragraphs, words, and sentences</li>
            <li>Text style options (normal, uppercase, lowercase)</li>
            <li>Copy, download, and track history</li>
            <li>Responsive design for all devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoremIpsumGenerator;