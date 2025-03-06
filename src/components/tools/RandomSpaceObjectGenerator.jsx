// components/RandomSpaceObjectGenerator.js
'use client';

import React, { useState } from 'react';

const RandomSpaceObjectGenerator = () => {
  const [spaceObject, setSpaceObject] = useState(null);

  const objectTypes = ['Star', 'Planet', 'Moon', 'Asteroid', 'Comet', 'Nebula'];
  const starTypes = ['Red Dwarf', 'Yellow Dwarf', 'Blue Giant', 'White Dwarf', 'Neutron Star'];
  const planetTypes = ['Terrestrial', 'Gas Giant', 'Ice Giant', 'Dwarf Planet'];
  const compositions = ['Rock', 'Ice', 'Gas', 'Metal', 'Dust'];
  const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Zeta', 'Omega'];
  const suffixes = ['Prime', 'Major', 'Minor', 'Secundus', 'Nebulous', 'Stellar'];

  const generateRandomObject = () => {
    const type = objectTypes[Math.floor(Math.random() * objectTypes.length)];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const name = `${prefix} ${suffix}`;
    
    let details = {
      type,
      name,
      size: `${Math.floor(Math.random() * 10000) + 1} km`,
      distance: `${Math.floor(Math.random() * 1000) + 1} light-years`,
      composition: compositions[Math.floor(Math.random() * compositions.length)],
    };

    if (type === 'Star') {
      details.subType = starTypes[Math.floor(Math.random() * starTypes.length)];
      details.temperature = `${Math.floor(Math.random() * 25000) + 500} K`;
    } else if (type === 'Planet') {
      details.subType = planetTypes[Math.floor(Math.random() * planetTypes.length)];
      details.moons = Math.floor(Math.random() * 20);
    } else if (type === 'Moon') {
      details.orbiting = `${prefix} Major`;
    }

    setSpaceObject(details);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Space Object Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateRandomObject}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Generate New Space Object
        </button>
      </div>

      {spaceObject && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-3 text-center text-blue-600">
            {spaceObject.name}
          </h2>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p>
              <span className="font-medium">Type:</span> {spaceObject.type}
              {spaceObject.subType && ` (${spaceObject.subType})`}
            </p>
            <p>
              <span className="font-medium">Size:</span> {spaceObject.size}
            </p>
            <p>
              <span className="font-medium">Distance:</span> {spaceObject.distance}
            </p>
            <p>
              <span className="font-medium">Composition:</span> {spaceObject.composition}
            </p>
            {spaceObject.temperature && (
              <p>
                <span className="font-medium">Temperature:</span> {spaceObject.temperature}
              </p>
            )}
            {spaceObject.moons !== undefined && (
              <p>
                <span className="font-medium">Moons:</span> {spaceObject.moons}
              </p>
            )}
            {spaceObject.orbiting && (
              <p>
                <span className="font-medium">Orbiting:</span> {spaceObject.orbiting}
              </p>
            )}
          </div>
        </div>
      )}

      {!spaceObject && (
        <p className="text-center text-gray-500">
          Click the button to generate a random space object!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: All values are fictional and randomly generated for entertainment purposes.
      </p>
    </div>
  );
};

export default RandomSpaceObjectGenerator;