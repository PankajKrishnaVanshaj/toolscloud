// components/FileTypeIdentifier.js
'use client';

import React, { useState } from 'react';

const FileTypeIdentifier = () => {
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState('');

  // Common file extensions and their descriptions
  const fileTypes = {
    '.txt': { description: 'Plain Text File', mime: 'text/plain' },
    '.pdf': { description: 'PDF Document', mime: 'application/pdf' },
    '.doc': { description: 'Microsoft Word Document', mime: 'application/msword' },
    '.docx': { description: 'Microsoft Word Document (Open XML)', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    '.xls': { description: 'Microsoft Excel Spreadsheet', mime: 'application/vnd.ms-excel' },
    '.xlsx': { description: 'Microsoft Excel Spreadsheet (Open XML)', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    '.ppt': { description: 'Microsoft PowerPoint Presentation', mime: 'application/vnd.ms-powerpoint' },
    '.pptx': { description: 'Microsoft PowerPoint Presentation (Open XML)', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
    '.jpg': { description: 'JPEG Image', mime: 'image/jpeg' },
    '.jpeg': { description: 'JPEG Image', mime: 'image/jpeg' },
    '.png': { description: 'PNG Image', mime: 'image/png' },
    '.gif': { description: 'GIF Image', mime: 'image/gif' },
    '.mp3': { description: 'MP3 Audio', mime: 'audio/mpeg' },
    '.mp4': { description: 'MP4 Video', mime: 'video/mp4' },
    '.zip': { description: 'ZIP Archive', mime: 'application/zip' },
    '.rar': { description: 'RAR Archive', mime: 'application/x-rar-compressed' },
    '.exe': { description: 'Windows Executable', mime: 'application/x-msdownload' },
    '.csv': { description: 'Comma-Separated Values', mime: 'text/csv' },
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      const typeInfo = fileTypes[extension] || { 
        description: 'Unknown File Type', 
        mime: file.type || 'Unknown MIME Type' 
      };

      setFileInfo({
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        extension: extension,
        description: typeInfo.description,
        mimeType: file.type || typeInfo.mime,
        lastModified: new Date(file.lastModified).toLocaleString(),
      });
      setError('');
    } else {
      setError('No file selected.');
      setFileInfo(null);
    }
  };

  const clearFile = () => {
    setFileInfo(null);
    setError('');
    document.getElementById('fileInput').value = '';
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">File Type Identifier</h1>

      <div className="space-y-6">
        {/* File Input */}
        <div className="flex flex-col items-center">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload a File to Identify
          </label>
          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* File Information */}
        {fileInfo && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-3 text-center text-blue-600">
              File Information
            </h2>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <p><span className="font-medium">Name:</span> {fileInfo.name}</p>
              <p><span className="font-medium">Size:</span> {fileInfo.size}</p>
              <p><span className="font-medium">Extension:</span> {fileInfo.extension}</p>
              <p><span className="font-medium">Type:</span> {fileInfo.description}</p>
              <p><span className="font-medium">MIME Type:</span> {fileInfo.mimeType}</p>
              <p><span className="font-medium">Last Modified:</span> {fileInfo.lastModified}</p>
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={clearFile}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Error or Placeholder */}
        {!fileInfo && !error && (
          <p className="text-center text-gray-500">
            Upload a file to see its type and details!
          </p>
        )}
        {error && (
          <p className="text-center text-red-600">{error}</p>
        )}

        {/* Note */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: This tool identifies file types based on extensions and browser-reported MIME types.
          It does not analyze file contents due to browser limitations.
        </p>
      </div>
    </div>
  );
};

export default FileTypeIdentifier;