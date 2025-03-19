"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const RandomPlantGenerator = () => {
  const [plant, setPlant] = useState(null);
  const [history, setHistory] = useState([]);
  const [generateCount, setGenerateCount] = useState(1);
  const [customOptions, setCustomOptions] = useState({
    type: "",
    habitat: "",
    color: "",
    property: "",
  });

  // Expanded plant attributes
  const plantTypes = [
    "Tree",
    "Shrub",
    "Vine",
    "Fern",
    "Flower",
    "Cactus",
    "Moss",
    "Bamboo",
    "Succulent",
    "Orchid",
  ];
  const habitats = [
    "Forest",
    "Desert",
    "Jungle",
    "Mountain",
    "Swamp",
    "Tundra",
    "Grassland",
    "Coastal",
    "Volcanic",
    "Arctic",
  ];
  const colors = [
    "Red",
    "Blue",
    "Purple",
    "Yellow",
    "Green",
    "Orange",
    "Pink",
    "Silver",
    "Gold",
    "Black",
  ];
  const properties = [
    "Glows in the dark",
    "Changes color seasonally",
    "Releases fragrant mist",
    "Attracts rare insects",
    "Has healing sap",
    "Grows edible crystals",
    "Sings in the wind",
    "Floats above ground",
    "Absorbs moonlight",
    "Repels water",
    "Mimics animal sounds",
  ];
  const prefixes = [
    "Luna",
    "Solar",
    "Aqua",
    "Terra",
    "Vita",
    "Echo",
    "Nova",
    "Aero",
    "Pyro",
    "Chrono",
  ];
  const suffixes = [
    "flora",
    "thorn",
    "bloom",
    "leaf",
    "root",
    "spire",
    "petal",
    "vine",
    "crest",
    "shade",
  ];

  // Generate plant(s)
  const generatePlant = useCallback(() => {
    const newPlants = [];
    for (let i = 0; i < generateCount; i++) {
      const type =
        customOptions.type ||
        plantTypes[Math.floor(Math.random() * plantTypes.length)];
      const habitat =
        customOptions.habitat ||
        habitats[Math.floor(Math.random() * habitats.length)];
      const color =
        customOptions.color || colors[Math.floor(Math.random() * colors.length)];
      const property =
        customOptions.property ||
        properties[Math.floor(Math.random() * properties.length)];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

      const name = `${prefix}${suffix}`;
      const description = `A ${color.toLowerCase()} ${type.toLowerCase()} found in ${habitat.toLowerCase()} regions, known to ${property.toLowerCase()}.`;

      newPlants.push({
        name,
        type,
        habitat,
        color,
        property,
        description,
      });
    }

    if (generateCount === 1) {
      setPlant(newPlants[0]);
      setHistory((prev) => [newPlants[0], ...prev.slice(0, 9)]); // Keep last 10
    } else {
      setPlant(null);
      setHistory((prev) => [...newPlants, ...prev.slice(0, 10 - generateCount)]);
    }
  }, [generateCount, customOptions]);

  // Reset everything
  const reset = () => {
    setPlant(null);
    setHistory([]);
    setGenerateCount(1);
    setCustomOptions({ type: "", habitat: "", color: "", property: "" });
  };

  // Download plant data as JSON
  const downloadPlant = () => {
    if (!plant && !history.length) return;
    const data = plant ? [plant] : history;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `plants-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle custom option changes
  const handleCustomChange = (field) => (e) => {
    setCustomOptions((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Plant Generator
        </h1>

        {/* Controls */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={generatePlant}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              Generate {generateCount > 1 ? `${generateCount} Plants` : "Plant"}
            </button>
            <button
              onClick={downloadPlant}
              disabled={!plant && !history.length}
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

          {/* Generation Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Plants
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={generateCount}
                onChange={(e) => setGenerateCount(Math.max(1, Math.min(5, e.target.value)))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Type
              </label>
              <input
                type="text"
                value={customOptions.type}
                onChange={handleCustomChange("type")}
                placeholder="e.g., Fungus"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Habitat
              </label>
              <input
                type="text"
                value={customOptions.habitat}
                onChange={handleCustomChange("habitat")}
                placeholder="e.g., Cave"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Color
              </label>
              <input
                type="text"
                value={customOptions.color}
                onChange={handleCustomChange("color")}
                placeholder="e.g., Indigo"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Current Plant */}
          {plant && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-3 text-center text-green-600">
                {plant.name}
              </h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Type:</span> {plant.type}
                </p>
                <p>
                  <span className="font-medium">Habitat:</span> {plant.habitat}
                </p>
                <p>
                  <span className="font-medium">Color:</span> {plant.color}
                </p>
                <p>
                  <span className="font-medium">Unique Property:</span> {plant.property}
                </p>
                <p className="mt-2 italic text-gray-700">{plant.description}</p>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && !plant && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Generated Plants</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                {history.map((p, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => setPlant(p)}
                  >
                    <h4 className="text-sm font-semibold text-green-600">{p.name}</h4>
                    <p className="text-xs text-gray-600">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!plant && !history.length && (
            <p className="text-center text-gray-500">
              Click "Generate Plant" to create a random plant!
            </p>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Generate multiple plants at once (up to 5)</li>
            <li>Customizable type, habitat, and color</li>
            <li>History of generated plants</li>
            <li>Download plant data as JSON</li>
            <li>Click history items to view details</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: These are fictional plants generated for creative inspiration!
        </p>
      </div>
    </div>
  );
};

export default RandomPlantGenerator;