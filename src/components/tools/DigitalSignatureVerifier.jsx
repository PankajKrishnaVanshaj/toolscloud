// components/DigitalSignatureVerifier.js
'use client';

import React, { useState } from 'react';

const DigitalSignatureVerifier = () => {
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Convert PEM to ArrayBuffer
  const pemToArrayBuffer = (pem) => {
    const base64 = pem
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer.buffer;
  };

  // Verify signature
  const verifySignature = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    if (!message) {
      setError('Please enter a message');
      setLoading(false);
      return;
    }
    if (!signature) {
      setError('Please enter a signature');
      setLoading(false);
      return;
    }
    if (!publicKey) {
      setError('Please enter a public key');
      setLoading(false);
      return;
    }

    try {
      // Parse public key (assuming RSA PEM format)
      const publicKeyBuffer = pemToArrayBuffer(publicKey);
      const key = await window.crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        { name: 'RSA-PSS', hash: 'SHA-256' },
        false,
        ['verify']
      );

      // Convert signature from hex to ArrayBuffer
      const signatureBuffer = new Uint8Array(
        signature.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
      );

      // Convert message to ArrayBuffer
      const encoder = new TextEncoder();
      const messageBuffer = encoder.encode(message);

      // Verify signature
      const isValid = await window.crypto.subtle.verify(
        { name: 'RSA-PSS', saltLength: 32 },
        key,
        signatureBuffer,
        messageBuffer
      );

      setResults({
        isValid,
        messageLength: message.length,
        signatureLength: signatureBuffer.length
      });
    } catch (err) {
      setError('Verification failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    verifySignature();
  };

  // Clear all
  const clearAll = () => {
    setMessage('');
    setSignature('');
    setPublicKey('');
    setResults(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6">Digital Signature Verifier</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 h-24"
              placeholder="Enter the signed message"
            />
          </div>

          {/* Signature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Signature (Hex)
            </label>
            <textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 h-24 font-mono text-sm"
              placeholder="Enter the signature in hexadecimal format"
            />
          </div>

          {/* Public Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Public Key (PEM)
            </label>
            <textarea
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 h-32 font-mono text-sm"
              placeholder="Paste RSA public key in PEM format"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Verifying...' : 'Verify Signature'}
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

        {/* Verification Results */}
        {results && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Verification Results</h2>
            <div className="bg-gray-50 p-4 rounded border space-y-2">
              <p className={`text-sm ${results.isValid ? 'text-green-600' : 'text-red-600'}`}>
                <strong>Signature:</strong> {results.isValid ? '✓ Valid' : '✗ Invalid'}
              </p>
              <p className="text-sm">
                <strong>Message Length:</strong> {results.messageLength} characters
              </p>
              <p className="text-sm">
                <strong>Signature Length:</strong> {results.signatureLength} bytes
              </p>
            </div>
          </div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> This tool verifies RSA-PSS signatures (SHA-256) using the Web Crypto API. Provide the signature in hex and public key in PEM format (SPKI). It does not modify or store data; verification is client-side only.
        </p>
      </div>
    </div>
  );
};

export default DigitalSignatureVerifier;