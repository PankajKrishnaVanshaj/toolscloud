"use client";
import React, { useState, useCallback } from "react";
import { FaRedo, FaDownload } from "react-icons/fa";

const RandomSongLyricGenerator = () => {
  const [lyrics, setLyrics] = useState([]);
  const [genre, setGenre] = useState("pop");
  const [lines, setLines] = useState(4); // Number of lines to generate
  const [structure, setStructure] = useState("verse"); // Song structure
  const [history, setHistory] = useState([]); // Lyric history

  // Word banks
  const wordBanks = {
    pop: {
      nouns: ["heart", "night", "dream", "star", "world", "love", "sky", "city"],
      verbs: ["dance", "shine", "fly", "fall", "sing", "feel", "love", "rise"],
      adjectives: ["bright", "wild", "sweet", "free", "golden", "true", "lost", "young"],
      prepositions: ["under", "over", "through", "in", "with", "beyond"],
    },
    rock: {
      nouns: ["road", "fire", "soul", "storm", "rebel", "shadow", "chain", "mountain"],
      verbs: ["rock", "burn", "fight", "run", "break", "scream", "crash", "roar"],
      adjectives: ["dark", "loud", "rough", "crazy", "fierce", "raw", "bold", "electric"],
      prepositions: ["down", "up", "across", "against", "into", "out"],
    },
    hiphop: {
      nouns: ["street", "flow", "mic", "crew", "game", "rhyme", "block", "chain"],
      verbs: ["spit", "ride", "grind", "flow", "drop", "hustle", "blaze", "stack"],
      adjectives: ["fresh", "real", "hot", "smooth", "dope", "hard", "fly", "ill"],
      prepositions: ["on", "off", "from", "to", "with", "at"],
    },
    country: {
      nouns: ["truck", "river", "moon", "farm", "boots", "highway", "barn", "whiskey"],
      verbs: ["ride", "drink", "roll", "stray", "dance", "pick", "roam", "sing"],
      adjectives: ["dusty", "old", "lonesome", "sweet", "rugged", "blue", "wild", "honest"],
      prepositions: ["down", "by", "over", "near", "in", "along"],
    },
  };

  const adverbs = ["forever", "tonight", "always", "never", "slowly", "fast", "high", "deep"];

  // Generate lyrics based on structure
  const generateLyrics = useCallback(() => {
    const selectedWords = wordBanks[genre];
    const newLyrics = [];

    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Different patterns for variety
    const patterns = {
      verse: () =>
        `${getRandom(selectedWords.adjectives)} ${getRandom(selectedWords.nouns)} ${getRandom(selectedWords.verbs)} ${getRandom(adverbs)}`,
      chorus: () =>
        `${getRandom(selectedWords.verbs)} ${getRandom(adverbs)}, ${getRandom(selectedWords.adjectives)} ${getRandom(selectedWords.nouns)}`,
      bridge: () =>
        `${getRandom(selectedWords.prepositions)} the ${getRandom(selectedWords.adjectives)} ${getRandom(selectedWords.nouns)} we ${getRandom(selectedWords.verbs)}`,
    };

    for (let i = 0; i < lines; i++) {
      const line = patterns[structure]();
      newLyrics.push(
        line.charAt(0).toUpperCase() + line.slice(1) // Capitalize first letter
      );
    }

    setLyrics(newLyrics);
    setHistory((prev) => [...prev.slice(-9), newLyrics]); // Keep last 10 in history
  }, [genre, lines, structure]);

  // Download lyrics as text file
  const downloadLyrics = () => {
    if (lyrics.length === 0) return;
    const blob = new Blob(
      [`${structure.toUpperCase()} (${genre})\n\n${lyrics.join("\n")}`],
      { type: "text/plain" }
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${genre}-${structure}-${Date.now()}.txt`;
    link.click();
  };

  // Reset to initial state
  const reset = () => {
    setLyrics([]);
    setGenre("pop");
    setLines(4);
    setStructure("verse");
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Song Lyric Generator
        </h1>

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                {Object.keys(wordBanks).map((g) => (
                  <option key={g} value={g}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Structure
              </label>
              <select
                value={structure}
                onChange={(e) => setStructure(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                <option value="verse">Verse</option>
                <option value="chorus">Chorus</option>
                <option value="bridge">Bridge</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lines ({lines})
              </label>
              <input
                type="range"
                min="2"
                max="8"
                value={lines}
                onChange={(e) => setLines(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={generateLyrics}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              Generate Lyrics
            </button>
            <button
              onClick={downloadLyrics}
              disabled={lyrics.length === 0}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaRedo className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Lyrics Display */}
        {lyrics.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-center text-indigo-600">
              {structure.charAt(0).toUpperCase() + structure.slice(1)} (
              {genre.charAt(0).toUpperCase() + genre.slice(1)})
            </h2>
            <div className="space-y-2 text-center text-gray-700">
              {lyrics.map((line, index) => (
                <p key={index} className="text-sm sm:text-base">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Placeholder */}
        {lyrics.length === 0 && (
          <div className="mt-6 text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">
              Select a genre, structure, and number of lines, then generate your lyrics!
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-700 mb-2">Previous Lyrics</h3>
            <div className="max-h-40 overflow-y-auto space-y-4 text-sm text-blue-600">
              {history.slice().reverse().map((lyricSet, index) => (
                <div key={index}>
                  {lyricSet.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                  {index < history.length - 1 && <hr className="my-2 border-blue-200" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h3 className="font-semibold text-indigo-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-indigo-600 text-sm space-y-1">
            <li>Multiple genres: Pop, Rock, Hip-Hop, Country</li>
            <li>Structure options: Verse, Chorus, Bridge</li>
            <li>Customizable line count (2-8)</li>
            <li>Download lyrics as text file</li>
            <li>Lyrics history tracking</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: These are randomly generated lyrics for inspiration and entertainment.
        </p>
      </div>
    </div>
  );
};

export default RandomSongLyricGenerator;