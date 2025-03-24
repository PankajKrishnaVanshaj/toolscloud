"use client";
import React, { useState, useRef, useCallback } from "react";
import EXIF from "exif-js";
import { FaDownload, FaSync, FaUpload, FaInfoCircle } from "react-icons/fa";

const ImageMetadataEditor = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [metadata, setMetadata] = useState({});
  const [editedMetadata, setEditedMetadata] = useState({});
  const [showAllFields, setShowAllFields] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload and extract metadata
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);

      EXIF.getData(file, function () {
        const allMetaData = EXIF.getAllTags(this);
        setMetadata(allMetaData);
        setEditedMetadata(allMetaData);
      });
    }
  }, []);

  // Handle metadata field changes
  const handleMetadataChange = (key, value) => {
    setEditedMetadata((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Save edited metadata (simulation)
  const saveMetadata = useCallback(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const newImageUrl = canvas.toDataURL("image/jpeg", 0.9); // Quality set to 0.9
      setPreviewUrl(newImageUrl);
      setMetadata(editedMetadata);
      alert("Metadata saved (simulated). Download to get the processed image.");
    };

    img.src = previewUrl;
  }, [image, previewUrl, editedMetadata]);

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `metadata-edited-${Date.now()}.jpg`;
    link.href = canvasRef.current.toDataURL("image/jpeg", 0.9);
    link.click();
  };

  // Reset everything
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setMetadata({});
    setEditedMetadata({});
    setShowAllFields(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Common editable EXIF fields
  const commonFields = [
    "DateTimeOriginal",
    "Artist",
    "Copyright",
    "ImageDescription",
    "Make",
    "Model",
    "Software",
    "Orientation",
  ];

  // Toggle between common and all fields
  const displayedFields = showAllFields ? Object.keys(metadata) : commonFields;

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Image Metadata Editor
        </h1>

        {/* Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {previewUrl && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Preview */}
              <div className="flex justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg shadow-md max-h-[70vh] object-contain"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Metadata Editor */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-700">
                    Edit Metadata
                  </h2>
                  <button
                    onClick={() => setShowAllFields(!showAllFields)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {showAllFields ? "Show Common Fields" : "Show All Fields"}
                  </button>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {displayedFields.map((field) => (
                    <div key={field} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {field}
                      </label>
                      <input
                        type="text"
                        value={editedMetadata[field] || ""}
                        onChange={(e) => handleMetadataChange(field, e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder={metadata[field] || "Not set"}
                      />
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <button
                    onClick={saveMetadata}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <FaUpload className="mr-2" /> Save Metadata
                  </button>
                  <button
                    onClick={downloadImage}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <FaDownload className="mr-2" /> Download
                  </button>
                  <button
                    onClick={reset}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <FaSync className="mr-2" /> Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Metadata Preview */}
            {showAllFields && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Full Metadata Preview</h3>
                <pre className="text-sm text-gray-600 overflow-x-auto">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Placeholder */}
        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to view and edit its metadata</p>
          </div>
        )}

        {/* Features and Notes */}
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>View and edit common EXIF metadata fields</li>
              <li>Toggle between common and all metadata fields</li>
              <li>Download edited image as JPEG</li>
              <li>Responsive design with Tailwind CSS</li>
              <li>Full metadata preview</li>
            </ul>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start">
            <FaInfoCircle className="text-yellow-700 mr-2 mt-1" />
            <p className="text-yellow-700 text-sm">
              <strong>Note:</strong> Browser-based EXIF editing is limited. Metadata changes are simulated and may not fully persist in the downloaded file. For full EXIF support, use a server-side solution or dedicated software.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageMetadataEditor;