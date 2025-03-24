"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const RandomCountryGenerator = () => {
  const [country, setCountry] = useState(null);
  const [history, setHistory] = useState([]);
  const countryRef = React.useRef(null);

  // Expanded data arrays
  const prefixes = [
    "New", "Great", "Upper", "Lower", "East", "West", "North", "South", "Central", "Grand", "High", "Low"
  ];
  const roots = [
    "land", "stan", "ia", "rica", "opia", "esia", "ton", "via", "dor", "mark", "gard", "nia"
  ];
  const citySuffixes = [
    "ville", "burg", "ton", "port", "city", "haven", "ridge", "field", "ham", "stead", "gate"
  ];
  const features = [
    "lush forests", "towering mountains", "vast deserts", "pristine beaches", "rolling hills",
    "crystal lakes", "active volcanoes", "dense jungles", "windy plains", "frozen tundras",
    "serene rivers", "mystical caves"
  ];
  const cultures = [
    "ancient traditions", "vibrant festivals", "unique cuisine", "rich history",
    "modern architecture", "traditional music", "colorful markets", "peaceful monasteries",
    "dynamic dances", "intricate crafts"
  ];
  const governments = [
    "Democratic Republic", "Monarchy", "Federation", "Confederation", "Socialist State",
    "Theocracy", "Parliamentary System"
  ];
  const economies = [
    "agriculture-based", "industrial", "tech-driven", "tourism-focused", "mining-rich",
    "trade-oriented"
  ];

  // Generate a random country
  const generateCountry = useCallback(() => {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const root = roots[Math.floor(Math.random() * roots.length)];
    const citySuffix = citySuffixes[Math.floor(Math.random() * citySuffixes.length)];
    const name = `${prefix}${root.charAt(0).toUpperCase() + root.slice(1)}`;
    const capital = `${prefix} ${root.charAt(0).toUpperCase()}${citySuffix}`;
    const population = Math.floor(Math.random() * 95000000) + 5000000; // 5M to 100M
    const area = Math.floor(Math.random() * 1900000) + 10000; // 10K to 2M sq km
    const feature = features[Math.floor(Math.random() * features.length)];
    const culture = cultures[Math.floor(Math.random() * cultures.length)];
    const government = governments[Math.floor(Math.random() * governments.length)];
    const economy = economies[Math.floor(Math.random() * economies.length)];
    const currency = `${root.toUpperCase()}${Math.floor(Math.random() * 100)}`; // e.g., STAN45

    const newCountry = {
      name,
      capital,
      population: population.toLocaleString(),
      area: area.toLocaleString(),
      feature,
      culture,
      government,
      economy,
      currency
    };

    setCountry(newCountry);
    setHistory((prev) => [...prev, newCountry].slice(-5)); // Keep last 5 in history
  }, []);

  // Download the generated country card
  const downloadCountry = () => {
    if (countryRef.current) {
      html2canvas(countryRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `${country.name}-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Reset everything
  const reset = () => {
    setCountry(null);
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Country Generator
        </h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button
            onClick={generateCountry}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Generate New Country
          </button>
          <button
            onClick={downloadCountry}
            disabled={!country}
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

        {/* Country Display */}
        {country && (
          <div ref={countryRef} className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-inner">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center text-green-600">
              {country.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <p>
                <span className="font-medium">Capital:</span> {country.capital}
              </p>
              <p>
                <span className="font-medium">Population:</span> {country.population}
              </p>
              <p>
                <span className="font-medium">Area:</span> {country.area} sq km
              </p>
              <p>
                <span className="font-medium">Natural Feature:</span> {country.feature}
              </p>
              <p>
                <span className="font-medium">Cultural Highlight:</span> {country.culture}
              </p>
              <p>
                <span className="font-medium">Government:</span> {country.government}
              </p>
              <p>
                <span className="font-medium">Economy:</span> {country.economy}
              </p>
              <p>
                <span className="font-medium">Currency:</span> {country.currency}
              </p>
            </div>
          </div>
        )}

        {!country && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">
              Click "Generate New Country" to create a fictional nation!
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Recent Countries</h3>
            <ul className="text-sm text-blue-600 space-y-1 max-h-40 overflow-y-auto">
              {history.slice().reverse().map((prevCountry, index) => (
                <li
                  key={index}
                  className="cursor-pointer hover:text-blue-800"
                  onClick={() => setCountry(prevCountry)}
                >
                  {prevCountry.name} - {prevCountry.capital}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Generate unique fictional countries</li>
            <li>Expanded attributes: government, economy, currency</li>
            <li>Download country card as PNG</li>
            <li>History of recent generations (click to revisit)</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: These are fictional countries generated for entertainment purposes.
        </p>
      </div>
    </div>
  );
};

export default RandomCountryGenerator;