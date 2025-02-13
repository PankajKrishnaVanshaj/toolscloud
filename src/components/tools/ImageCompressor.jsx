"use client";

import { useState, useRef, useEffect } from "react";

const ImageCompressor = () => {
  const [image, setImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [quality, setQuality] = useState(0.7);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [outputFormat, setOutputFormat] = useState("image/jpeg");
  const [aspectRatio, setAspectRatio] = useState(false);
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1);
  const [applyGrayscale, setApplyGrayscale] = useState(false);
  const [applyInvert, setApplyInvert] = useState(false);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOriginalSize(file.size);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          setWidth(img.width);
          setHeight(img.height);
          setOriginalAspectRatio(img.width / img.height);
          compressImage(img, img.width, img.height, quality);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (img, newWidth, newHeight, newQuality) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
    const compressedBase64 = canvas.toDataURL(outputFormat, newQuality);
    setCompressedImage(compressedBase64);

    // Calculate compressed size in bytes (base64 size * 3/4)
    const base64Length =
      compressedBase64.length - "data:image/jpeg;base64,".length;
    setCompressedSize(Math.floor((base64Length * 3) / 4));

    // Apply grayscale filter
    if (applyGrayscale) {
      const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const avg =
          (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) /
          3;
        imageData.data[i] = avg; // Red
        imageData.data[i + 1] = avg; // Green
        imageData.data[i + 2] = avg; // Blue
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // Apply invert filter
    if (applyInvert) {
      const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 255 - imageData.data[i]; // Red
        imageData.data[i + 1] = 255 - imageData.data[i + 1]; // Green
        imageData.data[i + 2] = 255 - imageData.data[i + 2]; // Blue
      }
      ctx.putImageData(imageData, 0, 0);
    }

    setCompressedImage(canvas.toDataURL(outputFormat, newQuality));
  };

  useEffect(() => {
    if (!image) return;
    const img = new Image();
    img.src = image;
    img.onload = () => {
      compressImage(img, width, height, quality);
    };
  }, [
    width,
    height,
    quality,
    outputFormat,
    applyGrayscale,
    applyInvert,
    image,
  ]);

  const handleWidthChange = (e) => {
    const newWidth = parseInt(e.target.value, 10);
    if (isNaN(newWidth)) return;

    if (aspectRatio) {
      setHeight(Math.round(newWidth / originalAspectRatio));
    }
    setWidth(newWidth);
  };

  const handleHeightChange = (e) => {
    const newHeight = parseInt(e.target.value, 10);
    if (isNaN(newHeight)) return;

    if (aspectRatio) {
      setWidth(Math.round(newHeight * originalAspectRatio));
    }
    setHeight(newHeight);
  };

  const handleDownload = () => {
    if (!compressedImage) return;

    const link = document.createElement("a");
    link.href = compressedImage;
    link.download = `compressed-image.${outputFormat.split("/")[1]}`;
    link.click();
  };

  const handleReset = () => {
    if (!image) return;
    const img = new Image();
    img.src = image;
    img.onload = () => {
      setWidth(img.width);
      setHeight(img.height);
      setQuality(0.7);
      setOutputFormat("image/jpeg");
      setApplyGrayscale(false);
      setApplyInvert(false);
      compressImage(img, img.width, img.height, 0.7);
    };
  };

  const formatSize = (sizeInBytes) => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1048576) return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    return `${(sizeInBytes / 1048576).toFixed(2)} MB`;
  };

  return (
    <div className="mx-auto p-5 bg-white shadow-lg rounded-2xl">
      <input
        type="file"
        accept="image/*"
        className="mb-3 w-full p-2 border rounded-lg"
        onChange={handleImageUpload}
      />

      {/* Preview Original and Compressed */}
      <div className="flex gap-4 mb-3">
        {image && (
          <img
            src={image}
            alt="Original"
            className="w-1/2 max-h-60 object-contain rounded-lg border"
          />
        )}
        {compressedImage && (
          <img
            src={compressedImage}
            alt="Compressed Preview"
            className="w-1/2 max-h-60 object-contain rounded-lg border"
          />
        )}
      </div>

      <label className="block mb-2 font-medium">Compression Quality</label>
      <input
        type="range"
        min="0.1"
        max="1.0"
        step="0.1"
        value={quality}
        onChange={(e) => setQuality(parseFloat(e.target.value))}
        className="w-full mb-3 accent-primary"
      />
      <p className="text-center text-sm mb-3">Quality: {quality}</p>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Width Input */}
        <div className="flex-1">
          <label className="block font-medium mb-1">Width</label>
          <input
            type="number"
            value={width || ""}
            onChange={handleWidthChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Height Input */}
        <div className="flex-1">
          <label className="block font-medium mb-1">Height</label>
          <input
            type="number"
            value={height || ""}
            onChange={handleHeightChange}
            disabled={aspectRatio}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Output Format Dropdown */}
        <div className="flex-1">
          <label className="block font-medium mb-1">Output Format</label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WEBP</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2">
          <input
            type="checkbox"
            checked={aspectRatio}
            onChange={() => setAspectRatio(!aspectRatio)}
            className="accent-primary"
          />
          <label className="text-sm">Maintain Aspect Ratio</label>
        </div>

        <div className="flex-1 flex items-center gap-2">
          <input
            type="checkbox"
            checked={applyGrayscale}
            onChange={() => setApplyGrayscale(!applyGrayscale)}
            className="accent-primary "
          />
          <label className="text-sm">Apply Grayscale</label>
        </div>

        <div className="flex-1 flex items-center gap-2">
          <input
            type="checkbox"
            checked={applyInvert}
            onChange={() => setApplyInvert(!applyInvert)}
            className="accent-primary"
          />
          <label className="text-sm">Apply Invert Colors</label>
        </div>

        <div className="flex-1 flex items-center gap-2">
          {/* Display Original and Compressed Image Sizes */}
          {originalSize > 0 && (
            <p className="text-sm mb-2">
              Original Size: {formatSize(originalSize)}
            </p>
          )}
        </div>
        <div className="flex-1 flex items-center gap-2">
          {compressedSize > 0 && (
            <p className="text-sm mb-4">
              Compressed Size: {formatSize(compressedSize)}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <button
          className="flex-1 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text border hover:border-secondary p-2 rounded-lg"
          onClick={handleReset}
        >
          Reset
        </button>
        {compressedImage && (
          <button
            className="flex-1 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text border hover:border-secondary p-2 rounded-lg"
            onClick={handleDownload}
          >
            Download Compressed Image
          </button>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default ImageCompressor;
