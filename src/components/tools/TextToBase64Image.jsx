'use client';

import React, { useState, useRef } from 'react';

const TextToBase64Image = () => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(20);
  const [fontColor, setFontColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [padding, setPadding] = useState(10);
  const [base64Image, setBase64Image] = useState('');
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  const fontOptions = [
    'Arial',
    'Times New Roman',
    'Courier New',
    'Verdana',
    'Georgia',
    'Comic Sans MS',
    'Impact',
  ];

  const generateImage = () => {
    setError('');
    setBase64Image('');

    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Measure text size
    ctx.font = `${fontSize}px ${fontFamily}`;
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize * 1.2; // Approximate height with some buffer

    // Set canvas size with padding
    canvas.width = textWidth + padding * 2;
    canvas.height = textHeight + padding * 2;

    // Clear and set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    ctx.fillStyle = fontColor;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Generate Base64
    const base64 = canvas.toDataURL('image/png');
    setBase64Image(base64);
  };

  const copyToClipboard = () => {
    if (base64Image) {
      navigator.clipboard.writeText(base64Image);
    }
  };

  const downloadImage = () => {
    if (base64Image) {
      const link = document.createElement('a');
      link.href = base64Image;
      link.download = 'text-image.png';
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Text to Base64 Image Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to convert"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size (px)
                </label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(Math.max(1, parseInt(e.target.value) || 20))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fontOptions.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Color
                </label>
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Padding (px)
              </label>
              <input
                type="number"
                value={padding}
                onChange={(e) => setPadding(Math.max(0, parseInt(e.target.value) || 10))}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={generateImage}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Generate Base64 Image
            </button>
          </div>

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Results Section */}
          {base64Image && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Result:</h2>
              <div className="space-y-4">
                <div>
                  <img src={base64Image} alt="Generated Text" className="max-w-full rounded-md border border-gray-300" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Base64 String:</p>
                  <textarea
                    value={base64Image}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 h-24 overflow-auto"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Copy Base64
                    </button>
                    <button
                      onClick={downloadImage}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Download Image
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert text to Base64-encoded PNG image</li>
              <li>Customize font size, family, color, and background</li>
              <li>Adjust padding around text</li>
              <li>Preview image and copy Base64 string</li>
              <li>Download as PNG file</li>
              <li>Uses HTML5 Canvas for image generation</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TextToBase64Image;