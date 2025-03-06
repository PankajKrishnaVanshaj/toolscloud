// components/RandomTravelDestinationGenerator.js
'use client';

import React, { useState } from 'react';

const RandomTravelDestinationGenerator = () => {
  const [destination, setDestination] = useState(null);

  const continents = [
    'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Australia', 'Antarctica'
  ];
  
  const destinationTypes = [
    'City', 'Beach', 'Mountain', 'Forest', 'Desert', 'Island', 'Countryside'
  ];
  
  const seasons = [
    'Spring', 'Summer', 'Fall', 'Winter'
  ];
  
  const activities = [
    'hiking', 'swimming', 'skiing', 'sightseeing', 'food tasting', 'shopping',
    'wildlife watching', 'cultural exploration', 'photography', 'camping',
    'adventure sports', 'relaxation'
  ];
  
  const adjectives = [
    'Vibrant', 'Serene', 'Majestic', 'Hidden', 'Exotic', 'Charming',
    'Breathtaking', 'Historic', 'Lush', 'Remote', 'Picturesque', 'Thrilling'
  ];

  const generateDestination = () => {
    const continent = continents[Math.floor(Math.random() * continents.length)];
    const type = destinationTypes[Math.floor(Math.random() * destinationTypes.length)];
    const season = seasons[Math.floor(Math.random() * seasons.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const activity1 = activities[Math.floor(Math.random() * activities.length)];
    const activity2 = activities[Math.floor(Math.random() * activities.length)];
    
    // Ensure two different activities
    const uniqueActivities = activity1 === activity2 
      ? [activity1, activities[Math.floor(Math.random() * activities.length)]] 
      : [activity1, activity2];

    const name = `${adjective} ${type} of ${continent}`;
    const description = `A ${type.toLowerCase()} destination in ${continent}, perfect for ${season.toLowerCase()} travel. Enjoy ${uniqueActivities[0]} and ${uniqueActivities[1]}.`;

    setDestination({
      name,
      description,
      continent,
      type,
      season,
      activities: uniqueActivities
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Travel Destination Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateDestination}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Generate New Destination
        </button>
      </div>

      {destination && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-3 text-center text-green-600">
            {destination.name}
          </h2>
          <p className="text-gray-700 text-center mb-4">
            {destination.description}
          </p>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><span className="font-medium">Continent:</span> {destination.continent}</p>
            <p><span className="font-medium">Type:</span> {destination.type}</p>
            <p><span className="font-medium">Best Season:</span> {destination.season}</p>
            <p><span className="font-medium">Activities:</span> {destination.activities.join(', ')}</p>
          </div>
        </div>
      )}

      {!destination && (
        <p className="text-center text-gray-500">
          Click the button to generate a random travel destination!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: These are fictional destinations generated for inspiration and fun!
      </p>
    </div>
  );
};

export default RandomTravelDestinationGenerator;