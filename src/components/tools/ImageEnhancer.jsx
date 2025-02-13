"use client";

import { useState, useRef, useEffect } from "react";

const ImageEnhancer = () => {
  const [image, setImage] = useState(null);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sharpen: 0,
    hueRotate: 0,
    grayscale: 0,
    invert: 0,
    blur: 0,
    sepia: 0,
    opacity: 100,
    dropShadowSize: 0,
    dropShadowColor: "#000000",
    vignette: 0,
    pixelate: 0,
  });

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (image) {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        setOriginalSize({ width: img.width, height: img.height });
        applyEnhancements();
      };
    }
  }, [image]);

  useEffect(() => {
    applyEnhancements();
  }, [filters]);

  const applyEnhancements = () => {
    if (!canvasRef.current || !imgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;

    canvas.width = originalSize.width;
    canvas.height = originalSize.height;

    // Reset the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply core filters
    ctx.filter = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      hue-rotate(${filters.hueRotate}deg)
      grayscale(${filters.grayscale}%)
      invert(${filters.invert}%)
      blur(${filters.blur}px)
      sepia(${filters.sepia}%)
      opacity(${filters.opacity}%)
      drop-shadow(${filters.dropShadowSize}px ${filters.dropShadowSize}px ${filters.dropShadowSize}px ${filters.dropShadowColor})
    `;

    ctx.drawImage(img, 0, 0, originalSize.width, originalSize.height);

    // Apply vignette effect
    if (filters.vignette > 0) {
      const gradient = ctx.createRadialGradient(
        originalSize.width / 2,
        originalSize.height / 2,
        0,
        originalSize.width / 2,
        originalSize.height / 2,
        Math.max(originalSize.width, originalSize.height) / 2
      );
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(1, `rgba(0, 0, 0, ${filters.vignette / 100})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Apply pixelation effect
    if (filters.pixelate > 0) {
      const pixelSize = filters.pixelate;
      for (let y = 0; y < originalSize.height; y += pixelSize) {
        for (let x = 0; x < originalSize.width; x += pixelSize) {
          const pixel = ctx.getImageData(x, y, pixelSize, pixelSize);
          const avgColor = averageColor(pixel.data); // Calculate average pixel color
          ctx.fillStyle = `rgb(${avgColor.r}, ${avgColor.g}, ${avgColor.b})`;
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }
    }
  };

  const averageColor = (data) => {
    let r = 0,
      g = 0,
      b = 0;
    const length = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    return {
      r: Math.round(r / length),
      g: Math.round(g / length),
      b: Math.round(b / length),
    };
  };

  const handleDownload = () => {
    if (!image) return;

    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = "enhanced-image.png";
    link.click();
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      sharpen: 0,
      hueRotate: 0,
      grayscale: 0,
      invert: 0,
      blur: 0,
      sepia: 0,
      opacity: 100,
      dropShadowSize: 0,
      dropShadowColor: "#000000",
      vignette: 0,
      pixelate: 0,
    });
  };

  return (
    <div className="mx-auto p-5 bg-white shadow-lg rounded-2xl">
      <input
        type="file"
        accept="image/*"
        className="mb-3 w-full p-2 border rounded-lg"
        onChange={handleImageUpload}
      />

      {image && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-bold mb-2">Original Image</h3>
            <img
              ref={imgRef}
              src={image}
              alt="Uploaded"
              className="w-full max-h-60 object-contain rounded-lg border"
            />
            <p className="text-sm mt-2">
              Size: {originalSize.width} x {originalSize.height}px
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Enhanced Image</h3>
            <canvas
              ref={canvasRef}
              className="w-full max-h-60 object-contain rounded-lg border"
            ></canvas>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 justify-center">
        {Object.keys(filters).map((filter) => (
          <div key={filter} className="flex flex-row items-center gap-4">
            <label className="block font-medium capitalize text-gray-700">
              {filter.replace(/([A-Z])/g, " $1")}:
            </label>
            <input
              type="range"
              min="0"
              max={filter === "hueRotate" ? "360" : "200"}
              value={filters[filter]}
              onChange={(e) =>
                setFilters({ ...filters, [filter]: e.target.value })
              }
              className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            {filter === "dropShadowColor" && (
              <input
                type="color"
                value={filters.dropShadowColor}
                onChange={(e) =>
                  setFilters({ ...filters, dropShadowColor: e.target.value })
                }
                className="w-10 h-10 p-0 border rounded-md"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-row gap-4 mt-2">
        <button
          className="flex-1 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text border hover:border-secondary p-2 rounded-lg"
          onClick={resetFilters}
        >
          Reset Filters
        </button>
        <button
          className="flex-1 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text border hover:border-secondary p-2 rounded-lg"
          onClick={handleDownload}
        >
          Download Image
        </button>
      </div>
    </div>
  );
};

export default ImageEnhancer;
