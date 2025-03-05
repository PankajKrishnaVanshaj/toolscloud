// app/components/ColorPaletteExporter.jsx
'use client';

import React, { useState } from 'react';

const ColorPaletteExporter = () => {
  const [palette, setPalette] = useState(['#FF6B6B', '#4ECDC4', '#45B7D1']);
  const [paletteName, setPaletteName] = useState('My Palette');
  const [exportFormat, setExportFormat] = useState('json');
  const [newColor, setNewColor] = useState('#000000');

  // Add a new color to the palette
  const addColor = () => {
    if (/^#[0-9A-F]{6}$/i.test(newColor) && !palette.includes(newColor)) {
      setPalette([...palette, newColor]);
      setNewColor('#000000');
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

  // Generate export content based on format
  const generateExportContent = () => {
    switch (exportFormat) {
      case 'json':
        return JSON.stringify(palette, null, 2);
      case 'css':
        return `:root {\n${palette.map((color, i) => `  --color-${i + 1}: ${color};`).join('\n')}\n}`;
      case 'text':
        return palette.join(' ');
      default:
        return '';
    }
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateExportContent());
    alert('Palette copied to clipboard!');
  };

  // Download as file
  const downloadFile = () => {
    const content = generateExportContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paletteName.replace(/\s+/g, '_').toLowerCase()}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Palette Exporter
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Palette Editor */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Palette Name
              </label>
              <input
                type="text"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="My Palette"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">{paletteName}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
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
                    <button
                      onClick={() => removeColor(index)}
                      className="text-red-500 text-xs mt-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

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
                onClick={addColor}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* Export Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Export Palette</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="json">JSON</option>
                <option value="css">CSS Variables</option>
                <option value="text">Plain Text</option>
              </select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold mb-2">Export Preview</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
                {generateExportContent()}
              </pre>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={downloadFile}
                  className="flex-1 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
                >
                  Download File
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Palette Preview */}
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

        {/* Instructions */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">How to Use</h2>
          <div className="text-sm text-gray-700">
            <p>Create and edit your palette, then export it in your preferred format:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>JSON: Array of HEX codes</li>
              <li>CSS: Root variables (e.g., --color-1)</li>
              <li>Plain Text: Space-separated HEX codes</li>
            </ul>
            <p className="mt-1">Copy to clipboard or download as a file.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteExporter;