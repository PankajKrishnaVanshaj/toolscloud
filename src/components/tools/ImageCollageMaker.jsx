"use client";
import React, { useState } from "react";

const ImageCollageMaker = () => {
  const [images, setImages] = useState([]);
  const [layout, setLayout] = useState("grid");

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const imageUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...imageUrls]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageUrls = droppedFiles.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...imageUrls]);
  };

  const removeImage = (indexToRemove) => {
    setImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div
      className="p-4 rounded-lg shadow-lg bg-white max-w-lg mx-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <h2 className="text-2xl font-bold mb-4">Image Collage Maker</h2>
      <input type="file" multiple onChange={handleFileChange} className="mb-4" />

      <div className="flex justify-between items-center mb-4">
        <label className="font-semibold">Layout:</label>
        <select
          value={layout}
          onChange={(e) => setLayout(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="grid">Grid</option>
          <option value="masonry">Masonry</option>
          <option value="single">Single Row</option>
        </select>
      </div>

      <div
        className={`${
          layout === "grid"
            ? "grid grid-cols-2 gap-4"
            : layout === "masonry"
            ? "columns-2 gap-2"
            : "flex flex-wrap gap-4"
        }`}
      >
        {images.map((img, index) => (
          <div key={index} className="relative">
            <img src={img} alt={`Selected ${index}`} className="rounded w-full" />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageCollageMaker;
