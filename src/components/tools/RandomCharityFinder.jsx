"use client";
import React, { useState, useCallback } from "react";
import { FaRandom, FaSync, FaFilter } from "react-icons/fa";

const RandomCharityFinder = () => {
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Expanded charity data
  const charities = [
    {
      name: "Red Cross",
      description: "Provides emergency assistance, disaster relief, and preparedness education worldwide.",
      website: "https://www.redcross.org",
      category: "Disaster Relief",
      donationLink: "#",
      location: "Global",
    },
    {
      name: "Doctors Without Borders",
      description: "Delivers medical aid to people affected by conflict, epidemics, or disasters.",
      website: "https://www.doctorswithoutborders.org",
      category: "Medical",
      donationLink: "#",
      location: "Global",
    },
    {
      name: "World Wildlife Fund",
      description: "Works to conserve nature and reduce threats to the diversity of life on Earth.",
      website: "https://www.worldwildlife.org",
      category: "Environment",
      donationLink: "#",
      location: "Global",
    },
    {
      name: "UNICEF",
      description: "Protects children's rights, helps meet basic needs, and expands opportunities.",
      website: "https://www.unicef.org",
      category: "Children",
      donationLink: "#",
      location: "Global",
    },
    {
      name: "Habitat for Humanity",
      description: "Builds and repairs homes to provide affordable housing solutions.",
      website: "https://www.habitat.org",
      category: "Housing",
      donationLink: "#",
      location: "Global",
    },
    {
      name: "Feeding America",
      description: "Nationwide network of food banks fighting hunger in the United States.",
      website: "https://www.feedingamerica.org",
      category: "Food Security",
      donationLink: "#",
      location: "USA",
    },
    {
      name: "Oxfam",
      description: "Works to end global poverty through humanitarian aid and advocacy.",
      website: "https://www.oxfam.org",
      category: "Poverty",
      donationLink: "#",
      location: "Global",
    },
  ];

  // Unique categories for filter
  const categories = ["all", ...new Set(charities.map((c) => c.category))];

  // Generate random charity with filter
  const generateRandomCharity = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const filteredCharities =
        categoryFilter === "all"
          ? charities
          : charities.filter((c) => c.category === categoryFilter);
      if (filteredCharities.length === 0) {
        setSelectedCharity(null);
        setIsLoading(false);
        return;
      }
      const randomIndex = Math.floor(Math.random() * filteredCharities.length);
      const newCharity = filteredCharities[randomIndex];
      setSelectedCharity(newCharity);
      setHistory((prev) => [newCharity, ...prev.slice(0, 4)]); // Keep last 5
      setIsLoading(false);
    }, 500); // Simulate loading
  }, [categoryFilter, charities]);

  // Reset to initial state
  const reset = () => {
    setSelectedCharity(null);
    setCategoryFilter("all");
    setHistory([]);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Charity Finder
        </h1>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
                disabled={isLoading}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={generateRandomCharity}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <FaRandom className="mr-2" />
              )}
              {isLoading ? "Finding..." : "Find Random Charity"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Selected Charity */}
        {selectedCharity && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-green-600">
              {selectedCharity.name}
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              Category: {selectedCharity.category} | Location: {selectedCharity.location}
            </p>
            <p className="text-gray-700 mb-4">{selectedCharity.description}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={selectedCharity.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Visit Website
              </a>
              <a
                href={selectedCharity.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
              >
                Donate Now
              </a>
            </div>
          </div>
        )}

        {!selectedCharity && !isLoading && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaRandom className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">
              Click "Find Random Charity" to discover a new organization!
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-700 mb-2">Recent Finds</h3>
            <ul className="text-sm text-blue-600 space-y-2 max-h-40 overflow-y-auto">
              {history.map((charity, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center hover:bg-blue-100 p-1 rounded"
                >
                  <span>
                    {charity.name} ({charity.category})
                  </span>
                  <button
                    onClick={() => setSelectedCharity(charity)}
                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Random charity selection from a diverse list</li>
            <li>Category filtering</li>
            <li>History of recent finds</li>
            <li>Direct links to website and donation pages</li>
            <li>Loading animation for better UX</li>
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: This is a sample selection of charities. Always research organizations before donating.
        </p>
      </div>
    </div>
  );
};

export default RandomCharityFinder;