"use client";
import React, { useState, useCallback } from "react";
import { FaDice, FaDownload, FaSync } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const RandomAnimalGenerator = () => {
  const [animal, setAnimal] = useState(null);
  const [history, setHistory] = useState([]);
  const [customOptions, setCustomOptions] = useState({
    includeModifier: true,
    includeTrait: true,
    includeHabitat: true,
  });
  const cardRef = React.useRef(null);

  // Expanded lists
  const bases = [
    "Tiger", "Eagle", "Shark", "Bear", "Wolf", "Snake", "Hawk", "Panther", "Crocodile", "Owl",
    "Fox", "Dolphin", "Leopard", "Gorilla", "Raven", "Stag", "Whale", "Cheetah", "Coyote", "Bat",
  ];
  
  const modifiers = [
    "Crystal", "Shadow", "Flame", "Ice", "Thunder", "Mist", "Glow", "Venom", "Steel", "Frost",
    "Solar", "Lunar", "Emerald", "Obsidian", "Crimson", "Sapphire", "Golden", "Silent", "Ethereal", "Radiant",
  ];
  
  const habitats = [
    "Jungle", "Desert", "Ocean", "Mountain", "Forest", "Tundra", "Sky", "Cave", "Swamp", "Plains",
    "Volcano", "River", "Glacier", "Coral Reef", "Savanna", "Canyon", "Marsh", "Peak", "Island", "Steppe",
  ];
  
  const traits = [
    "winged", "horned", "scaled", "feathered", "clawed", "tailed", "fanged", "spiked", "armored",
    "camouflaged", "bioluminescent", "giant", "tiny", "swift", "venomous", "regenerative", "invisible",
    "multi-headed", "electric", "magnetic",
  ];

  const colors = [
    "red", "blue", "green", "yellow", "purple", "black", "white", "silver", "gold", "iridescent",
  ];

  // Generate random animal
  const generateAnimal = useCallback(() => {
    const base = bases[Math.floor(Math.random() * bases.length)];
    const modifier = customOptions.includeModifier
      ? modifiers[Math.floor(Math.random() * modifiers.length)]
      : "";
    const habitat = customOptions.includeHabitat
      ? habitats[Math.floor(Math.random() * habitats.length)]
      : "";
    const trait = customOptions.includeTrait
      ? traits[Math.floor(Math.random() * traits.length)]
      : "";
    const color = colors[Math.floor(Math.random() * colors.length)];

    const name = modifier ? `${modifier} ${base}` : base;
    const descriptionParts = [
      `A ${color}`,
      trait ? `${trait}` : "",
      base.toLowerCase(),
      habitat ? `native to the ${habitat}` : "",
    ].filter(Boolean);
    const description = `${descriptionParts.join(" ")}.`;

    const newAnimal = { name, description, color };
    setAnimal(newAnimal);
    setHistory((prev) => [...prev, newAnimal].slice(-5)); // Keep last 5
  }, [customOptions]);

  // Download animal card
  const downloadAnimal = () => {
    if (cardRef.current && animal) {
      html2canvas(cardRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `${animal.name}-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Reset
  const reset = () => {
    setAnimal(null);
    setHistory([]);
    setCustomOptions({ includeModifier: true, includeTrait: true, includeHabitat: true });
  };

  // Toggle custom options
  const toggleOption = (key) => {
    setCustomOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Animal Generator
        </h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center">
          <button
            onClick={generateAnimal}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <FaDice className="mr-2" /> Generate New Animal
          </button>
          <button
            onClick={downloadAnimal}
            disabled={!animal}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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

        {/* Customization Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Customize Output</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {Object.entries(customOptions).map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => toggleOption(key)}
                  className="mr-2 accent-green-500"
                />
                <span className="text-sm text-gray-700">
                  {key.replace("include", "").toLowerCase()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Animal Display */}
        {animal && (
          <div ref={cardRef} className="bg-gray-50 p-4 rounded-lg text-center mb-6">
            <h2
              className="text-xl sm:text-2xl font-semibold mb-3"
              style={{ color: animal.color }}
            >
              {animal.name}
            </h2>
            <p className="text-gray-700 text-sm sm:text-base">{animal.description}</p>
          </div>
        )}

        {!animal && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">
              Click "Generate New Animal" to create a unique creature!
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-700 mb-2">Recent Creations</h3>
            <ul className="text-sm text-blue-600 space-y-1 max-h-32 overflow-y-auto">
              {history.slice().reverse().map((item, index) => (
                <li key={index}>
                  <span className="font-bold" style={{ color: item.color }}>
                    {item.name}:
                  </span>{" "}
                  {item.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Generate unique fictional animals</li>
            <li>Customizable components (modifier, trait, habitat)</li>
            <li>Color-coded names</li>
            <li>Download as PNG</li>
            <li>History of recent creations</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: These are fictional animals generated for fun and creativity!
        </p>
      </div>
    </div>
  );
};

export default RandomAnimalGenerator;