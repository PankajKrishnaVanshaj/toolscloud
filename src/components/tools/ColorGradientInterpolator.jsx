// app/components/ColorGradientInterpolator.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorGradientInterpolator = () => {
  const [colors, setColors] = useState(['#FF6B6B', '#4ECDC4']);
  const [steps, setSteps] = useState(5);
  const [gradient, setGradient] = useState([]);

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
      const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  // Interpolate between two colors
  const interpolateColor = (color1, color2, factor) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const r = rgb1.r + (rgb2.r - rgb1.r) * factor;
    const g = rgb1.g + (rgb2.g - rgb1.g) * factor;
    const b = rgb1.b + (rgb2.b - rgb1.b) * factor;
    return rgbToHex(r, g, b);
  };

  // Generate gradient
  const generateGradient = () => {
    if (colors.length < 2) return;

    const newGradient = [];
    const segments = colors.length - 1;
    const stepsPerSegment = Math.floor(steps / segments);

    for (let i = 0; i < segments; i++) {
      const startColor = colors[i];
      const endColor = colors[i + 1];
      
      for (let j = 0; j < (i === segments - 1 ? steps - (segments - 1) * stepsPerSegment : stepsPerSegment); j++) {
        const factor = j / stepsPerSegment;
        newGradient.push(interpolateColor(startColor, endColor, factor));
      }
    }

    // Ensure the last color is included
    if (newGradient.length < steps) {
      newGradient.push(colors[colors.length - 1]);
    }

    setGradient(newGradient.slice(0, steps));
  };

  useEffect(() => {
    generateGradient();
  }, [colors, steps]);

  // Add a new color
  const addColor = () => {
    setColors([...colors, '#000000']);
  };

  // Remove a color
  const removeColor = (index) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  // Update a color
  const updateColor = (index, value) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
  };

  // Generate CSS gradient
  const getCssGradient = () => {
    return `linear-gradient(to right, ${gradient.join(', ')})`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Gradient Interpolator
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Color Controls */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Control Points</h2>
              {colors.map((color, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                  {colors.length > 2 && (
                    <button
                      onClick={() => removeColor(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addColor}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Add Color
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Steps: {steps}
              </label>
              <input
                type="range"
                min="2"
                max="20"
                value={steps}
                onChange={(e) => setSteps(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Gradient Display */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Gradient Result</h2>
            <div
              className="h-32 rounded-lg shadow-inner"
              style={{ background: getCssGradient() }}
            />
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {gradient.map((color, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded shadow"
                    style={{ backgroundColor: color }}
                  />
                  <p className="text-xs mt-1">{color}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(color)}
                    className="text-blue-500 text-xs hover:underline"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold mb-2">CSS Gradient</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded break-all">
                {getCssGradient()}
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(getCssGradient())}
                className="mt-2 text-blue-500 hover:underline text-xs"
              >
                Copy CSS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorGradientInterpolator;