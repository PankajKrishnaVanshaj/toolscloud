'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

const TextToQRCode = () => {
  const [text, setText] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    size: 200,
    color: '#000000',
    bgColor: '#ffffff',
    errorCorrection: 'M', // Medium error correction
  });

  const generateQRCode = async () => {
    setError('');
    setQrCodeUrl('');

    if (!text.trim()) {
      setError('Please enter some text to generate a QR code');
      return;
    }

    try {
      const qrOptions = {
        width: options.size,
        color: {
          dark: options.color,
          light: options.bgColor,
        },
        errorCorrectionLevel: options.errorCorrection,
      };

      const url = await QRCode.toDataURL(text, qrOptions);
      setQrCodeUrl(url);
    } catch (err) {
      setError(`Failed to generate QR code: ${err.message}`);
    }
  };

  useEffect(() => {
    if (text) {
      generateQRCode();
    }
  }, [text, options]);

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'qrcode.png';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Text to QR Code Generator
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Input
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to convert to QR code (e.g., URL, message)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-y"
              />
            </div>

            {/* Customization Options */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size (pixels)
                </label>
                <input
                  type="number"
                  value={options.size}
                  onChange={(e) => handleOptionChange('size', parseInt(e.target.value))}
                  min="100"
                  max="1000"
                  step="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Error Correction Level
                </label>
                <select
                  value={options.errorCorrection}
                  onChange={(e) => handleOptionChange('errorCorrection', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="L">Low (L)</option>
                  <option value="M">Medium (M)</option>
                  <option value="Q">Quartile (Q)</option>
                  <option value="H">High (H)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foreground Color
                </label>
                <input
                  type="color"
                  value={options.color}
                  onChange={(e) => handleOptionChange('color', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <input
                  type="color"
                  value={options.bgColor}
                  onChange={(e) => handleOptionChange('bgColor', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* QR Code Display */}
          {qrCodeUrl && (
            <div className="p-4 bg-gray-50 rounded-md text-center">
              <h2 className="text-lg font-semibold mb-2">Generated QR Code:</h2>
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-4" />
              <button
                onClick={downloadQRCode}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Download QR Code
              </button>
            </div>
          )}

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
              <li>Generate QR codes from any text input</li>
              <li>Customize size (100-1000px), colors, and error correction</li>
              <li>Real-time preview as you type or adjust options</li>
              <li>Download QR code as PNG</li>
              <li>Error correction levels: L (7%), M (15%), Q (25%), H (30%)</li>
              <li>Example: Enter a URL like "https://example.com"</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TextToQRCode;