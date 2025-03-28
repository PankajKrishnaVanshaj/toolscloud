"use client";
import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { FaCamera, FaStop, FaCopy, FaSync, FaUpload } from "react-icons/fa";

const QRCodeScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraId, setCameraId] = useState(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const qrRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize QR scanner and get available cameras
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((cameras) => {
        setAvailableCameras(cameras);
        if (cameras.length > 0) {
          setCameraId(cameras[0].id);
        }
      })
      .catch((err) => {
        setError("Error accessing cameras: " + err.message);
      });

    return () => {
      if (qrRef.current && isScanning) {
        qrRef.current.stop().catch(() => {});
        qrRef.current = null; // Avoid calling clear() here, just reset the ref
      }
    };
  }, [isScanning]);

  // Start camera-based scanning
  const startScanning = () => {
    if (!cameraId) {
      setError("No camera selected or available");
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    setError(null);
    setSelectedFile(null);

    qrRef.current = new Html5Qrcode("qr-scanner-region");

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    qrRef.current
      .start(
        cameraId,
        config,
        (decodedText) => {
          setScanResult(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          console.log("Scan error:", errorMessage);
        }
      )
      .catch((err) => {
        setError("Error starting scanner: " + err.message);
        setIsScanning(false);
      });
  };

  // Stop camera-based scanning
  const stopScanning = () => {
    if (qrRef.current && isScanning) {
      qrRef.current
        .stop()
        .then(() => {
          setIsScanning(false);
          qrRef.current = null; // Reset ref without calling clear()
        })
        .catch((err) => {
          setError("Error stopping scanner: " + err.message);
          setIsScanning(false);
        });
    } else {
      setIsScanning(false);
    }
  };

  // Handle file upload and scan
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    stopScanning(); // Stop any ongoing camera scan
    setScanResult(null);
    setError(null);

    // Use a separate hidden div for file scanning
    const qrCodeScanner = new Html5Qrcode("qr-file-scan-region");
    try {
      const decodedText = await qrCodeScanner.scanFile(file, false); // false to avoid rendering
      setScanResult(decodedText);
      setSelectedFile(file); // Set file after successful scan
    } catch (err) {
      setError("No QR code found in the image or error decoding: " + err.message);
      setSelectedFile(file); // Show file even if scan fails
    } finally {
      // Avoid calling clear() unless necessary
      const scanRegion = document.getElementById("qr-file-scan-region");
      if (scanRegion && scanRegion.children.length > 0) {
        try {
          qrCodeScanner.clear();
        } catch (clearErr) {
          console.warn("Error during cleanup:", clearErr);
        }
      }
    }
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (scanResult) {
      navigator.clipboard.writeText(scanResult);
      alert("QR Code content copied to clipboard!");
    }
  };

  // Reset the scanner
  const reset = () => {
    stopScanning();
    setScanResult(null);
    setError(null);
    setSelectedFile(null);
    setCameraId(availableCameras[0]?.id || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <FaCamera className="mr-2" /> QR Code Scanner
        </h1>

        {/* Scanner Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Camera
              </label>
              <select
                value={cameraId || ""}
                onChange={(e) => setCameraId(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isScanning}
              >
                {availableCameras.length === 0 ? (
                  <option value="">No cameras found</option>
                ) : (
                  availableCameras.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label || `Camera ${camera.id}`}
                    </option>
                  ))
                )}
              </select>
            </div>
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
              disabled={isScanning || !cameraId || selectedFile}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400过渡-colors flex items-center justify-center"
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
            id="qr-scanner-region"
            className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center"
          >
            {selectedFile ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Uploaded QR Code"
                className="max-w-full max-h-full object-contain"
              />
            ) : !isScanning ? (
              <p className="text-gray-500 italic">
                Press "Start Camera Scan" or upload an image
              </p>
            ) : null}
          </div>

          {/* Hidden div for file scanning */}
          <div id="qr-file-scan-region" style={{ display: "none" }}></div>

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
            <li>Scan QR codes via camera or uploaded image</li>
            <li>Support for multiple cameras</li>
            <li>Copy scan result to clipboard</li>
            <li>Real-time camera scanning with stop control</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;