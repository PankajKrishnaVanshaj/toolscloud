// components/SpeedTestTool.js
'use client';

import React, { useState } from 'react';

const SpeedTestTool = () => {
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState('');

  // Test file URL (using a public image for download test)
  const testFileUrl = 'https://speed.cloudflare.com/__down?bytes=10000000'; // 10MB test file
  const uploadTestUrl = 'https://speed.cloudflare.com/__up'; // Cloudflare speed test endpoint

  const calculateSpeed = (loadedBytes, timeTaken) => {
    const bytesPerSecond = loadedBytes / (timeTaken / 1000);
    const mbps = (bytesPerSecond * 8) / 1000000; // Convert to Mbps
    return mbps.toFixed(2);
  };

  const runDownloadTest = async () => {
    setError('');
    try {
      const startTime = performance.now();
      const response = await fetch(`${testFileUrl}?t=${Date.now()}`, { cache: 'no-store' });
      const blob = await response.blob();
      const endTime = performance.now();
      
      const timeTaken = endTime - startTime;
      const speed = calculateSpeed(blob.size, timeTaken);
      setDownloadSpeed(speed);
    } catch (err) {
      setError('Download test failed. Please try again.');
      setDownloadSpeed(null);
    }
  };

  const runUploadTest = async () => {
    setError('');
    try {
      const startTime = performance.now();
      const uploadData = new Blob([new Uint8Array(1000000)]); // 1MB test data
      const formData = new FormData();
      formData.append('file', uploadData);

      const response = await fetch(uploadTestUrl, {
        method: 'POST',
        body: formData,
        cache: 'no-store',
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const endTime = performance.now();
      const timeTaken = endTime - startTime;
      const speed = calculateSpeed(uploadData.size, timeTaken);
      setUploadSpeed(speed);
    } catch (err) {
      setError('Upload test failed. Please try again.');
      setUploadSpeed(null);
    }
  };

  const runSpeedTest = async () => {
    setIsTesting(true);
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setError('');

    await runDownloadTest();
    await runUploadTest();
    
    setIsTesting(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Internet Speed Test Tool</h1>

      <div className="space-y-6">
        {/* Results Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700">Download Speed</h2>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {downloadSpeed ? `${downloadSpeed} Mbps` : isTesting ? 'Testing...' : 'N/A'}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700">Upload Speed</h2>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {uploadSpeed ? `${uploadSpeed} Mbps` : isTesting ? 'Testing...' : 'N/A'}
            </p>
          </div>
        </div>

        {/* Test Button */}
        <div className="flex justify-center">
          <button
            onClick={runSpeedTest}
            disabled={isTesting}
            className={`px-6 py-2 rounded-md text-white transition-colors duration-200 ${
              isTesting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isTesting ? 'Testing...' : 'Run Speed Test'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Notes */}
        <p className="text-xs text-gray-500 text-center">
          Note: Speeds are approximate and depend on your network conditions. 
          This test uses a 10MB download and 1MB upload sample. Results may vary 
          from professional speed test services.
        </p>
      </div>
    </div>
  );
};

export default SpeedTestTool;