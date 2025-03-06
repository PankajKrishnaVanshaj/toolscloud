// components/VirtualMagnifierTool.js
'use client';

import React, { useState, useRef } from 'react';

const VirtualMagnifierTool = () => {
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [isMagnifying, setIsMagnifying] = useState(false);
  const imageRef = useRef(null);
  
  // Sample image URL - you can replace this with your own image
  const defaultImage = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80';
  
  const magnification = 2; // Magnification level
  const magnifierSize = 150; // Size of the magnifier in pixels

  const handleMouseMove = (e) => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Ensure magnifier stays within image bounds
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        setMagnifierPosition({ x, y });
        setIsMagnifying(true);
      } else {
        setIsMagnifying(false);
      }
    }
  };

  const handleMouseLeave = () => {
    setIsMagnifying(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Virtual Magnifier Tool</h1>
      
      <div className="relative">
        <div 
          className="relative overflow-hidden rounded-lg"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <img
            ref={imageRef}
            src={defaultImage}
            alt="Image to magnify"
            className="w-full h-auto"
          />
          
          {isMagnifying && (
            <div
              className="absolute rounded-full border-2 border-gray-300 bg-white/80 shadow-lg pointer-events-none"
              style={{
                width: `${magnifierSize}px`,
                height: `${magnifierSize}px`,
                left: `${magnifierPosition.x - magnifierSize / 2}px`,
                top: `${magnifierPosition.y - magnifierSize / 2}px`,
                backgroundImage: `url(${defaultImage})`,
                backgroundSize: `${imageRef.current?.width * magnification}px ${imageRef.current?.height * magnification}px`,
                backgroundPosition: `-${magnifierPosition.x * magnification - magnifierSize / 2}px -${magnifierPosition.y * magnification - magnifierSize / 2}px`,
              }}
            />
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Hover over the image to magnify. Move your mouse to explore different areas.
          </p>
        </div>
      </div>

      {/* Optional Controls */}
      <div className="mt-6 flex justify-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Magnification: {magnification}x
          </label>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Magnifier Size: {magnifierSize}px
          </label>
        </div>
      </div>
    </div>
  );
};

export default VirtualMagnifierTool;