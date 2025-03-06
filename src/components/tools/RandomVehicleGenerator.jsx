// components/RandomVehicleGenerator.js
'use client';

import React, { useState } from 'react';

const RandomVehicleGenerator = () => {
  const [vehicle, setVehicle] = useState(null);

  const vehicleTypes = [
    'Car', 'Truck', 'Motorcycle', 'Van', 'SUV', 'Bus', 'Boat', 
    'Airplane', 'Helicopter', 'Hovercraft', 'Scooter'
  ];
  
  const brands = [
    'Nova', 'Peak', 'Apex', 'Zephyr', 'Vortex', 'Stellar', 'Pulse', 
    'Eclipse', 'Aurora', 'Titan', 'Quantum', 'Blaze'
  ];
  
  const powerSources = [
    'Electric', 'Gasoline', 'Hybrid', 'Diesel', 'Hydrogen', 'Solar', 'Steam'
  ];
  
  const features = [
    'self-driving', 'amphibious', 'all-terrain', 'turbo-charged', 
    'convertible', 'armored', 'flying', 'voice-controlled', 
    'solar-powered', 'stealth', 'hyper-speed', 'eco-friendly'
  ];
  
  const colors = [
    'Midnight Black', 'Arctic White', 'Crimson Red', 'Sapphire Blue', 
    'Emerald Green', 'Solar Yellow', 'Titanium Silver', 'Cosmic Purple'
  ];

  const generateVehicle = () => {
    const type = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const power = powerSources[Math.floor(Math.random() * powerSources.length)];
    const feature = features[Math.floor(Math.random() * features.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const name = `${brand} ${type} ${Math.floor(Math.random() * 900) + 100}`; // Adds model number
    const details = {
      type,
      name,
      powerSource: power,
      feature,
      color,
      topSpeed: `${Math.floor(Math.random() * 300) + 50} mph`,
      price: `$${(Math.floor(Math.random() * 200000) + 5000).toLocaleString()}`
    };

    setVehicle(details);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Vehicle Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateVehicle}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Generate New Vehicle
        </button>
      </div>

      {vehicle && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-3 text-center text-green-600">
            {vehicle.name}
          </h2>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p>
              <span className="font-medium">Type:</span> {vehicle.type}
            </p>
            <p>
              <span className="font-medium">Power Source:</span> {vehicle.powerSource}
            </p>
            <p>
              <span className="font-medium">Special Feature:</span> {vehicle.feature}
            </p>
            <p>
              <span className="font-medium">Color:</span> {vehicle.color}
            </p>
            <p>
              <span className="font-medium">Top Speed:</span> {vehicle.topSpeed}
            </p>
            <p>
              <span className="font-medium">Price:</span> {vehicle.price}
            </p>
          </div>
        </div>
      )}

      {!vehicle && (
        <p className="text-center text-gray-500">
          Click the button to generate a random vehicle!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: All vehicles and specifications are fictional and generated for entertainment purposes.
      </p>
    </div>
  );
};

export default RandomVehicleGenerator;