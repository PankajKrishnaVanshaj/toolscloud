// components/RandomPlantGenerator.js
'use client';

import React, { useState } from 'react';

const RandomPlantGenerator = () => {
  const [plant, setPlant] = useState(null);

  const plantTypes = ['Tree', 'Shrub', 'Vine', 'Fern', 'Flower', 'Cactus', 'Moss'];
  const habitats = ['Forest', 'Desert', 'Jungle', 'Mountain', 'Swamp', 'Tundra', 'Grassland'];
  const colors = ['Red', 'Blue', 'Purple', 'Yellow', 'Green', 'Orange', 'Pink', 'Silver'];
  const properties = [
    'Glows in the dark', 'Changes color seasonally', 'Releases fragrant mist',
    'Attracts rare insects', 'Has healing sap', 'Grows edible crystals',
    'Sings in the wind', 'Floats above ground', 'Absorbs moonlight'
  ];
  const prefixes = ['Luna', 'Solar', 'Aqua', 'Terra', 'Vita', 'Echo', 'Nova'];
  const suffixes = ['flora', 'thorn', 'bloom', 'leaf', 'root', 'spire', 'petal'];

  const generatePlant = () => {
    const type = plantTypes[Math.floor(Math.random() * plantTypes.length)];
    const habitat = habitats[Math.floor(Math.random() * habitats.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const property = properties[Math.floor(Math.random() * properties.length)];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    const name = `${prefix}${suffix}`;
    const description = `A ${color.toLowerCase()} ${type.toLowerCase()} found in ${habitat.toLowerCase()} regions, known to ${property.toLowerCase()}.`;

    setPlant({
      name,
      type,
      habitat,
      color,
      property,
      description
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Plant Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generatePlant}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Generate New Plant
        </button>
      </div>

      {plant && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-3 text-center text-green-600">
            {plant.name}
          </h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Type:</span> {plant.type}</p>
            <p><span className="font-medium">Habitat:</span> {plant.habitat}</p>
            <p><span className="font-medium">Color:</span> {plant.color}</p>
            <p><span className="font-medium">Unique Property:</span> {plant.property}</p>
            <p className="mt-2 italic text-gray-700">{plant.description}</p>
          </div>
        </div>
      )}

      {!plant && (
        <p className="text-center text-gray-500">
          Click the button to generate a random plant!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: These are fictional plants generated for creative inspiration!
      </p>
    </div>
  );
};

export default RandomPlantGenerator;