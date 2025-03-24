"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload, FaMapMarkerAlt } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const RandomTravelDestinationGenerator = () => {
  const [destination, setDestination] = useState(null);
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({
    continent: "Any",
    type: "Any",
    season: "Any",
    minBudget: 500,
    maxBudget: 5000,
  });
  const cardRef = React.useRef(null);

  // Expanded data arrays
  const continents = [
    "Africa",
    "Asia",
    "Europe",
    "North America",
    "South America",
    "Australia",
    "Antarctica",
  ];
  const destinationTypes = [
    "City",
    "Beach",
    "Mountain",
    "Forest",
    "Desert",
    "Island",
    "Countryside",
    "Volcano",
    "Lake",
  ];
  const seasons = ["Spring", "Summer", "Fall", "Winter"];
  const activities = [
    "hiking",
    "swimming",
    "skiing",
    "sightseeing",
    "food tasting",
    "shopping",
    "wildlife watching",
    "cultural exploration",
    "photography",
    "camping",
    "adventure sports",
    "relaxation",
    "diving",
    "stargazing",
  ];
  const adjectives = [
    "Vibrant",
    "Serene",
    "Majestic",
    "Hidden",
    "Exotic",
    "Charming",
    "Breathtaking",
    "Historic",
    "Lush",
    "Remote",
    "Picturesque",
    "Thrilling",
    "Mystical",
    "Pristine",
  ];
  const travelStyles = [
    "Budget",
    "Luxury",
    "Eco-Friendly",
    "Adventure",
    "Romantic",
    "Family-Friendly",
  ];

  // Generate a random destination
  const generateDestination = useCallback(() => {
    const continent =
      filters.continent === "Any"
        ? continents[Math.floor(Math.random() * continents.length)]
        : filters.continent;
    const type =
      filters.type === "Any"
        ? destinationTypes[Math.floor(Math.random() * destinationTypes.length)]
        : filters.type;
    const season =
      filters.season === "Any"
        ? seasons[Math.floor(Math.random() * seasons.length)]
        : filters.season;
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const travelStyle = travelStyles[Math.floor(Math.random() * travelStyles.length)];
    const activityCount = Math.floor(Math.random() * 3) + 2; // 2-4 activities
    const uniqueActivities = new Set();
    while (uniqueActivities.size < activityCount) {
      uniqueActivities.add(activities[Math.floor(Math.random() * activities.length)]);
    }
    const budget = Math.floor(
      Math.random() * (filters.maxBudget - filters.minBudget + 1) + filters.minBudget
    );

    const name = `${adjective} ${type} of ${continent}`;
    const description = `A ${travelStyle.toLowerCase()} ${type.toLowerCase()} destination in ${continent}, ideal for ${season.toLowerCase()} travel. Enjoy ${Array.from(uniqueActivities)
      .map((act) => act.toLowerCase())
      .join(", ")}. Estimated budget: $${budget}.`;

    const newDestination = {
      name,
      description,
      continent,
      type,
      season,
      activities: Array.from(uniqueActivities),
      travelStyle,
      budget,
    };

    setDestination(newDestination);
    setHistory((prev) => [...prev, newDestination].slice(-5)); // Keep last 5
  }, [filters]);

  // Download destination card
  const downloadDestination = () => {
    if (cardRef.current) {
      html2canvas(cardRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `travel-destination-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      continent: "Any",
      type: "Any",
      season: "Any",
      minBudget: 500,
      maxBudget: 5000,
    });
    setDestination(null);
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Travel Destination Generator
        </h1>

        {/* Filters */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Customize Your Trip</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Continent</label>
              <select
                value={filters.continent}
                onChange={(e) => setFilters({ ...filters, continent: e.target.value })}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="Any">Any</option>
                {continents.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="Any">Any</option>
                {destinationTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
              <select
                value={filters.season}
                onChange={(e) => setFilters({ ...filters, season: e.target.value })}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="Any">Any</option>
                {seasons.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Budget ($)
              </label>
              <input
                type="number"
                min="100"
                max={filters.maxBudget}
                value={filters.minBudget}
                onChange={(e) =>
                  setFilters({ ...filters, minBudget: parseInt(e.target.value) || 500 })
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Budget ($)
              </label>
              <input
                type="number"
                min={filters.minBudget}
                max="10000"
                value={filters.maxBudget}
                onChange={(e) =>
                  setFilters({ ...filters, maxBudget: parseInt(e.target.value) || 5000 })
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={generateDestination}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <FaMapMarkerAlt className="mr-2" /> Generate Destination
          </button>
          <button
            onClick={downloadDestination}
            disabled={!destination}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download
          </button>
          <button
            onClick={resetFilters}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Destination Display */}
        {destination && (
          <div ref={cardRef} className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-center text-green-600">
              {destination.name}
            </h2>
            <p className="text-gray-700 text-center mb-4">{destination.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <p>
                <span className="font-medium">Continent:</span> {destination.continent}
              </p>
              <p>
                <span className="font-medium">Type:</span> {destination.type}
              </p>
              <p>
                <span className="font-medium">Best Season:</span> {destination.season}
              </p>
              <p>
                <span className="font-medium">Travel Style:</span> {destination.travelStyle}
              </p>
              <p>
                <span className="font-medium">Budget:</span> ${destination.budget}
              </p>
              <p>
                <span className="font-medium">Activities:</span>{" "}
                {destination.activities.join(", ")}
              </p>
            </div>
          </div>
        )}

        {!destination && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaMapMarkerAlt className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">
              Generate a random travel destination to get started!
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Recent Destinations</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1 max-h-40 overflow-y-auto">
              {history.slice().reverse().map((dest, index) => (
                <li key={index}>
                  {dest.name} - {dest.season}, ${dest.budget}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Custom filters for continent, type, season, and budget</li>
            <li>Multiple travel styles and expanded activities</li>
            <li>History of recent destinations</li>
            <li>Download destination as PNG</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: These are fictional destinations generated for inspiration and fun!
        </p>
      </div>
    </div>
  );
};

export default RandomTravelDestinationGenerator;