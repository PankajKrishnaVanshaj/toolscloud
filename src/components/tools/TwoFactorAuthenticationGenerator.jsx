// components/TwoFactorAuthenticationGenerator.js
'use client';

import React, { useState, useEffect } from 'react';
import { totp } from 'otplib';

const TwoFactorAuthenticationGenerator = () => {
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [step, setStep] = useState(30); // Default TOTP time step (seconds)
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // Generate a random secret if none provided
  const generateRandomSecret = () => {
    const newSecret = totp.generateSecret(16); // 16 bytes = 128 bits
    setSecret(newSecret);
    setCode('');
    setError('');
  };

  // Generate TOTP code
  const generateCode = () => {
    setError('');
    setCode('');

    if (!secret) {
      setError('Please enter or generate a secret key');
      return;
    }

    try {
      totp.options = { step: parseInt(step) }; // Set time step
      const newCode = totp.generate(secret);
      setCode(newCode);
      setIsRunning(true);

      // Calculate time left in current step
      const currentTime = Math.floor(Date.now() / 1000);
      const timeElapsed = currentTime % step;
      setTimeLeft(step - timeElapsed);
    } catch (err) {
      setError('Code generation failed: ' + err.message);
    }
  };

  // Update time left and regenerate code when step expires
  useEffect(() => {
    if (!isRunning || !code) return;

    const timer = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeElapsed = currentTime % step;
      const remaining = step - timeElapsed;

      setTimeLeft(remaining);

      if (remaining === step) {
        // Regenerate code when step resets
        generateCode();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, code, step, secret]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateCode();
  };

  // Copy code to clipboard
  const copyToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code);
    }
  };

  // Clear all
  const clearAll = () => {
    setSecret('');
    setCode('');
    setStep(30);
    setTimeLeft(0);
    setError('');
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Two-Factor Authentication Generator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Secret Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secret Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="flex-1 p-2 border rounded focus:ring focus:ring-blue-200 font-mono text-sm"
                placeholder="Enter or generate a secret key"
              />
              <button
                type="button"
                onClick={generateRandomSecret}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Generate
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Base32-encoded secret (e.g., JBSWY3DPEHPK3PXP)
            </p>
          </div>

          {/* Time Step */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Step (seconds)
            </label>
            <input
              type="number"
              value={step}
              onChange={(e) => setStep(parseInt(e.target.value))}
              min={1}
              max={300}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
              placeholder="Default: 30"
            />
            <p className="text-xs text-gray-500 mt-1">
              How often the code changes (typically 30 seconds)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Generate Code
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

        {/* Generated Code */}
        {code && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Generated TOTP Code</h2>
            <div className="bg-gray-50 p-4 rounded border space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-2xl font-mono">{code}</p>
                <button
                  onClick={copyToClipboard}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${(timeLeft / step) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Time Left: {timeLeft} seconds
              </p>
            </div>
          </div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> Generates TOTP codes using the otplib library (RFC 6238). Codes update every {step} seconds. Use a Base32 secret compatible with authenticator apps (e.g., Google Authenticator).
        </p>
      </div>
    </div>
  );
};

export default TwoFactorAuthenticationGenerator;