"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload, FaPlus } from "react-icons/fa";

const RandomPoetryLineGenerator = () => {
  const [poetryLines, setPoetryLines] = useState([]);
  const [mood, setMood] = useState("neutral");
  const [lineCount, setLineCount] = useState(1);
  const [history, setHistory] = useState([]);

  // Word lists with mood variations
  const words = {
    nouns: {
      neutral: ["moon", "river", "shadow", "wind", "forest", "star", "ocean", "mountain"],
      happy: ["sun", "flower", "bird", "meadow", "rainbow", "breeze", "dawn", "sky"],
      sad: ["tear", "rain", "dusk", "mist", "ruin", "shade", "fog", "night"],
    },
    verbs: {
      neutral: ["whispers", "dances", "weaves", "sings", "falls", "rises", "drifts", "glows"],
      happy: ["laughs", "blooms", "soars", "sparkles", "plays", "shines", "twirls", "leaps"],
      sad: ["fades", "weeps", "sinks", " lingers", "mourns", "wanders", "dims", "drops"],
    },
    adjectives: {
      neutral: ["silver", "gentle", "wild", "eternal", "faint", "golden", "dark", "soft"],
      happy: ["bright", "joyful", "warm", "vivid", "sweet", "radiant", "cheerful", "light"],
      sad: ["gray", "lonely", "cold", "somber", "bleak", "pale", "hollow", "dull"],
    },
    adverbs: {
      neutral: ["silently", "slowly", "gently", "boldly", "forever", "softly", "swiftly"],
      happy: ["merrily", "freely", "happily", "briskly", "gleefully", "warmly", "lightly"],
      sad: ["sadly", "quietly", "forlornly", "heavily", "dimly", "wearily", "gloomily"],
    },
    prepositions: ["beneath", "above", "within", "beyond", "against", "through", "under"],
  };

  const structures = [
    (adj, n, v, adv) => `The ${adj} ${n} ${v} ${adv}.`,
    (adj, n, v, prep, n2) => `${adj} ${n} ${v} ${prep} the ${n2}.`,
    (n, v, adv, prep, adj) => `${n} ${v} ${adv} ${prep} ${adj} skies.`,
    (adv, v, adj, n) => `${adv}, the ${adj} ${n} ${v}.`,
    (adj, n, prep, n2, v) => `The ${adj} ${n} ${prep} ${n2} ${v}.`,
  ];

  // Generate poetry lines
  const generatePoetryLines = useCallback(() => {
    const newLines = [];
    const selectedNouns = words.nouns[mood];
    const selectedVerbs = words.verbs[mood];
    const selectedAdjectives = words.adjectives[mood];
    const selectedAdverbs = words.adverbs[mood];

    for (let i = 0; i < lineCount; i++) {
      const structure = structures[Math.floor(Math.random() * structures.length)];
      const adj = selectedAdjectives[Math.floor(Math.random() * selectedAdjectives.length)];
      const n = selectedNouns[Math.floor(Math.random() * selectedNouns.length)];
      const v = selectedVerbs[Math.floor(Math.random() * selectedVerbs.length)];
      const adv = selectedAdverbs[Math.floor(Math.random() * selectedAdverbs.length)];
      const prep = words.prepositions[Math.floor(Math.random() * words.prepositions.length)];
      const n2 = selectedNouns[Math.floor(Math.random() * selectedNouns.length)];
      const uniqueN2 = n === n2 ? selectedNouns[(selectedNouns.indexOf(n2) + 1) % selectedNouns.length] : n2;

      newLines.push(structure(adj, n, v, adv, prep, uniqueN2));
    }

    setPoetryLines(newLines);
    setHistory((prev) => [...prev, newLines].slice(-10)); // Keep last 10 generations
  }, [mood, lineCount]);

  // Download as text file
  const downloadPoetry = () => {
    if (poetryLines.length) {
      const blob = new Blob([poetryLines.join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `poetry-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Reset to initial state
  const reset = () => {
    setPoetryLines([]);
    setMood("neutral");
    setLineCount(1);
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Poetry Line Generator
        </h1>

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
              >
                <option value="neutral">Neutral</option>
                <option value="happy">Happy</option>
                <option value="sad">Sad</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Lines ({lineCount})
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={lineCount}
                onChange={(e) => setLineCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generatePoetryLines}
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Generate Poetry
            </button>
            <button
              onClick={downloadPoetry}
              disabled={!poetryLines.length}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Poetry Display */}
        {poetryLines.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Generated Poetry</h3>
            <div className="text-gray-800 italic">
              {poetryLines.map((line, index) => (
                <p key={index} className="mb-2">"{line}"</p>
              ))}
            </div>
          </div>
        )}

        {!poetryLines.length && (
          <div className="mt-6 text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">
              Select a mood and number of lines, then generate your poetry!
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Recent Generations</h3>
            <ul className="text-sm text-blue-600 space-y-2 max-h-40 overflow-y-auto">
              {history.slice().reverse().map((lines, index) => (
                <li key={index}>
                  {lines.map((line, i) => (
                    <span key={i} className="block">"{line}"</span>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-purple-600 text-sm space-y-1">
            <li>Choose mood: Neutral, Happy, or Sad</li>
            <li>Generate 1-5 lines at a time</li>
            <li>Download poetry as a text file</li>
            <li>View generation history (last 10)</li>
            <li>Randomized poetic structures</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: These lines are randomly generated for inspiration and creativity.
        </p>
      </div>
    </div>
  );
};

export default RandomPoetryLineGenerator;