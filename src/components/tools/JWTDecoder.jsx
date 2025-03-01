"use client";

import React, { useState } from 'react';

const JWTDecoder = () => {
  const [jwtInput, setJwtInput] = useState('');
  const [decodedData, setDecodedData] = useState(null);
  const [error, setError] = useState(null);

  const decodeJWT = (token) => {
    setError(null);
    setDecodedData(null);

    if (!token.trim()) {
      setError('Please enter a JWT to decode');
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT: Must contain three parts (header.payload.signature)');
      }

      const [headerEncoded, payloadEncoded, signature] = parts;

      // Decode Base64URL to regular Base64 and then to string
      const decodeBase64URL = (str) => {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '==='.slice(0, (4 - base64.length % 4) % 4);
        return atob(padded);
      };

      const header = JSON.parse(decodeBase64URL(headerEncoded));
      const payload = JSON.parse(decodeBase64URL(payloadEncoded));

      setDecodedData({
        header: JSON.stringify(header, null, 2),
        payload: JSON.stringify(payload, null, 2),
        signature
      });
    } catch (err) {
      setError('Error decoding JWT: ' + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    decodeJWT(jwtInput);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">JWT Decoder</h2>

        {/* JWT Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JWT Token
            </label>
            <textarea
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Decode JWT
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Decoded Output */}
        {decodedData && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-700">Header</h3>
                <button
                  onClick={() => copyToClipboard(decodedData.header)}
                  className="px-2 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                {decodedData.header}
              </pre>
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-700">Payload</h3>
                <button
                  onClick={() => copyToClipboard(decodedData.payload)}
                  className="px-2 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                {decodedData.payload}
              </pre>
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-700">Signature</h3>
                <button
                  onClick={() => copyToClipboard(decodedData.signature)}
                  className="px-2 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Copy
                </button>
              </div>
              <p className="text-sm font-mono text-gray-800 break-all">
                {decodedData.signature}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">
                - This tool decodes the JWT but does not verify the signature.
              </p>
              <p className="text-sm text-gray-600">
                - Use a server-side tool or library (e.g., jsonwebtoken in Node.js) to verify authenticity.
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!decodedData && !error && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Enter a JWT to decode its header, payload, and view the signature.</p>
            <p className="mt-1">Example: <code className="text-xs">eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiSm9obiJ9.signature</code></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JWTDecoder;