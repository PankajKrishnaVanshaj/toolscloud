"use client";

import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaSearch } from "react-icons/fa";

const RandomImageDownloader = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [orientation, setOrientation] = useState("all");
  const [imageSize, setImageSize] = useState("regular");
  const [history, setHistory] = useState([]);

  // Fetch random image from Unsplash
  const fetchRandomImage = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const queryParams = new URLSearchParams({
        orientation: orientation === "all" ? "" : orientation,
        query: category || undefined,
      }).toString();

      const response = await fetch(
        `https://api.unsplash.com/photos/random?${queryParams}`,
        {
          headers: {
            Authorization: "Client-ID YOUR_UNSPLASH_API_KEY_HERE", // Replace with your Unsplash API key
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch image");

      const data = await response.json();
      const newImage = {
        url: data.urls[imageSize],
        downloadUrl: data.links.download,
        author: data.user.name,
        description: data.description || "Random Image",
        id: data.id,
      };
      setImage(newImage);
      setHistory((prev) => [newImage, ...prev.slice(0, 4)]); // Keep last 5 images
    } catch (err) {
      setError("Error fetching image. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [category, orientation, imageSize]);

  // Download the current image
  const downloadImage = () => {
    if (image) {
      const link = document.createElement("a");
      link.href = image.downloadUrl;
      link.download = `${image.description || "random-image"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Reset to initial state
  const reset = () => {
    setImage(null);
    setCategory("");
    setOrientation("all");
    setImageSize("regular");
    setError("");
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Image Downloader
        </h1>

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., nature, city"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orientation
              </label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="all">All</option>
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
                <option value="square">Square</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Size
              </label>
              <select
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="thumb">Thumbnail (200px)</option>
                <option value="small">Small (400px)</option>
                <option value="regular">Regular (1080px)</option>
                <option value="full">Full (High-res)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={fetchRandomImage}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <FaSearch className="mr-2" />
              )}
              {loading ? "Fetching..." : "Get Random Image"}
            </button>
            <button
              onClick={downloadImage}
              disabled={!image || loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={reset}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Image Display */}
          {image && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={image.url}
                  alt={image.description}
                  className="w-full h-auto rounded-lg shadow-md max-h-[500px] object-contain transition-transform hover:scale-105"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Description:</span>{" "}
                  {image.description}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Author:</span> {image.author}
                </p>
              </div>
            </div>
          )}

          {/* Placeholder */}
          {!image && !loading && (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <FaSearch className="mx-auto text-gray-400 text-3xl mb-2" />
              <p className="text-gray-500 italic">
                Enter a category or click "Get Random Image" to start!
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-center text-red-600 text-sm mt-4">{error}</p>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Recent Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {history.map((histImage) => (
                  <img
                    key={histImage.id}
                    src={histImage.url}
                    alt={histImage.description}
                    className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setImage(histImage)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Fetch random images from Unsplash</li>
            <li>Filter by category, orientation, and size</li>
            <li>Download images directly</li>
            <li>View and reuse recent images</li>
          </ul>
          
        </div>
      </div>
    </div>
  );
};

export default RandomImageDownloader;