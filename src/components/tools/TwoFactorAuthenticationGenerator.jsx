"use client";

import React, { useState, useEffect, useCallback } from "react";
import { totp } from "otplib";
import { FaCopy, FaSync, FaQrcode, FaDownload } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react"; // Changed to QRCodeCanvas

const TwoFactorAuthenticationGenerator = () => {
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [step, setStep] = useState(30); // Default TOTP time step
  const [digits, setDigits] = useState(6); // Default TOTP digits
  const [issuer, setIssuer] = useState(""); // For QR code
  const [accountName, setAccountName] = useState(""); // For QR code
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Generate a random secret
  const generateRandomSecret = useCallback(() => {
    const newSecret = totp.generateSecret(16); // 16 bytes = 128 bits
    setSecret(newSecret);
    setCode("");
    setError("");
  }, []);

  // Generate TOTP code
  const generateCode = useCallback(() => {
    setError("");
    setCode("");

    if (!secret) {
      setError("Please enter or generate a secret key");
      return;
    }

    try {
      totp.options = { step: parseInt(step), digits: parseInt(digits) };
      const newCode = totp.generate(secret);
      setCode(newCode);
      setIsRunning(true);

      const currentTime = Math.floor(Date.now() / 1000);
      const timeElapsed = currentTime % step;
      setTimeLeft(step - timeElapsed);
    } catch (err) {
      setError("Code generation failed: " + err.message);
    }
  }, [secret, step, digits]);

  // Timer effect
  useEffect(() => {
    if (!isRunning || !code) return;

    const timer = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeElapsed = currentTime % step;
      const remaining = step - timeElapsed;

      setTimeLeft(remaining);

      if (remaining === step) {
        generateCode();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, code, step, generateCode]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateCode();
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  // Reset everything
  const reset = () => {
    setSecret("");
    setCode("");
    setStep(30);
    setDigits(6);
    setIssuer("");
    setAccountName("");
    setTimeLeft(0);
    setError("");
    setIsRunning(false);
    setShowQRCode(false);
  };

  // Generate QR code URL
  const getQRCodeUrl = () => {
    if (!secret || !accountName) return "";
    const otpauth = `otpauth://totp/${encodeURIComponent(
      issuer ? `${issuer}:${accountName}` : accountName
    )}?secret=${secret}&digits=${digits}&period=${step}${
      issuer ? `&issuer=${encodeURIComponent(issuer)}` : ""
    }`;
    return otpauth;
  };

  // Download QR code as PNG
  const downloadQRCode = () => {
    const canvas = document.getElementById("qrcode-canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = `2fa-qrcode-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Two-Factor Authentication Generator
        </h1>

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
                onChange={(e) => setSecret(e.target.value.toUpperCase())}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Enter or generate a secret key (Base32)"
              />
              <button
                type="button"
                onClick={generateRandomSecret}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Generate
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Base32-encoded secret (e.g., JBSWY3DPEHPK3PXP)
            </p>
          </div>

          {/* QR Code Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issuer (Optional)
              </label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., MyApp"
              />
            </div>
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Step (seconds)
              </label>
              <input
                type="number"
                value={step}
                onChange={(e) => setStep(Math.max(1, Math.min(300, parseInt(e.target.value))))}
                min={1}
                max={300}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Default: 30"
              />
              <p className="text-xs text-gray-500 mt-1">
                Code validity period (1-300 seconds)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Digits
              </label>
              <select
                value={digits}
                onChange={(e) => setDigits(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value={6}>6</option>
                <option value={8}>8</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Length of the generated code
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate Code
            </button>
            <button
              type="button"
              onClick={() => setShowQRCode(!showQRCode)}
              disabled={!secret || !accountName}
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaQrcode className="mr-2" />
              {showQRCode ? "Hide QR Code" : "Show QR Code"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {/* Generated Code */}
        {code && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Generated TOTP Code</h2>
            <div className="flex items-center justify-between mb-4">
              <p className="text-3xl font-mono text-blue-600">{code}</p>
              <button
                onClick={() => copyToClipboard(code)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <FaCopy className="mr-2" /> Copy
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / step) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Time Left: {timeLeft} seconds
            </p>
          </div>
        )}

        {/* QR Code */}
        {showQRCode && secret && accountName && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border text-center">
            <h2 className="text-lg font-semibold mb-4">QR Code for Authenticator</h2>
            <QRCodeCanvas // Changed to QRCodeCanvas
              id="qrcode-canvas"
              value={getQRCodeUrl()}
              size={200}
              className="mx-auto mb-4"
            />
            <button
              onClick={downloadQRCode}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center mx-auto"
            >
              <FaDownload className="mr-2" /> Download QR Code
            </button>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate TOTP codes (RFC 6238)</li>
            <li>Customizable time step and digit length</li>
            <li>QR code generation for authenticator apps</li>
            <li>Copy code to clipboard</li>
            <li>Download QR code as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthenticationGenerator;