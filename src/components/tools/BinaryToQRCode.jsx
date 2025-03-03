'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

const BinaryToQRCode = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    errorCorrectionLevel: 'M',
    scale: 4,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  const validateBinary = (binary) => {
    return /^[01\s]+$/.test(binary);
  };

  const binaryToText = (binary) => {
    const binaryArray = binary.trim().split(/\s+/);
    return binaryArray.map(bin => {
      if (!validateBinary(bin)) throw new Error('Invalid binary');
      return String.fromCharCode(parseInt(bin, 2));
    }).join('');
  };

  const generateQRCode = async (text) => {
    try {
      const url = await QRCode.toDataURL(text, {
        errorCorrectionLevel: options.errorCorrectionLevel,
        scale: options.scale,
        margin: options.margin,
        color: options.color,
      });
      setQrCodeUrl(url);
    } catch (err) {
      setError(`QR Code generation failed: ${err.message}`);
    }
  };

  const handleBinaryInput = (value) => {
    setBinaryInput(value);
    setError('');
    setTextOutput('');
    setQrCodeUrl('');

    if (!value.trim()) return;

    try {
      if (!validateBinary(value)) {
        throw new Error('Input must contain only 0s, 1s, and spaces');
      }
      const text = binaryToText(value);
      setTextOutput(text);
      generateQRCode(text);
    } catch (err) {
      setError(err.message);
      setTextOutput('');
      setQrCodeUrl('');
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'qrcode.png';
    link.click();
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => {
      const newOptions = { ...prev };
      if (key.includes('color')) {
        newOptions.color[key.split('.')[1]] = value;
      } else {
        newOptions[key] = value;
      }
      return newOptions;
    });
    if (textOutput) generateQRCode(textOutput); // Regenerate QR with new options
  };

  useEffect(() => {
    if (textOutput) generateQRCode(textOutput);
  }, [options]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to QR Code Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input
              </label>
              <textarea
                value={binaryInput}
                onChange={(e) => handleBinaryInput(e.target.value)}
                placeholder="Enter binary (e.g., 01001000 01100101 01101100 01101100 01101111)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Output
              </label>
              <input
                type="text"
                value={textOutput}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          </div>

          {/* QR Code Options */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">QR Code Options</h2>
            <div className="grid gap-4 text-sm">
              <div className="flex items-center gap-2">
                <label className="font-medium">Error Correction:</label>
                <select
                  value={options.errorCorrectionLevel}
                  onChange={(e) => handleOptionChange('errorCorrectionLevel', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="L">Low</option>
                  <option value="M">Medium</option>
                  <option value="Q">Quartile</option>
                  <option value="H">High</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="font-medium">Scale:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={options.scale}
                  onChange={(e) => handleOptionChange('scale', parseInt(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="font-medium">Margin:</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={options.margin}
                  onChange={(e) => handleOptionChange('margin', parseInt(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="font-medium">Dark Color:</label>
                <input
                  type="color"
                  value={options.color.dark}
                  onChange={(e) => handleOptionChange('color.dark', e.target.value)}
                  className="h-8 w-12 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="font-medium">Light Color:</label>
                <input
                  type="color"
                  value={options.color.light}
                  onChange={(e) => handleOptionChange('color.light', e.target.value)}
                  className="h-8 w-12 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {qrCodeUrl && (
            <div className="p-4 bg-gray-50 rounded-md text-center">
              <h2 className="text-lg font-semibold mb-2">QR Code:</h2>
              <img src={qrCodeUrl} alt="Generated QR Code" className="mx-auto max-w-full h-auto" />
              <button
                onClick={downloadQRCode}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Download QR Code
              </button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert binary to text and generate QR code</li>
              <li>Input binary as space-separated bytes (8 bits each)</li>
              <li>Customize QR code appearance (error correction, scale, colors)</li>
              <li>Download generated QR code as PNG</li>
              <li>Example: "01001000 01100101 01101100 01101100 01101111" → "Hello"</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToQRCode;