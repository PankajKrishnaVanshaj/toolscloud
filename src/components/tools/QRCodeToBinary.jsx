"use client";
import React, { useState, useCallback, useRef } from "react";
import jsQR from "jsqr";
import { useDropzone } from "react-dropzone";
import { FaDownload, FaCopy, FaSync, FaUpload } from "react-icons/fa";

const QRCodeToBinary = () => {
  const [image, setImage] = useState(null);
  const [qrContent, setQrContent] = useState("");
  const [binary, setBinary] = useState("");
  const [error, setError] = useState("");
  const [byteFormat, setByteFormat] = useState(8);
  const [previewUrl, setPreviewUrl] = useState("");
  const [separator, setSeparator] = useState(" ");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Decode QR Code using jsQR
  const decodeQRCode = useCallback((file) => {
    setError("");
    setQrContent("");
    setBinary("");
    setPreviewUrl("");
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        setPreviewUrl(reader.result);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        const imageData = context.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setQrContent(code.data);
          convertToBinary(code.data);
        } else {
          setError("Failed to decode QR code: No QR code found in the image");
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        setError("Failed to load image");
        setIsProcessing(false);
      };
    };
    reader.readAsDataURL(file);
  }, []);

  // Convert to Binary
  const convertToBinary = useCallback(
    (text) => {
      const binaryArray = [];
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        let binaryStr = charCode.toString(2);
        binaryStr = binaryStr.padStart(byteFormat, "0");
        binaryArray.push(binaryStr);
      }
      setBinary(binaryArray.join(separator));
    },
    [byteFormat, separator]
  );

  // Handle Dropzone
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        setImage(acceptedFiles[0]);
        decodeQRCode(acceptedFiles[0]);
      }
    },
    [decodeQRCode]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: false,
  });

  // Download Binary as Text
  const downloadBinary = () => {
    const blob = new Blob([binary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrcode_binary_${byteFormat}bit.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy to Clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(binary);
    alert("Binary copied to clipboard!");
  };

  // Reset Everything
  const reset = () => {
    setImage(null);
    setQrContent("");
    setBinary("");
    setError("");
    setPreviewUrl("");
    setByteFormat(8);
    setSeparator(" ");
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          QR Code to Binary Converter
        </h1>

        <div className="space-y-6">
          {/* Dropzone Section */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} ref={fileInputRef} />
            {isDragActive ? (
              <p className="text-blue-500 flex items-center justify-center gap-2">
                <FaUpload /> Drop the QR code image here...
              </p>
            ) : (
              <p className="text-gray-600 flex items-center justify-center gap-2">
                <FaUpload /> Drag and drop a QR code image here, or click to select a file
              </p>
            )}
          </div>

          {/* Preview Section */}
          {previewUrl && (
            <div className="flex justify-center relative">
              <img
                src={previewUrl}
                alt="QR Code Preview"
                className="max-w-full h-auto rounded-lg shadow-md max-h-64 object-contain"
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          )}

          {/* Configuration Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Byte Format
              </label>
              <select
                value={byteFormat}
                onChange={(e) => {
                  const newFormat = parseInt(e.target.value);
                  setByteFormat(newFormat);
                  if (qrContent) convertToBinary(qrContent);
                }}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              >
                <option value={8}>8-bit</option>
                <option value={16}>16-bit</option>
                <option value={32}>32-bit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Separator
              </label>
              <select
                value={separator}
                onChange={(e) => {
                  setSeparator(e.target.value);
                  if (qrContent) convertToBinary(qrContent);
                }}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              >
                <option value=" ">Space</option>
                <option value=",">Comma</option>
                <option value="-">Dash</option>
                <option value="">None</option>
              </select>
            </div>
          </div>

          {/* Results Section */}
          {(qrContent || binary) && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Results:</h2>
              <div className="space-y-4 text-sm">
                {qrContent && (
                  <div>
                    <p className="font-medium text-gray-600">QR Code Content:</p>
                    <p className="break-all bg-white p-2 rounded-md">{qrContent}</p>
                  </div>
                )}
                {binary && (
                  <div>
                    <p className="font-medium text-gray-600">Binary Representation:</p>
                    <p className="break-all font-mono bg-white p-2 rounded-md">{binary}</p>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                        disabled={isProcessing}
                      >
                        <FaCopy className="mr-2" /> Copy to Clipboard
                      </button>
                      <button
                        onClick={downloadBinary}
                        className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                        disabled={isProcessing}
                      >
                        <FaDownload className="mr-2" /> Download as Text
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button
              onClick={reset}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              disabled={isProcessing}
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Decode QR codes from images</li>
              <li>Convert to binary with 8-bit, 16-bit, or 32-bit options</li>
              <li>Customizable binary separators (space, comma, dash, none)</li>
              <li>Drag and drop support</li>
              <li>Preview uploaded QR code</li>
              <li>Copy to clipboard or download as text</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeToBinary;