'use client';

import React, { useState } from 'react';

const RunLengthEncodingToBinary = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('encode'); // 'encode' or 'decode'
  const [binaryOutput, setBinaryOutput] = useState('');
  const [rleOutput, setRleOutput] = useState('');
  const [error, setError] = useState('');
  const [separator, setSeparator] = useState(','); // Separator for RLE output
  const [maxRun, setMaxRun] = useState(255); // Maximum run length

  const encodeToRLE = (text) => {
    if (!text.match(/^[01]+$/)) {
      setError('Input must be a binary string (0s and 1s only)');
      return null;
    }

    let result = [];
    let count = 1;
    let current = text[0];

    for (let i = 1; i < text.length; i++) {
      if (text[i] === current && count < maxRun) {
        count++;
      } else {
        result.push(`${count}${current}`);
        current = text[i];
        count = 1;
      }
    }
    result.push(`${count}${current}`);

    return result.join(separator);
  };

  const decodeFromRLE = (rle) => {
    const pairs = rle.split(separator);
    let binary = '';

    for (const pair of pairs) {
      const match = pair.match(/^(\d+)([01])$/);
      if (!match) {
        setError(`Invalid RLE format at: ${pair}`);
        return null;
      }
      const count = parseInt(match[1]);
      const bit = match[2];
      if (count > maxRun) {
        setError(`Run length ${count} exceeds maximum of ${maxRun}`);
        return null;
      }
      binary += bit.repeat(count);
    }

    return binary;
  };

  const handleConvert = () => {
    setError('');
    setBinaryOutput('');
    setRleOutput('');

    if (!input.trim()) {
      setError('Please enter a value');
      return;
    }

    if (mode === 'encode') {
      const rle = encodeToRLE(input);
      if (rle) {
        setRleOutput(rle);
        setBinaryOutput(input);
      }
    } else {
      const binary = decodeFromRLE(input);
      if (binary) {
        setBinaryOutput(binary);
        setRleOutput(input);
      }
    }
  };

  const handleSample = () => {
    setInput(mode === 'encode' ? '0000111100001111' : '40,41,40,41');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Run-Length Encoding to Binary Converter
        </h1>

        <div className="grid gap-6">
          {/* Mode Selection */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setMode('encode')}
              className={`px-4 py-2 rounded-md ${mode === 'encode' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-600 hover:text-white transition-colors`}
            >
              Encode (Binary → RLE)
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`px-4 py-2 rounded-md ${mode === 'decode' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-600 hover:text-white transition-colors`}
            >
              Decode (RLE → Binary)
            </button>
          </div>

          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {mode === 'encode' ? 'Binary Input' : 'RLE Input'}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' ? 'e.g., 0000111100001111' : `e.g., 40${separator}41${separator}40${separator}41`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 font-mono"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Separator
                </label>
                <input
                  type="text"
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Run Length
                </label>
                <input
                  type="number"
                  value={maxRun}
                  onChange={(e) => setMaxRun(Math.min(999, Math.max(1, parseInt(e.target.value) || 255)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={1}
                  max={999}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleConvert}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Convert
              </button>
              <button
                onClick={handleSample}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Sample
              </button>
            </div>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Results Section */}
          {(binaryOutput || rleOutput) && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <div className="space-y-4 text-sm font-mono">
                {binaryOutput && (
                  <div>
                    <p className="font-medium">Binary:</p>
                    <p className="break-all">{binaryOutput}</p>
                    <p className="text-gray-500">Length: {binaryOutput.length} bits</p>
                    <p className="text-gray-500">Decimal: {parseInt(binaryOutput, 2)}</p>
                  </div>
                )}
                {rleOutput && (
                  <div>
                    <p className="font-medium">RLE:</p>
                    <p className="break-all">{rleOutput}</p>
                    <p className="text-gray-500">Pairs: {rleOutput.split(separator).length}</p>
                  </div>
                )}
                {mode === 'encode' && binaryOutput && rleOutput && (
                  <div>
                    <p className="font-medium">Compression Ratio:</p>
                    <p>{((rleOutput.length / binaryOutput.length) * 100).toFixed(2)}% ({rleOutput.length} / {binaryOutput.length} chars)</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Encode binary to RLE or decode RLE to binary</li>
              <li>Customizable separator and max run length</li>
              <li>Shows binary length, decimal value, and compression ratio</li>
              <li>Sample: 00001111 → 40,41</li>
              <li>RLE format: [count][bit], e.g., 40 = four 0s</li>
              <li>Use "Sample" button for example input</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default RunLengthEncodingToBinary;