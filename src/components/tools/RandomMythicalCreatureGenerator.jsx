"use client";
import React, { useState, useCallback } from "react";
import { FaDice, FaSave, FaSync } from "react-icons/fa";

const RandomMythicalCreatureGenerator = () => {
  const [creature, setCreature] = useState(null);
  const [history, setHistory] = useState([]);
  const [rarity, setRarity] = useState("common");

  // Expanded data arrays
  const heads = [
    "Dragon",
    "Lion",
    "Eagle",
    "Serpent",
    "Wolf",
    "Phoenix",
    "Unicorn",
    "Sphinx",
    "Griffin",
    "Chimera",
  ];

  const bodies = [
    "Horse",
    "Bear",
    "Deer",
    "Snake",
    "Bird",
    "Fish",
    "Spider",
    "Goat",
    "Tiger",
    "Bat",
  ];

  const abilities = [
    "fire-breathing",
    "shape-shifting",
    "invisibility",
    "flight",
    "venomous",
    "teleportation",
    "mind-reading",
    "regeneration",
    "ice-control",
    "time-bending",
    "lightning-strike",
    "stone-gaze",
  ];

  const traits = [
    "Golden",
    "Iridescent",
    "Shadowy",
    "Crystal",
    "Emerald",
    "Spectral",
    "Luminous",
    "Obsidian",
    "Celestial",
    "Ethereal",
    "Crimson",
    "Sapphire",
  ];

  const habitats = [
    "mountains",
    "forests",
    "oceans",
    "deserts",
    "clouds",
    "caves",
    "volcanoes",
    "swamps",
    "underworld",
    "sky-islands",
    "crystal-lakes",
    "forgotten-ruins",
  ];

  const rarities = {
    common: { color: "text-gray-600", chance: 60 },
    rare: { color: "text-blue-600", chance: 25 },
    legendary: { color: "text-purple-600", chance: 10 },
    mythic: { color: "text-yellow-600", chance: 5 },
  };

  // Generate a random creature
  const generateCreature = useCallback(() => {
    const head = heads[Math.floor(Math.random() * heads.length)];
    const body = bodies[Math.floor(Math.random() * bodies.length)];
    const ability = abilities[Math.floor(Math.random() * abilities.length)];
    const trait = traits[Math.floor(Math.random() * traits.length)];
    const habitat = habitats[Math.floor(Math.random() * habitats.length)];

    // Determine rarity based on weighted chance
    const roll = Math.random() * 100;
    let selectedRarity = "common";
    let cumulativeChance = 0;
    for (const [key, value] of Object.entries(rarities)) {
      cumulativeChance += value.chance;
      if (roll <= cumulativeChance) {
        selectedRarity = key;
        break;
      }
    }

    const name = `${trait} ${head}${body}`;
    const description = `A ${selectedRarity} mythical creature with the head of a ${head.toLowerCase()} and the body of a ${body.toLowerCase()}, capable of ${ability}. It dwells in the ${habitat}.`;

    const newCreature = { name, description, rarity: selectedRarity };
    setCreature(newCreature);
    setHistory((prev) => [...prev, newCreature].slice(-10)); // Keep last 10
  }, []);

  // Reset everything
  const reset = () => {
    setCreature(null);
    setHistory([]);
    setRarity("common");
  };

  // Download creature as text file
  const downloadCreature = () => {
    if (!creature) return;
    const text = `${creature.name}\n\n${creature.description}`;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${creature.name.replace(/\s+/g, "_")}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Mythical Creature Generator
        </h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          <button
            onClick={generateCreature}
            className="flex items-center justify-center px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
          >
            <FaDice className="mr-2" /> Generate Creature
          </button>
          <button
            onClick={downloadCreature}
            disabled={!creature}
            className="flex items-center justify-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <FaSave className="mr-2" /> Save Creature
          </button>
          <button
            onClick={reset}
            className="flex items-center justify-center px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Rarity Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Rarity (optional)
          </label>
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value)}
            className="w-full sm:w-1/3 p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
          >
            <option value="common">Common (60%)</option>
            <option value="rare">Rare (25%)</option>
            <option value="legendary">Legendary (10%)</option>
            <option value="mythic">Mythic (5%)</option>
          </select>
        </div>

        {/* Creature Display */}
        {creature && (
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <h2
              className={`text-xl sm:text-2xl font-semibold mb-3 ${
                rarities[creature.rarity].color
              }`}
            >
              {creature.name} <span className="text-sm">({creature.rarity})</span>
            </h2>
            <p className="text-gray-700">{creature.description}</p>
          </div>
        )}

        {!creature && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">
              Click "Generate Creature" to create a random mythical being!
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Recent Creations</h3>
            <ul className="text-sm text-gray-600 space-y-2 max-h-48 overflow-y-auto">
              {history
                .slice()
                .reverse()
                .map((pastCreature, index) => (
                  <li key={index}>
                    <span className={rarities[pastCreature.rarity].color}>
                      {pastCreature.name}
                    </span>{" "}
                    - {pastCreature.description}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-purple-600 text-sm space-y-1">
            <li>Expanded options for heads, bodies, abilities, traits, and habitats</li>
            <li>Rarity system with weighted probabilities</li>
            <li>History of recent creations (up to 10)</li>
            <li>Save creature as a text file</li>
            <li>Customizable rarity filter</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: These are fictional creatures generated for fun and inspiration!
        </p>
      </div>
    </div>
  );
};

export default RandomMythicalCreatureGenerator;