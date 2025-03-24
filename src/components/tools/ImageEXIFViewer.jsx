"use client";
import React, { useState, useCallback, useRef } from "react";
import EXIF from "exif-js";
import { FaDownload, FaSync, FaUpload, FaCopy } from "react-icons/fa";

const ImageEXIFViewer = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [exifData, setExifData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const fileInputRef = useRef(null);

  // Handle image upload and extract EXIF data
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setIsLoading(true);
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setShowAllTags(false);

      EXIF.getData(file, function () {
        const allMetaData = EXIF.getAllTags(this);
        setExifData(allMetaData);
        setIsLoading(false);
      });
    }
  }, []);

  // Reset the component
  const handleReset = () => {
    setImage(null);
    setPreviewUrl(null);
    setExifData(null);
    setIsLoading(false);
    setShowAllTags(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Copy EXIF data to clipboard
  const copyToClipboard = () => {
    if (!exifData) return;
    const text = Object.entries(exifData)
      .map(([key, value]) => `${key}: ${formatExifValue(value)}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    alert("EXIF data copied to clipboard!");
  };

  // Download EXIF data as text file
  const downloadExifData = () => {
    if (!exifData) return;
    const text = Object.entries(exifData)
      .map(([key, value]) => `${key}: ${formatExifValue(value)}`)
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `exif-data-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Format EXIF data for display
  const formatExifValue = (value) => {
    if (value instanceof Array) {
      return value.join(", ");
    }
    if (value && typeof value === "object" && "numerator" in value && "denominator" in value) {
      return `${value.numerator}/${value.denominator}`;
    }
    if (value && typeof value === "object" && "degrees" in value) {
      return `${value.degrees}° ${value.minutes}' ${value.seconds}"`;
    }
    return value || "N/A";
  };

  // Common EXIF fields to display
  const commonFields = [
    { key: "Make", label: "Camera Make" },
    { key: "Model", label: "Camera Model" },
    { key: "DateTime", label: "Date Taken" },
    { key: "ExposureTime", label: "Exposure Time" },
    { key: "FNumber", label: "F-Number" },
    { key: "ISO", label: "ISO Speed" },
    { key: "FocalLength", label: "Focal Length" },
    { key: "LensModel", label: "Lens Model" },
    { key: "GPSLatitude", label: "Latitude" },
    { key: "GPSLongitude", label: "Longitude" },
    { key: "Orientation", label: "Orientation" },
    { key: "ImageWidth", label: "Width" },
    { key: "ImageHeight", label: "Height" },
  ];

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Image EXIF Viewer
        </h1>

        {/* Upload Section */}
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Preview and EXIF Data */}
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading EXIF data...</p>
          </div>
        ) : previewUrl ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Preview */}
              <div>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md shadow-md max-h-[500px] object-contain"
                />
              </div>

              {/* EXIF Data Display */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">EXIF Metadata</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      disabled={!exifData}
                      className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      title="Copy to Clipboard"
                    >
                      <FaCopy />
                    </button>
                    <button
                      onClick={downloadExifData}
                      disabled={!exifData}
                      className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      title="Download as Text"
                    >
                      <FaDownload />
                    </button>
                    <button
                      onClick={handleReset}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      title="Reset"
                    >
                      <FaSync />
                    </button>
                  </div>
                </div>

                {exifData && Object.keys(exifData).length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-md max-h-[400px] overflow-y-auto">
                    <dl className="grid grid-cols-1 gap-y-2">
                      {(showAllTags ? Object.entries(exifData) : commonFields.filter(f => exifData[f.key])).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-2 gap-2">
                          <dt className="text-sm font-medium text-gray-600">
                            {showAllTags ? key : commonFields.find(f => f.key === key)?.label || key}:
                          </dt>
                          <dd className="text-sm text-gray-800 break-words">
                            {formatExifValue(showAllTags ? value : exifData[key])}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <button
                      onClick={() => setShowAllTags(!showAllTags)}
                      className="mt-4 text-blue-600 hover:underline"
                    >
                      {showAllTags ? "Show Common Tags" : "Show All Tags"}
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500">No EXIF data found in this image</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to view its EXIF data</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>View common and all EXIF metadata</li>
            <li>Copy EXIF data to clipboard</li>
            <li>Download EXIF data as text file</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Image preview with loading indicator</li>
            <li>Toggle between common and full EXIF tags</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageEXIFViewer;