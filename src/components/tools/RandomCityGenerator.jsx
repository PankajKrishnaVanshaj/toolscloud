"use client";
import React, { useState, useCallback } from "react";
import { FaDice, FaDownload, FaSync } from "react-icons/fa";

const RandomCityGenerator = () => {
  const [city, setCity] = useState(null);
  const [history, setHistory] = useState([]);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [customPrefix, setCustomPrefix] = useState("");

  // Expanded data arrays
  const prefixes = [
    "New", "Fort", "Lake", "Port", "Saint", "West", "East", "North", "South", "Grand", "Old",
    "High", "Blue", "Red", "Green", "Silver", "Golden",
  ];
  const roots = [
    "haven", "wood", "ridge", "view", "field", "brook", "stone", "hill", "vale", "mont", "bay",
    "pine", "oak", "meadow", "crest", "shore", "glen", "spring",
  ];
  const suffixes = [
    "ton", "ville", "burg", "ford", "dale", " City", "opolis", "borough", "stead", "ham", "port",
    "ridge", "falls", "beach",
  ];
  const climates = [
    "Temperate", "Tropical", "Arid", "Polar", "Mediterranean", "Continental", "Subarctic",
    "Highland", "Savanna",
  ];
  const features = [
    "ancient ruins", "bustling markets", "towering skyscrapers", "sprawling parks",
    "historic castles", "vibrant nightlife", "pristine beaches", "dense forests",
    "majestic mountains", "winding rivers", "hidden caves", "serene lakes",
    "futuristic transit", "colorful festivals",
  ];
  const industries = [
    "technology", "tourism", "manufacturing", "agriculture", "fishing", "entertainment",
    "mining", "education", "trade", "arts", "aerospace", "fashion", "renewable energy",
  ];
  const cultures = [
    "cosmopolitan", "traditional", "artistic", "maritime", "industrial", "agrarian",
    "nomadic", "scholarly", "mystical",
  ];

  // Generate a random city
  const generateCity = useCallback(() => {
    const prefix = customPrefix || prefixes[Math.floor(Math.random() * prefixes.length)];
    const root = roots[Math.floor(Math.random() * roots.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const name = `${prefix} ${root}${suffix}`;

    const population = Math.floor(Math.random() * 19950001) + 50000; // 50k to 20M
    const climate = climates[Math.floor(Math.random() * climates.length)];
    const feature = features[Math.floor(Math.random() * features.length)];
    const industry = industries[Math.floor(Math.random() * industries.length)];
    const culture = cultures[Math.floor(Math.random() * cultures.length)];

    const newCity = {
      name,
      population: population.toLocaleString(),
      climate,
      notableFeature: feature,
      primaryIndustry: industry,
      culture,
      generatedAt: new Date().toLocaleString(),
    };

    setCity(newCity);
    setHistory((prev) => [newCity, ...prev].slice(0, 5)); // Keep last 5 cities
  }, [customPrefix]);

  // Download city details as text
  const downloadCity = () => {
    if (!city) return;
    const text = `City: ${city.name}
Population: ${city.population}
Climate: ${city.climate}
Notable Feature: ${city.notableFeature}
Primary Industry: ${city.primaryIndustry}
Culture: ${city.culture}
Generated: ${city.generatedAt}`;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${city.name.replace(/\s+/g, "-")}.txt`;
    link.click();
  };

  // Clear history and current city
  const reset = () => {
    setCity(null);
    setHistory([]);
    setCustomPrefix("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random City Generator
        </h1>

        {/* Controls */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Prefix (optional)
              </label>
              <input
                type="text"
                value={customPrefix}
                onChange={(e) => setCustomPrefix(e.target.value.trim())}
                placeholder="e.g., Crystal"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={generateCity}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDice className="mr-2" /> Generate
              </button>
              <button
                onClick={downloadCity}
                disabled={!city}
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
          </div>

          {/* Options */}
          <div className="flex items-center justify-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeDetails}
                onChange={(e) => setIncludeDetails(e.target.checked)}
                className="mr-2 accent-green-500"
              />
              <span className="text-sm text-gray-700">Include Detailed Info</span>
            </label>
          </div>

          {/* City Display */}
          {city && (
            <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-center text-green-600">
                {city.name}
              </h2>
              {includeDetails && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <p>
                    <span className="font-medium">Population:</span> {city.population}
                  </p>
                  <p>
                    <span className="font-medium">Climate:</span> {city.climate}
                  </p>
                  <p>
                    <span className="font-medium">Notable Feature:</span> {city.notableFeature}
                  </p>
                  <p>
                    <span className="font-medium">Primary Industry:</span> {city.primaryIndustry}
                  </p>
                  <p>
                    <span className="font-medium">Culture:</span> {city.culture}
                  </p>
                  <p>
                    <span className="font-medium">Generated:</span> {city.generatedAt}
                  </p>
                </div>
              )}
            </div>
          )}

          {!city && (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500 italic">
                Click "Generate" to create a random city!
              </p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">Recent Cities</h3>
              <ul className="text-sm text-blue-600 space-y-2 max-h-40 overflow-y-auto">
                {history.map((pastCity, index) => (
                  <li
                    key={index}
                    className="cursor-pointer hover:underline"
                    onClick={() => setCity(pastCity)}
                  >
                    {pastCity.name} ({pastCity.generatedAt})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
              <li>Custom prefix option</li>
              <li>Expanded name components and attributes</li>
              <li>Population range: 50k to 20M</li>
              <li>Toggle detailed info</li>
              <li>Download city details as text</li>
              <li>History of last 5 generated cities</li>
            </ul>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Note: These are fictional cities for creative inspiration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RandomCityGenerator;