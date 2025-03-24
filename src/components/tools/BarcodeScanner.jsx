"use client";
import React, { useState, useRef, useEffect } from "react";
import Quagga from "quagga"; // Barcode scanning library with image support
import { FaCamera, FaStop, FaCopy, FaSync, FaUpload } from "react-icons/fa";

const BarcodeScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start camera-based scanning
  const startScanning = () => {
    setIsScanning(true);
    setScanResult(null);
    setError(null);
    setSelectedFile(null);

    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current,
          constraints: { facingMode: "environment" }, // Use rear camera
        },
        decoder: {
          readers: ["code_128_reader", "ean_reader", "upc_reader"], // Add more as needed
        },
      },
      (err) => {
        if (err) {
          setError("Error initializing scanner: " + err.message);
          setIsScanning(false);
          return;
        }
        Quagga.start();
      }
    );

    Quagga.onDetected((data) => {
      if (data && data.codeResult) {
        setScanResult(data.codeResult.code);
        stopScanning();
      }
    });
  };

  // Stop camera-based scanning
  const stopScanning = () => {
    if (isScanning) {
      Quagga.stop();
      setIsScanning(false);
    }
  };

  // Handle file upload and scan
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      stopScanning();
      setSelectedFile(file);
      setScanResult(null);
      setError(null);

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        Quagga.decodeSingle(
          {
            src: img.src,
            numOfWorkers: 0, // Disable web workers for simplicity
            decoder: {
              readers: ["code_128_reader", "ean_reader", "upc_reader"],
            },
          },
          (result) => {
            if (result && result.codeResult) {
              setScanResult(result.codeResult.code);
            } else {
              setError("No barcode found in the image");
            }
          }
        );
      };
    }
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (scanResult) {
      navigator.clipboard.writeText(scanResult);
      alert("Barcode content copied to clipboard!");
    }
  };

  // Reset the scanner
  const reset = () => {
    stopScanning();
    setScanResult(null);
    setError(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopScanning();
  }, []);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <FaCamera className="mr-2" /> Barcode Scanner
        </h1>

        {/* Scanner Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isScanning}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={startScanning}
              disabled={isScanning || selectedFile}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCamera className="mr-2" /> Start Camera Scan
            </button>
            <button
              onClick={stopScanning}
              disabled={!isScanning}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaStop className="mr-2" /> Stop Scan
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!scanResult}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCopy className="mr-2" /> Copy Result
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Scanner Region / File Preview */}
          <div
            ref={videoRef}
            className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center"
          >
            {selectedFile ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Uploaded Barcode"
                className="max-w-full max-h-full object-contain"
              />
            ) : !isScanning ? (
              <p className="text-gray-500 italic">
                Press "Start Camera Scan" or upload an image
              </p>
            ) : null}
          </div>

          {/* Result and Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          {scanResult && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h2 className="text-lg font-semibold text-green-700 mb-2">Scan Result:</h2>
              <p className="text-sm text-green-600 break-all">{scanResult}</p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Scan barcodes via camera or uploaded image</li>
            <li>Support for multiple barcode formats (Code 128, EAN, UPC)</li>
            <li>Copy scan result to clipboard</li>
            <li>Real-time camera scanning with stop control</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default BarcodeScanner;