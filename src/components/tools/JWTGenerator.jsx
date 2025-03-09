"use client";

import React, { useState, useCallback } from "react";
import jwt from "jsonwebtoken";
import { FaCopy, FaTrash, FaHistory, FaUndo, FaEye } from "react-icons/fa";

const JWTGenerator = () => {
  const [header, setHeader] = useState(JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2));
  const [payload, setPayload] = useState(
    JSON.stringify(
      { sub: "1234567890", name: "John Doe", iat: Math.floor(Date.now() / 1000) },
      null,
      2
    )
  );
  const [secret, setSecret] = useState("your-secret-key");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [decodedToken, setDecodedToken] = useState(null);
  const [options, setOptions] = useState({
    algorithm: "HS256", // HS256, HS384, HS512
    expiresIn: "", // e.g., "1h", "24h", "7d"
  });

  // Validate JSON input
  const validateJSON = (str, fieldName) => {
    try {
      if (typeof str !== "string") throw new Error(`${fieldName} must be a string`);
      const parsed = JSON.parse(str);
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error(`${fieldName} must be a valid JSON object`);
      }
      return parsed;
    } catch (err) {
      throw new Error(`Invalid ${fieldName}: ${err.message}`);
    }
  };

  // Generate JWT
  const generateToken = useCallback(() => {
    setError("");
    setToken("");
    setDecodedToken(null);

    try {
      if (!secret || typeof secret !== "string") throw new Error("Secret key must be a non-empty string");

      const parsedHeader = validateJSON(header, "header");
      const parsedPayload = validateJSON(payload, "payload");

      const jwtOptions = { header: parsedHeader };
      if (options.expiresIn) jwtOptions.expiresIn = options.expiresIn;

      const generatedToken = jwt.sign(parsedPayload, secret, {
        ...jwtOptions,
        algorithm: options.algorithm,
        encoding: "utf8",
      });

      setToken(generatedToken);
      setHistory((prev) => [
        ...prev,
        { header, payload, secret, token: generatedToken, options },
      ].slice(-5));
    } catch (err) {
      setError(err.message || "Failed to generate token");
    }
  }, [header, payload, secret, options]);

  // Decode JWT
  const decodeToken = () => {
    if (!token) {
      setError("No token to decode");
      return;
    }
    try {
      const decoded = jwt.verify(token, secret, { algorithms: [options.algorithm] });
      setDecodedToken(decoded);
      setError("");
    } catch (err) {
      setError("Failed to decode token: " + (err.message || "Invalid token or secret"));
    }
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!token) {
      setError("No token to copy");
      return;
    }
    navigator.clipboard
      .writeText(token)
      .then(() => {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2000);
      })
      .catch(() => setError("Failed to copy token"));
  };

  // Reset fields
  const resetFields = () => {
    setHeader(JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2));
    setPayload(
      JSON.stringify(
        { sub: "1234567890", name: "John Doe", iat: Math.floor(Date.now() / 1000) },
        null,
        2
      )
    );
    setSecret("your-secret-key");
    setToken("");
    setError("");
    setDecodedToken(null);
    setOptions({ algorithm: "HS256", expiresIn: "" });
  };

  // Restore from history
  const restoreFromHistory = (entry) => {
    setHeader(entry.header);
    setPayload(entry.payload);
    setSecret(entry.secret);
    setToken(entry.token);
    setOptions(entry.options);
    setError("");
    setDecodedToken(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        {/* Alert Notification */}
        {showAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Token copied to clipboard!
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced JWT Generator
        </h1>

        {/* Options */}
        <div className="p-4 bg-gray-50 rounded-lg mb-6 space-y-4">
          <p className="text-sm font-medium text-gray-700">JWT Options:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Algorithm:</label>
              <select
                value={options.algorithm}
                onChange={(e) => setOptions({ ...options, algorithm: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="HS256">HS256</option>
                <option value="HS384">HS384</option>
                <option value="HS512">HS512</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Expires In:</label>
              <input
                type="text"
                value={options.expiresIn}
                onChange={(e) => setOptions({ ...options, expiresIn: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1h, 24h, 7d"
              />
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={generateToken}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!secret || !header || !payload}
          >
            Generate Token
          </button>
          {token && (
            <>
              <button
                onClick={copyToClipboard}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium flex items-center justify-center"
              >
                <FaCopy className="mr-2" />
                Copy Token
              </button>
              <button
                onClick={decodeToken}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
              >
                <FaEye className="mr-2" />
                Decode Token
              </button>
              <button
                onClick={resetFields}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
              >
                <FaTrash className="mr-2" />
                Reset
              </button>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md text-center">
            {error}
          </div>
        )}

        {/* Generated Token */}
        {token && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated JWT:</h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 break-all">
              <pre className="text-sm font-mono text-gray-800">{token}</pre>
            </div>
          </div>
        )}

        {/* Decoded Token */}
        {decodedToken && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Decoded Token:</h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <pre className="text-sm font-mono text-gray-800">
                {JSON.stringify(decodedToken, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Tokens (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{entry.token.slice(0, 20)}...</span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Support for HS256, HS384, HS512 algorithms</li>
            <li>Custom expiration time (e.g., 1h, 24h, 7d)</li>
            <li>Generate, decode, and copy tokens</li>
            <li>Track recent tokens with history</li>
          </ul>
        </div>
      </div>

      {/* Tailwind Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};

export default JWTGenerator;