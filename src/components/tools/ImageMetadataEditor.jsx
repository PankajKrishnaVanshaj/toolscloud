// components/ImageMetadataEditor.jsx
"use client";
import React, { useState, useRef } from "react";
import EXIF from "exif-js";

const ImageMetadataEditor = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [metadata, setMetadata] = useState({});
  const [editedMetadata, setEditedMetadata] = useState({});
  const canvasRef = useRef(null);

  // Handle image upload and extract metadata
  const handleImageUpload = (e) => {
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
  };

  // Handle metadata field changes
  const handleMetadataChange = (key, value) => {
    setEditedMetadata((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Save edited metadata (simplified - actual EXIF writing requires more complex handling)
  const saveMetadata = async () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Note: Actual EXIF writing isn't fully possible in browser
      // This is a simulation that preserves the image with new metadata in memory
      const newImageUrl = canvas.toDataURL("image/jpeg");
      setPreviewUrl(newImageUrl);
      
      // Update displayed metadata
      setMetadata(editedMetadata);
      
      alert("Metadata saved (simulated). Download to get the processed image.");
    };

    img.src = previewUrl;
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "metadata-edited.jpg";
    link.href = canvasRef.current.toDataURL("image/jpeg");
    link.click();
  };

  // Common editable EXIF fields
  const editableFields = [
    "DateTimeOriginal",
    "Artist",
    "Copyright",
    "ImageDescription",
    "Make",
    "Model",
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Metadata Editor
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Preview and Metadata Editor */}
          {previewUrl && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Preview */}
              <div>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Metadata Editor */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  Edit Metadata
                </h2>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {editableFields.map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field}
                      </label>
                      <input
                        type="text"
                        value={editedMetadata[field] || ""}
                        onChange={(e) =>
                          handleMetadataChange(field, e.target.value)
                        }
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder={metadata[field] || "Not set"}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <button
                    onClick={saveMetadata}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Save Metadata
                  </button>
                  <button
                    onClick={downloadImage}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!previewUrl && (
            <p className="text-center text-gray-500">
              Upload an image to view and edit its metadata
            </p>
          )}
        </div>

        {/* Note about limitations */}
        {previewUrl && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            Note: Full EXIF editing is limited in browsers. Some metadata may not persist in the downloaded file.
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageMetadataEditor;