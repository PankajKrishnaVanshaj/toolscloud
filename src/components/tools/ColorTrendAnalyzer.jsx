// app/components/ColorTrendAnalyzer.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorTrendAnalyzer = () => {
  const [colors, setColors] = useState([]);
  const [newColor, setNewColor] = useState('#FF6B6B');
  const [trendData, setTrendData] = useState({});

  // Mock trend data generator (simulating usage over time)
  const generateMockTrendData = (colorList) => {
    const data = {};
    colorList.forEach(color => {
      // Simulate monthly usage frequency (0-100)
      data[color] = Array.from({ length: 12 }, () => Math.floor(Math.random() * 101));
    });
    return data;
  };

  // Convert HEX to RGB for display
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Add a new color
  const addColor = () => {
    if (!colors.includes(newColor) && /^#[0-9A-F]{6}$/i.test(newColor)) {
      setColors([...colors, newColor]);
      setNewColor('#000000'); // Reset input
    }
  };

  // Remove a color
  const removeColor = (color) => {
    setColors(colors.filter(c => c !== color));
  };

  // Update trend data when colors change
  useEffect(() => {
    if (colors.length > 0) {
      setTrendData(generateMockTrendData(colors));
    } else {
      setTrendData({});
    }
  }, [colors]);

  // Simple trend visualization (bar height based on average usage)
  const getAverageUsage = (color) => {
    if (!trendData[color]) return 0;
    return trendData[color].reduce((sum, val) => sum + val, 0) / 12;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Trend Analyzer
        </h1>

        <div className="space-y-6">
          {/* Color Input */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Add Color to Track</h2>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-12 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="#HEXCODE"
              />
              <button
                onClick={addColor}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* Tracked Colors */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Tracked Colors</h2>
            {colors.length === 0 ? (
              <p className="text-gray-500">No colors added yet</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {colors.map((color, index) => {
                  const rgb = hexToRgb(color);
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-16 h-16 rounded shadow"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-xs mt-1">{color}</p>
                      <p className="text-xs text-gray-600">RGB: {rgb.r}, {rgb.g}, {rgb.b}</p>
                      <button
                        onClick={() => removeColor(color)}
                        className="text-red-500 text-xs mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Trend Visualization */}
          {colors.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Trend Analysis (Mock Data)</h2>
              <div className="flex items-end gap-4 h-64">
                {colors.map((color, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full rounded-t"
                      style={{
                        backgroundColor: color,
                        height: `${getAverageUsage(color) * 2}px`, // Scale height for visibility
                      }}
                    />
                    <p className="text-xs mt-2">{color}</p>
                    <p className="text-xs text-gray-600">Avg: {Math.round(getAverageUsage(color))}%</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Note: This is mock data simulating monthly usage frequency (0-100%).
              </p>
            </div>
          )}

          {/* Trend Details */}
          {colors.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Monthly Trend Data</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Color</th>
                      {Array.from({ length: 12 }, (_, i) => (
                        <th key={i} className="p-2">Month {i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {colors.map((color, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2 flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: color }}
                          />
                          {color}
                        </td>
                        {trendData[color]?.map((value, month) => (
                          <td key={month} className="p-2 text-center">{value}%</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorTrendAnalyzer;