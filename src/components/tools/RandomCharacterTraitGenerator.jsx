"use client";
import React, { useState, useCallback } from "react";
import { FaDice, FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the trait card

const RandomCharacterTraitGenerator = () => {
  const [characterTraits, setCharacterTraits] = useState(null);
  const [traitCount, setTraitCount] = useState(1); // Number of trait sets to generate
  const [history, setHistory] = useState([]);
  const cardRef = React.useRef(null);

  // Expanded trait lists
  const personalityTraits = [
    "Optimistic", "Pessimistic", "Introverted", "Extroverted", "Analytical",
    "Creative", "Loyal", "Skeptical", "Compassionate", "Sarcastic", "Adventurous",
    "Cautious", "Charismatic", "Shy", "Confident", "Mysterious", "Playful",
    "Stoic", "Curious", "Rebellious"
  ];

  const strengths = [
    "Courageous", "Intelligent", "Resourceful", "Athletic", "Perceptive",
    "Charming", "Determined", "Patient", "Adaptable", "Skilled", "Empathetic",
    "Strategic", "Resilient", "Honest", "Quick-witted", "Inventive", "Leader",
    "Calm", "Talented", "Observant"
  ];

  const weaknesses = [
    "Impulsive", "Stubborn", "Insecure", "Naive", "Arrogant", "Disorganized",
    "Gullible", "Short-tempered", "Clumsy", "Indecisive", "Overconfident",
    "Procrastinator", "Reckless", "Pessimistic", "Forgetful", "Jealous",
    "Overly-trusting", "Perfectionist", "Timid", "Distractible"
  ];

  const quirks = [
    "Talks to themselves", "Collects odd trinkets", "Hums constantly",
    "Obsessed with time", "Always carries a lucky charm", "Fidgets nervously",
    "Speaks in riddles", "Laughs at inappropriate times", "Counts everything",
    "Has an unusual pet", "Whistles off-key", "Overuses a catchphrase",
    "Avoids eye contact", "Loves bad puns", "Sleeps with eyes open",
    "Eats food in a specific order", "Draws on everything", "Talks to plants",
    "Wears mismatched socks", "Quotes obscure books"
  ];

  const backgrounds = [
    "Orphaned wanderer", "Noble heir", "Retired soldier", "Former thief",
    "Scholar of the arcane", "Village outcast", "Traveling merchant",
    "Exiled royalty", "Farmhand turned hero", "Mystical seer", "City urchin",
    "Disgraced knight", "Reclusive inventor", "Pirate deserter", "Temple acolyte"
  ];

  // Generate random traits
  const generateTraits = useCallback(() => {
    const newTraits = Array.from({ length: traitCount }, () => ({
      personality: personalityTraits[Math.floor(Math.random() * personalityTraits.length)],
      strength: strengths[Math.floor(Math.random() * strengths.length)],
      weakness: weaknesses[Math.floor(Math.random() * weaknesses.length)],
      quirk: quirks[Math.floor(Math.random() * quirks.length)],
      background: backgrounds[Math.floor(Math.random() * backgrounds.length)],
    }));
    setCharacterTraits(newTraits);
    setHistory((prev) => [...prev, ...newTraits].slice(-10)); // Keep last 10 in history
  }, [traitCount]);

  // Reset traits
  const reset = () => {
    setCharacterTraits(null);
    setTraitCount(1);
    setHistory([]);
  };

  // Download trait card
  const downloadCard = () => {
    if (cardRef.current && characterTraits) {
      html2canvas(cardRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `character-traits-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Character Trait Generator
        </h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Characters ({traitCount})
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={traitCount}
              onChange={(e) => setTraitCount(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={generateTraits}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDice className="mr-2" /> Generate
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadCard}
              disabled={!characterTraits}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </div>

        {/* Character Traits Display */}
        {characterTraits && (
          <div ref={cardRef} className="space-y-6">
            {characterTraits.map((traits, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <h2 className="text-lg font-semibold mb-3 text-green-600">
                  Character {index + 1}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <p>
                    <span className="font-medium text-gray-700">Personality:</span>{" "}
                    {traits.personality}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Strength:</span>{" "}
                    {traits.strength}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Weakness:</span>{" "}
                    {traits.weakness}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Quirk:</span> {traits.quirk}
                  </p>
                  <p className="sm:col-span-2">
                    <span className="font-medium text-gray-700">Background:</span>{" "}
                    {traits.background}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!characterTraits && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">
              Generate some character traits to get started!
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Recent Characters</h3>
            <ul className="text-sm text-blue-600 space-y-2 max-h-48 overflow-y-auto">
              {history.slice().reverse().map((traits, index) => (
                <li key={index}>
                  {traits.personality}, {traits.strength}, {traits.weakness}, {traits.quirk},{" "}
                  {traits.background}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Generate 1-5 character profiles at once</li>
            <li>Expanded trait lists with backgrounds</li>
            <li>Download traits as a PNG card</li>
            <li>History of recent generations</li>
            <li>Smooth transitions and intuitive controls</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Use these traits to inspire unique characters for stories, games, or role-playing!
        </p>
      </div>
    </div>
  );
};

export default RandomCharacterTraitGenerator;