'use client';

import React, { useState } from 'react';

const ROT13ToText = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [rotation, setRotation] = useState(13); // Default ROT13
  const [direction, setDirection] = useState('encode'); // encode or decode
  const [preserveCase, setPreserveCase] = useState(true);
  const [realTime, setRealTime] = useState(true);

  const rotCipher = (text, shift, encode = true) => {
    const effectiveShift = encode ? shift : -shift;
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      
      // Handle uppercase letters (A-Z: 65-90)
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + effectiveShift + 26) % 26) + 65);
      }
      // Handle lowercase letters (a-z: 97-122)
      else if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + effectiveShift + 26) % 26) + 97);
      }
      // Return non-alphabetic characters unchanged
      return char;
    }).join('');
  };

  const handleConversion = (text) => {
    if (!text) {
      setOutputText('');
      return;
    }

    let result = rotCipher(text, rotation, direction === 'encode');
    
    if (!preserveCase) {
      result = direction === 'encode' ? result.toUpperCase() : result.toLowerCase();
    }

    setOutputText(result);
  };

  const handleInputChange = (value) => {
    setInputText(value);
    if (realTime) {
      handleConversion(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleConversion(inputText);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const swapInputOutput = () => {
    setInputText(outputText);
    setOutputText(inputText);
    setDirection(direction === 'encode' ? 'decode' : 'encode');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          ROT13 to Text Converter
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
                onChange={(e) => handleInputChange(e.target.value)}
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
                    const value = Math.max(1, Math.min(25, parseInt(e.target.value) || 13));
                    setRotation(value);
                    if (realTime) handleConversion(inputText);
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
                  onChange={(e) => {
                    setDirection(e.target.value);
                    if (realTime) handleConversion(inputText);
                  }}
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
                  onChange={(e) => {
                    setPreserveCase(e.target.checked);
                    if (realTime) handleConversion(inputText);
                  }}
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
            <h2 className="text-lg font-semibold mb-2">Output:</h2>
            <div className="flex items-center gap-2">
              <textarea
                value={outputText}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 h-32 resize-y"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(outputText)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Copy
              </button>
            </div>
            <button
              type="button"
              onClick={swapInputOutput}
              className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              Swap Input/Output
            </button>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            disabled={realTime}
          >
            Convert
          </button>
        </form>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Encode/decode text using ROT13 or custom rotation (1-25)</li>
              <li>Preserve case option for mixed-case text</li>
              <li>Real-time conversion toggle</li>
              <li>Swap input/output for easy reverse operations</li>
              <li>Copy output to clipboard</li>
              <li>Example: "HELLO" → "URYYB" (ROT13 encode)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ROT13ToText;