"use client";
import React, { useState, useCallback, useRef } from "react";
import { BrowserQRCodeReader } from "@zxing/library";
import { FaCopy, FaDownload, FaSync, FaQrcode, FaTrash } from "react-icons/fa";

const QRCodeToText = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [generatedQR, setGeneratedQR] = useState(null);
  const [qrSize, setQrSize] = useState(150);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Decode QR Code
  const decodeQRCode = useCallback(async (imageFile) => {
    setError("");
    setText("");
    setGeneratedQR(null);
    setIsProcessing(true);

    try {
      const reader = new BrowserQRCodeReader();
      const imgUrl = URL.createObjectURL(imageFile);
      const result = await reader.decodeFromImageUrl(imgUrl);

      if (result) {
        const decodedText = result.getText();
        setText(decodedText);
        setHistory((prev) => [
          { text: decodedText, timestamp: new Date().toISOString(), fileName: imageFile.name },
          ...prev,
        ].slice(0, 10));
      } else {
        setError("No QR code found in the image");
      }
      URL.revokeObjectURL(imgUrl);
    } catch (err) {
      setError(`Failed to decode QR code: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Handle file input
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      decodeQRCode(selectedFile);
    } else {
      setError("Please upload a valid image file");
    }
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
      decodeQRCode(droppedFile);
    } else {
      setError("Please drop a valid image file");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  // Generate QR Code
  const generateQRCode = () => {
    if (!text) {
      setError("Please enter text or decode a QR code first");
      return;
    }
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(
      text
    )}`;
    setGeneratedQR(qrUrl);
  };

  // Copy to clipboard
  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
    alert("Copied to clipboard!");
  };

  // Reset everything
  const reset = () => {
    setFile(null);
    setText("");
    setError("");
    setGeneratedQR(null);
    setQrSize(150);
    setHistory([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Clear history
  const clearHistory = () => setHistory([]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          QR Code to Text Converter
        </h1>

        {/* File Upload Section */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-6 text-center mb-6 ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
            disabled={isProcessing}
          />
          <label htmlFor="fileInput" className="cursor-pointer">
            <p className="text-sm text-gray-600">
              {file ? `Selected: ${file.name}` : "Drag and drop an image or click to upload"}
            </p>
            <button
              type="button"
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              onClick={() => document.getElementById("fileInput").click()}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <div className="animate-spin h-5 w-5 mr-2 border-t-2 border-white rounded-full"></div>
                  Processing...
                </span>
              ) : (
                "Upload Image"
              )}
            </button>
          </label>
        </div>

        {/* Result Section */}
        {text && (
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Decoded Text</h2>
            <div className="flex items-center gap-2">
              <p className="flex-1 break-all text-sm text-gray-600">{text}</p>
              <button
                onClick={() => copyToClipboard(text)}
                className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                title="Copy to Clipboard"
              >
                <FaCopy />
              </button>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  QR Size ({qrSize}px)
                </label>
                <input
                  type="range"
                  min="100"
                  max="500"
                  step="50"
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <button
                onClick={generateQRCode}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaQrcode className="mr-2" /> Generate QR Code
              </button>
            </div>
          </div>
        )}

        {/* Generated QR Code */}
        {generatedQR && (
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated QR Code</h2>
            <img src={generatedQR} alt="Generated QR Code" className="mx-auto max-w-full h-auto" />
            <a
              href={generatedQR}
              download={`qrcode-${qrSize}x${qrSize}.png`}
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaDownload className="inline mr-2" /> Download QR Code
            </a>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="p-4 bg-red-50 rounded-lg mb-6 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-700">History (Last 10)</h2>
              <button
                onClick={clearHistory}
                className="p-2 bg-red-200 rounded-md hover:bg-red-300 transition-colors"
                title="Clear History"
              >
                <FaTrash />
              </button>
            </div>
            <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
              {history.map((item, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded flex justify-between items-center">
                  <div>
                    <p className="text-gray-600">
                      {new Date(item.timestamp).toLocaleString()}:{" "}
                      {item.text.slice(0, 50)}
                      {item.text.length > 50 ? "..." : ""}
                    </p>
                    <p className="text-xs text-gray-500">From: {item.fileName}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.text)}
                    className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                    title="Copy"
                  >
                    <FaCopy />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Decode QR codes from images</li>
            <li>Drag-and-drop support</li>
            <li>Generate QR codes with customizable size (100-500px)</li>
            <li>Copy decoded text to clipboard</li>
            <li>Download generated QR codes</li>
            <li>History tracking with file names and timestamps</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRCodeToText;