// components/RandomCountryGenerator.js
'use client';

import React, { useState } from 'react';

const RandomCountryGenerator = () => {
  const [country, setCountry] = useState(null);

  const prefixes = ['New', 'Great', 'Upper', 'Lower', 'East', 'West', 'North', 'South', 'Central'];
  const roots = ['land', 'stan', 'ia', 'rica', 'opia', 'esia', 'ton', 'via', 'dor'];
  const citySuffixes = ['ville', 'burg', 'ton', 'port', 'city', 'haven', 'ridge', 'field'];
  const features = [
    'lush forests', 'towering mountains', 'vast deserts', 'pristine beaches',
    'rolling hills', 'crystal lakes', 'active volcanoes', 'dense jungles',
    'windy plains', 'frozen tundras'
  ];
  const cultures = [
    'ancient traditions', 'vibrant festivals', 'unique cuisine', 'rich history',
    'modern architecture', 'traditional music', 'colorful markets', 'peaceful monasteries'
  ];

  const generateCountry = () => {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const root = roots[Math.floor(Math.random() * roots.length)];
    const citySuffix = citySuffixes[Math.floor(Math.random() * citySuffixes.length)];
    const name = `${prefix}${root.charAt(0).toUpperCase() + root.slice(1)}`;
    const capital = `${prefix} ${root.charAt(0).toUpperCase()}${citySuffix}`;
    const population = Math.floor(Math.random() * 95000000) + 5000000; // 5M to 100M
    const area = Math.floor(Math.random() * 1900000) + 10000; // 10K to 2M sq km
    const feature = features[Math.floor(Math.random() * features.length)];
    const culture = cultures[Math.floor(Math.random() * cultures.length)];

    setCountry({
      name,
      capital,
      population: population.toLocaleString(),
      area: area.toLocaleString(),
      feature,
      culture
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Country Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateCountry}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Generate New Country
        </button>
      </div>

      {country && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-3 text-center text-green-600">
            {country.name}
          </h2>
          <div className="grid grid-cols-1 gap-2 text-sm">
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
          </div>
        </div>
      )}

      {!country && (
        <p className="text-center text-gray-500">
          Click the button to generate a random country!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: These are fictional countries generated for entertainment purposes.
      </p>
    </div>
  );
};

export default RandomCountryGenerator;