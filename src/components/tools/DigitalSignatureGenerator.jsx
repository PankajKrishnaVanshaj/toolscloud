// components/DigitalSignatureGenerator.js
'use client';

import React, { useState } from 'react';

const DigitalSignatureGenerator = () => {
  const [message, setMessage] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [signature, setSignature] = useState('');
  const [publicKey, setPublicKey] = useState(''); // For verification reference
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Convert ArrayBuffer to PEM
  const arrayBufferToPem = (buffer, type) => {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return `-----BEGIN ${type}-----\n${base64.match(/.{1,64}/g).join('\n')}\n-----END ${type}-----`;
  };

  // Convert PEM to ArrayBuffer
  const pemToArrayBuffer = (pem) => {
    const base64 = pem
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s/g, '');
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer.buffer;
  };

  // Convert ArrayBuffer to Hex
  const arrayBufferToHex = (buffer) => {
    return Array.from(new Uint8Array(buffer))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  };

  // Generate signature
  const generateSignature = async () => {
    setLoading(true);
    setError('');
    setSignature('');
    setPublicKey('');

    if (!message) {
      setError('Please enter a message to sign');
      setLoading(false);
      return;
    }
    if (!privateKey) {
      setError('Please enter a private key or generate a key pair');
      setLoading(false);
      return;
    }

    try {
      // Import private key from PEM (assuming PKCS#8 format)
      const privateKeyBuffer = pemToArrayBuffer(privateKey);
      const key = await window.crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        { name: 'RSA-PSS', hash: 'SHA-256' },
        true,
        ['sign']
      );

      // Convert message to ArrayBuffer
      const encoder = new TextEncoder();
      const messageBuffer = encoder.encode(message);

      // Generate signature
      const signatureBuffer = await window.crypto.subtle.sign(
        { name: 'RSA-PSS', saltLength: 32 },
        key,
        messageBuffer
      );

      // Export public key for reference
      const publicKeyExported = await window.crypto.subtle.exportKey('spki', key);
      const publicKeyPem = arrayBufferToPem(publicKeyExported, 'PUBLIC KEY');

      setSignature(arrayBufferToHex(signatureBuffer));
      setPublicKey(publicKeyPem);
    } catch (err) {
      setError('Signature generation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate new RSA key pair
  const generateKeyPair = async () => {
    setLoading(true);
    setError('');
    setSignature('');
    setPublicKey('');

    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-PSS',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]), // 65537
          hash: 'SHA-256'
        },
        true,
        ['sign', 'verify']
      );

      const privateKeyExported = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      const publicKeyExported = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);

      const privateKeyPem = arrayBufferToPem(privateKeyExported, 'PRIVATE KEY');
      const publicKeyPem = arrayBufferToPem(publicKeyExported, 'PUBLIC KEY');

      setPrivateKey(privateKeyPem);
      setPublicKey(publicKeyPem);
    } catch (err) {
      setError('Key pair generation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateSignature();
  };

  // Copy signature or keys to clipboard
  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  // Clear all
  const clearAll = () => {
    setMessage('');
    setPrivateKey('');
    setSignature('');
    setPublicKey('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6">Digital Signature Generator</h1>
        
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
              placeholder="Enter the message to sign"
            />
          </div>

          {/* Private Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Private Key (PEM)
            </label>
            <textarea
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 h-32 font-mono text-sm"
              placeholder="Paste RSA private key in PEM format or generate one"
            />
            <button
              type="button"
              onClick={generateKeyPair}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Key Pair'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Signing...' : 'Generate Signature'}
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

        {/* Generated Signature */}
        {(signature || publicKey) && (
          <div className="mt-6 space-y-6">
            {/* Signature */}
            {signature && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Generated Signature (Hex)</h2>
                  <button
                    onClick={() => copyToClipboard(signature)}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Copy
                  </button>
                </div>
                <textarea
                  value={signature}
                  readOnly
                  className="w-full p-2 border rounded bg-gray-50 h-24 font-mono text-sm"
                />
              </div>
            )}

            {/* Public Key */}
            {publicKey && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Public Key (PEM)</h2>
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
                  className="w-full p-2 border rounded bg-gray-50 h-32 font-mono text-sm"
                />
              </div>
            )}
          </div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> Generates RSA-PSS signatures (SHA-256) using the Web Crypto API. Provide or generate an RSA private key in PEM format (PKCS#8). The signature is in hex and can be verified with the corresponding public key.
        </p>
      </div>
    </div>
  );
};

export default DigitalSignatureGenerator;