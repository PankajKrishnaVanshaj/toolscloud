"use client";

import { useState, useEffect, useRef } from "react";

const ImageResizer = () => {
  const [image, setImage] = useState(null);
  const [width, setWidth] = useState(250);
  const [height, setHeight] = useState(300);
  const [originalWidth, setOriginalWidth] = useState(500);
  const [originalHeight, setOriginalHeight] = useState(300);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);

  const canvasRef = useRef(null);
  const [resizedImage, setResizedImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderImage = () => {
    if (!image) return;

    const img = new Image();
    img.src = image;

    img.onload = () => {
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Apply transformations
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      ctx.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
      `;

      // Draw the image to fit the new dimensions
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Update resized image preview
      setResizedImage(canvas.toDataURL("image/png"));
    };
  };

  useEffect(() => {
    renderImage();
  }, [
    image,
    width,
    height,
    brightness,
    contrast,
    saturation,
    rotation,
    flipHorizontal,
    flipVertical,
  ]);

  const handleWidthChange = (e) => {
    const newWidth = parseInt(e.target.value, 10);
    if (isNaN(newWidth)) return;
    setWidth(newWidth);
    if (keepAspectRatio) {
      const newHeight = Math.round((newWidth * originalHeight) / originalWidth);
      setHeight(newHeight);
    }
  };

  const handleHeightChange = (e) => {
    const newHeight = parseInt(e.target.value, 10);
    if (isNaN(newHeight)) return;
    setHeight(newHeight);
    if (keepAspectRatio) {
      const newWidth = Math.round((newHeight * originalWidth) / originalHeight);
      setWidth(newWidth);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = "resized-image.png";
    link.href = resizedImage;
    link.click();
  };

  const handleReset = () => {
    setWidth(300);
    setHeight(300);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
  };

  return (
    <div className="mx-auto p-5 bg-white shadow-lg rounded-2xl">
      <h1 className="text-2xl font-bold mb-4">Image Resizer & Editor</h1>
      <input
        type="file"
        accept="image/*"
        className="mb-3"
        onChange={handleImageUpload}
      />
      {resizedImage && (
        <img
          src={resizedImage}
          alt="Preview"
          className="w-full max-h-60 object-contain rounded-lg border mb-3"
        />
      )}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="number"
          className="flex-1 p-2 border rounded-lg"
          placeholder="Width (px)"
          value={width}
          onChange={handleWidthChange}
        />
        <input
          type="number"
          className="flex-1 p-2 border rounded-lg"
          placeholder="Height (px)"
          value={height}
          onChange={handleHeightChange}
        />
      </div>
      <div className="flex flex-wrap gap-4 my-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="aspect-ratio"
            checked={keepAspectRatio}
            onChange={() => setKeepAspectRatio(!keepAspectRatio)}
            className="mr-2 accent-primary"
          />
          <label htmlFor="aspect-ratio">Keep Aspect Ratio</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="flip-horizontal"
            checked={flipHorizontal}
            onChange={() => setFlipHorizontal(!flipHorizontal)}
            className="mr-2 accent-primary"
          />
          <label htmlFor="flip-horizontal">Flip Horizontal</label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="flip-vertical"
            checked={flipVertical}
            onChange={() => setFlipVertical(!flipVertical)}
            className="mr-2 accent-primary"
          />
          <label htmlFor="flip-vertical">Flip Vertical</label>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <Slider
          label="Brightness"
          value={brightness}
          setValue={setBrightness}
        />
        <Slider label="Contrast" value={contrast} setValue={setContrast} />
        <Slider
          label="Saturation"
          value={saturation}
          setValue={setSaturation}
        />
        <Slider label="Rotation" value={rotation} setValue={setRotation} />
      </div>

      <div className="flex flex-wrap gap-4 my-2">
        <button
          className="flex-1 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text border hover:border-secondary p-2 rounded-lg"
          onClick={handleReset}
        >
          Reset
        </button>
        <button
          className="flex-1 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text border hover:border-secondary p-2 rounded-lg"
          onClick={handleDownload}
          disabled={!resizedImage}
        >
          Download Image
        </button>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

const Slider = ({ label, value, setValue }) => (
  <div className="flex flex-col items-center">
    <label className="text-sm mb-1">{label}</label>
    <input
      type="range"
      min={label === "Rotation" ? "-180" : "0"}
      max={label === "Rotation" ? "180" : "200"}
      value={value}
      onChange={(e) => setValue(parseInt(e.target.value))}
      className="w-full accent-primary"
    />
  </div>
);

export default ImageResizer;
