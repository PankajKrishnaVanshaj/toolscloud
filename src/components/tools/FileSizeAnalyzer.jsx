"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaDownload, FaSync, FaUpload, FaSort } from "react-icons/fa";
import { CSVLink } from "react-csv"; // For CSV export

const FileSizeAnalyzer = () => {
  const [filesData, setFilesData] = useState([]);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [maxFiles, setMaxFiles] = useState(10);
  const fileInputRef = useRef(null);

  // Format file size
  const formatSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const files = Array.from(event.target.files);

    if (files.length > maxFiles) {
      setError(`Please upload a maximum of ${maxFiles} files at a time.`);
      return;
    }

    const newFilesData = files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || "Unknown",
      formattedSize: formatSize(file.size),
      lastModified: new Date(file.lastModified).toLocaleString(),
    }));

    setFilesData(newFilesData);
    setError("");
  }, [maxFiles]);

  // Clear all files
  const clearFiles = () => {
    setFilesData([]);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Sort files
  const sortFiles = (field) => {
    const newSortOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);

    setFilesData((prev) =>
      [...prev].sort((a, b) => {
        if (field === "size") {
          return newSortOrder === "asc" ? a.size - b.size : b.size - a.size;
        }
        return newSortOrder === "asc"
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field]);
      })
    );
  };

  // CSV export data
  const csvData = filesData.map((file) => ({
    Name: file.name,
    Size: file.formattedSize,
    Type: file.type,
    "Last Modified": file.lastModified,
  }));

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          File Size Analyzer
        </h1>

        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files (Max {maxFiles})
              </label>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Files Limit
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={maxFiles}
                onChange={(e) => setMaxFiles(Math.max(1, Math.min(50, e.target.value)))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Results */}
          {filesData.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-lg font-semibold">Analysis Results</h2>
                <div className="flex gap-2">
                  <button
                    onClick={clearFiles}
                    className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <FaSync className="mr-2" /> Clear All
                  </button>
                  <CSVLink
                    data={csvData}
                    filename={`file-size-analysis-${Date.now()}.csv`}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <FaDownload className="mr-2" /> Export CSV
                  </CSVLink>
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="text-xs uppercase bg-gray-200 sticky top-0">
                    <tr>
                      {[
                        { label: "File Name", field: "name" },
                        { label: "Size", field: "size" },
                        { label: "Type", field: "type" },
                        { label: "Last Modified", field: "lastModified" },
                      ].map(({ label, field }) => (
                        <th
                          key={field}
                          onClick={() => sortFiles(field)}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-300 flex items-center"
                        >
                          {label}
                          {sortField === field && (
                            <FaSort
                              className={`ml-1 ${sortOrder === "desc" ? "rotate-180" : ""}`}
                            />
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filesData.map((file, index) => (
                      <tr key={index} className="border-b hover:bg-gray-100">
                        <td
                          className="px-4 py-2 truncate max-w-[200px]"
                          title={file.name}
                        >
                          {file.name}
                        </td>
                        <td className="px-4 py-2">{file.formattedSize}</td>
                        <td className="px-4 py-2">{file.type}</td>
                        <td className="px-4 py-2">{file.lastModified}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-sm">
                <p>
                  <span className="font-medium">Total Files:</span> {filesData.length}
                </p>
                <p>
                  <span className="font-medium">Total Size:</span>{" "}
                  {formatSize(filesData.reduce((sum, file) => sum + file.size, 0))}
                </p>
                <p>
                  <span className="font-medium">Average Size:</span>{" "}
                  {formatSize(
                    filesData.reduce((sum, file) => sum + file.size, 0) /
                      filesData.length || 0
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Empty State or Error */}
          {filesData.length === 0 && !error && (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
              <p className="text-gray-500 italic">Upload files to analyze their sizes</p>
            </div>
          )}
          {error && <p className="text-center text-red-600">{error}</p>}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Analyze multiple files at once</li>
              <li>Sortable columns (name, size, type, last modified)</li>
              <li>Customizable max file limit (1-50)</li>
              <li>Export results to CSV</li>
              <li>Total and average size calculation</li>
            </ul>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 mt-4 text-center">
            Note: Files are analyzed locally in your browser. No data is uploaded to any server.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileSizeAnalyzer;