// components/FileSizeAnalyzer.js
'use client';

import React, { useState } from 'react';

const FileSizeAnalyzer = () => {
  const [filesData, setFilesData] = useState([]);
  const [error, setError] = useState('');

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length > 10) {
      setError('Please upload a maximum of 10 files at a time.');
      return;
    }

    const newFilesData = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type || 'Unknown',
      formattedSize: formatSize(file.size)
    }));

    setFilesData(newFilesData);
    setError('');
  };

  const clearFiles = () => {
    setFilesData([]);
    setError('');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">File Size Analyzer</h1>

      <div className="space-y-6">
        {/* File Input */}
        <div className="flex flex-col items-center">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Files (Max 10)
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700
              cursor-pointer"
          />
        </div>

        {/* Results */}
        {filesData.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Analysis Results</h2>
              <button
                onClick={clearFiles}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Clear All
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs uppercase bg-gray-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-2">File Name</th>
                    <th className="px-4 py-2">Size</th>
                    <th className="px-4 py-2">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filesData.map((file, index) => (
                    <tr key={index} className="border-b hover:bg-gray-100">
                      <td className="px-4 py-2 truncate max-w-[200px]" title={file.name}>
                        {file.name}
                      </td>
                      <td className="px-4 py-2">{file.formattedSize}</td>
                      <td className="px-4 py-2">{file.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-sm">
              <p>
                <span className="font-medium">Total Files:</span> {filesData.length}
              </p>
              <p>
                <span className="font-medium">Total Size:</span>{' '}
                {formatSize(filesData.reduce((sum, file) => sum + file.size, 0))}
              </p>
            </div>
          </div>
        )}

        {/* Empty State or Error */}
        {filesData.length === 0 && !error && (
          <p className="text-center text-gray-500">
            Upload files to analyze their sizes
          </p>
        )}
        {error && (
          <p className="text-center text-red-600">{error}</p>
        )}

        {/* Note */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: Files are analyzed locally in your browser. No data is uploaded to any server.
        </p>
      </div>
    </div>
  );
};

export default FileSizeAnalyzer;