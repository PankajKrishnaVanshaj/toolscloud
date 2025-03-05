// app/components/ColorCodeValidator.jsx
'use client';

import React, { useState } from 'react';

const ColorCodeValidator = () => {
  const [input, setInput] = useState('');
  const [format, setFormat] = useState('hex');
  const [validationResult, setValidationResult] = useState(null);

  // Validation functions for different formats
  const validateHex = (value) => {
    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    if (hexRegex.test(value)) {
      return {
        isValid: true,
        color: value.length === 4 ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}` : value,
        message: 'Valid HEX color code'
      };
    }
    return { isValid: false, color: null, message: 'Invalid HEX color code (e.g., #FFF or #FFFFFF)' };
  };

  const validateRgb = (value) => {
    const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;
    const match = value.match(rgbRegex);
    if (match) {
      const [_, r, g, b] = match;
      const rgb = { r: parseInt(r), g: parseInt(g), b: parseInt(b) };
      if (rgb.r >= 0 && rgb.r <= 255 && rgb.g >= 0 && rgb.g <= 255 && rgb.b >= 0 && rgb.b <= 255) {
        return {
          isValid: true,
          color: rgbToHex(rgb.r, rgb.g, rgb.b),
          message: 'Valid RGB color code'
        };
      }
    }
    return { isValid: false, color: null, message: 'Invalid RGB color code (e.g., rgb(255, 107, 107))' };
  };

  const validateHsl = (value) => {
    const hslRegex = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i;
    const match = value.match(hslRegex);
    if (match) {
      const [_, h, s, l] = match;
      const hsl = { h: parseInt(h), s: parseInt(s), l: parseInt(l) };
      if (hsl.h >= 0 && hsl.h <= 360 && hsl.s >= 0 && hsl.s <= 100 && hsl.l >= 0 && hsl.l <= 100) {
        return {
          isValid: true,
          color: hslToHex(hsl.h, hsl.s, hsl.l),
          message: 'Valid HSL color code'
        };
      }
    }
    return { isValid: false, color: null, message: 'Invalid HSL color code (e.g., hsl(0, 50%, 50%))' };
  };

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  // Convert HSL to HEX
  const hslToHex = (h, s, l) => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;

    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return rgbToHex(r, g, b);
  };

  // Validate input based on selected format
  const validateColor = () => {
    let result;
    switch (format) {
      case 'hex':
        result = validateHex(input.trim());
        break;
      case 'rgb':
        result = validateRgb(input.trim());
        break;
      case 'hsl':
        result = validateHsl(input.trim());
        break;
      default:
        result = { isValid: false, color: null, message: 'Select a format' };
    }
    setValidationResult(result);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Code Validator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 mb-2"
            >
              <option value="hex">HEX</option>
              <option value="rgb">RGB</option>
              <option value="hsl">HSL</option>
            </select>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter Color Code
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder={`e.g., ${format === 'hex' ? '#FF6B6B' : format === 'rgb' ? 'rgb(255, 107, 107)' : 'hsl(0, 50%, 50%)'}`}
              />
              <button
                onClick={validateColor}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Validate
              </button>
            </div>
          </div>

          {/* Validation Result */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Validation Result</h2>
            {validationResult ? (
              <div className="space-y-3">
                <p className={`text-sm ${validationResult.isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {validationResult.message}
                </p>
                {validationResult.isValid && (
                  <>
                    <div
                      className="w-24 h-24 rounded-lg shadow mx-auto"
                      style={{ backgroundColor: validationResult.color }}
                    />
                    <p className="text-sm text-center">
                      HEX: {validationResult.color}
                      <button
                        onClick={() => navigator.clipboard.writeText(validationResult.color)}
                        className="ml-2 text-blue-500 hover:underline text-xs"
                      >
                        Copy
                      </button>
                    </p>
                  </>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Enter a color code and click "Validate" to see the result</p>
            )}
          </div>

          {/* Format Guidelines */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Accepted Formats</h2>
            <div className="text-sm text-gray-700">
              <p>Enter colors in these formats:</p>
              <ul className="list-disc ml-5 mt-1">
                <li>HEX: #FFF or #FFFFFF (3 or 6 digits)</li>
                <li>RGB: rgb(255, 107, 107) (0-255 for each channel)</li>
                <li>HSL: hsl(0, 50%, 50%) (0-360 for hue, 0-100% for saturation/lightness)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorCodeValidator;