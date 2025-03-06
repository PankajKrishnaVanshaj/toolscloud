// components/RandomCharityFinder.js
'use client';

import React, { useState } from 'react';

const RandomCharityFinder = () => {
  const [selectedCharity, setSelectedCharity] = useState(null);

  // Sample charity data (in a real app, this could come from an API)
  const charities = [
    {
      name: "Red Cross",
      description: "Provides emergency assistance, disaster relief, and preparedness education worldwide.",
      website: "https://www.redcross.org",
      category: "Disaster Relief"
    },
    {
      name: "Doctors Without Borders",
      description: "Delivers medical aid to people affected by conflict, epidemics, or disasters.",
      website: "https://www.doctorswithoutborders.org",
      category: "Medical"
    },
    {
      name: "World Wildlife Fund",
      description: "Works to conserve nature and reduce threats to the diversity of life on Earth.",
      website: "https://www.worldwildlife.org",
      category: "Environment"
    },
    {
      name: "UNICEF",
      description: "Protects children's rights, helps meet basic needs, and expands opportunities.",
      website: "https://www.unicef.org",
      category: "Children"
    },
    {
      name: "Habitat for Humanity",
      description: "Builds and repairs homes to provide affordable housing solutions.",
      website: "https://www.habitat.org",
      category: "Housing"
    },
    {
      name: "Feeding America",
      description: "Nationwide network of food banks fighting hunger in the United States.",
      website: "https://www.feedingamerica.org",
      category: "Food Security"
    }
  ];

  const generateRandomCharity = () => {
    const randomIndex = Math.floor(Math.random() * charities.length);
    setSelectedCharity(charities[randomIndex]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Charity Finder</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateRandomCharity}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Find a Random Charity
        </button>
      </div>

      {selectedCharity && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <h2 className="text-xl font-semibold mb-2 text-green-600">
            {selectedCharity.name}
          </h2>
          <p className="text-sm text-gray-600 mb-2">
            Category: {selectedCharity.category}
          </p>
          <p className="text-gray-700 mb-3">
            {selectedCharity.description}
          </p>
          <a
            href={selectedCharity.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Visit Website
          </a>
        </div>
      )}

      {!selectedCharity && (
        <p className="text-center text-gray-500">
          Click the button to discover a random charity!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: This is a sample selection of charities. Always research organizations before donating.
      </p>
    </div>
  );
};

export default RandomCharityFinder;