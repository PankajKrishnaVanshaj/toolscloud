'use client'
import React, { useState } from 'react'
import jwt from 'jsonwebtoken'

const JWTGenerator = () => {
  const [header, setHeader] = useState(JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2))
  const [payload, setPayload] = useState(JSON.stringify({
    sub: '1234567890',
    name: 'John Doe',
    iat: Math.floor(Date.now() / 1000)
  }, null, 2))
  const [secret, setSecret] = useState('your-secret-key')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  const validateJSON = (str, fieldName) => {
    try {
      if (typeof str !== 'string') {
        throw new Error(`${fieldName} must be a string`);
      }
      const parsed = JSON.parse(str);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error(`${fieldName} must be a valid JSON object`);
      }
      return parsed;
    } catch (err) {
      throw new Error(`Invalid ${fieldName}: ${err.message}`);
    }
  }

  const generateToken = () => {
    setError('')
    setToken('')
    
    try {
      // Validate inputs before proceeding
      if (!secret || typeof secret !== 'string') {
        throw new Error('Secret key must be a non-empty string');
      }

      const parsedHeader = validateJSON(header, 'header');
      const parsedPayload = validateJSON(payload, 'payload');

      // Generate token with proper error handling
      const generatedToken = jwt.sign(parsedPayload, secret, { 
        header: parsedHeader,
        // Adding some default options to prevent common issues
        noTimestamp: false,
        encoding: 'utf8'
      });
      
      setToken(generatedToken);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while generating the token');
    }
  }

  const copyToClipboard = () => {
    if (!token) {
      setError('No token to copy');
      return;
    }
    navigator.clipboard.writeText(token)
      .then(() => alert('Token copied to clipboard!'))
      .catch(() => setError('Failed to copy token'));
  }

  const resetFields = () => {
    setHeader(JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2));
    setPayload(JSON.stringify({
      sub: '1234567890',
      name: 'John Doe',
      iat: Math.floor(Date.now() / 1000)
    }, null, 2));
    setSecret('your-secret-key');
    setToken('');
    setError('');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          JWT Generator
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Header (JSON)
            </label>
            <textarea
              value={header}
              onChange={(e) => setHeader(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter JWT header in JSON format"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payload (JSON)
            </label>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter JWT payload in JSON format"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secret Key
          </label>
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your secret key"
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateToken}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!secret || !header || !payload}
          >
            Generate Token
          </button>

          {token && (
            <>
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Copy Token
              </button>

              <button
                onClick={resetFields}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Reset
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {token && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated JWT:
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 break-all">
              <pre className="text-sm font-mono text-gray-800">{token}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JWTGenerator