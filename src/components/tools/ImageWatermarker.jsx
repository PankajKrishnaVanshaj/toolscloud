import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FaUpload, FaDownload, FaSync, FaTextHeight, FaImage } from 'react-icons/fa';

const ImageWatermarker = () => {
  const [image, setImage] = useState(null);
  const [watermarkedImage, setWatermarkedImage] = useState(null);
  const [watermarkType, setWatermarkType] = useState('text');
  const [textWatermark, setTextWatermark] = useState('Watermark');
  const [imageWatermark, setImageWatermark] = useState(null);
  const [position, setPosition] = useState({ xPercent: 50, yPercent: 50 });
  const [opacity, setOpacity] = useState(0.5);
  const [fontSize, setFontSize] = useState(30);
  const [color, setColor] = useState('#ffffff');
  const [watermarkSize, setWatermarkSize] = useState({ width: 100, height: 100 });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);
  const watermarkInputRef = useRef(null);

  // Handle main image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setWatermarkedImage(null);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image file');
    }
  }, []);

  // Handle watermark image upload
  const handleWatermarkImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageWatermark(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image file for watermark');
    }
  }, []);

  // Calculate actual pixel position from percentages
  const calculatePixelPosition = useCallback(() => {
    if (!imageRef.current) return { x: 0, y: 0 };
    
    return {
      x: Math.round((position.xPercent / 100) * imageRef.current.naturalWidth),
      y: Math.round((position.yPercent / 100) * imageRef.current.naturalHeight),
    };
  }, [position.xPercent, position.yPercent]);

  // Apply watermark
  const applyWatermark = useCallback(() => {
    if (!image || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = image;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const { x, y } = calculatePixelPosition();
      ctx.globalAlpha = opacity;

      if (watermarkType === 'text') {
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(textWatermark, x, y);
      } else if (imageWatermark) {
        const watermarkImg = new Image();
        watermarkImg.src = imageWatermark;
        watermarkImg.onload = () => {
          const wmWidth = Math.min(watermarkSize.width, canvas.width);
          const wmHeight = Math.min(watermarkSize.height, canvas.height);
          ctx.drawImage(watermarkImg, x - wmWidth / 2, y - wmHeight / 2, wmWidth, wmHeight);
          setWatermarkedImage(canvas.toDataURL('image/png'));
        };
        return;
      }

      setWatermarkedImage(canvas.toDataURL('image/png'));
    };
  }, [image, watermarkType, textWatermark, imageWatermark, position, opacity, fontSize, color, watermarkSize, calculatePixelPosition]);

  useEffect(() => {
    if (image) {
      applyWatermark();
    }
  }, [image, watermarkType, textWatermark, imageWatermark, position, opacity, fontSize, color, watermarkSize, applyWatermark]);

  // Handle watermark size changes
  const handleWatermarkSizeChange = (dimension, value) => {
    const numValue = Math.max(10, parseInt(value) || 10); // Default to 10 if parsing fails
    setWatermarkSize((prev) => ({
      ...prev,
      [dimension]: numValue,
    }));
  };

  // Handle position changes
  const handlePositionChange = (dimension, value) => {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0)); // Ensure value stays between 0-100
    setPosition((prev) => ({
      ...prev,
      [dimension]: numValue,
    }));
  };

  // Download watermarked image
  const handleDownload = () => {
    if (watermarkedImage) {
      const link = document.createElement('a');
      link.download = `watermarked-image-${Date.now()}.png`;
      link.href = watermarkedImage;
      link.click();
    }
  };

  // Reset everything
  const handleReset = () => {
    setImage(null);
    setWatermarkedImage(null);
    setWatermarkType('text');
    setTextWatermark('Watermark');
    setImageWatermark(null);
    setPosition({ xPercent: 50, yPercent: 50 });
    setOpacity(0.5);
    setFontSize(30);
    setColor('#ffffff');
    setWatermarkSize({ width: 100, height: 100 });
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (watermarkInputRef.current) watermarkInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image Watermarker</h1>

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
            {/* Preview */}
            <div className="relative flex justify-center">
              <img
                ref={imageRef}
                src={watermarkedImage || image}
                alt="Watermarked Preview"
                className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
              />
            </div>
            <canvas ref={canvasRef} className="hidden" />

            {/* Watermark Controls */}
            <div className="space-y-4">
              {/* Watermark Type Selection */}
              <div className="flex gap-4">
                <button
                  onClick={() => setWatermarkType('text')}
                  className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center ${
                    watermarkType === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <FaTextHeight className="mr-2" /> Text
                </button>
                <button
                  onClick={() => setWatermarkType('image')}
                  className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center ${
                    watermarkType === 'image' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <FaImage className="mr-2" /> Image
                </button>
              </div>

              {/* Watermark Settings */}
              {watermarkType === 'text' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Watermark Text</label>
                    <input
                      type="text"
                      value={textWatermark}
                      onChange={(e) => setTextWatermark(e.target.value || '')} // Ensure always defined
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Size ({fontSize}px)</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-10 border rounded-md cursor-pointer"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Watermark Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      ref={watermarkInputRef}
                      onChange={handleWatermarkImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
                      <input
                        type="number"
                        min="10"
                        value={watermarkSize.width}
                        onChange={(e) => handleWatermarkSizeChange('width', e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
                      <input
                        type="number"
                        min="10"
                        value={watermarkSize.height}
                        onChange={(e) => handleWatermarkSizeChange('height', e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Position Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">X Position (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={position.xPercent}
                    onChange={(e) => handlePositionChange('xPercent', e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Y Position (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={position.yPercent}
                    onChange={(e) => handlePositionChange('yPercent', e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Opacity Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opacity ({opacity})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
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
                disabled={!watermarkedImage}
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
            <p className="text-gray-500 italic">Upload an image to start watermarking</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Add text or image watermarks</li>
            <li>Adjust position with percentage controls</li>
            <li>Customize image watermark width and height</li>
            <li>Control opacity, text size, and color</li>
            <li>Real-time preview</li>
            <li>Download watermarked image as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageWatermarker;