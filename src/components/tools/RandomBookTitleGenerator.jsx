"use client";
import { useState, useCallback } from "react";
import { FaSync, FaCopy, FaPlus } from "react-icons/fa";

const RandomBookTitleGenerator = () => {
  const [bookTitle, setBookTitle] = useState(null);
  const [genre, setGenre] = useState("fantasy");
  const [titleCount, setTitleCount] = useState(1);
  const [titles, setTitles] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Word lists by genre
  const wordLists = {
    fantasy: {
      adjectives: [
        "Mysterious", "Forgotten", "Hidden", "Eternal", "Whispering",
        "Crimson", "Silent", "Golden", "Shattered", "Enchanted",
        "Lost", "Dark", "Radiant", "Secret", "Ancient",
      ],
      nouns: [
        "Kingdom", "Forest", "Tower", "Realm", "Shadow",
        "Journey", "Legacy", "Prophecy", "Curse", "Empire",
        "Echo", "Throne", "Veil", "Path", "Rune",
      ],
      themes: [
        "of Destiny", "of the Stars", "of Time", "of Blood",
        "in the Mist", "under the Moon", "beyond the Horizon",
        "and Dust", "of Dreams", "in Shadow",
        "of the Ancients", "and Fire", "of Secrets", "of Magic",
      ],
    },
    sciFi: {
      adjectives: [
        "Quantum", "Cosmic", "Infinite", "Neon", "Synthetic",
        "Stellar", "Frozen", "Distant", "Orbital", "Cyber",
        "Echoing", "Nova", "Galactic", "Temporal",
      ],
      nouns: [
        "Station", "Planet", "Core", "Nexus", "Void",
        "Voyage", "Circuit", "Signal", "Colony", "Grid",
        "Pulse", "Orbit", "System", "Drift",
      ],
      themes: [
        "of the Cosmos", "in Zero Gravity", "beyond the Stars",
        "of the Machine", "and Steel", "in the Void",
        "of Eternity", "under the Nebula", "of the Future",
        "and Dust", "of Data", "in Flux",
      ],
    },
    mystery: {
      adjectives: [
        "Grim", "Twisted", "Haunted", "Silent", "Obscure",
        "Faded", "Cold", "Broken", "Veiled", "Dismal",
        "Shadowy", "Cryptic", "Chilling", "Unseen",
      ],
      nouns: [
        "Case", "Manor", "Alley", "Secret", "Clue",
        "Night", "Whisper", "Riddle", "Fog", "Enigma",
        "Trail", "Vault", "Mirror", "Mask",
      ],
      themes: [
        "of the Unknown", "in the Dark", "of Deception",
        "and Silence", "beneath the Shadows", "of the Past",
        "in the Rain", "of Betrayal", "and Lies",
        "under the Veil", "of Suspicion",
      ],
    },
  };

  const structures = [
    "The {{adjective}} {{noun}} {{theme}}",
    "{{adjective}} {{noun}}",
    "The {{noun}} {{theme}}",
    "A {{adjective}} {{noun}} {{theme}}",
    "The {{adjective}} {{theme}}",
    "{{noun}} {{theme}}",
    "A {{noun}} of {{adjective}} Dreams",
  ];

  // Generate a single title
  const generateSingleTitle = useCallback(() => {
    const words = wordLists[genre];
    const structure = structures[Math.floor(Math.random() * structures.length)];
    const adjective = words.adjectives[Math.floor(Math.random() * words.adjectives.length)];
    const noun = words.nouns[Math.floor(Math.random() * words.nouns.length)];
    const theme = words.themes[Math.floor(Math.random() * words.themes.length)];

    return structure
      .replace("{{adjective}}", adjective)
      .replace("{{noun}}", noun)
      .replace("{{theme}}", theme);
  }, [genre]);

  // Generate multiple titles
  const generateTitles = () => {
    const newTitles = Array.from({ length: titleCount }, generateSingleTitle);
    setTitles(newTitles);
    setBookTitle(newTitles[0]); // Set first title for legacy display
    setCopiedIndex(null);
  };

  // Reset everything
  const reset = () => {
    setTitles([]);
    setBookTitle(null);
    setGenre("fantasy");
    setTitleCount(1);
    setCopiedIndex(null);
  };

  // Custom copy to clipboard function
  const copyToClipboard = (text, index) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000); 
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Book Title Generator
        </h1>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
            >
              <option value="fantasy">Fantasy</option>
              <option value="sciFi">Sci-Fi</option>
              <option value="mystery">Mystery</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Titles (1-5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={titleCount}
              onChange={(e) => setTitleCount(Math.max(1, Math.min(5, parseInt(e.target.value))))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={generateTitles}
            className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Generate Titles
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Generated Titles */}
        {titles.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3 text-purple-600">Generated Titles</h2>
            <ul className="space-y-2">
              {titles.map((title, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-lg italic text-gray-800">"{title}"</span>
                  <button
                    onClick={() => copyToClipboard(title, index)}
                    className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
                    title="Copy to clipboard"
                  >
                    <FaCopy />
                    {copiedIndex === index && (
                      <span className="ml-1 text-xs text-green-500">Copied!</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!titles.length && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">
              Select a genre and click "Generate Titles" to create random book titles!
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-purple-600 text-sm space-y-1">
            <li>Multiple genres: Fantasy, Sci-Fi, Mystery</li>
            <li>Generate 1-5 titles at once</li>
            <li>Copy titles to clipboard</li>
            <li>Customizable word lists per genre</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: These are fictional titles generated for inspiration and creativity!
        </p>
      </div>
    </div>
  );
};

export default RandomBookTitleGenerator;