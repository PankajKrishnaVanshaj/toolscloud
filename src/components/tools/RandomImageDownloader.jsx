// components/RandomImageDownloader.js
'use client';

import React, { useState } from 'react';

const RandomImageDownloader = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Using Unsplash API with a free access key (replace with your own key for production)
  const fetchRandomImage = async () => {
    setLoading(true);
    setError('');
    try {
      // For this example, we'll use a public API endpoint
      const response = await fetch('https://api.unsplash.com/photos/random', {
        headers: {
          Authorization: 'Client-ID vX5hT5oX5eY8Z9QJ5K7L5M5N5P5R5S5T5U5V5W5X5Y5Z', // Replace with your Unsplash API key
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const data = await response.json();
      setImage({
        url: data.urls.regular,
        downloadUrl: data.links.download,
        author: data.user.name,
        description: data.description || 'Random Image',
      });
    } catch (err) {
      setError('Error fetching image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (image) {
      // Trigger download by creating a temporary link
      const link = document.createElement('a');
      link.href = image.downloadUrl;
      link.download = `${image.description || 'random-image'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Image Downloader</h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={fetchRandomImage}
          disabled={loading}
          className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Fetching...' : 'Get Random Image'}
        </button>
      </div>

      {image && (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={image.url}
              alt={image.description}
              className="w-full h-auto rounded-md max-h-[400px] object-cover"
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Description:</span> {image.description}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Author:</span> {image.author}
            </p>
            <button
              onClick={downloadImage}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Download Image
            </button>
          </div>
        </div>
      )}

      {!image && !loading && (
        <p className="text-center text-gray-500">
          Click the button to fetch a random image!
        </p>
      )}

      {error && (
        <p className="text-center text-red-600 text-sm mt-4">{error}</p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Images are sourced from Unsplash. Please respect copyright and usage rights.
      </p>
    </div>
  );
};

export default RandomImageDownloader;