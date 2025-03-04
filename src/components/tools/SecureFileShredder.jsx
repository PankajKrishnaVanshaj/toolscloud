'use client';

import React, { useState } from 'react';

const SecureFileShredder = () => {
  const [file, setFile] = useState(null);
  const [passes, setPasses] = useState(3); // Number of overwrite passes
  const [shredStatus, setShredStatus] = useState('idle'); // idle, shredding, complete, error
  const [error, setError] = useState('');

  // Simulate secure file shredding
  const shredFile = async () => {
    if (!file) {
      setError('Please select a file to shred');
      return;
    }

    if (passes < 1 || passes > 10) {
      setError('Number of passes must be between 1 and 10');
      return;
    }

    setShredStatus('shredding');
    setError('');

    try {
      // Read file content
      const reader = new FileReader();
      const fileContent = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file); // Use ArrayBuffer for binary data
      });

      // Simulate shredding with multiple passes
      const fileSize = file.size;
      let shreddedData = new Uint8Array(fileContent);

      for (let pass = 1; pass <= passes; pass++) {
        // Simulate overwrite with random data
        const randomData = new Uint8Array(fileSize);
        window.crypto.getRandomValues(randomData);
        shreddedData = randomData;

        // Simulate progress (delay for effect)
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // "Clear" the data (in memory only)
      shreddedData.fill(0);

      setShredStatus('complete');
    } catch (err) {
      setError('Shredding simulation failed: ' + err.message);
      setShredStatus('error');
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setShredStatus('idle');
      setError('');
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    shredFile();
  };

  // Clear all
  const clearAll = () => {
    setFile(null);
    setPasses(3);
    setShredStatus('idle');
    setError('');
    document.getElementById('fileInput').value = '';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Secure File Shredder Simulator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select File
            </label>
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            />
            {file && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Passes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Passes (1-10)
            </label>
            <input
              type="number"
              value={passes}
              onChange={(e) => setPasses(parseInt(e.target.value))}
              min={1}
              max={10}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            />
            <p className="text-xs text-gray-500 mt-1">
              More passes increase shredding thoroughness (simulated).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={shredStatus === 'shredding'}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {shredStatus === 'shredding' ? 'Shredding...' : 'Shred File'}
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

        {/* Shredding Status */}
        {shredStatus !== 'idle' && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Shredding Status</h2>
            <div className="bg-gray-50 p-4 rounded border">
              <p className="text-sm">
                <strong>File:</strong> {file ? file.name : 'None'}
              </p>
              <p className="text-sm">
                <strong>Status:</strong>{' '}
                {shredStatus === 'shredding' && 'Shredding in progress...'}
                {shredStatus === 'complete' && 'Shredding completed'}
                {shredStatus === 'error' && 'Shredding failed'}
              </p>
              {shredStatus === 'complete' && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ File data has been securely overwritten {passes} times (simulated).
                </p>
              )}
            </div>
          </div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> This is a simulation. It overwrites file data in memory with random values but does not affect the original file on disk. Use OS-specific tools (e.g., shred, srm) for actual file deletion.
        </p>
      </div>
    </div>
  );
};

export default SecureFileShredder;