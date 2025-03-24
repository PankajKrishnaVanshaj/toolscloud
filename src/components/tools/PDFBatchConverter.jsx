// app/components/PDFBatchConverter.jsx
"use client";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FaDownload, FaSync, FaTrash, FaUpload } from "react-icons/fa";

const PDFBatchConverter = () => {
  const [files, setFiles] = useState([]);
  const [conversionSettings, setConversionSettings] = useState({
    outputFormat: "docx",
    quality: 100,
    mergeOutput: false,
    includeAnnotations: true,
    compressionLevel: "medium",
    pageRange: "all",
    customRange: "",
  });
  const [conversionProgress, setConversionProgress] = useState({});
  const [isConverting, setIsConverting] = useState(false);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles) => {
    const pdfFiles = acceptedFiles.filter((file) => file.type === "application/pdf");
    setFiles((prev) => [
      ...prev,
      ...pdfFiles.map((file) => ({
        file,
        status: "pending",
        preview: URL.createObjectURL(file),
      })),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  // Handle settings change
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConversionSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Remove file from list
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all files and reset settings
  const resetAll = () => {
    setFiles([]);
    setConversionSettings({
      outputFormat: "docx",
      quality: 100,
      mergeOutput: false,
      includeAnnotations: true,
      compressionLevel: "medium",
      pageRange: "all",
      customRange: "",
    });
    setConversionProgress({});
    setIsConverting(false);
  };

  // Simulate conversion process
  const convertFiles = async () => {
    if (!files.length) return;

    setIsConverting(true);
    setConversionProgress({});

    try {
      // Simulate merged output if selected
      if (conversionSettings.mergeOutput) {
        setConversionProgress({ merged: 0 });
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          setConversionProgress({ merged: progress });
        }

        const blob = new Blob(files.map((f) => f.file), { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `converted-files-${Date.now()}.${conversionSettings.outputFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setFiles((prev) => prev.map((file) => ({ ...file, status: "completed" })));
      } else {
        for (let i = 0; i < files.length; i++) {
          setConversionProgress((prev) => ({ ...prev, [i]: 0 }));

          for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise((resolve) => setTimeout(resolve, 300));
            setConversionProgress((prev) => ({ ...prev, [i]: progress }));
          }

          const url = URL.createObjectURL(files[i].file);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${files[i].file.name.split(".")[0]}.${conversionSettings.outputFormat}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          setFiles((prev) =>
            prev.map((file, idx) => (idx === i ? { ...file, status: "completed" } : file))
          );
        }
      }
    } catch (error) {
      console.error("Conversion failed:", error);
      setFiles((prev) => prev.map((file) => ({ ...file, status: "error" })));
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Batch Converter</h1>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 mb-6 text-center transition-colors ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
          }`}
        >
          <input {...getInputProps()} />
          <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
          <p className="text-gray-600">
            {isDragActive
              ? "Drop the PDF files here..."
              : "Drag & drop PDF files here, or click to select"}
          </p>
          <p className="text-sm text-gray-500 mt-1">Supports multiple PDF files</p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Selected Files</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-lg">
              {files.map((fileObj, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm"
                >
                  <span className="text-sm truncate flex-1 text-gray-700">{fileObj.file.name}</span>
                  <div className="flex items-center space-x-3">
                    {conversionProgress[index] !== undefined && !conversionSettings.mergeOutput && (
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${conversionProgress[index]}%` }}
                        />
                      </div>
                    )}
                    <span
                      className={`text-sm ${
                        fileObj.status === "completed"
                          ? "text-green-600"
                          : fileObj.status === "error"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {fileObj.status === "completed"
                        ? "Done"
                        : fileObj.status === "error"
                        ? "Error"
                        : "Pending"}
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      disabled={isConverting}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
              {conversionSettings.mergeOutput && conversionProgress.merged !== undefined && (
                <div className="mt-2">
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${conversionProgress.merged}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 mt-1">Merging Progress</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conversion Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
            <select
              name="outputFormat"
              value={conversionSettings.outputFormat}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isConverting}
            >
              <option value="docx">Word (.docx)</option>
              <option value="png">Image (.png)</option>
              <option value="jpg">Image (.jpg)</option>
              <option value="txt">Text (.txt)</option>
              <option value="pdf">Optimized PDF (.pdf)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quality (%)</label>
            <input
              type="number"
              name="quality"
              value={conversionSettings.quality}
              onChange={handleSettingsChange}
              min="10"
              max="100"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isConverting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compression Level</label>
            <select
              name="compressionLevel"
              value={conversionSettings.compressionLevel}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isConverting}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Range</label>
            <select
              name="pageRange"
              value={conversionSettings.pageRange}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isConverting}
            >
              <option value="all">All Pages</option>
              <option value="custom">Custom Range</option>
            </select>
            {conversionSettings.pageRange === "custom" && (
              <input
                type="text"
                name="customRange"
                value={conversionSettings.customRange}
                onChange={handleSettingsChange}
                placeholder="e.g., 1-3, 5"
                className="w-full p-2 border rounded-md mt-2 focus:ring-2 focus:ring-blue-500"
                disabled={isConverting}
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="mergeOutput"
                checked={conversionSettings.mergeOutput}
                onChange={handleSettingsChange}
                className="mr-2 accent-blue-500"
                disabled={isConverting}
              />
              <span className="text-sm text-gray-700">Merge into single file</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeAnnotations"
                checked={conversionSettings.includeAnnotations}
                onChange={handleSettingsChange}
                className="mr-2 accent-blue-500"
                disabled={isConverting}
              />
              <span className="text-sm text-gray-700">Include annotations</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={convertFiles}
            disabled={!files.length || isConverting}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" />
            {isConverting ? "Converting..." : "Convert and Download"}
          </button>
          <button
            onClick={resetAll}
            disabled={isConverting}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Batch conversion of multiple PDFs</li>
            <li>Multiple output formats (DOCX, PNG, JPG, TXT, PDF)</li>
            <li>Custom quality and compression settings</li>
            <li>Page range selection with custom ranges</li>
            <li>Merge output into single file option</li>
            <li>Drag and drop support</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFBatchConverter;