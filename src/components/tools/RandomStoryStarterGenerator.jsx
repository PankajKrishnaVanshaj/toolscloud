"use client";
import React, { useState, useCallback } from "react";
import { FaDice, FaSave, FaHistory } from "react-icons/fa";

const RandomStoryStarterGenerator = () => {
  const [storyStarter, setStoryStarter] = useState(null);
  const [history, setHistory] = useState([]);
  const [customTone, setCustomTone] = useState("");
  const [useCustomTone, setUseCustomTone] = useState(false);

  const characters = [
    "a curious explorer",
    "a time-traveling scientist",
    "a mischievous fairy",
    "a retired pirate",
    "an ambitious chef",
    "a talking cat",
    "a secretive librarian",
    "a young inventor",
    "a lost astronaut",
    "a magical gardener",
    "a fearless knight",
    "a quirky robot",
  ];

  const settings = [
    "a hidden jungle temple",
    "a futuristic underwater city",
    "a haunted Victorian mansion",
    "a bustling medieval market",
    "a mysterious floating island",
    "an abandoned space station",
    "an enchanted forest",
    "a steampunk airship",
    "a desert caravan",
    "a snowy mountain village",
    "a neon-lit cyberpunk city",
    "a tranquil seaside village",
  ];

  const plotElements = [
    "discovers a long-lost artifact",
    "must solve an ancient riddle",
    "encounters a strange creature",
    "uncovers a dangerous conspiracy",
    "finds a portal to another world",
    "receives a cryptic message",
    "competes in a high-stakes challenge",
    "searches for a missing friend",
    "awakens a dormant power",
    "faces an unexpected betrayal",
    "embarks on a forbidden quest",
    "decodes a secret map",
  ];

  const tones = [
    "mysterious",
    "thrilling",
    "humorous",
    "dark",
    "adventurous",
    "romantic",
    "spooky",
    "whimsical",
    "dramatic",
    "hopeful",
    "tense",
    "heartwarming",
  ];

  // Generate a random story starter
  const generateStoryStarter = useCallback(() => {
    const character = characters[Math.floor(Math.random() * characters.length)];
    const setting = settings[Math.floor(Math.random() * settings.length)];
    const plotElement = plotElements[Math.floor(Math.random() * plotElements.length)];
    const tone = useCustomTone && customTone ? customTone : tones[Math.floor(Math.random() * tones.length)];

    const prompt = `In a ${tone} tale, ${character} ${plotElement} in ${setting}.`;
    setStoryStarter(prompt);
    setHistory((prev) => [prompt, ...prev.slice(0, 9)]); // Keep last 10 prompts
  }, [customTone, useCustomTone]);

  // Save the current story starter
  const saveStoryStarter = () => {
    if (storyStarter) {
      const blob = new Blob([storyStarter], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `story-starter-${Date.now()}.txt`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Story Starter Generator
        </h1>

        {/* Controls */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={generateStoryStarter}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDice className="mr-2" /> Generate
            </button>
            <button
              onClick={saveStoryStarter}
              disabled={!storyStarter}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSave className="mr-2" /> Save
            </button>
          </div>

          {/* Custom Tone Option */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={useCustomTone}
                onChange={(e) => setUseCustomTone(e.target.checked)}
                className="mr-2 accent-green-500"
              />
              <span className="text-sm text-gray-700">Use Custom Tone</span>
            </div>
            <div>
              <input
                type="text"
                value={customTone}
                onChange={(e) => setCustomTone(e.target.value)}
                placeholder="Enter custom tone (e.g., 'epic')"
                disabled={!useCustomTone}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Story Starter Display */}
          {storyStarter ? (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-lg text-gray-800 italic">"{storyStarter}"</p>
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500 italic">
                Click "Generate" to create a random story starter!
              </p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
                <FaHistory className="mr-2" /> Recent Story Starters
              </h3>
              <ul className="text-sm text-blue-600 space-y-2 max-h-40 overflow-y-auto">
                {history.map((item, index) => (
                  <li
                    key={index}
                    className="cursor-pointer hover:text-blue-800"
                    onClick={() => setStoryStarter(item)}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Randomly generates unique story starters</li>
            <li>Custom tone option for personalized prompts</li>
            <li>Save your favorite starters as text files</li>
            <li>History of recent prompts (click to reuse)</li>
            <li>Expanded lists of characters, settings, and plots</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Use these prompts to spark your next writing adventure!
        </p>
      </div>
    </div>
  );
};

export default RandomStoryStarterGenerator;