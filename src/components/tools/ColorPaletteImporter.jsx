// app/components/ColorPaletteImporter.jsx
'use client';

import React, { useState } from 'react';

const ColorPaletteImporter = () => {
  const [palette, setPalette] = useState([]);
  const [importText, setImportText] = useState('');
  const [paletteName, setPaletteName] = useState('Imported Palette');

  // Parse different color formats
  const parseColors = (text) => {
    const hexRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
    let colors = [];

    // Try JSON parsing
    try {
      const jsonData = JSON.parse(text);
      if (Array.isArray(jsonData)) {
        colors = jsonData.filter(color => /^#[0-9a-fA-F]{6}$/i.test(color));
      } else if (typeof jsonData === 'object') {
        colors = Object.values(jsonData).filter(color => /^#[0-9a-fA-F]{6}$/i.test(color));
      }
    } catch (e) {
      // Not JSON, try CSS or plain text
      colors = (text.match(hexRegex) || []).map(color => {
        if (color.length === 4) {
          return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
        }
        return color;
      });
    }

    return colors;
  };

  // Handle import
  const handleImport = () => {
    const importedColors = parseColors(importText);
    if (importedColors.length > 0) {
      setPalette(importedColors);
      setImportText('');
    } else {
      alert('No valid colors found in the input!');
    }
  };

  // Update a color
  const updateColor = (index, value) => {
    const newPalette = [...palette];
    newPalette[index] = value;
    setPalette(newPalette);
  };

  // Remove a color
  const removeColor = (index) => {
    setPalette(palette.filter((_, i) => i !== index));
  };

  // Add a new color
  const addColor = () => {
    setPalette([...palette, '#000000']);
  };

  // Export palette as JSON
  const exportPalette = () => {
    const json = JSON.stringify(palette, null, 2);
    navigator.clipboard.writeText(json);
    alert('Palette copied to clipboard as JSON!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Palette Importer
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Import Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Palette Name
              </label>
              <input
                type="text"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Imported Palette"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Import Colors
              </label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full h-32 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder={`Paste colors in various formats:
- JSON: ["#FF6B6B", "#4ECDC4"]
- CSS: #FF6B6B, #4ECDC4
- Plain text: #FF6B6B #4ECDC4`}
              />
              <button
                onClick={handleImport}
                className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Import Palette
              </button>
            </div>
          </div>

          {/* Palette Display */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{paletteName}</h2>
            {palette.length === 0 ? (
              <p className="text-gray-500">No colors imported yet</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {palette.map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="w-16 h-16 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="w-20 mt-1 p-1 text-xs border rounded text-center uppercase"
                    />
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => navigator.clipboard.writeText(color)}
                        className="text-blue-500 text-xs hover:underline"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => removeColor(index)}
                        className="text-red-500 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {palette.length > 0 && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={addColor}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  Add Color
                </button>
                <button
                  onClick={exportPalette}
                  className="flex-1 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
                >
                  Export as JSON
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        {palette.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Palette Preview</h2>
            <div className="flex h-24 rounded-lg overflow-hidden">
              {palette.map((color, index) => (
                <div
                  key={index}
                  className="flex-1"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Instructions - Fixed nesting issue */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">How to Use</h2>
          <div className="text-sm text-gray-700">
            <p>Import palettes from:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>JSON: Array of HEX codes or object with HEX values</li>
              <li>CSS: Comma or space-separated HEX codes</li>
              <li>Plain Text: Space-separated HEX codes</li>
            </ul>
            <p className="mt-1">Edit colors, add new ones, or export as JSON.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteImporter;