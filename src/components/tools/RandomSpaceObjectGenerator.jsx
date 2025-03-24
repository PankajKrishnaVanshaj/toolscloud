"use client";
import React, { useState, useCallback } from "react";
import { FaDice, FaDownload, FaSync } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the generated object

const RandomSpaceObjectGenerator = () => {
  const [spaceObject, setSpaceObject] = useState(null);
  const [history, setHistory] = useState([]);
  const cardRef = React.useRef(null);

  // Expanded data arrays
  const objectTypes = ["Star", "Planet", "Moon", "Asteroid", "Comet", "Nebula", "Black Hole"];
  const starTypes = [
    "Red Dwarf",
    "Yellow Dwarf",
    "Blue Giant",
    "White Dwarf",
    "Neutron Star",
    "Supergiant",
    "Pulsar",
  ];
  const planetTypes = ["Terrestrial", "Gas Giant", "Ice Giant", "Dwarf Planet", "Exoplanet"];
  const compositions = ["Rock", "Ice", "Gas", "Metal", "Dust", "Plasma", "Crystal"];
  const prefixes = ["Alpha", "Beta", "Gamma", "Delta", "Zeta", "Omega", "Sigma", "Tau"];
  const suffixes = [
    "Prime",
    "Major",
    "Minor",
    "Secundus",
    "Nebulous",
    "Stellar",
    "Cosmic",
    "Astral",
  ];
  const colors = ["Red", "Blue", "Yellow", "White", "Green", "Purple", "Orange"];

  // Generate random space object
  const generateRandomObject = useCallback(() => {
    const type = objectTypes[Math.floor(Math.random() * objectTypes.length)];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const name = `${prefix} ${color} ${suffix}`;

    let details = {
      type,
      name,
      size: `${(Math.random() * 10000 + 1).toFixed(2)} km`,
      distance: `${(Math.random() * 1000 + 1).toFixed(2)} light-years`,
      composition: compositions[Math.floor(Math.random() * compositions.length)],
      age: `${(Math.random() * 13.8).toFixed(2)} billion years`,
      discovered: `20${Math.floor(Math.random() * 25) + 10}`,
    };

    if (type === "Star") {
      details.subType = starTypes[Math.floor(Math.random() * starTypes.length)];
      details.temperature = `${Math.floor(Math.random() * 50000) + 500} K`;
      details.luminosity = `${(Math.random() * 1000 + 0.1).toFixed(2)} solar units`;
    } else if (type === "Planet") {
      details.subType = planetTypes[Math.floor(Math.random() * planetTypes.length)];
      details.moons = Math.floor(Math.random() * 50);
      details.atmosphere = Math.random() > 0.5 ? "Yes" : "No";
    } else if (type === "Moon") {
      details.orbiting = `${prefix} Major`;
      details.tidalLocked = Math.random() > 0.5 ? "Yes" : "No";
    } else if (type === "Black Hole") {
      details.mass = `${(Math.random() * 100 + 1).toFixed(2)} solar masses`;
      details.eventHorizon = `${(Math.random() * 1000 + 10).toFixed(2)} km`;
    } else if (type === "Nebula") {
      details.shape = ["Spiral", "Elliptical", "Irregular"][Math.floor(Math.random() * 3)];
    }

    setSpaceObject(details);
    setHistory((prev) => [...prev, details].slice(-5)); // Keep last 5 in history
  }, []);

  // Download the generated card
  const downloadCard = () => {
    if (cardRef.current) {
      html2canvas(cardRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `${spaceObject.name}-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Reset everything
  const reset = () => {
    setSpaceObject(null);
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Space Object Generator
        </h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button
            onClick={generateRandomObject}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaDice className="mr-2" /> Generate New
          </button>
          <button
            onClick={downloadCard}
            disabled={!spaceObject}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Card
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Space Object Display */}
        {spaceObject ? (
          <div ref={cardRef} className="bg-gray-50 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-center text-blue-600">
              {spaceObject.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <p>
                <span className="font-medium">Type:</span> {spaceObject.type}
                {spaceObject.subType && ` (${spaceObject.subType})`}
              </p>
              <p>
                <span className="font-medium">Size:</span> {spaceObject.size}
              </p>
              <p>
                <span className="font-medium">Distance:</span> {spaceObject.distance}
              </p>
              <p>
                <span className="font-medium">Composition:</span> {spaceObject.composition}
              </p>
              <p>
                <span className="font-medium">Age:</span> {spaceObject.age}
              </p>
              <p>
                <span className="font-medium">Discovered:</span> {spaceObject.discovered}
              </p>
              {spaceObject.temperature && (
                <p>
                  <span className="font-medium">Temperature:</span> {spaceObject.temperature}
                </p>
              )}
              {spaceObject.luminosity && (
                <p>
                  <span className="font-medium">Luminosity:</span> {spaceObject.luminosity}
                </p>
              )}
              {spaceObject.moons !== undefined && (
                <p>
                  <span className="font-medium">Moons:</span> {spaceObject.moons}
                </p>
              )}
              {spaceObject.atmosphere && (
                <p>
                  <span className="font-medium">Atmosphere:</span> {spaceObject.atmosphere}
                </p>
              )}
              {spaceObject.orbiting && (
                <p>
                  <span className="font-medium">Orbiting:</span> {spaceObject.orbiting}
                </p>
              )}
              {spaceObject.tidalLocked && (
                <p>
                  <span className="font-medium">Tidal Locked:</span> {spaceObject.tidalLocked}
                </p>
              )}
              {spaceObject.mass && (
                <p>
                  <span className="font-medium">Mass:</span> {spaceObject.mass}
                </p>
              )}
              {spaceObject.eventHorizon && (
                <p>
                  <span className="font-medium">Event Horizon:</span> {spaceObject.eventHorizon}
                </p>
              )}
              {spaceObject.shape && (
                <p>
                  <span className="font-medium">Shape:</span> {spaceObject.shape}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Click "Generate New" to create a random space object!
          </p>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Recent Generations</h3>
            <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
              {history.slice().reverse().map((obj, index) => (
                <li
                  key={index}
                  className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                  onClick={() => setSpaceObject(obj)}
                >
                  {obj.name} ({obj.type})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate various space objects with detailed properties</li>
            <li>Download generated object as a PNG card</li>
            <li>History of recent generations (click to revisit)</li>
            <li>Expanded object types and attributes</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: All values are fictional and randomly generated for entertainment purposes.
        </p>
      </div>
    </div>
  );
};

export default RandomSpaceObjectGenerator;