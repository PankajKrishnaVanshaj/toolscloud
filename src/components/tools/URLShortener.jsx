"use client";

import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaSync, FaQrcode, FaDownload } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react"; // Changed to QRCodeCanvas

const URLShortener = () => {
  const [inputUrl, setInputUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [history, setHistory] = useState([]);
  const qrCodeRef = useRef(null);

  // URL validation
  const validateUrl = (url) => {
    const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
    return urlPattern.test(url);
  };

  // Handle URL shortening
  const handleShorten = useCallback(() => {
    setError("");
    setShortenedUrl("");
    setCopied(false);
    setShowQRCode(false);

    if (!inputUrl) {
      setError("Please enter a URL");
      return;
    }

    if (!validateUrl(inputUrl)) {
      setError("Please enter a valid URL");
      return;
    }

    // Simulate URL shortening
    const alias = customAlias || Math.random().toString(36).substring(2, 8);
    const fakeShortUrl = `https://short.ly/${alias}`;
    setShortenedUrl(fakeShortUrl);
    setHistory((prev) => [
      { original: inputUrl, shortened: fakeShortUrl, timestamp: new Date().toLocaleString() },
      ...prev.slice(0, 9), // Keep last 10 entries
    ]);
  }, [inputUrl, customAlias]);

  // Copy to clipboard
  const handleCopy = () => {
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Download QR code
  const downloadQRCode = () => {
    if (qrCodeRef.current) {
      const canvas = qrCodeRef.current.querySelector("canvas");
      const link = document.createElement("a");
      link.download = `qr-${shortenedUrl.split("/").pop()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  // Reset form
  const reset = () => {
    setInputUrl("");
    setCustomAlias("");
    setShortenedUrl("");
    setError("");
    setCopied(false);
    setShowQRCode(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          URL Shortener
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter URL to Shorten
              </label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://example.com/very/long/url"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Alias (Optional)
              </label>
              <input
                type="text"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value.replace(/\s/g, ""))}
                placeholder="my-custom-link"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                maxLength={20}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleShorten}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Shorten URL
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Result Section */}
          {shortenedUrl && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Shortened URL:</p>
                  <a
                    href={shortenedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {shortenedUrl}
                  </a>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className={`px-3 py-1 rounded-md text-white transition-colors ${
                      copied ? "bg-green-500" : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    <FaCopy className="inline mr-1" /> {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={() => setShowQRCode(!showQRCode)}
                    className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    <FaQrcode className="inline mr-1" /> {showQRCode ? "Hide QR" : "Show QR"}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {showQRCode && (
                <div className="mt-4 flex flex-col items-center" ref={qrCodeRef}>
                  <QRCodeCanvas // Changed to QRCodeCanvas
                    value={shortenedUrl}
                    size={128}
                  />
                  <button
                    onClick={downloadQRCode}
                    className="mt-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <FaDownload className="mr-1" /> Download QR
                  </button>
                </div>
              )}

              <p className="text-xs text-yellow-600 mt-2">
                Note: This is a demo. Actual shortening service coming soon!
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          {/* History */}
          {history.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Shortening History</h3>
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {history.map((entry, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    <span className="font-medium">{entry.timestamp}:</span>{" "}
                    <a
                      href={entry.shortened}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {entry.shortened}
                    </a>{" "}
                    (from {entry.original.slice(0, 30)}
                    {entry.original.length > 30 ? "..." : ""})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>URL validation</li>
            <li>Custom alias support</li>
            <li>Copy to clipboard</li>
            <li>QR code generation and download</li>
            <li>Shortening history (last 10 entries)</li>
          </ul>
        </div>

        {/* Coming Soon Notice */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: This is a preview version. Full URL shortening functionality coming soon!
        </p>
      </div>
    </div>
  );
};

export default URLShortener;