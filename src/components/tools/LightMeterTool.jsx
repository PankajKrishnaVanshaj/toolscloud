"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCamera, FaLightbulb, FaSync } from "react-icons/fa";

const LightMeterTool = () => {
  const [lux, setLux] = useState(0);
  const [iso, setIso] = useState(100);
  const [exposureSettings, setExposureSettings] = useState([]);
  const [lightDescription, setLightDescription] = useState("");
  const [preset, setPreset] = useState("custom");

  // Preset light levels for quick selection
  const lightPresets = {
    custom: 0,
    twilight: 5,
    dimIndoor: 50,
    typicalIndoor: 500,
    brightIndoor: 5000,
    overcast: 10000,
    daylight: 50000,
    sunlight: 100000,
  };

  // Calculate exposure settings
  const calculateExposure = useCallback(
    (luxValue) => {
      if (luxValue <= 0 || iso <= 0) return [];

      // Simplified EV calculation: EV = log2(N^2/t), adjusted for lux and ISO
      const ev = Math.log2((luxValue * 2.5) / iso);
      const settings = [];
      const apertures = [1.0, 1.4, 2.0, 2.8, 4.0, 5.6, 8.0, 11, 16, 22, 32];
      apertures.forEach((aperture) => {
        const shutterSpeed = (aperture * aperture) / Math.pow(2, ev);
        if (shutterSpeed >= 0.000125 && shutterSpeed <= 60) {
          // 1/8000s to 60s
          settings.push({
            aperture: `f/${aperture}`,
            shutter:
              shutterSpeed < 1
                ? `1/${Math.round(1 / shutterSpeed)}s`
                : `${Math.round(shutterSpeed * 10) / 10}s`,
          });
        }
      });
      return settings.slice(0, 6); // Limit to 6 combinations
    },
    [iso]
  );

  // Interpret light level
  const interpretLightLevel = (luxValue) => {
    if (luxValue <= 0) return "No light input";
    if (luxValue < 1) return "Near darkness";
    if (luxValue < 10) return "Very dim (twilight)";
    if (luxValue < 100) return "Dim indoor lighting";
    if (luxValue < 1000) return "Typical indoor lighting";
    if (luxValue < 10000) return "Bright indoor/overcast outdoor";
    if (luxValue < 100000) return "Full daylight";
    return "Direct sunlight";
  };

  // Update settings and description
  useEffect(() => {
    const settings = calculateExposure(lux);
    setExposureSettings(settings);
    setLightDescription(interpretLightLevel(lux));
  }, [lux, iso, calculateExposure]);

  // Handle lux input
  const handleLuxChange = (e) => {
    const value = Math.max(0, Number(e.target.value));
    setLux(value);
    setPreset("custom");
  };

  // Handle ISO change
  const handleIsoChange = (e) => {
    const value = Math.max(50, Math.min(12800, Number(e.target.value)));
    setIso(value);
  };

  // Handle preset selection
  const handlePresetChange = (e) => {
    const selectedPreset = e.target.value;
    setPreset(selectedPreset);
    setLux(lightPresets[selectedPreset]);
  };

  // Reset to default
  const reset = () => {
    setLux(0);
    setIso(100);
    setPreset("custom");
    setExposureSettings([]);
    setLightDescription("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Light Meter Tool
        </h1>

        <div className="space-y-6">
          {/* Input Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                Enter a value from a light meter or use presets
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ISO
              </label>
              <input
                type="number"
                value={iso}
                onChange={handleIsoChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="50"
                max="12800"
                step="50"
              />
              <p className="text-xs text-gray-500 mt-1">Range: 50 - 12800</p>
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Light Condition Presets
            </label>
            <select
              value={preset}
              onChange={handlePresetChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(lightPresets).map(([key, value]) => (
                <option key={key} value={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)} ({value} lux)
                </option>
              ))}
            </select>
          </div>

          {/* Light Description */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
              <FaLightbulb className="mr-2 text-yellow-500" /> Light Condition
            </h2>
            <p className="text-gray-700">
              {lightDescription || "Enter a lux value to see the condition"}
            </p>
          </div>

          {/* Exposure Settings */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
              <FaCamera className="mr-2 text-blue-500" /> Exposure Settings (ISO {iso})
            </h2>
            {exposureSettings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {exposureSettings.map((setting, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-700 bg-white p-2 rounded-md shadow-sm"
                  >
                    <span className="font-medium">{setting.aperture}</span> -{" "}
                    {setting.shutter}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Enter a valid lux value to see exposure settings
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <button
              onClick={reset}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Features */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Calculate exposure settings based on lux and ISO</li>
              <li>Adjustable ISO from 50 to 12800</li>
              <li>Light condition presets for quick selection</li>
              <li>Practical aperture and shutter speed combinations</li>
            </ul>
          </div>

          {/* Note */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-700 text-sm">
              <strong>Note:</strong> This tool provides approximate exposure settings based on lux
              input. It cannot measure ambient light directly due to browser limitations. Use a
              physical light meter for accurate readings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightMeterTool;