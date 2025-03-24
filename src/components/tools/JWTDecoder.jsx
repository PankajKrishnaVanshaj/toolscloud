"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { FaCopy, FaDownload, FaSync, FaClock, FaKey, FaEye, FaEyeSlash, FaFileExport } from 'react-icons/fa';

const JWTDecoder = () => {
  const [jwtInput, setJwtInput] = useState('');
  const [decodedData, setDecodedData] = useState(null);
  const [error, setError] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [history, setHistory] = useState([]);
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [customClaims, setCustomClaims] = useState('');
  const [options, setOptions] = useState({
    verifyExpiration: true,
    showTimestamps: true,
    verifySignature: false,
    highlightClaims: true,
    validateSchema: false,
  });

  const decodeJWT = useCallback(async (token) => {
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

      const decodeBase64URL = (str) => {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '==='.slice(0, (4 - base64.length % 4) % 4);
        return atob(padded);
      };

      const header = JSON.parse(decodeBase64URL(headerEncoded));
      let payload = JSON.parse(decodeBase64URL(payloadEncoded));

      // Signature verification with proper async handling
      if (options.verifySignature && secret) {
        try {
          const encoder = new TextEncoder();
          const data = `${headerEncoded}.${payloadEncoded}`;
          
          const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(secret),
            { name: "HMAC", hash: header.alg || "SHA-256" },
            false,
            ["sign"]
          );

          const sig = await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(data)
          );

          const generatedSig = btoa(String.fromCharCode(...new Uint8Array(sig)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

          if (generatedSig !== signature) {
            setError(prev => prev ? `${prev}; Signature verification failed` : 'Warning: Signature verification failed');
          }
        } catch (sigError) {
          setError(`Signature verification error: ${sigError.message}`);
        }
      }

      // Schema validation
      if (options.validateSchema) {
        const requiredClaims = ['iss', 'sub', 'aud'];
        requiredClaims.forEach(claim => {
          if (!(claim in payload)) {
            setError(prev => prev ? `${prev}; Missing required claim: ${claim}` : `Warning: Missing required claim: ${claim}`);
          }
        });
      }

      // Process payload
      if (options.verifyExpiration && payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp < currentTime) {
          setError(prev => prev ? `${prev}; JWT has expired` : 'Warning: JWT has expired');
        }
      }

      const processedPayload = { ...payload };
      if (options.showTimestamps) {
        if (payload.iat) processedPayload.iatHuman = new Date(payload.iat * 1000).toLocaleString();
        if (payload.exp) processedPayload.expHuman = new Date(payload.exp * 1000).toLocaleString();
        if (payload.nbf) processedPayload.nbfHuman = new Date(payload.nbf * 1000).toLocaleString();
      }

      const decoded = {
        header: JSON.stringify(header, null, 2),
        payload: JSON.stringify(processedPayload, null, 2),
        signature,
        raw: { header: headerEncoded, payload: payloadEncoded, signature }
      };

      setDecodedData(decoded);
      setHistory(prev => [...prev, { token, timestamp: new Date() }].slice(-5));
    } catch (err) {
      setError('Error decoding JWT: ' + err.message);
    }
  }, [options, secret]);

  const generateSampleJWT = () => {
    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
      sub: "1234567890",
      name: "John Doe",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    const headerEnc = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const payloadEnc = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const signature = 'sample-signature';
    const token = `${headerEnc}.${payloadEnc}.${signature}`;
    setJwtInput(token);
    decodeJWT(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await decodeJWT(jwtInput);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadJWT = () => {
    const blob = new Blob([jwtInput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jwt-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportDecodedData = () => {
    if (!decodedData) return;
    const data = {
      header: JSON.parse(decodedData.header),
      payload: JSON.parse(decodedData.payload),
      signature: decodedData.signature
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `decoded-jwt-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setJwtInput('');
    setDecodedData(null);
    setError(null);
    setShowRaw(false);
    setSecret('');
    setCustomClaims('');
  };

  useEffect(() => {
    if (jwtInput && (options.verifySignature || options.validateSchema) && secret) {
      decodeJWT(jwtInput);
    }
  }, [jwtInput, options, secret, decodeJWT]);

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">JWT Decoder</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">JWT Token</label>
            <textarea
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              className="w-full h-32 sm:h-40 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              aria-label="JWT Input"
            />
          </div>

          {/* Secret Key Input */}
          {options.verifySignature && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full p-4 pr-12 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter secret key"
                  aria-label="Secret Key"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showSecret ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          )}

          {/* Custom Claims */}
          {options.highlightClaims && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Claims to Highlight (comma-separated)</label>
              <input
                type="text"
                value={customClaims}
                onChange={(e) => setCustomClaims(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., sub, name"
                aria-label="Custom Claims"
              />
            </div>
          )}

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(options).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Decode JWT
            </button>
            <button
              type="button"
              onClick={generateSampleJWT}
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <FaKey className="mr-2" /> Generate Sample
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              type="button"
              onClick={downloadJWT}
              disabled={!jwtInput.trim()}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error.split(';').map((msg, index) => (
              <p key={index}>{msg.trim()}</p>
            ))}
          </div>
        )}

        {/* Decoded Output */}
        {decodedData && (
          <div className="mt-6 space-y-6">
            {['header', 'payload', 'signature'].map((section) => (
              <div key={section} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700 capitalize">{section}</h3>
                  <div className="flex gap-2">
                    {section !== 'signature' && (
                      <button
                        onClick={() => setShowRaw(!showRaw)}
                        className="px-2 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                      >
                        {showRaw ? 'Formatted' : 'Raw'}
                      </button>
                    )}
                    <button
                      onClick={() => copyToClipboard(showRaw && section !== 'signature' ? decodedData.raw[section] : decodedData[section])}
                      className="px-2 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
                <pre className={`text-sm font-mono text-gray-800 whitespace-pre-wrap break-all ${options.highlightClaims && section === 'payload' && customClaims ? 'bg-yellow-50' : ''}`}>
                  {showRaw && section !== 'signature' ? decodedData.raw[section] : decodedData[section]}
                </pre>
              </div>
            ))}

            {/* Export Button */}
            <button
              onClick={exportDecodedData}
              className="w-full py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center"
            >
              <FaFileExport className="mr-2" /> Export Decoded Data (JSON)
            </button>

            {/* Notes */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-700 mb-2">Notes</h3>
              <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
                <li>Signature verification is client-side (use server for production)</li>
                <li>Custom claims highlighted: {customClaims || 'None'}</li>
                <li>Schema validation checks iss, sub, aud when enabled</li>
              </ul>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <FaClock className="mr-2" /> Recent Decodings (Last 5)
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((item, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span
                    className="truncate max-w-[70%] cursor-pointer hover:text-blue-600"
                    onClick={() => { setJwtInput(item.token); decodeJWT(item.token); }}
                    title={item.token}
                  >
                    {item.token.slice(0, 50)}...
                  </span>
                  <span>{item.timestamp.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default JWTDecoder;