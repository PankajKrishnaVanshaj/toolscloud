// components/SecureQRCodeGenerator.js
'use client';

import React, { useState } from 'react';
import QRCode from 'qrcode';
import { AES, enc } from 'crypto-js';

const SecureQRCodeGenerator = () => {
  const [inputData, setInputData] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [encrypt, setEncrypt] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate QR code
  const generateQRCode = async () => {
    setLoading(true);
    setError('');
    setQrCodeUrl('');

    if (!inputData) {
      setError('Please enter data to encode');
      setLoading(false);
      return;
    }
    if (encrypt && !secretKey) {
      setError('Please enter a secret key for encryption');
      setLoading(false);
      return;
    }

    try {
      let dataToEncode = inputData;
      if (encrypt) {
        dataToEncode = AES.encrypt(inputData, secretKey).toString();
      }

      const qrCodeDataUrl = await QRCode.toDataURL(dataToEncode, {
        width: 300,
        margin: 1,
        errorCorrectionLevel: 'H' // High error correction for reliability
      });
      setQrCodeUrl(qrCodeDataUrl);
    } catch (err) {
      setError('QR code generation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateQRCode();
  };

  // Download QR code
  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qrcode-${Date.now()}.png`;
      link.click();
    }
  };

  // Copy encrypted data to clipboard (if encrypted)
  const copyEncryptedData = () => {
    if (encrypt && inputData && secretKey) {
      const encrypted = AES.encrypt(inputData, secretKey).toString();
      navigator.clipboard.writeText(encrypted);
    }
  };

  // Clear all
  const clearAll = () => {
    setInputData('');
    setSecretKey('');
    setEncrypt(false);
    setQrCodeUrl('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Secure QR Code Generator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data to Encode
            </label>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 h-24"
              placeholder="Enter text, URL, or data to encode"
            />
          </div>

          {/* Encryption Option */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={encrypt}
                onChange={(e) => setEncrypt(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-200"
              />
              Encrypt Data
            </label>
            {encrypt && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secret Key
                </label>
                <input
                  type="text"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
                  placeholder="Enter secret key for encryption"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Generating...' : 'Generate QR Code'}
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center mt-4">{error}</div>
        )}

        {/* QR Code Output */}
        {qrCodeUrl && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Generated QR Code</h2>
            <div className="bg-gray-50 p-4 rounded border text-center">
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={downloadQRCode}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Download
                </button>
                {encrypt && (
                  <button
                    onClick={copyEncryptedData}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Copy Encrypted Data
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {encrypt
                ? 'Scan with a QR reader and decrypt with the secret key to access the data.'
                : 'Scan with any QR reader to access the data.'}
            </p>
          </div>
        )}

        {/* Security Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> Encryption (if enabled) uses AES and occurs locally. Keep your secret key secure. QR codes have a data limit of ~4KB.
        </p>
      </div>
    </div>
  );
};

export default SecureQRCodeGenerator;