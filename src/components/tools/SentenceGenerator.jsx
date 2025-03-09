"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const SentenceGenerator = () => {
  const [sentences, setSentences] = useState([]);
  const [count, setCount] = useState(5);
  const [complexity, setComplexity] = useState("simple"); // simple, medium, complex
  const [category, setCategory] = useState("general"); // general, tech, fantasy, humor
  const [tone, setTone] = useState("neutral"); // neutral, formal, casual, dramatic
  const [maxLength, setMaxLength] = useState(0); // 0 for unlimited, otherwise max words
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);

  // Word banks for different categories
  const wordBanks = {
    general: {
      subjects: ["The cat", "A dog", "People", "The sun", "Birds"],
      verbs: ["runs", "jumps", "sings", "shines", "flies"],
      objects: ["quickly", "happily", "loudly", "brightly", "high"],
      extras: ["in the park", "today", "with joy", "all day", "nearby"],
    },
    tech: {
      subjects: ["The system", "A developer", "Computers", "The network", "Code"],
      verbs: ["processes", "codes", "connects", "runs", "compiles"],
      objects: ["data", "quickly", "efficiently", "smoothly", "fast"],
      extras: ["in the cloud", "on the server", "through the API", "with bugs", "daily"],
    },
    fantasy: {
      subjects: ["The dragon", "A wizard", "Elves", "The kingdom", "Ghosts"],
      verbs: ["flies", "casts", "dances", "reigns", "haunts"],
      objects: ["magically", "powerfully", "gracefully", "mightily", "silently"],
      extras: ["in the forest", "under the moon", "with magic", "beyond the hills", "at night"],
    },
    humor: {
      subjects: ["The clown", "A chicken", "My boss", "The cat", "Zombies"],
      verbs: ["trips", "crosses", "yells", "sleeps", "shuffles"],
      objects: ["hilariously", "slowly", "loudly", "quietly", "awkwardly"],
      extras: ["in the office", "on the road", "with a banana", "all the time", "for no reason"],
    },
  };

  // Tone modifiers
  const toneModifiers = {
    neutral: { prefix: "", suffix: "" },
    formal: { prefix: "It is noted that", suffix: "accordingly" },
    casual: { prefix: "Hey,", suffix: "you know" },
    dramatic: { prefix: "Behold!", suffix: "in a blaze of glory" },
  };

  const generateSentence = useCallback(() => {
    const bank = wordBanks[category];
    const toneMod = toneModifiers[tone];
    const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

    let sentence;
    switch (complexity) {
      case "simple":
        sentence = `${randomItem(bank.subjects)} ${randomItem(bank.verbs)}.`;
        break;
      case "medium":
        sentence = `${randomItem(bank.subjects)} ${randomItem(bank.verbs)} ${randomItem(bank.objects)}.`;
        break;
      case "complex":
        sentence = `${randomItem(bank.subjects)} ${randomItem(bank.verbs)} ${randomItem(bank.objects)} ${randomItem(bank.extras)}.`;
        break;
      default:
        sentence = `${randomItem(bank.subjects)} ${randomItem(bank.verbs)}.`;
    }

    // Apply tone
    sentence = `${toneMod.prefix} ${sentence.slice(0, -1)} ${toneMod.suffix}.`.trim();

    // Apply max length
    if (maxLength > 0) {
      const words = sentence.split(" ");
      sentence = words.slice(0, maxLength).join(" ") + (words.length > maxLength ? "..." : ".");
    }

    return sentence.charAt(0).toUpperCase() + sentence.slice(1); // Capitalize first letter
  }, [category, complexity, tone, maxLength]);

  const generateSentences = useCallback(() => {
    const newSentences = Array.from({ length: Math.min(count, 100) }, generateSentence);
    setSentences(newSentences);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { sentences: newSentences, options: { count, complexity, category, tone, maxLength } },
    ].slice(-5));
  }, [count, complexity, category, tone, maxLength, generateSentence]);

  const copyToClipboard = () => {
    const text = sentences.join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = sentences.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sentences-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearSentences = () => {
    setSentences([]);
    setIsCopied(false);
  };

  const restoreFromHistory = (entry) => {
    setSentences(entry.sentences);
    setCount(entry.options.count);
    setComplexity(entry.options.complexity);
    setCategory(entry.options.category);
    setTone(entry.options.tone);
    setMaxLength(entry.options.maxLength);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Advanced Sentence Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Sentences (1-100)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complexity
              </label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="simple">Simple (Subject + Verb)</option>
                <option value="medium">Medium (Subject + Verb + Object)</option>
                <option value="complex">Complex (Subject + Verb + Object + Extra)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="tech">Technology</option>
                <option value="fantasy">Fantasy</option>
                <option value="humor">Humor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="neutral">Neutral</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="dramatic">Dramatic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Words (0 for unlimited)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={maxLength}
                onChange={(e) => setMaxLength(Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateSentences}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDownload className="mr-2" />
              Generate Sentences
            </button>
            {sentences.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsText}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearSentences}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Generated Sentences */}
        {sentences.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 text-center">
              Generated Sentences ({sentences.length}):
            </h2>
            <div className="mt-3 bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-y-auto">
              <ul className="list-decimal list-inside text-gray-700 space-y-2">
                {sentences.map((sentence, index) => (
                  <li key={index}>{sentence}</li>
                ))}
              </ul>
            </div>
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
                    {entry.sentences.length} sentences ({entry.options.complexity}, {entry.options.category}, {entry.options.tone})
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
            <li>Generate simple, medium, or complex sentences</li>
            <li>Categories: General, Tech, Fantasy, Humor</li>
            <li>Tone options: Neutral, Formal, Casual, Dramatic</li>
            <li>Control max sentence length</li>
            <li>Copy, download, and track history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SentenceGenerator;