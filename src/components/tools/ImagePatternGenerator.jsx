// components/AdvancedImagePatternGenerator.jsx
"use client";
import React, { useState, useRef } from "react";

const AdvancedImagePatternGenerator = () => {
  const [patternType, setPatternType] = useState("grid");
  const [size, setSize] = useState(50);
  const [rotation, setRotation] = useState(0);
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState(1);
  const [repeat, setRepeat] = useState("repeat");
  const canvasRef = useRef(null);

  // Pattern styles generator
  const getPatternStyle = () => {
    const styles = {
      grid: `repeating-linear-gradient(${rotation}deg, ${primaryColor}, ${primaryColor} 2px, transparent 2px, transparent ${size}px), repeating-linear-gradient(${rotation + 90}deg, ${primaryColor}, ${primaryColor} 2px, transparent 2px, transparent ${size}px)`,
      dots: `radial-gradient(${primaryColor} ${size / 10}px, ${secondaryColor} ${size / 10}px)`,
      stripes: `repeating-linear-gradient(${rotation}deg, ${primaryColor}, ${primaryColor} ${size / 2}px, ${secondaryColor} ${size / 2}px, ${secondaryColor} ${size}px)`,
      checker: `repeating-conic-gradient(from ${rotation}deg, ${primaryColor} 0deg 90deg, ${secondaryColor} 90deg 180deg)`,
      waves: `repeating-radial-gradient(circle, ${primaryColor}, ${primaryColor} ${size / 4}px, ${secondaryColor} ${size / 2}px)`,
    };

    return {
      backgroundImage: styles[patternType],
      backgroundSize: patternType === "dots" ? `${size}px ${size}px` : `${size}px ${size}px`,
      backgroundRepeat: repeat,
      opacity: opacity,
      backgroundColor: secondaryColor,
    };
  };

  // Export pattern as PNG
  const exportPattern = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    canvas.width = size * 2;
    canvas.height = size * 2;
    
    Object.assign(canvas.style, getPatternStyle());
    ctx.fillStyle = canvas.style.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = `pattern-${patternType}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><rect width='100%' height='100%' style='${Object.entries(getPatternStyle()).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`).join(';')}'/></svg>`;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Advanced Pattern Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pattern Type
                </label>
                <select
                  value={patternType}
                  onChange={(e) => setPatternType(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="grid">Grid</option>
                  <option value="dots">Dots</option>
                  <option value="stripes">Stripes</option>
                  <option value="checker">Checker</option>
                  <option value="waves">Waves</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size ({size}px)
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rotation ({rotation}°)
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full h-10 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Color
                </label>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full h-10 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opacity ({opacity})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repeat
                </label>
                <select
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="repeat">Repeat</option>
                  <option value="repeat-x">Repeat X</option>
                  <option value="repeat-y">Repeat Y</option>
                  <option value="no-repeat">No Repeat</option>
                </select>
              </div>

              <button
                onClick={exportPattern}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
              >
                Export Pattern
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <div
              className="w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl shadow-lg border border-gray-200"
              style={getPatternStyle()}
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedImagePatternGenerator;