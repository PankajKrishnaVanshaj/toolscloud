"use client";
import React, { useState, useCallback } from "react";
import { FaPlay, FaSync, FaDownload, FaUpload } from "react-icons/fa";

const SpeedTestTool = () => {
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [ping, setPing] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState("");
  const [testSize, setTestSize] = useState("medium"); // small: 1MB, medium: 10MB, large: 50MB
  const [history, setHistory] = useState([]);

  // Test endpoints
  const testSizes = {
    small: 1000000, // 1MB
    medium: 10000000, // 10MB
    large: 50000000, // 50MB
  };
  const testFileUrl = "https://speed.cloudflare.com/__down";
  const uploadTestUrl = "https://speed.cloudflare.com/__up";
  const pingTestUrl = "https://speed.cloudflare.com/__ping";

  const calculateSpeed = (loadedBytes, timeTaken) => {
    const bytesPerSecond = loadedBytes / (timeTaken / 1000);
    const mbps = (bytesPerSecond * 8) / 1000000; // Convert to Mbps
    return mbps.toFixed(2);
  };

  const runPingTest = async () => {
    setError("");
    try {
      const startTime = performance.now();
      await fetch(`${pingTestUrl}?t=${Date.now()}`, { cache: "no-store" });
      const endTime = performance.now();
      const pingTime = (endTime - startTime).toFixed(0);
      setPing(pingTime);
      return pingTime;
    } catch (err) {
      setError("Ping test failed.");
      setPing(null);
    }
  };

  const runDownloadTest = async () => {
    setError("");
    try {
      const startTime = performance.now();
      const response = await fetch(`${testFileUrl}?bytes=${testSizes[testSize]}&t=${Date.now()}`, {
        cache: "no-store",
      });
      const blob = await response.blob();
      const endTime = performance.now();

      const timeTaken = endTime - startTime;
      const speed = calculateSpeed(blob.size, timeTaken);
      setDownloadSpeed(speed);
      return speed;
    } catch (err) {
      setError("Download test failed. Please try again.");
      setDownloadSpeed(null);
    }
  };

  const runUploadTest = async () => {
    setError("");
    try {
      const startTime = performance.now();
      const uploadData = new Blob([new Uint8Array(testSizes[testSize] / 10)]); // 1/10th size for upload
      const formData = new FormData();
      formData.append("file", uploadData);

      const response = await fetch(uploadTestUrl, {
        method: "POST",
        body: formData,
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Upload failed");

      const endTime = performance.now();
      const timeTaken = endTime - startTime;
      const speed = calculateSpeed(uploadData.size, timeTaken);
      setUploadSpeed(speed);
      return speed;
    } catch (err) {
      setError("Upload test failed. Please try again.");
      setUploadSpeed(null);
    }
  };

  const runSpeedTest = useCallback(async () => {
    setIsTesting(true);
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setPing(null);
    setError("");

    const pingResult = await runPingTest();
    const downloadResult = await runDownloadTest();
    const uploadResult = await runUploadTest();

    if (pingResult && downloadResult && uploadResult) {
      setHistory((prev) => [
        { ping: pingResult, download: downloadResult, upload: uploadResult, timestamp: new Date() },
        ...prev.slice(0, 4), // Keep last 5 tests
      ]);
    }

    setIsTesting(false);
  }, [testSize]);

  const reset = () => {
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setPing(null);
    setIsTesting(false);
    setError("");
    setHistory([]);
    setTestSize("medium");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Internet Speed Test Tool
        </h1>

        {/* Test Settings */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Size</label>
              <select
                value={testSize}
                onChange={(e) => setTestSize(e.target.value)}
                disabled={isTesting}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Small (1MB)</option>
                <option value="medium">Medium (10MB)</option>
                <option value="large">Large (50MB)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center justify-center">
              <FaDownload className="mr-2" /> Download
            </h2>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {downloadSpeed ? `${downloadSpeed} Mbps` : isTesting ? "Testing..." : "N/A"}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center justify-center">
              <FaUpload className="mr-2" /> Upload
            </h2>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {uploadSpeed ? `${uploadSpeed} Mbps` : isTesting ? "Testing..." : "N/A"}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center justify-center">
              Ping
            </h2>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {ping ? `${ping} ms` : isTesting ? "Testing..." : "N/A"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={runSpeedTest}
            disabled={isTesting}
            className={`flex-1 py-2 px-4 rounded-md text-white transition-colors flex items-center justify-center ${
              isTesting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <FaPlay className="mr-2" />
            {isTesting ? "Testing..." : "Run Speed Test"}
          </button>
          <button
            onClick={reset}
            disabled={isTesting}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 text-center mb-4">{error}</p>
        )}

        {/* Test History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Test History</h3>
            <ul className="space-y-2 text-sm text-gray-600 max-h-40 overflow-y-auto">
              {history.map((test, index) => (
                <li key={index}>
                  {new Date(test.timestamp).toLocaleTimeString()} - Ping: {test.ping} ms, Download:{" "}
                  {test.download} Mbps, Upload: {test.upload} Mbps
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Notes</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Measures ping, download, and upload speeds</li>
            <li>Customizable test sizes: Small (1MB), Medium (10MB), Large (50MB)</li>
            <li>Test history tracking (last 5 tests)</li>
            <li>
              Note: Results are approximate and may vary based on network conditions and server
              performance.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SpeedTestTool;