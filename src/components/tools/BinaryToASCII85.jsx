'use client';

import React, { useState } from 'react';

const BinaryToASCII85 = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [ascii85Output, setAscii85Output] = useState('');
  const [ascii85Input, setAscii85Input] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const [error, setError] = useState('');
  const [formatOptions, setFormatOptions] = useState({
    wrapLength: 76, // Common line wrap length
    spaceAfterColon: true,
  });

  // Binary to ASCII85 conversion
  const binaryToAscii85 = (binary) => {
    // Remove spaces and validate binary
    const cleanBinary = binary.replace(/\s/g, '');
    if (!/^[01]+$/.test(cleanBinary)) {
      throw new Error('Invalid binary input: must contain only 0s and 1s');
    }

    // Convert binary string to byte array
    const bytes = [];
    for (let i = 0; i < cleanBinary.length; i += 8) {
      const byte = cleanBinary.slice(i, i + 8).padEnd(8, '0');
      bytes.push(parseInt(byte, 2));
    }

    // ASCII85 encoding
    let result = '';
    for (let i = 0; i < bytes.length; i += 4) {
      const chunk = bytes.slice(i, i + 4);
      while (chunk.length < 4) chunk.push(0); // Pad with zeros

      let num = (chunk[0] << 24) + (chunk[1] << 16) + (chunk[2] << 8) + chunk[3];
      if (num === 0 && chunk.length === 4) {
        result += 'z';
      } else {
        const chars = [];
        for (let j = 0; j < 5; j++) {
          chars.unshift(String.fromCharCode((num % 85) + 33));
          num = Math.floor(num / 85);
        }
        result += chars.join('').slice(0, chunk.length + 1);
      }
    }

    // Apply wrapping if specified
    if (formatOptions.wrapLength > 0) {
      const wrapped = result.match(new RegExp(`.{1,${formatOptions.wrapLength}}`, 'g')).join('\n');
      return formatOptions.spaceAfterColon ? `<~ ${wrapped} ~>` : `<~${wrapped}~>`;
    }
    return formatOptions.spaceAfterColon ? `<~ ${result} ~>` : `<~${result}~>`;
  };

  // ASCII85 to Binary conversion
  const ascii85ToBinary = (ascii85) => {
    // Remove delimiters and spaces
    const cleanAscii85 = ascii85.replace(/<~\s*|\s*~>|[\n\r\s]/g, '');
    if (!/^[!-u|z]+$/.test(cleanAscii85)) {
      throw new Error('Invalid ASCII85 input: must contain only characters ! to u or z');
    }

    let bytes = [];
    for (let i = 0; i < cleanAscii85.length; ) {
      if (cleanAscii85[i] === 'z') {
        bytes.push(0, 0, 0, 0);
        i++;
      } else {
        const chunk = cleanAscii85.slice(i, i + 5);
        let num = 0;
        for (let j = 0; j < 5; j++) {
          num = num * 85 + (chunk[j] ? chunk.charCodeAt(j) - 33 : 84);
        }
        bytes.push((num >>> 24) & 255, (num >>> 16) & 255, (num >>> 8) & 255, num & 255);
        i += chunk.length < 5 ? chunk.length + 1 : 5;
      }
    }

    // Remove padding bytes based on last group length
    const lastGroupLength = cleanAscii85.slice(-5).replace(/z/g, '').length || 5;
    bytes = bytes.slice(0, bytes.length - (4 - lastGroupLength));

    // Convert to binary string
    return bytes.map(byte => byte.toString(2).padStart(8, '0')).join(' ');
  };

  const handleBinaryConvert = () => {
    setError('');
    setAscii85Output('');
    try {
      const result = binaryToAscii85(binaryInput);
      setAscii85Output(result);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAscii85Convert = () => {
    setError('');
    setBinaryOutput('');
    try {
      const result = ascii85ToBinary(ascii85Input);
      setBinaryOutput(result);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const binary = Array.from(new Uint8Array(event.target.result))
        .map(byte => byte.toString(2).padStart(8, '0'))
        .join('');
      setBinaryInput(binary);
      handleBinaryConvert();
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to ASCII85 Converter
        </h1>

        <div className="grid gap-6">
          {/* Binary to ASCII85 Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input
              </label>
              <textarea
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                placeholder="e.g., 01001000 01100101 01101100 01101100 01101111"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
              <input
                type="file"
                onChange={handleFileUpload}
                className="mt-2 text-sm text-gray-500"
              />
            </div>
            <button
              onClick={handleBinaryConvert}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Convert to ASCII85
            </button>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ASCII85 Output
              </label>
              <textarea
                value={ascii85Output}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 h-24"
              />
            </div>
          </div>

          {/* ASCII85 to Binary Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ASCII85 Input
              </label>
              <textarea
                value={ascii85Input}
                onChange={(e) => setAscii85Input(e.target.value)}
                placeholder="e.g., <~87cURD]j~>"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>
            <button
              onClick={handleAscii85Convert}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Convert to Binary
            </button>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Output
              </label>
              <textarea
                value={binaryOutput}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 h-24"
              />
            </div>
          </div>

          {/* Format Options */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Format Options</h2>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Wrap Length:</label>
                <input
                  type="number"
                  value={formatOptions.wrapLength}
                  onChange={(e) => setFormatOptions({ ...formatOptions, wrapLength: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span>(0 for no wrap)</span>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formatOptions.spaceAfterColon}
                  onChange={(e) => setFormatOptions({ ...formatOptions, spaceAfterColon: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Space after &lt;~ and before ~&gt;
              </label>
            </div>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert binary to ASCII85 and vice versa</li>
              <li>Supports file upload for binary input</li>
              <li>Handles z compression (all zeros)</li>
              <li>Customizable wrap length and delimiter spacing</li>
              <li>Binary input: space-separated bytes (e.g., 01001000 01100101)</li>
              <li>ASCII85 example: &lt;{`~87cURD]j~`}&gt; = "Hello"</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToASCII85;