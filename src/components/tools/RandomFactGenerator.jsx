"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaSync, FaShareAlt, FaCopy, FaVolumeUp } from "react-icons/fa";

const RandomFactGenerator = () => {
  const [currentFact, setCurrentFact] = useState(null);
  const [category, setCategory] = useState("all");
  const [history, setHistory] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const factRef = useRef(null);

  const facts = {
    nature: [
      "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
      "Octopuses have three hearts and can change color to blend into their surroundings.",
      "Polar bears have black skin under their white fur to absorb heat.",
      "Sloths can hold their breath longer than dolphins.",
      "Butterflies taste with their feet.",
    ],
    science: [
      "A day on Venus is longer than its year.",
      "The human nose can detect about 1 trillion different smells.",
      "The first computer 'bug' was an actual insect that got stuck in a relay.",
      "A single cloud can weigh more than a million pounds.",
      "A jiffy is an actual unit of time: 1/100th of a second.",
    ],
    history: [
      "The shortest war in history lasted 38 minutes.",
      "The shortest warship in history was just 13 feet long.",
      "The shortest war in history was won with zero casualties.",
      "The inventor of the frisbee was turned into a frisbee after he died.",
    ],
    animals: [
      "A group of flamingos is called a 'flamboyance'.",
      "Cows have best friends and can become stressed when separated from them.",
      "A blue whale's heart weighs as much as a car.",
      "Bananas are berries, but strawberries aren't.",
    ],
    misc: [
      "The shortest bone in the human body is in the ear and is about 3mm long.",
      "There are more stars in the universe than grains of sand on Earth.",
    ],
  };

  // Generate a random fact based on category
  const generateFact = useCallback(() => {
    const availableFacts =
      category === "all"
        ? Object.values(facts).flat()
        : facts[category] || [];
    if (availableFacts.length === 0) return;

    let newFact;
    do {
      const randomIndex = Math.floor(Math.random() * availableFacts.length);
      newFact = availableFacts[randomIndex];
    } while (newFact === currentFact && availableFacts.length > 1);

    setCurrentFact(newFact);
    setHistory((prev) => [newFact, ...prev.slice(0, 4)]); // Keep last 5 facts
  }, [category, currentFact]);

  // Share fact
  const shareFact = async () => {
    if (currentFact && navigator.share) {
      try {
        await navigator.share({
          title: "Random Fact",
          text: currentFact,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      alert("Sharing not supported or no fact to share!");
    }
  };

  // Copy fact to clipboard
  const copyFact = () => {
    if (currentFact) {
      navigator.clipboard.writeText(currentFact);
      alert("Fact copied to clipboard!");
    }
  };

  // Text-to-speech
  const speakFact = () => {
    if (currentFact && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentFact);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported or no fact to speak!");
    }
  };

  // Reset everything
  const reset = () => {
    setCurrentFact(null);
    setCategory("all");
    setHistory([]);
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Fact Generator
        </h1>

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Categories</option>
                <option value="nature">Nature</option>
                <option value="science">Science</option>
                <option value="history">History</option>
                <option value="animals">Animals</option>
                <option value="misc">Miscellaneous</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={generateFact}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                Generate Fact
              </button>
              <button
                onClick={reset}
                className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaSync />
              </button>
            </div>
          </div>

          {/* Current Fact */}
          {currentFact ? (
            <div
              ref={factRef}
              className="bg-gray-50 p-4 rounded-lg text-center relative"
            >
              <p className="text-gray-800 text-lg italic">"{currentFact}"</p>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={shareFact}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  title="Share Fact"
                >
                  <FaShareAlt />
                </button>
                <button
                  onClick={copyFact}
                  className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
                  title="Copy Fact"
                >
                  <FaCopy />
                </button>
                <button
                  onClick={speakFact}
                  disabled={isSpeaking}
                  className={`p-2 ${
                    isSpeaking ? "bg-gray-400" : "bg-yellow-500 hover:bg-yellow-600"
                  } text-white rounded-full transition-colors`}
                  title="Read Aloud"
                >
                  <FaVolumeUp />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 italic">
              Click "Generate Fact" to discover something new!
            </p>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Facts</h3>
              <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
                {history.map((fact, index) => (
                  <li key={index} className="italic">
                    "{fact}"
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Category-based fact selection</li>
            <li>Share facts via Web Share API</li>
            <li>Copy facts to clipboard</li>
            <li>Text-to-speech functionality</li>
            <li>History of recent facts</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Fun facts sourced from various trivia collections.
        </p>
      </div>
    </div>
  );
};

export default RandomFactGenerator;