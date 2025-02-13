"use client";
import React, { useState } from "react";

const ImageBackgroundRemover = () => {
  const [image, setImage] = useState(null);
  const [isBackgroundRemoved, setIsBackgroundRemoved] = useState(false);

  const handleFileChange = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
    setIsBackgroundRemoved(false); // Reset the removal state
  };

  const removeBackground = () => {
    // Placeholder functionality
    alert("Background removal functionality coming soon!");
    setIsBackgroundRemoved(true);
  };

  return (
    <div className="p-4 rounded-lg shadow-lg bg-white max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Image Background Remover</h2>
      <input type="file" onChange={handleFileChange} className="mb-4" />
      {image && (
        <div>
          <img
            src={image}
            alt="Selected"
            className={`rounded mb-4 ${isBackgroundRemoved ? "opacity-75 grayscale" : ""}`}
          />
          <button
            onClick={removeBackground}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Remove Background
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageBackgroundRemover;
