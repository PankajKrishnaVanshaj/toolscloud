// app/components/ColorPaletteOrganizer.jsx
'use client';

import React, { useState } from 'react';

const ColorPaletteOrganizer = () => {
  const [palettes, setPalettes] = useState([
    { name: 'Palette 1', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'] }
  ]);
  const [newColor, setNewColor] = useState('#000000');
  const [newPaletteName, setNewPaletteName] = useState('');

  // Add a new color to a palette
  const addColor = (paletteIndex) => {
    const updatedPalettes = [...palettes];
    updatedPalettes[paletteIndex].colors.push(newColor);
    setPalettes(updatedPalettes);
    setNewColor('#000000'); // Reset color picker
  };

  // Remove a color from a palette
  const removeColor = (paletteIndex, colorIndex) => {
    const updatedPalettes = [...palettes];
    updatedPalettes[paletteIndex].colors.splice(colorIndex, 1);
    setPalettes(updatedPalettes);
  };

  // Move color within a palette
  const moveColor = (paletteIndex, fromIndex, toIndex) => {
    const updatedPalettes = [...palettes];
    const [movedColor] = updatedPalettes[paletteIndex].colors.splice(fromIndex, 1);
    updatedPalettes[paletteIndex].colors.splice(toIndex, 0, movedColor);
    setPalettes(updatedPalettes);
  };

  // Add a new palette
  const addPalette = () => {
    if (newPaletteName.trim()) {
      setPalettes([...palettes, { name: newPaletteName.trim(), colors: [] }]);
      setNewPaletteName('');
    }
  };

  // Remove a palette
  const removePalette = (paletteIndex) => {
    const updatedPalettes = palettes.filter((_, index) => index !== paletteIndex);
    setPalettes(updatedPalettes);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Palette Organizer
        </h1>

        {/* New Palette Form */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Create New Palette</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newPaletteName}
              onChange={(e) => setNewPaletteName(e.target.value)}
              placeholder="Palette Name"
              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addPalette}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Add Palette
            </button>
          </div>
        </div>

        {/* Palettes List */}
        <div className="space-y-6">
          {palettes.map((palette, paletteIndex) => (
            <div key={paletteIndex} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{palette.name}</h3>
                <button
                  onClick={() => removePalette(paletteIndex)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete Palette
                </button>
              </div>

              {/* Color List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {palette.colors.map((color, colorIndex) => (
                  <div key={colorIndex} className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded shadow"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs mt-1">{color.toUpperCase()}</p>
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => moveColor(paletteIndex, colorIndex, colorIndex - 1)}
                        disabled={colorIndex === 0}
                        className="text-blue-500 text-xs disabled:text-gray-400"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveColor(paletteIndex, colorIndex, colorIndex + 1)}
                        disabled={colorIndex === palette.colors.length - 1}
                        className="text-blue-500 text-xs disabled:text-gray-400"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeColor(paletteIndex, colorIndex)}
                        className="text-red-500 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Color */}
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
                />
                <button
                  onClick={() => addColor(paletteIndex)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  Add Color
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Palette Summary */}
        {palettes.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Palette Summary</h2>
            <p>Total Palettes: {palettes.length}</p>
            <p>Total Colors: {palettes.reduce((sum, p) => sum + p.colors.length, 0)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPaletteOrganizer;