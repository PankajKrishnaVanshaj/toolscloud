// components/ImageMemeGenerator.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageMemeGenerator = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [topText, setTopText] = useState("TOP TEXT");
  const [bottomText, setBottomText] = useState("BOTTOM TEXT");
  const [textColor, setTextColor] = useState("#ffffff");
  const [outlineColor, setOutlineColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(40);
  const canvasRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
    }
  };

  // Draw meme on canvas
  const drawMeme = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Text styling
      ctx.font = `${fontSize}px Impact, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = textColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = fontSize / 10;

      // Text positions
      const centerX = canvas.width / 2;
      const topY = fontSize * 1.5;
      const bottomY = canvas.height - fontSize * 1.5;

      // Wrap text if too long
      const wrapText = (text, x, y, maxWidth) => {
        const words = text.split(" ");
        let line = "";
        const lineHeight = fontSize * 1.2;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.strokeText(line, x, y);
            ctx.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.strokeText(line, x, y);
        ctx.fillText(line, x, y);
      };

      // Draw text
      wrapText(topText.toUpperCase(), centerX, topY, canvas.width * 0.9);
      wrapText(bottomText.toUpperCase(), centerX, bottomY, canvas.width * 0.9);

      setPreviewUrl(canvas.toDataURL());
    };

    img.src = previewUrl;
  };

  // Update preview when parameters change
  React.useEffect(() => {
    if (previewUrl) {
      drawMeme();
    }
  }, [topText, bottomText, textColor, outlineColor, fontSize, previewUrl]);

  // Download meme
  const downloadMeme = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Meme Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
            <div className="space-y-6">
              <div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Top Text
                </label>
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bottom Text
                </label>
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Color
                </label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outline Color
                </label>
                <input
                  type="color"
                  value={outlineColor}
                  onChange={(e) => setOutlineColor(e.target.value)}
                  className="w-full h-10 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size ({fontSize}px)
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <button
                onClick={downloadMeme}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors"
              >
                Download Meme
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            {previewUrl ? (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <img
                  src={previewUrl}
                  alt="Meme preview"
                  className="max-w-full h-auto rounded-md"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : (
              <div className="bg-gray-200 rounded-xl h-[400px] flex items-center justify-center text-gray-500">
                Upload an image to create a meme
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageMemeGenerator;