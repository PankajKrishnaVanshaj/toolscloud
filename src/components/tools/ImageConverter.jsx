import React, { useState, useCallback, useRef } from 'react';
import { FaUpload, FaDownload, FaSync } from 'react-icons/fa';

const ImageConverter = () => {
  const [image, setImage] = useState(null);
  const [convertedImage, setConvertedImage] = useState(null);
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('png');
  const [quality, setQuality] = useState(0.8);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Supported formats
  const supportedFormats = ['png', 'jpeg', 'webp', 'gif'];

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      const fileExt = file.type.split('/')[1].toLowerCase();
      if (!supportedFormats.includes(fileExt)) {
        alert('Unsupported image format');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setInputFormat(fileExt);
        convertImage(event.target.result, outputFormat);
      };
      reader.readAsDataURL(file);
    }
  }, [outputFormat]);

  // Convert image to selected format
  const convertImage = useCallback((sourceImage, format) => {
    if (!sourceImage || !canvasRef.current) return;

    const img = new Image();
    img.src = sourceImage;

    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      const qualityValue = format === 'jpeg' || format === 'webp' ? quality : undefined;
      const converted = canvas.toDataURL(`image/${format}`, qualityValue);
      setConvertedImage(converted);
    };
  }, [quality]);

  // Handle download
  const handleDownload = () => {
    if (convertedImage) {
      const link = document.createElement('a');
      link.download = `converted-image-${Date.now()}.${outputFormat}`;
      link.href = convertedImage;
      link.click();
    }
  };

  // Reset everything
  const handleReset = () => {
    setImage(null);
    setConvertedImage(null);
    setInputFormat('');
    setOutputFormat('png');
    setQuality(0.8);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image Converter</h1>

        {/* File Upload */}
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {image && (
          <div className="space-y-6">
            {/* Preview Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Original ({inputFormat})</p>
                <img
                  src={image}
                  alt="Original"
                  className="max-w-full h-auto rounded-lg shadow-md max-h-64 object-contain"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Converted ({outputFormat})</p>
                <img
                  src={convertedImage}
                  alt="Converted"
                  className="max-w-full h-auto rounded-lg shadow-md max-h-64 object-contain"
                />
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />

            {/* Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => {
                    setOutputFormat(e.target.value);
                    convertImage(image, e.target.value);
                  }}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {supportedFormats.map((format) => (
                    <option key={format} value={format}>
                      {format.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {(outputFormat === 'jpeg' || outputFormat === 'webp') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quality ({quality})
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={quality}
                    onChange={(e) => {
                      setQuality(parseFloat(e.target.value));
                      convertImage(image, outputFormat);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={handleDownload}
                disabled={!convertedImage}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>
        )}

        {!image && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start converting</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between PNG, JPEG, WEBP, and GIF formats</li>
            <li>Quality control for JPEG and WEBP</li>
            <li>Side-by-side preview of original and converted images</li>
            <li>Real-time conversion preview</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageConverter;