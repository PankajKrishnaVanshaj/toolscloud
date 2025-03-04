'use client';

import React, { useState } from 'react';

const Base64ImageToText = () => {
  const [base64String, setBase64String] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const validateBase64 = (str) => {
    // Check if it's a valid Base64 string and likely an image
    const base64Regex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+$/;
    return base64Regex.test(str);
  };

  const handleBase64Input = (value) => {
    setBase64String(value);
    setError('');
    setImageSrc('');
    setFileName('');

    if (value.trim() === '') return;

    if (validateBase64(value)) {
      setImageSrc(value);
      setFileName('decoded_image_' + Date.now() + '.png'); // Default filename
    } else {
      setError('Invalid Base64 image string. Must start with "data:image/[type];base64,"');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setError('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setBase64String(base64);
      setImageSrc(base64);
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsDataURL(file);
  };

  const downloadImage = () => {
    if (!imageSrc) return;

    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = fileName || 'image.png';
    link.click();
  };

  const copyToClipboard = () => {
    if (!base64String) return;
    navigator.clipboard.writeText(base64String)
      .then(() => alert('Base64 string copied to clipboard'))
      .catch(() => setError('Failed to copy to clipboard'));
  };

  const clearAll = () => {
    setBase64String('');
    setImageSrc('');
    setError('');
    setFileName('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Base64 Image to Text Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base64 String
              </label>
              <textarea
                value={base64String}
                onChange={(e) => handleBase64Input(e.target.value)}
                placeholder="Paste Base64 string here (e.g., data:image/png;base64,...)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                disabled={!base64String}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              >
                Copy Base64
              </button>
              <button
                onClick={downloadImage}
                disabled={!imageSrc}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
              >
                Download Image
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Preview Section */}
          {imageSrc && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Image Preview:</h2>
              <div className="flex justify-center">
                <img
                  src={imageSrc}
                  alt="Decoded Image"
                  className="max-w-full max-h-96 object-contain rounded-md"
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Filename: {fileName}
              </p>
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
              <li>Convert Base64 image strings to actual images</li>
              <li>Upload images to generate Base64 strings</li>
              <li>Preview decoded images</li>
              <li>Download images with custom filename</li>
              <li>Copy Base64 string to clipboard</li>
              <li>Supports common image formats (PNG, JPEG, etc.)</li>
              <li>Example: data:image/png;base64,iVBORw0KGgo...</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default Base64ImageToText;