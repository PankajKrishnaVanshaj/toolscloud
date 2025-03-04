'use client';

import React, { useState, useCallback } from 'react';
import { QrReader } from 'qrcode-reader'; // Note: This is a simplified import; actual implementation may vary
import Jimp from 'jimp';

const QRCodeToText = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [generatedQR, setGeneratedQR] = useState(null);

  const decodeQRCode = useCallback(async (imageFile) => {
    setError('');
    setText('');
    setGeneratedQR(null);

    try {
      const image = await Jimp.read(await imageFile.arrayBuffer());
      const qr = new QrReader();
      
      const result = await new Promise((resolve, reject) => {
        qr.decode(image.bitmap, (err, value) => {
          if (err) reject(err);
          else resolve(value);
        });
      });

      if (result) {
        setText(result);
        setHistory(prev => [...prev, { text: result, timestamp: new Date().toISOString() }].slice(-10));
      } else {
        setError('No QR code found in the image');
      }
    } catch (err) {
      setError(`Failed to decode QR code: ${err.message}`);
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      decodeQRCode(selectedFile);
    } else {
      setError('Please upload a valid image file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      decodeQRCode(droppedFile);
    } else {
      setError('Please drop a valid image file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const generateQRCode = () => {
    if (!text) {
      setError('Please enter text to generate a QR code');
      return;
    }
    // Using a simple online QR code generator API for demonstration
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;
    setGeneratedQR(qrUrl);
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          QR Code to Text Converter
        </h1>

        <div className="grid gap-6">
          {/* File Upload Section */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-md p-6 text-center ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer">
              <p className="text-sm text-gray-600">
                {file ? `Selected: ${file.name}` : 'Drag and drop an image or click to upload'}
              </p>
              <button
                type="button"
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={() => document.getElementById('fileInput').click()}
              >
                Upload Image
              </button>
            </label>
          </div>

          {/* Result Section */}
          {text && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Decoded Text:</h2>
              <div className="flex items-center gap-2 text-sm">
                <p className="break-all">{text}</p>
                <button
                  onClick={() => copyToClipboard(text)}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Copy
                </button>
              </div>
              <button
                onClick={generateQRCode}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Generate QR Code from Text
              </button>
            </div>
          )}

          {/* Generated QR Code */}
          {generatedQR && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Generated QR Code:</h2>
              <img src={generatedQR} alt="Generated QR Code" className="mx-auto" />
              <a
                href={generatedQR}
                download="qrcode.png"
                className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Download QR Code
              </a>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">History (Last 10):</h2>
              <div className="space-y-2 text-sm max-h-40 overflow-auto">
                {history.map((item, index) => (
                  <div key={index} className="p-2 bg-gray-100 rounded">
                    <p>{item.timestamp}: {item.text.slice(0, 50)}{item.text.length > 50 ? '...' : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Decode QR codes from image files</li>
              <li>Drag-and-drop support</li>
              <li>Generate QR codes from decoded text</li>
              <li>Copy text to clipboard</li>
              <li>Download generated QR codes</li>
              <li>Tracks last 10 decoded results</li>
              <li>Supports common image formats (PNG, JPG, etc.)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default QRCodeToText;