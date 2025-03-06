// components/RandomHistoricalEventGenerator.js
'use client';

import React, { useState } from 'react';

const RandomHistoricalEventGenerator = () => {
  const [event, setEvent] = useState(null);

  const eventTypes = [
    'Battle', 'Discovery', 'Invention', 'Revolution', 'Treaty', 
    'Coronation', 'Disaster', 'Expedition', 'Founding', 'Celebration'
  ];

  const locations = [
    'Rome', 'London', 'Paris', 'Beijing', 'Cairo', 'Athens', 'Moscow', 
    'Tokyo', 'New York', 'Constantinople', 'Vienna', 'Babylon', 
    'Jerusalem', 'Tenochtitlan'
  ];

  const descriptors = [
    'Great', 'Bloody', 'Famous', 'Unexpected', 'Legendary', 'Tragic', 
    'Glorious', 'Mysterious', 'Epic', 'Historic', 'Fateful', 'Monumental'
  ];

  const actors = [
    'King', 'Queen', 'General', 'Explorer', 'Inventor', 'Philosopher', 
    'Rebel', 'Priest', 'Merchant', 'Scientist', 'Emperor', 'Prophet'
  ];

  const actions = [
    'defeated', 'discovered', 'invented', 'overthrew', 'signed', 
    'crowned', 'survived', 'explored', 'founded', 'celebrated'
  ];

  const subjects = [
    'an army', 'a new land', 'a machine', 'the monarchy', 'a peace accord', 
    'a new ruler', 'a catastrophe', 'uncharted territory', 'a city', 
    'a grand festival'
  ];

  const generateEvent = () => {
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
    const actor = actors[Math.floor(Math.random() * actors.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    
    // Generate a random year between 500 BCE and 1900 CE
    const year = Math.floor(Math.random() * 2401) - 500;
    const yearString = year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;

    const name = `The ${descriptor} ${type} of ${location}`;
    const description = `In ${yearString}, a ${actor.toLowerCase()} ${action} ${subject} during the ${type.toLowerCase()} in ${location}.`;

    setEvent({ name, description, year: yearString });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Historical Event Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateEvent}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Generate New Event
        </button>
      </div>

      {event && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <h2 className="text-xl font-semibold mb-2 text-green-600">
            {event.name}
          </h2>
          <p className="text-gray-600 mb-2">
            {event.year}
          </p>
          <p className="text-gray-700">
            {event.description}
          </p>
        </div>
      )}

      {!event && (
        <p className="text-center text-gray-500">
          Click the button to generate a random historical event!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: These are fictional events generated for entertainment and inspiration.
      </p>
    </div>
  );
};

export default RandomHistoricalEventGenerator;