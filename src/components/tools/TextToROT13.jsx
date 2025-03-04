'use client';

import React, { useState, useEffect } from 'react';

const TextToROT13 = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [rotation, setRotation] = useState(13); // Default ROT13
  const [preserveCase, setPreserveCase] = useState(true);
  const [realTime, setRealTime] = useState(true);
  const [direction, setDirection] = useState('encode'); // 'encode' or 'decode'

  const rotCipher = (text, rot, encode = true) => {
    const shift = encode ? rot : -rot;
    return text.replace(/[a-zA-Z]/g, (char) => {
      const isUpper = char === char.toUpperCase();
      const base = isUpper ? 65 : 97; // ASCII base for A or a
      const code = char.charCodeAt(0);
      const shifted = ((code - base + shift + 26) % 26) + base;
      return preserveCase 
        ? String.fromCharCode(shifted) 
        : String.fromCharCode(shifted).toLowerCase();
    });
  };

  const handleConversion = () => {
    if (!inputText) {
      setOutputText('');
      return;
    }
    setOutputText(rotCipher(inputText, rotation, direction === 'encode'));
  };

  useEffect(() => {
    if (realTime) {
      handleConversion();
    }
  }, [inputText, rotation, preserveCase, direction, realTime]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleConversion();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
  };

  const swapInputOutput = () => {
    setInputText(outputText);
    setDirection(direction === 'encode' ? 'decode' : 'encode');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Text to ROT13 Converter
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Text
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to encode/decode"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rotation (1-25)
                </label>
                <input
                  type="number"
                  value={rotation}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(25, parseInt(e.target.value) || 13));
                    setRotation(val);
                  }}
                  min={1}
                  max={25}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Direction
                </label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="encode">Encode</option>
                  <option value="decode">Decode</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preserveCase}
                  onChange={(e) => setPreserveCase(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Preserve Case
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={realTime}
                  onChange={(e) => setRealTime(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Real-Time Conversion
              </label>
            </div>
          </div>

          {/* Output Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Output:</h2>
              <button
                onClick={copyToClipboard}
                disabled={!outputText}
                className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Copy
              </button>
            </div>
            <textarea
              value={outputText}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 h-32 resize-y"
            />
            <button
              type="button"
              onClick={swapInputOutput}
              className="mt-2 px-4 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              Swap Input/Output
            </button>
          </div>

          {!realTime && (
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Convert
            </button>
          )}
        </form>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Encode/decode text with ROT13 or custom rotation (1-25)</li>
              <li>Preserve case or convert to lowercase</li>
              <li>Real-time conversion (toggleable)</li>
              <li>Copy output to clipboard</li>
              <li>Swap input and output for quick reverse operations</li>
              <li>Example: "HELLO" → "URYYB" (ROT13 encode)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TextToROT13;