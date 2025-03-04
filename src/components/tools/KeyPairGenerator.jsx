// components/KeyPairGenerator.js
'use client';

import React, { useState } from 'react';

const KeyPairGenerator = () => {
  const [keySize, setKeySize] = useState(2048); // 2048 or 4096
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate RSA key pair
  const generateKeyPair = async () => {
    setLoading(true);
    setError('');
    setPublicKey('');
    setPrivateKey('');

    try {
      // Generate key pair using Web Crypto API
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: keySize,
          publicExponent: new Uint8Array([1, 0, 1]), // 65537 in hex
          hash: 'SHA-256'
        },
        true, // Extractable
        ['encrypt', 'decrypt']
      );

      // Export public key in PEM format
      const publicKeyExported = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
      const publicKeyPem = formatToPem(publicKeyExported, 'PUBLIC KEY');
      setPublicKey(publicKeyPem);

      // Export private key in PEM format
      const privateKeyExported = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      const privateKeyPem = formatToPem(privateKeyExported, 'PRIVATE KEY');
      setPrivateKey(privateKeyPem);
    } catch (err) {
      setError('Key pair generation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Convert ArrayBuffer to PEM format
  const formatToPem = (keyData, type) => {
    const base64 = window.btoa(
      String.fromCharCode(...new Uint8Array(keyData))
    );
    const pem = `-----BEGIN ${type}-----\n${base64.match(/.{1,64}/g).join('\n')}\n-----END ${type}-----`;
    return pem;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateKeyPair();
  };

  // Copy keys to clipboard
  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  // Clear all
  const clearAll = () => {
    setPublicKey('');
    setPrivateKey('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6">RSA Key Pair Generator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Key Size Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key Size
            </label>
            <select
              value={keySize}
              onChange={(e) => setKeySize(parseInt(e.target.value))}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            >
              <option value={2048}>2048 bits</option>
              <option value={4096}>4096 bits</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              2048 is standard; 4096 offers higher security but slower generation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Generating...' : 'Generate Key Pair'}
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

        {/* Generated Keys */}
        {(publicKey || privateKey) && (
          <div className="mt-6 space-y-6">
            {/* Public Key */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Public Key</h2>
                <button
                  onClick={() => copyToClipboard(publicKey)}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
              <textarea
                value={publicKey}
                readOnly
                className="w-full p-2 border rounded bg-gray-50 h-40 font-mono text-sm"
                placeholder="Public key will appear here"
              />
            </div>

            {/* Private Key */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Private Key</h2>
                <button
                  onClick={() => copyToClipboard(privateKey)}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
              <textarea
                value={privateKey}
                readOnly
                className="w-full p-2 border rounded bg-gray-50 h-40 font-mono text-sm"
                placeholder="Private key will appear here"
              />
            </div>
          </div>
        )}

        {/* Security Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> Keys are generated locally in your browser using the Web Crypto API. The private key should be stored securely and never shared.
        </p>
      </div>
    </div>
  );
};

export default KeyPairGenerator;