// components/RandomInventionIdeaGenerator.js
'use client';

import React, { useState } from 'react';

const RandomInventionIdeaGenerator = () => {
  const [invention, setInvention] = useState(null);

  const components = [
    'Robot', 'Device', 'Gadget', 'Machine', 'App', 'Wearable', 'Drone', 
    'Implant', 'Vehicle', 'System', 'Tool', 'Platform'
  ];
  
  const purposes = [
    'cleaning', 'cooking', 'traveling', 'learning', 'exercising', 'monitoring',
    'entertaining', 'communicating', 'organizing', 'healing', 'gaming', 
    'creating', 'protecting', 'exploring'
  ];
  
  const features = [
    'AI-powered', 'solar-powered', 'voice-activated', 'self-learning', 
    'biodegradable', 'invisible', 'foldable', 'waterproof', 'holographic',
    'telepathic', 'self-repairing', 'temperature-controlled', 
    'gravity-defying', 'time-tracking'
  ];
  
  const adjectives = [
    'Smart', 'Portable', 'Eco-Friendly', 'Futuristic', 'Compact', 
    'Intelligent', 'Revolutionary', 'Ultra-Light', 'Versatile', 
    'Hyper-Efficient', 'Quantum', 'Nano'
  ];

  const generateInvention = () => {
    const component = components[Math.floor(Math.random() * components.length)];
    const purpose = purposes[Math.floor(Math.random() * purposes.length)];
    const feature = features[Math.floor(Math.random() * features.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    
    const name = `${adjective} ${component}`;
    const description = `A ${feature} ${component.toLowerCase()} designed for ${purpose}.`;
    
    setInvention({ name, description });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Invention Idea Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateInvention}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
        >
          Generate New Invention
        </button>
      </div>

      {invention && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <h2 className="text-xl font-semibold mb-3 text-indigo-600">
            {invention.name}
          </h2>
          <p className="text-gray-700">
            {invention.description}
          </p>
        </div>
      )}

      {!invention && (
        <p className="text-center text-gray-500">
          Click the button to generate a random invention idea!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: These are fictional invention ideas generated for inspiration and fun!
      </p>
    </div>
  );
};

export default RandomInventionIdeaGenerator;