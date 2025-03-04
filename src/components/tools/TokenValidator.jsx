// components/TokenValidator.js
'use client';

import React, { useState } from 'react';

const TokenValidator = () => {
  const [token, setToken] = useState('');
  const [tokenType, setTokenType] = useState('jwt'); // jwt, oauth, custom
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Decode JWT (base64url to JSON)
  const decodeJWT = (part) => {
    try {
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = atob(base64);
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Validate and analyze token
  const validateToken = () => {
    setError('');
    setResults(null);

    if (!token.trim()) {
      setError('Please enter a token to validate');
      return;
    }

    let isValid = false;
    let details = {};

    if (tokenType === 'jwt') {
      // JWT: header.payload.signature
      const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
      isValid = jwtRegex.test(token);

      if (isValid) {
        const [header, payload, signature] = token.split('.');
        const decodedHeader = decodeJWT(header);
        const decodedPayload = decodeJWT(payload);

        if (!decodedHeader || !decodedPayload) {
          setError('Invalid JWT: Unable to decode header or payload');
          return;
        }

        details = {
          header: decodedHeader,
          payload: decodedPayload,
          signatureLength: signature ? signature.length : 0
        };

        // Check common JWT fields
        if (decodedPayload.exp) {
          const expirationDate = new Date(decodedPayload.exp * 1000);
          details.isExpired = expirationDate < new Date();
          details.expiration = expirationDate.toLocaleString();
        }
      } else {
        setError('Invalid JWT format. Expected: header.payload.signature');
        return;
      }
    } else if (tokenType === 'oauth') {
      // OAuth-like token: typically alphanumeric with some structure
      const oauthRegex = /^[A-Za-z0-9-_]{20,}$/;
      isValid = oauthRegex.test(token);
      details.length = token.length;

      if (!isValid) {
        setError('Invalid OAuth token format. Expected: 20+ alphanumeric characters');
        return;
      }
    } else if (tokenType === 'custom') {
      // Custom token: basic check for length and entropy
      isValid = token.length >= 16;
      details.length = token.length;
      details.hasVariety = /[A-Za-z]/.test(token) && /\d/.test(token);

      if (!isValid) {
        setError('Invalid custom token. Minimum length: 16 characters');
        return;
      }
    }

    setResults({
      type: tokenType,
      isValid,
      details
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    validateToken();
  };

  // Copy results to clipboard
  const copyToClipboard = () => {
    if (results) {
      const text = JSON.stringify(results, null, 2);
      navigator.clipboard.writeText(text);
    }
  };

  // Clear all
  const clearAll = () => {
    setToken('');
    setTokenType('jwt');
    setResults(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6">Token Validator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Token Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token Type
            </label>
            <select
              value={tokenType}
              onChange={(e) => setTokenType(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            >
              <option value="jwt">JWT (JSON Web Token)</option>
              <option value="oauth">OAuth-like Token</option>
              <option value="custom">Custom Token</option>
            </select>
          </div>

          {/* Token Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token
            </label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 h-24 font-mono text-sm"
              placeholder="Paste your token here"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Validate Token
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

        {/* Validation Results */}
        {results && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Validation Results</h2>
              <button
                onClick={copyToClipboard}
                className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Copy Results
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded border space-y-2">
              <p className="text-sm">
                <strong>Type:</strong> {results.type.toUpperCase()}
              </p>
              <p className={`text-sm ${results.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {results.isValid ? '✓ Valid format' : '✗ Invalid format'}
              </p>

              {results.type === 'jwt' && results.isValid && (
                <>
                  <div>
                    <p className="text-sm font-medium">Header:</p>
                    <pre className="text-sm bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(results.details.header, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payload:</p>
                    <pre className="text-sm bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(results.details.payload, null, 2)}
                    </pre>
                  </div>
                  <p className="text-sm">
                    <strong>Signature Length:</strong> {results.details.signatureLength} characters
                  </p>
                  {results.details.expiration && (
                    <p className={`text-sm ${results.details.isExpired ? 'text-red-600' : 'text-green-600'}`}>
                      <strong>Expiration:</strong> {results.details.expiration} 
                      {results.details.isExpired ? ' (Expired)' : ' (Valid)'}
                    </p>
                  )}
                </>
              )}

              {results.type === 'oauth' && results.isValid && (
                <p className="text-sm">
                  <strong>Length:</strong> {results.details.length} characters
                </p>
              )}

              {results.type === 'custom' && results.isValid && (
                <>
                  <p className="text-sm">
                    <strong>Length:</strong> {results.details.length} characters
                  </p>
                  <p className="text-sm">
                    <strong>Character Variety:</strong> {results.details.hasVariety ? 'Yes (letters + numbers)' : 'No (limited diversity)'}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> This tool validates token format and decodes JWTs client-side. It does not verify token authenticity (e.g., signature), which requires server-side secrets.
        </p>
      </div>
    </div>
  );
};

export default TokenValidator;