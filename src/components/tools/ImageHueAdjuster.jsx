// components/ImageHueAdjuster.jsx
"use client";
import React, { useState, useRef, useEffect } from "react";

const ImageHueAdjuster = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(100);
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setHue(0);
      setSaturation(100);
      setLightness(100);
    }
  };

  // Apply HSL adjustments
  const adjustImage = () => {
    if (!image || !canvasRef.current) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;

        // Convert RGB to HSL
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
          h = s = 0; // achromatic
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }

        // Apply adjustments
        h = (h * 360 + hue) % 360 / 360;
        s = Math.min(1, Math.max(0, s * (saturation / 100)));
        l = Math.min(1, Math.max(0, l * (lightness / 100)));

        // Convert back to RGB
        let newR, newG, newB;
        if (s === 0) {
          newR = newG = newB = l; // achromatic
        } else {
          const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
          };
          
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          newR = hue2rgb(p, q, h + 1/3);
          newG = hue2rgb(p, q, h);
          newB = hue2rgb(p, q, h - 1/3);
        }

        data[i] = newR * 255;
        data[i + 1] = newG * 255;
        data[i + 2] = newB * 255;
      }

      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL());
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  // Update preview when adjustments change
  useEffect(() => {
    if (previewUrl) {
      adjustImage();
    }
  }, [hue, saturation, lightness]);

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "hue-adjusted.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset adjustments
  const resetAdjustments = () => {
    setHue(0);
    setSaturation(100);
    setLightness(100);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Hue Adjuster
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

          {/* Preview and Controls */}
          {previewUrl && (
            <div className="space-y-6">
              <div className="relative max-w-full mx-auto">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hue ({hue}°)
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={hue}
                    onChange={(e) => setHue(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Saturation ({saturation}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lightness ({lightness}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={lightness}
                    onChange={(e) => setLightness(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={resetAdjustments}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={downloadImage}
                    disabled={isProcessing}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Adjust the sliders to modify the image's hue, saturation, and lightness
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageHueAdjuster;