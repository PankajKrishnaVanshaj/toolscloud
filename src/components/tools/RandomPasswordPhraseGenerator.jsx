"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaLock } from "react-icons/fa";

const RandomPasswordPhraseGenerator = () => {
  const [passphrase, setPassphrase] = useState("");
  const [wordCount, setWordCount] = useState(4);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecial, setIncludeSpecial] = useState(true);
  const [separator, setSeparator] = useState(""); // New: Separator option
  const [strengthLevel, setStrengthLevel] = useState("medium"); // New: Strength level
  const [history, setHistory] = useState([]); // New: History of generated passphrases

  const words = {
    simple: [
      "cat", "dog", "bird", "fish", "sun", "moon", "star", "tree", "lake", "hill",
    ],
    medium: [
      "apple", "bear", "cloud", "dragon", "eagle", "forest", "ghost", "hammer",
      "island", "jazz", "kitten", "lemon", "mountain", "ninja", "ocean", "panda",
      "queen", "river", "shadow", "tiger",
    ],
    complex: [
      "aberration", "benevolent", "catastrophe", "dichotomy", "ephemeral",
      "fortitude", "gregarious", "hierarchy", "incongruous", "juxtaposition",
    ],
  };

  const specialChars = "!@#$%^&*+-=";
  const separators = ["", "-", "_", ".", " "];

  const generatePassphrase = useCallback(() => {
    const wordList = words[strengthLevel];
    let newPassphrase = [];

    // Generate words
    for (let i = 0; i < wordCount; i++) {
      const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      const capitalizedWord = randomWord.charAt(0).toUpperCase() + randomWord.slice(1);
      newPassphrase.push(capitalizedWord);
    }

    // Add number(s) based on strength level
    if (includeNumbers) {
      const numCount = strengthLevel === "simple" ? 1 : strengthLevel === "medium" ? 2 : 3;
      for (let i = 0; i < numCount; i++) {
        newPassphrase.push(Math.floor(Math.random() * 100).toString());
      }
    }

    // Add special character(s) based on strength level
    if (includeSpecial) {
      const specialCount = strengthLevel === "simple" ? 1 : strengthLevel === "medium" ? 2 : 3;
      for (let i = 0; i < specialCount; i++) {
        newPassphrase.push(specialChars[Math.floor(Math.random() * specialChars.length)]);
      }
    }

    // Shuffle array for randomness
    for (let i = newPassphrase.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPassphrase[i], newPassphrase[j]] = [newPassphrase[j], newPassphrase[i]];
    }

    const finalPassphrase = newPassphrase.join(separator);
    setPassphrase(finalPassphrase);
    setHistory((prev) => [finalPassphrase, ...prev.slice(0, 4)]); // Keep last 5 in history
  }, [wordCount, includeNumbers, includeSpecial, separator, strengthLevel]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(passphrase);
    alert("Passphrase copied to clipboard!");
  };

  const reset = () => {
    setPassphrase("");
    setWordCount(4);
    setIncludeNumbers(true);
    setIncludeSpecial(true);
    setSeparator("");
    setStrengthLevel("medium");
    setHistory([]);
  };

  // Calculate passphrase strength (simple entropy estimate)
  const getStrength = () => {
    const length = passphrase.length;
    const hasNumbers = /\d/.test(passphrase);
    const hasSpecial = /[!@#$%^&*+=-]/.test(passphrase);
    let score = length * 4;
    if (hasNumbers) score += 10;
    if (hasSpecial) score += 10;
    if (strengthLevel === "complex") score += 20;

    if (score < 50) return { text: "Weak", color: "text-red-500" };
    if (score < 80) return { text: "Moderate", color: "text-yellow-500" };
    return { text: "Strong", color: "text-green-500" };
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Password Phrase Generator
        </h1>

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Words (2-6)
              </label>
              <input
                type="number"
                value={wordCount}
                onChange={(e) =>
                  setWordCount(Math.max(2, Math.min(6, Number(e.target.value))))
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="2"
                max="6"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Strength Level
              </label>
              <select
                value={strengthLevel}
                onChange={(e) => setStrengthLevel(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="simple">Simple</option>
                <option value="medium">Medium</option>
                <option value="complex">Complex</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Separator
              </label>
              <select
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {separators.map((sep) => (
                  <option key={sep} value={sep}>
                    {sep === "" ? "None" : sep}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="mr-2 accent-blue-500"
              />
              Include Numbers
            </label>
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={includeSpecial}
                onChange={(e) => setIncludeSpecial(e.target.checked)}
                className="mr-2 accent-blue-500"
              />
              Include Special Characters
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generatePassphrase}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaLock className="mr-2" /> Generate Passphrase
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Result */}
        {passphrase && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-lg font-mono text-gray-800 break-all mb-3">{passphrase}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={copyToClipboard}
                className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <FaCopy className="mr-2" /> Copy
              </button>
            </div>
            <p className={`text-sm mt-2 ${getStrength().color}`}>
              Strength: {getStrength().text}
            </p>
          </div>
        )}

        {!passphrase && (
          <div className="text-center p-6 bg-gray-50 rounded-lg mt-6">
            <p className="text-gray-500 italic">
              Generate a secure passphrase to get started!
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Recent Passphrases</h3>
            <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
              {history.map((item, index) => (
                <li key={index} className="font-mono break-all">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable word count, separators, and strength levels</li>
            <li>Optional numbers and special characters</li>
            <li>Passphrase strength indicator</li>
            <li>History of recent passphrases</li>
            <li>Copy to clipboard functionality</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Tip: Use complex words and separators for stronger, more memorable passphrases!
        </p>
      </div>
    </div>
  );
};

export default RandomPasswordPhraseGenerator;