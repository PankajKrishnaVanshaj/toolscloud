"use client";
import React, { useState, useRef } from "react";

const ImageColorAdjuster = () => {
  const [image, setImage] = useState(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [blur, setBlur] = useState(0);

  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setGrayscale(0);
    setBlur(0);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) blur(${blur}px)`;
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = "adjusted-image.png";
      link.href = canvas.toDataURL();
      link.click();
    };
  };

  return (
    <div className="p-4 rounded-lg shadow-lg bg-white max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Image Color Adjuster</h2>
      <input type="file" onChange={handleFileChange} className="mb-4" />
      {image && (
        <div>
          <img
            src={image}
            alt="Selected"
            style={{
              filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) blur(${blur}px)`,
            }}
            className="rounded mb-4"
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div className="flex flex-col gap-4">
            <label className="flex flex-col">
              Brightness
              <input
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={(e) => setBrightness(e.target.value)}
              />
            </label>

            <label className="flex flex-col">
              Contrast
              <input
                type="range"
                min="0"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(e.target.value)}
              />
            </label>

            <label className="flex flex-col">
              Saturation
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(e) => setSaturation(e.target.value)}
              />
            </label>

            <label className="flex flex-col">
              Grayscale
              <input
                type="range"
                min="0"
                max="100"
                value={grayscale}
                onChange={(e) => setGrayscale(e.target.value)}
              />
            </label>

            <label className="flex flex-col">
              Blur
              <input
                type="range"
                min="0"
                max="10"
                value={blur}
                onChange={(e) => setBlur(e.target.value)}
              />
            </label>
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded shadow"
            >
              Reset
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-500 text-white rounded shadow"
            >
              Download Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageColorAdjuster;
