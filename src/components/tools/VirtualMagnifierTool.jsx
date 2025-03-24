"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaUpload, FaSync, FaPlus, FaMinus } from "react-icons/fa";

const VirtualMagnifierTool = () => {
  const [image, setImage] = useState(
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
  );
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [isMagnifying, setIsMagnifying] = useState(false);
  const [magnification, setMagnification] = useState(2);
  const [magnifierSize, setMagnifierSize] = useState(150);
  const [shape, setShape] = useState("circle");
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(URL.createObjectURL(file));
    }
  }, []);

  // Mouse movement handler
  const handleMouseMove = useCallback(
    (e) => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
          setMagnifierPosition({ x, y });
          setIsMagnifying(true);
        } else {
          setIsMagnifying(false);
        }
      }
    },
    []
  );

  const handleMouseLeave = () => setIsMagnifying(false);

  // Adjust magnification and size
  const adjustMagnification = (amount) =>
    setMagnification((prev) => Math.max(1, Math.min(10, prev + amount)));
  const adjustSize = (amount) =>
    setMagnifierSize((prev) => Math.max(50, Math.min(300, prev + amount)));

  // Reset to default
  const reset = () => {
    setImage(
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    );
    setMagnification(2);
    setMagnifierSize(150);
    setShape("circle");
    setIsMagnifying(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Virtual Magnifier Tool
        </h1>

        {/* Controls */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={reset}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Customization Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Magnification ({magnification}x)
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustMagnification(-0.5)}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  <FaMinus />
                </button>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={magnification}
                  onChange={(e) => setMagnification(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <button
                  onClick={() => adjustMagnification(0.5)}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  <FaPlus />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Magnifier Size ({magnifierSize}px)
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustSize(-10)}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  <FaMinus />
                </button>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={magnifierSize}
                  onChange={(e) => setMagnifierSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <button
                  onClick={() => adjustSize(10)}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  <FaPlus />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shape
              </label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="circle">Circle</option>
                <option value="square">Square</option>
                <option value="diamond">Diamond</option>
              </select>
            </div>
          </div>

          {/* Image with Magnifier */}
          <div className="relative">
            <div
              className="relative overflow-hidden rounded-lg shadow-md"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img
                ref={imageRef}
                src={image}
                alt="Image to magnify"
                className="w-full h-auto max-h-[70vh] object-contain"
              />
              {isMagnifying && (
                <div
                  className={`absolute border-2 border-gray-300 bg-white/80 shadow-lg pointer-events-none transition-all duration-100 ${
                    shape === "circle"
                      ? "rounded-full"
                      : shape === "square"
                      ? "rounded-none"
                      : "rotate-45 rounded-none"
                  }`}
                  style={{
                    width: `${magnifierSize}px`,
                    height: `${magnifierSize}px`,
                    left: `${magnifierPosition.x - magnifierSize / 2}px`,
                    top: `${magnifierPosition.y - magnifierSize / 2}px`,
                    backgroundImage: `url(${image})`,
                    backgroundSize: `${imageRef.current?.width * magnification}px ${
                      imageRef.current?.height * magnification
                    }px`,
                    backgroundPosition: `-${magnifierPosition.x * magnification - magnifierSize / 2}px -${
                      magnifierPosition.y * magnification - magnifierSize / 2
                    }px`,
                    transform: shape === "diamond" ? "rotate(45deg)" : "none",
                  }}
                />
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Hover over the image to magnify. Adjust settings to customize the magnifier.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Upload custom images</li>
            <li>Adjustable magnification (1x-10x)</li>
            <li>Customizable magnifier size (50px-300px)</li>
            <li>Multiple shapes: Circle, Square, Diamond</li>
            <li>Smooth transitions and real-time preview</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VirtualMagnifierTool;