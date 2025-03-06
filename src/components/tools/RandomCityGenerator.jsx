// components/RandomCityGenerator.js
'use client';

import React, { useState } from 'react';

const RandomCityGenerator = () => {
  const [city, setCity] = useState(null);

  const prefixes = ['New', 'Fort', 'Lake', 'Port', 'Saint', 'West', 'East', 'North', 'South', 'Grand'];
  const roots = ['haven', 'wood', 'ridge', 'view', 'field', 'brook', 'stone', 'hill', 'vale', 'mont', 'bay'];
  const suffixes = ['ton', 'ville', 'burg', 'ford', 'dale', ' City', 'opolis', 'borough', 'stead'];

  const climates = ['Temperate', 'Tropical', 'Arid', 'Polar', 'Mediterranean', 'Continental'];
  const features = [
    'ancient ruins', 'bustling markets', 'towering skyscrapers', 'sprawling parks', 
    'historic castles', 'vibrant nightlife', 'pristine beaches', 'dense forests', 
    'majestic mountains', 'winding rivers'
  ];
  const industries = [
    'technology', 'tourism', 'manufacturing', 'agriculture', 'fishing', 
    'entertainment', 'mining', 'education', 'trade', 'arts'
  ];

  const generateCity = () => {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const root = roots[Math.floor(Math.random() * roots.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const name = `${prefix} ${root}${suffix}`;

    const population = Math.floor(Math.random() * 9950001) + 50000; // 50k to 10M
    const climate = climates[Math.floor(Math.random() * climates.length)];
    const feature = features[Math.floor(Math.random() * features.length)];
    const industry = industries[Math.floor(Math.random() * industries.length)];

    setCity({
      name,
      population: population.toLocaleString(),
      climate,
      notableFeature: feature,
      primaryIndustry: industry
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random City Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateCity}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Generate New City
        </button>
      </div>

      {city && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-3 text-center text-green-600">
            {city.name}
          </h2>
          <div className="grid grid-cols-1 gap-2 text-sm">
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
          </div>
        </div>
      )}

      {!city && (
        <p className="text-center text-gray-500">
          Click the button to generate a random city!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: These are fictional cities generated for creative inspiration.
      </p>
    </div>
  );
};

export default RandomCityGenerator;