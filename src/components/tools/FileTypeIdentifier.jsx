"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaSync, FaUpload, FaFileDownload } from "react-icons/fa";

const FileTypeIdentifier = () => {
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState("");
  const [analyzeContent, setAnalyzeContent] = useState(false);
  const fileInputRef = useRef(null);

  // Extended file types database
  const fileTypes = {
    ".txt": { description: "Plain Text File", mime: "text/plain" },
    ".pdf": { description: "PDF Document", mime: "application/pdf" },
    ".doc": { description: "Microsoft Word Document", mime: "application/msword" },
    ".docx": {
      description: "Microsoft Word Document (Open XML)",
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    ".xls": { description: "Microsoft Excel Spreadsheet", mime: "application/vnd.ms-excel" },
    ".xlsx": {
      description: "Microsoft Excel Spreadsheet (Open XML)",
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
    ".ppt": {
      description: "Microsoft PowerPoint Presentation",
      mime: "application/vnd.ms-powerpoint",
    },
    ".pptx": {
      description: "Microsoft PowerPoint Presentation (Open XML)",
      mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    },
    ".jpg": { description: "JPEG Image", mime: "image/jpeg" },
    ".jpeg": { description: "JPEG Image", mime: "image/jpeg" },
    ".png": { description: "PNG Image", mime: "image/png" },
    ".gif": { description: "GIF Image", mime: "image/gif" },
    ".mp3": { description: "MP3 Audio", mime: "audio/mpeg" },
    ".mp4": { description: "MP4 Video", mime: "video/mp4" },
    ".zip": { description: "ZIP Archive", mime: "application/zip" },
    ".rar": { description: "RAR Archive", mime: "application/x-rar-compressed" },
    ".exe": { description: "Windows Executable", mime: "application/x-msdownload" },
    ".csv": { description: "Comma-Separated Values", mime: "text/csv" },
    ".json": { description: "JSON Data", mime: "application/json" },
    ".html": { description: "HTML Document", mime: "text/html" },
    ".xml": { description: "XML Document", mime: "application/xml" },
    ".mov": { description: "QuickTime Video", mime: "video/quicktime" },
    ".wav": { description: "WAV Audio", mime: "audio/wav" },
  };

  // Handle file change and basic content analysis
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError("No file selected.");
      setFileInfo(null);
      return;
    }

    const extension = "." + file.name.split(".").pop().toLowerCase();
    const typeInfo = fileTypes[extension] || {
      description: "Unknown File Type",
      mime: file.type || "Unknown MIME Type",
    };

    let extraInfo = {};
    if (analyzeContent) {
      try {
        const reader = new FileReader();
        const contentPromise = new Promise((resolve) => {
          reader.onload = (event) => resolve(event.target.result);
          reader.readAsArrayBuffer(file);
        });
        const buffer = await contentPromise;
        const uint8 = new Uint8Array(buffer.slice(0, 4)); // Check first 4 bytes
        extraInfo.magicNumber = Array.from(uint8)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(" ");
      } catch (err) {
        extraInfo.error = "Could not analyze file content.";
      }
    }

    setFileInfo({
      name: file.name,
      size: formatSize(file.size),
      extension: extension,
      description: typeInfo.description,
      mimeType: file.type || typeInfo.mime,
      lastModified: new Date(file.lastModified).toLocaleString(),
      ...extraInfo,
    });
    setError("");
  }, [analyzeContent]);

  // Format file size
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  // Clear file and reset state
  const clearFile = () => {
    setFileInfo(null);
    setError("");
    setAnalyzeContent(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Download file info as JSON
  const downloadInfo = () => {
    if (!fileInfo) return;
    const json = JSON.stringify(fileInfo, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileInfo.name}-info.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          File Type Identifier
        </h1>

        <div className="space-y-6">
          {/* File Input and Options */}
          <div className="flex flex-col items-center gap-4">
            <input
              id="fileInput"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={analyzeContent}
                onChange={(e) => setAnalyzeContent(e.target.checked)}
                className="accent-blue-500"
              />
              <span className="text-sm text-gray-700">Analyze File Content (Magic Number)</span>
            </label>
          </div>

          {/* File Information */}
          {fileInfo && (
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-3 text-center text-blue-600">
                File Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <p>
                  <span className="font-medium">Name:</span> {fileInfo.name}
                </p>
                <p>
                  <span className="font-medium">Size:</span> {fileInfo.size}
                </p>
                <p>
                  <span className="font-medium">Extension:</span> {fileInfo.extension}
                </p>
                <p>
                  <span className="font-medium">Type:</span> {fileInfo.description}
                </p>
                <p>
                  <span className="font-medium">MIME Type:</span> {fileInfo.mimeType}
                </p>
                <p>
                  <span className="font-medium">Last Modified:</span> {fileInfo.lastModified}
                </p>
                {fileInfo.magicNumber && (
                  <p>
                    <span className="font-medium">Magic Number:</span> {fileInfo.magicNumber}
                  </p>
                )}
                {fileInfo.error && (
                  <p className="text-red-600">
                    <span className="font-medium">Error:</span> {fileInfo.error}
                  </p>
                )}
              </div>
              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={downloadInfo}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FaFileDownload className="mr-2" /> Download Info
                </button>
                <button
                  onClick={clearFile}
                  className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <FaSync className="mr-2" /> Clear
                </button>
              </div>
            </div>
          )}

          {/* Error or Placeholder */}
          {!fileInfo && !error && (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
              <p className="text-gray-500 italic">
                Upload a file to identify its type and details
              </p>
            </div>
          )}
          {error && <p className="text-center text-red-600">{error}</p>}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Identify file types by extension and MIME type</li>
              <li>Optional content analysis with magic numbers</li>
              <li>Download file info as JSON</li>
              <li>Supports a wide range of common file formats</li>
            </ul>
          </div>

          {/* Note */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-700 text-sm">
              <strong>Note:</strong> Content analysis is limited to magic numbers in the browser.
              For full file validation, use a server-side solution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileTypeIdentifier;