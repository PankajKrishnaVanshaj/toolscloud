// components/LightMeterTool.js
'use client';

import React, { useState, useEffect } from 'react';

const LightMeterTool = () => {
  const [lux, setLux] = useState(0);
  const [exposureSettings, setExposureSettings] = useState(null);
  const [lightDescription, setLightDescription] = useState('');

  // Common ISO value for calculations
  const ISO = 100;

  const calculateExposure = (luxValue) => {
    // Simplified exposure calculation (EV to aperture/shutter)
    // EV = log2(N^2/t) where N is aperture and t is shutter speed
    const ev = Math.log2(luxValue * 2.5 / ISO); // Approximation for lux to EV

    const settings = [];
    const apertures = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22];
    apertures.forEach(aperture => {
      const shutterSpeed = (aperture * aperture) / Math.pow(2, ev);
      if (shutterSpeed >= 0.000125 && shutterSpeed <= 30) { // Reasonable range: 1/8000s to 30s
        settings.push({
          aperture: `f/${aperture}`,
          shutter: shutterSpeed < 1 
            ? `1/${Math.round(1/shutterSpeed)}s` 
            : `${Math.round(shutterSpeed * 10) / 10}s`
        });
      }
    });

    return settings.slice(0, 5); // Limit to 5 practical combinations
  };

  const interpretLightLevel = (luxValue) => {
    if (luxValue < 1) return 'Near darkness';
    if (luxValue < 10) return 'Very dim (twilight)';
    if (luxValue < 100) return 'Dim indoor lighting';
    if (luxValue < 1000) return 'Typical indoor lighting';
    if (luxValue < 10000) return 'Bright indoor/overcast outdoor';
    if (luxValue < 100000) return 'Full daylight';
    return 'Direct sunlight';
  };

  useEffect(() => {
    const settings = calculateExposure(lux);
    setExposureSettings(settings);
    setLightDescription(interpretLightLevel(lux));
  }, [lux]);

  const handleLuxChange = (e) => {
    const value = Math.max(0, Number(e.target.value)); // Prevent negative values
    setLux(value);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Light Meter Tool</h1>

      <div className="space-y-6">
        {/* Lux Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Light Level (Lux)
          </label>
          <input
            type="number"
            value={lux}
            onChange={handleLuxChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            placeholder="Enter lux value"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a value from a physical light meter or estimate
          </p>
        </div>

        {/* Light Description */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Light Condition</h2>
          <p className="text-gray-700 bg-gray-50 p-2 rounded-md">
            {lightDescription || 'Enter a lux value to see the condition'}
          </p>
        </div>

        {/* Exposure Settings */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Exposure Settings (ISO {ISO})</h2>
          {exposureSettings && exposureSettings.length > 0 ? (
            <ul className="space-y-2 bg-gray-50 p-2 rounded-md">
              {exposureSettings.map((setting, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {setting.aperture} - {setting.shutter}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Enter a lux value to see settings</p>
          )}
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 mt-4">
          Note: This tool provides approximate photographic exposure settings based on lux input.
          It cannot measure ambient light directly due to browser limitations.
          Use a physical light meter for accurate readings.
        </p>
      </div>
    </div>
  );
};

export default LightMeterTool;