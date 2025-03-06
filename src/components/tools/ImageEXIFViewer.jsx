// components/ImageEXIFViewer.jsx
"use client";
import React, { useState } from "react";
import EXIF from "exif-js";

const ImageEXIFViewer = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [exifData, setExifData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle image upload and extract EXIF data
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsLoading(true);
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);

      EXIF.getData(file, function () {
        const allMetaData = EXIF.getAllTags(this);
        setExifData(allMetaData);
        setIsLoading(false);
      });
    }
  };

  // Format EXIF data for display
  const formatExifValue = (value) => {
    if (value instanceof Array) {
      return value.join(", ");
    }
    if (value && typeof value === "object" && "numerator" in value && "denominator" in value) {
      return `${value.numerator}/${value.denominator}`;
    }
    return value || "N/A";
  };

  // Common EXIF fields to display
  const displayFields = [
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
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image EXIF Viewer
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

          {/* Preview and EXIF Data */}
          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-600">Loading EXIF data...</p>
            </div>
          ) : previewUrl && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Preview */}
              <div>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md shadow-md"
                />
              </div>

              {/* EXIF Data Display */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  EXIF Metadata
                </h2>
                {exifData && Object.keys(exifData).length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-md max-h-[400px] overflow-y-auto">
                    <dl className="grid grid-cols-1 gap-y-2">
                      {displayFields.map((field) => (
                        exifData[field.key] && (
                          <div key={field.key} className="grid grid-cols-2 gap-2">
                            <dt className="text-sm font-medium text-gray-600">
                              {field.label}:
                            </dt>
                            <dd className="text-sm text-gray-800">
                              {formatExifValue(exifData[field.key])}
                            </dd>
                          </div>
                        )
                      ))}
                    </dl>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No EXIF data found in this image
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEXIFViewer;