"use client";
import React, { useState, useCallback, useRef } from "react";
import QRCode from "qrcode";
import { AES, enc } from "crypto-js";
import { FaDownload, FaCopy, FaSync, FaQrcode } from "react-icons/fa";

const SecureQRCodeGenerator = () => {
  const [inputData, setInputData] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [encrypt, setEncrypt] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(300);
  const [color, setColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [errorCorrection, setErrorCorrection] = useState("H");
  const qrRef = useRef(null);

  // Generate QR code
  const generateQRCode = useCallback(async () => {
    setLoading(true);
    setError("");
    setQrCodeUrl("");

    if (!inputData) {
      setError("Please enter data to encode");
      setLoading(false);
      return;
    }
    if (encrypt && !secretKey) {
      setError("Please enter a secret key for encryption");
      setLoading(false);
      return;
    }

    try {
      let dataToEncode = inputData;
      if (encrypt) {
        dataToEncode = AES.encrypt(inputData, secretKey).toString();
      }

      const qrCodeDataUrl = await QRCode.toDataURL(dataToEncode, {
        width: size,
        margin: 1,
        color: { dark: color, light: bgColor },
        errorCorrectionLevel: errorCorrection,
      });
      setQrCodeUrl(qrCodeDataUrl);
    } catch (err) {
      setError("QR code generation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [inputData, secretKey, encrypt, size, color, bgColor, errorCorrection]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateQRCode();
  };

  // Download QR code
  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a");
      link.href = qrCodeUrl;
      link.download = `qrcode-${Date.now()}.png`;
      link.click();
    }
  };

  // Copy encrypted data to clipboard
  const copyEncryptedData = () => {
    if (encrypt && inputData && secretKey) {
      const encrypted = AES.encrypt(inputData, secretKey).toString();
      navigator.clipboard.writeText(encrypted).then(() =>
        alert("Encrypted data copied to clipboard!")
      );
    }
  };

  // Copy QR code URL to clipboard
  const copyQRCodeUrl = () => {
    if (qrCodeUrl) {
      navigator.clipboard.writeText(qrCodeUrl).then(() =>
        alert("QR Code URL copied to clipboard!")
      );
    }
  };

  // Reset all fields
  const resetAll = () => {
    setInputData("");
    setSecretKey("");
    setEncrypt(false);
    setQrCodeUrl("");
    setError("");
    setSize(300);
    setColor("#000000");
    setBgColor("#ffffff");
    setErrorCorrection("H");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Secure QR Code Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data to Encode
            </label>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              placeholder="Enter text, URL, or data to encode (max ~4KB)"
            />
          </div>

          {/* Encryption Option */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={encrypt}
                onChange={(e) => setEncrypt(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              Encrypt Data with AES
            </label>
            {encrypt && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secret Key
                </label>
                <input
                  type="text"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a secure secret key"
                />
              </div>
            )}
          </div>

          {/* Customization Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size (px)
              </label>
              <input
                type="number"
                min="100"
                max="1000"
                value={size}
                onChange={(e) => setSize(Math.max(100, Math.min(1000, e.target.value)))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QR Color
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 rounded-md cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Color
              </label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-10 rounded-md cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Error Correction
              </label>
              <select
                value={errorCorrection}
                onChange={(e) => setErrorCorrection(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaQrcode className="mr-2" />
              {loading ? "Generating..." : "Generate QR Code"}
            </button>
            <button
              type="button"
              onClick={resetAll}
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

        {/* QR Code Output */}
        {qrCodeUrl && (
          <div className="mt-6" ref={qrRef}>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Generated QR Code</h2>
            <div className="bg-gray-50 p-4 rounded-lg border text-center">
              <img
                src={qrCodeUrl}
                alt="Generated QR Code"
                className="mx-auto max-w-full h-auto"
              />
              <div className="mt-4 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={downloadQRCode}
                  className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
                <button
                  onClick={copyQRCodeUrl}
                  className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FaCopy className="mr-2" /> Copy QR URL
                </button>
                {encrypt && (
                  <button
                    onClick={copyEncryptedData}
                    className="py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <FaCopy className="mr-2" /> Copy Encrypted Data
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              {encrypt
                ? "Scan and decrypt with the secret key to access the data."
                : "Scan with any QR reader to access the data."}
            </p>
          </div>
        )}

        {/* Features and Notes */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Optional AES encryption for secure data</li>
            <li>Customizable size, colors, and error correction</li>
            <li>Download QR code as PNG</li>
            <li>Copy QR URL or encrypted data to clipboard</li>
          </ul>
        </div>
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700 text-sm">
            <strong>Note:</strong> Encryption is local using AES. Keep your secret key secure. QR
            codes have a ~4KB data limit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecureQRCodeGenerator;