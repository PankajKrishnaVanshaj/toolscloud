// components/RandomHolidayGenerator.js
'use client';

import React, { useState } from 'react';

const RandomHolidayGenerator = () => {
  const [holiday, setHoliday] = useState(null);

  const prefixes = [
    'National', 'Global', 'Annual', 'Cosmic', 'Lunar', 'Solar', 
    'Mystic', 'Festive', 'Grand', 'Silly', 'Whimsical'
  ];
  
  const themes = [
    'Pancake', 'Starlight', 'Robot', 'Penguin', 'Cloud', 'Rainbow', 
    'Music', 'Chocolate', 'Dream', 'Adventure', 'Moonbeam', 'Firefly',
    'Bubble', 'Llama', 'Unicorn'
  ];
  
  const suffixes = [
    'Day', 'Festival', 'Celebration', 'Eve', 'Week', 'Extravaganza',
    'Jubilee', 'Gala', 'Fête', 'Carnival'
  ];
  
  const activities = [
    'dancing in the streets', 'eating themed foods', 'wearing colorful costumes',
    'launching fireworks', 'singing traditional songs', 'exchanging gifts',
    'parading with floats', 'lighting lanterns', 'baking special treats',
    'telling ancient stories', 'painting faces', 'building elaborate displays'
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const generateHoliday = () => {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const theme = themes[Math.floor(Math.random() * themes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const month = months[Math.floor(Math.random() * months.length)];
    const day = Math.floor(Math.random() * 28) + 1; // Keep it 1-28 to avoid month-end issues
    
    const name = `${prefix} ${theme} ${suffix}`;
    const date = `${month} ${day}`;
    const description = `Celebrated by ${activity} to honor the spirit of ${theme.toLowerCase()}.`;
    
    setHoliday({ name, date, description });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Holiday Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateHoliday}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Generate New Holiday
        </button>
      </div>

      {holiday && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <h2 className="text-xl font-semibold mb-2 text-green-600">
            {holiday.name}
          </h2>
          <p className="text-gray-700 mb-2">
            <span className="font-medium">Date:</span> {holiday.date}
          </p>
          <p className="text-gray-700">
            {holiday.description}
          </p>
        </div>
      )}

      {!holiday && (
        <p className="text-center text-gray-500">
          Click the button to generate a random holiday!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: These are fictional holidays created for fun and imagination!
      </p>
    </div>
  );
};

export default RandomHolidayGenerator;