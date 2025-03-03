'use client';

import React, { useState, useCallback } from 'react';
import QrCodeReader from 'qrcode-reader';
import { useDropzone } from 'react-dropzone';

const QRCodeToBinary = () => {
  const [image, setImage] = useState(null);
  const [qrContent, setQrContent] = useState('');
  const [binary, setBinary] = useState('');
  const [error, setError] = useState('');
  const [byteFormat, setByteFormat] = useState(8); // 8-bit or 16-bit bytes
  const [previewUrl, setPreviewUrl] = useState('');

  const decodeQRCode = (file) => {
    setError('');
    setQrContent('');
    setBinary('');
    setPreviewUrl('');

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        setPreviewUrl(reader.result);
        const qr = new QrCodeReader();
        qr.callback = (err, value) => {
          if (err) {
            setError('Failed to decode QR code: ' + err.message);
            return;
          }
          const content = value.result;
          setQrContent(content);
          convertToBinary(content);
        };
        qr.decode(img);
      };
    };
    reader.readAsDataURL(file);
  };

  const convertToBinary = (text) => {
    const binaryArray = [];
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      let binaryStr = charCode.toString(2);
      binaryStr = binaryStr.padStart(byteFormat, '0');
      binaryArray.push(binaryStr);
    }
    setBinary(binaryArray.join(' '));
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      decodeQRCode(acceptedFiles[0]);
    }
  }, [byteFormat]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
    multiple: false,
  });

  const downloadBinary = () => {
    const blob = new Blob([binary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrcode_binary.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(binary);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          QR Code to Binary Converter
        </h1>

        <div className="grid gap-6">
          {/* Dropzone Section */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-md p-6 text-center ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-blue-500">Drop the QR code image here...</p>
            ) : (
              <p className="text-gray-600">
                Drag and drop a QR code image here, or click to select a file
              </p>
            )}
          </div>

          {/* Preview Section */}
          {previewUrl && (
            <div className="flex justify-center">
              <img src={previewUrl} alt="QR Code Preview" className="max-w-xs rounded-md" />
            </div>
          )}

          {/* Byte Format Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Byte Format
            </label>
            <select
              value={byteFormat}
              onChange={(e) => {
                setByteFormat(parseInt(e.target.value));
                if (qrContent) convertToBinary(qrContent);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={8}>8-bit</option>
              <option value={16}>16-bit</option>
            </select>
          </div>

          {/* Results Section */}
          {(qrContent || binary) && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <div className="space-y-4 text-sm">
                {qrContent && (
                  <div>
                    <p className="font-medium">QR Code Content:</p>
                    <p className="break-all">{qrContent}</p>
                  </div>
                )}
                {binary && (
                  <div>
                    <p className="font-medium">Binary Representation:</p>
                    <p className="break-all font-mono">{binary}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Copy to Clipboard
                      </button>
                      <button
                        onClick={downloadBinary}
                        className="px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        Download as Text
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
              <li>Upload a QR code image to decode its content</li>
              <li>Converts QR content to binary (8-bit or 16-bit per character)</li>
              <li>Preview the uploaded QR code</li>
              <li>Copy binary to clipboard or download as text file</li>
              <li>Supports any QR code content (text, URLs, etc.)</li>
              <li>Requires a valid QR code image (PNG, JPG, etc.)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default QRCodeToBinary;