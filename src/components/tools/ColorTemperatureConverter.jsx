"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync, FaSun, FaMoon } from "react-icons/fa";

const ColorTemperatureConverter = () => {
  const [kelvin, setKelvin] = useState(6500); // Default to daylight
  const [hex, setHex] = useState("");
  const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });
  const [hsl, setHsl] = useState({ h: 0, s: 0, l: 0 });
  const [displayMode, setDisplayMode] = useState("hex"); // hex, rgb, hsl
  const [preset, setPreset] = useState("Daylight");

  // Convert Kelvin to RGB (approximation based on black-body radiation)
  const kelvinToRgb = useCallback((temp) => {
    temp = Math.max(1000, Math.min(40000, temp)); // Limit range: 1000K to 40000K
    temp /= 100;

    let r, g, b;

    // Red
    if (temp <= 66) {
      r = 255;
    } else {
      r = 329.698727446 * Math.pow(temp - 60, -0.1332047592);
      r = Math.max(0, Math.min(255, r));
    }

    // Green
    if (temp <= 66) {
      g = 99.4708025861 * Math.log(temp) - 161.1195681661;
    } else {
      g = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
    }
    g = Math.max(0, Math.min(255, g));

    // Blue
    if (temp >= 66) {
      b = 255;
    } else if (temp <= 19) {
      b = 0;
    } else {
      b = 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
    }
    b = Math.max(0, Math.min(255, b));

    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
  }, []);

  // RGB to HEX
  const rgbToHex = (r, g, b) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
        .toUpperCase()
    );
  };

  // RGB to HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  // Update color values when Kelvin changes
  useEffect(() => {
    const rgbValue = kelvinToRgb(kelvin);
    setRgb(rgbValue);
    setHex(rgbToHex(rgbValue.r, rgbValue.g, rgbValue.b));
    setHsl(rgbToHsl(rgbValue.r, rgbValue.g, rgbValue.b));
  }, [kelvin, kelvinToRgb]);

  // Handle Kelvin input change
  const handleKelvinChange = (value) => {
    const num = parseInt(value) || 0;
    setKelvin(Math.max(1000, Math.min(40000, num)));
    setPreset("Custom");
  };

  // Preset temperatures
  const presets = {
    "Candlelight": 1800,
    "Incandescent": 2700,
    "Warm White": 3500,
    "Daylight": 6500,
    "Cool White": 9000,
    "Overcast Sky": 12000,
  };

  // Reset to default
  const reset = () => {
    setKelvin(6500);
    setPreset("Daylight");
    setDisplayMode("hex");
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Temperature Converter
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input & Preview */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Temperature (Kelvin)
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="1000"
                  max="40000"
                  value={kelvin}
                  onChange={(e) => handleKelvinChange(e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <input
                  type="number"
                  value={kelvin}
                  onChange={(e) => handleKelvinChange(e.target.value)}
                  min="1000"
                  max="40000"
                  className="w-24 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Range: 1000K (warm) to 40000K (cool)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presets
              </label>
              <select
                value={preset}
                onChange={(e) => {
                  const value = presets[e.target.value] || 6500;
                  setKelvin(value);
                  setPreset(e.target.value);
                }}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(presets).map(([name, value]) => (
                  <option key={name} value={name}>
                    {name} ({value}K)
                  </option>
                ))}
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Preview</h2>
              <div
                className="h-40 rounded-lg shadow-inner flex items-center justify-center text-white text-lg font-medium transition-colors"
                style={{ backgroundColor: hex }}
              >
                {kelvin}K {preset !== "Custom" && `(${preset})`}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Converted Color</h2>
                <select
                  value={displayMode}
                  onChange={(e) => setDisplayMode(e.target.value)}
                  className="p-1 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hex">HEX</option>
                  <option value="rgb">RGB</option>
                  <option value="hsl">HSL</option>
                </select>
              </div>
              <div className="space-y-2">
                {displayMode === "hex" && (
                  <p className="text-sm flex items-center">
                    HEX: {hex}
                    <button
                      onClick={() => copyToClipboard(hex)}
                      className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FaCopy />
                    </button>
                  </p>
                )}
                {displayMode === "rgb" && (
                  <p className="text-sm flex items-center">
                    RGB: {rgb.r}, {rgb.g}, {rgb.b}
                    <button
                      onClick={() =>
                        copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)
                      }
                      className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FaCopy />
                    </button>
                  </p>
                )}
                {displayMode === "hsl" && (
                  <p className="text-sm flex items-center">
                    HSL: {hsl.h}°, {hsl.s}%, {hsl.l}%
                    <button
                      onClick={() =>
                        copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)
                      }
                      className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FaCopy />
                    </button>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={reset}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset to Daylight
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">
            About Color Temperature
          </h2>
          <div className="text-sm text-blue-600">
            <p>Converts Kelvin temperature to color values based on black-body radiation:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>
                <FaMoon className="inline mr-1" /> 1000K-2000K: Warm (candlelight,
                incandescent)
              </li>
              <li>3000K-4000K: Neutral (warm white, halogen)</li>
              <li>
                <FaSun className="inline mr-1" /> 5000K-6500K: Cool (daylight)
              </li>
              <li>7000K+: Very cool (overcast sky)</li>
            </ul>
            <p className="mt-1">
              Note: This is an approximation; actual color may vary slightly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorTemperatureConverter;