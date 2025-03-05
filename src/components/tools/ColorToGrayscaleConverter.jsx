// app/components/ColorToGrayscaleConverter.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorToGrayscaleConverter = () => {
  const [inputColor, setInputColor] = useState('#FF6B6B');
  const [method, setMethod] = useState('luminance');
  const [grayscaleColor, setGrayscaleColor] = useState('');

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  // Convert RGB to HSL (for lightness method)
  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h, s, l };
  };

  // Convert color to grayscale based on method
  const convertToGrayscale = (hex, method) => {
    const rgb = hexToRgb(hex);
    let gray;

    switch (method) {
      case 'luminance':
        // Weighted luminance method (WCAG standard)
        gray = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
        break;
      case 'average':
        // Simple average of RGB values
        gray = (rgb.r + rgb.g + rgb.b) / 3;
        break;
      case 'lightness':
        // Lightness from HSL (average of max and min RGB)
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        gray = hsl.l * 255;
        break;
      default:
        gray = 0;
    }

    return rgbToHex(gray, gray, gray);
  };

  useEffect(() => {
    if (/^#[0-9A-Fa-f]{6}$/.test(inputColor)) {
      const grayscale = convertToGrayscale(inputColor, method);
      setGrayscaleColor(grayscale);
    } else {
      setGrayscaleColor('');
    }
  }, [inputColor, method]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color to Grayscale Converter
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input and Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={inputColor}
                  onChange={(e) => setInputColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={inputColor}
                  onChange={(e) => setInputColor(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="#FF6B6B"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conversion Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="luminance">Luminance (WCAG)</option>
                <option value="average">Average</option>
                <option value="lightness">Lightness (HSL)</option>
              </select>
            </div>
          </div>

          {/* Result */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Grayscale Result</h2>
              {grayscaleColor ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Original Color</p>
                      <div
                        className="w-full h-24 rounded-lg shadow-inner"
                        style={{ backgroundColor: inputColor }}
                      />
                      <p className="text-sm mt-1 text-center">{inputColor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Grayscale</p>
                      <div
                        className="w-full h-24 rounded-lg shadow-inner"
                        style={{ backgroundColor: grayscaleColor }}
                      />
                      <p className="text-sm mt-1 text-center">{grayscaleColor}
                        <button
                          onClick={() => navigator.clipboard.writeText(grayscaleColor)}
                          className="ml-2 text-blue-500 hover:underline text-xs"
                        >
                          Copy
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Enter a valid HEX color (e.g., #FF6B6B) to convert to grayscale
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">About Grayscale Conversion</h2>
          <div className="text-sm text-gray-700">
            <p>Convert colors to grayscale using different methods:</p>
            <ul className="list-disc ml-5 mt-1">
              <li><strong>Luminance (WCAG):</strong> Weighted (0.2126R + 0.7152G + 0.0722B) for human perception</li>
              <li><strong>Average:</strong> Simple average of RGB values</li>
              <li><strong>Lightness (HSL):</strong> Average of max and min RGB values from HSL</li>
            </ul>
            <p className="mt-1">Each method produces different grayscale tones based on how it weights RGB channels.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorToGrayscaleConverter;