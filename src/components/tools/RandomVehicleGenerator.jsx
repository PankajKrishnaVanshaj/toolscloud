"use client";
import React, { useState, useCallback } from "react";
import { FaCar, FaRedo, FaSave } from "react-icons/fa";

const RandomVehicleGenerator = () => {
  const [vehicle, setVehicle] = useState(null);
  const [history, setHistory] = useState([]);
  const [customizations, setCustomizations] = useState({
    includeExperimental: false,
    minPrice: 5000,
    maxPrice: 500000,
    minSpeed: 50,
    maxSpeed: 500,
  });

  // Expanded data arrays
  const vehicleTypes = [
    "Car",
    "Truck",
    "Motorcycle",
    "Van",
    "SUV",
    "Bus",
    "Boat",
    "Airplane",
    "Helicopter",
    "Hovercraft",
    "Scooter",
    ...(customizations.includeExperimental
      ? ["Submarine", "Spaceship", "Jetpack", "Time Machine"]
      : []),
  ];

  const brands = [
    "Nova",
    "Peak",
    "Apex",
    "Zephyr",
    "Vortex",
    "Stellar",
    "Pulse",
    "Eclipse",
    "Aurora",
    "Titan",
    "Quantum",
    "Blaze",
    "Nebula",
    "Orbit",
  ];

  const powerSources = [
    "Electric",
    "Gasoline",
    "Hybrid",
    "Diesel",
    "Hydrogen",
    "Solar",
    "Steam",
    ...(customizations.includeExperimental
      ? ["Nuclear", "Antimatter", "Quantum Flux"]
      : []),
  ];

  const features = [
    "self-driving",
    "amphibious",
    "all-terrain",
    "turbo-charged",
    "convertible",
    "armored",
    "flying",
    "voice-controlled",
    "solar-powered",
    "stealth",
    "hyper-speed",
    "eco-friendly",
    "AI-assisted",
    "holographic-display",
    ...(customizations.includeExperimental
      ? ["teleportation", "invisibility", "time-travel"]
      : []),
  ];

  const colors = [
    "Midnight Black",
    "Arctic White",
    "Crimson Red",
    "Sapphire Blue",
    "Emerald Green",
    "Solar Yellow",
    "Titanium Silver",
    "Cosmic Purple",
    "Nebula Gray",
    "Stardust Gold",
  ];

  const generateVehicle = useCallback(() => {
    const type = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const power = powerSources[Math.floor(Math.random() * powerSources.length)];
    const feature = features[Math.floor(Math.random() * features.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const modelNumber = Math.floor(Math.random() * 900) + 100;

    const name = `${brand} ${type} ${modelNumber}`;
    const topSpeed = Math.floor(
      Math.random() * (customizations.maxSpeed - customizations.minSpeed + 1) +
        customizations.minSpeed
    );
    const price = Math.floor(
      Math.random() * (customizations.maxPrice - customizations.minPrice + 1) +
        customizations.minPrice
    );

    const newVehicle = {
      type,
      name,
      powerSource: power,
      feature,
      color,
      topSpeed: `${topSpeed} mph`,
      price: `$${price.toLocaleString()}`,
      generatedAt: new Date().toLocaleString(),
    };

    setVehicle(newVehicle);
    setHistory((prev) => [newVehicle, ...prev.slice(0, 9)]); // Keep last 10
  }, [customizations]);

  const downloadVehicle = () => {
    if (!vehicle) return;
    const text = Object.entries(vehicle)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${vehicle.name}.txt`;
    link.click();
  };

  const handleCustomizationChange = (key, value) => {
    setCustomizations((prev) => ({
      ...prev,
      [key]: typeof value === "number" ? parseInt(value) : value,
    }));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Vehicle Generator
        </h1>

        {/* Customization Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Customizations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={customizations.includeExperimental}
                onChange={(e) =>
                  handleCustomizationChange("includeExperimental", e.target.checked)
                }
                className="mr-2 accent-green-500"
              />
              <span className="text-sm text-gray-700">Include Experimental</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Speed (mph)
              </label>
              <input
                type="number"
                min="50"
                max={customizations.maxSpeed - 1}
                value={customizations.minSpeed}
                onChange={(e) => handleCustomizationChange("minSpeed", e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Speed (mph)
              </label>
              <input
                type="number"
                min={customizations.minSpeed + 1}
                max="1000"
                value={customizations.maxSpeed}
                onChange={(e) => handleCustomizationChange("maxSpeed", e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price ($)
              </label>
              <input
                type="number"
                min="5000"
                max={customizations.maxPrice - 1}
                value={customizations.minPrice}
                onChange={(e) => handleCustomizationChange("minPrice", e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price ($)
              </label>
              <input
                type="number"
                min={customizations.minPrice + 1}
                max="1000000"
                value={customizations.maxPrice}
                onChange={(e) => handleCustomizationChange("maxPrice", e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Generate and Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center">
          <button
            onClick={generateVehicle}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <FaCar className="mr-2" /> Generate New Vehicle
          </button>
          <button
            onClick={downloadVehicle}
            disabled={!vehicle}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSave className="mr-2" /> Save Vehicle
          </button>
          <button
            onClick={() => setHistory([])}
            disabled={!history.length}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaRedo className="mr-2" /> Clear History
          </button>
        </div>

        {/* Vehicle Display */}
        {vehicle ? (
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h2 className="text-xl font-semibold mb-3 text-center text-green-600">
              {vehicle.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {Object.entries(vehicle).map(([key, value]) => (
                <p key={key}>
                  <span className="font-medium capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}:
                  </span>{" "}
                  {value}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 mb-6">
            Click "Generate New Vehicle" to create a random vehicle!
          </p>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-700 mb-2">Vehicle History</h3>
            <ul className="text-sm text-blue-600 space-y-2 max-h-48 overflow-y-auto">
              {history.map((v, index) => (
                <li
                  key={index}
                  className="cursor-pointer hover:bg-blue-100 p-2 rounded"
                  onClick={() => setVehicle(v)}
                >
                  {v.name} - {v.generatedAt}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Wide variety of vehicle types, brands, and features</li>
            <li>Customizable price and speed ranges</li>
            <li>Optional experimental vehicles and technologies</li>
            <li>Save vehicle details as text file</li>
            <li>History of generated vehicles (click to revisit)</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: All vehicles and specifications are fictional and generated for entertainment
          purposes.
        </p>
      </div>
    </div>
  );
};

export default RandomVehicleGenerator;