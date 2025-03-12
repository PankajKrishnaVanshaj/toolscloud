"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaRandom } from "react-icons/fa";

const AdvancedImagePatternGenerator = () => {
  const [patternType, setPatternType] = useState("grid");
  const [size, setSize] = useState(50);
  const [rotation, setRotation] = useState(0);
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState(1);
  const [repeat, setRepeat] = useState("repeat");
  const [spacing, setSpacing] = useState(10); // New: spacing between elements
  const [shape, setShape] = useState("square"); // New: shape for dots/waves
  const canvasRef = useRef(null);

  // Randomize settings
  const randomize = () => {
    setPatternType(["grid", "dots", "stripes", "checker", "waves", "hexagon"][Math.floor(Math.random() * 6)]);
    setSize(Math.floor(Math.random() * 191) + 10);
    setRotation(Math.floor(Math.random() * 361));
    setPrimaryColor(`#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`);
    setSecondaryColor(`#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`);
    setOpacity(Math.random().toFixed(1));
    setRepeat(["repeat", "repeat-x", "repeat-y", "no-repeat"][Math.floor(Math.random() * 4)]);
    setSpacing(Math.floor(Math.random() * 41));
    setShape(["square", "circle", "triangle"][Math.floor(Math.random() * 3)]);
  };

  // Pattern styles generator
  const getPatternStyle = useCallback(() => {
    const adjustedSize = size + spacing;
    const styles = {
      grid: `repeating-linear-gradient(${rotation}deg, ${primaryColor}, ${primaryColor} 2px, transparent 2px, transparent ${adjustedSize}px), repeating-linear-gradient(${rotation + 90}deg, ${primaryColor}, ${primaryColor} 2px, transparent 2px, transparent ${adjustedSize}px)`,
      dots: `radial-gradient(${shape === "circle" ? "circle" : "square"} at center, ${primaryColor} ${size / 10}px, ${secondaryColor} ${size / 10}px)`,
      stripes: `repeating-linear-gradient(${rotation}deg, ${primaryColor}, ${primaryColor} ${size / 2}px, ${secondaryColor} ${size / 2}px, ${secondaryColor} ${adjustedSize}px)`,
      checker: `repeating-conic-gradient(from ${rotation}deg, ${primaryColor} 0deg 90deg, ${secondaryColor} 90deg 180deg)`,
      waves: `repeating-radial-gradient(${shape === "circle" ? "circle" : "square"}, ${primaryColor}, ${primaryColor} ${size / 4}px, ${secondaryColor} ${size / 2}px)`,
      hexagon: `repeating-conic-gradient(from ${rotation}deg, ${primaryColor} 0deg 60deg, ${secondaryColor} 60deg 120deg, ${primaryColor} 120deg 180deg)`,
    };

    return {
      backgroundImage: styles[patternType],
      backgroundSize: patternType === "dots" || patternType === "hexagon" ? `${adjustedSize}px ${adjustedSize}px` : `${adjustedSize}px ${adjustedSize}px`,
      backgroundRepeat: repeat,
      opacity: opacity,
      backgroundColor: secondaryColor,
    };
  }, [patternType, size, rotation, primaryColor, secondaryColor, opacity, repeat, spacing, shape]);

  // Export pattern as PNG
  const exportPattern = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const exportSize = Math.max(size + spacing, 100) * 2; // Ensure minimum size
    canvas.width = exportSize;
    canvas.height = exportSize;

    const patternStyle = getPatternStyle();
    ctx.fillStyle = patternStyle.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const svgPattern = `<svg xmlns='http://www.w3.org/2000/svg' width='${exportSize}' height='${exportSize}'><rect width='100%' height='100%' style='${Object.entries(patternStyle)
      .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`)
      .join(";")}'/></svg>`;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, exportSize, exportSize);
      const link = document.createElement("a");
      link.download = `pattern-${patternType}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = `data:image/svg+xml,${encodeURIComponent(svgPattern)}`;
  }, [patternType, size, spacing, getPatternStyle]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-800">
          Advanced Pattern Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pattern Type</label>
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
                  <option value="hexagon">Hexagon</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size ({size}px)</label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spacing ({spacing}px)</label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={spacing}
                  onChange={(e) => setSpacing(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rotation ({rotation}°)</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full h-10 rounded-md cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full h-10 rounded-md cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opacity ({opacity})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Repeat</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shape</label>
                <select
                  value={shape}
                  onChange={(e) => setShape(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={patternType !== "dots" && patternType !== "waves"}
                >
                  <option value="square">Square</option>
                  <option value="circle">Circle</option>
                  <option value="triangle">Triangle</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={exportPattern}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Export
                </button>
                <button
                  onClick={randomize}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaRandom className="mr-2" /> Randomize
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <div
              className="w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl shadow-lg border border-gray-200 transition-all duration-300"
              style={getPatternStyle()}
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple pattern types: Grid, Dots, Stripes, Checker, Waves, Hexagon</li>
            <li>Customizable size, spacing, rotation, colors, and opacity</li>
            <li>Shape options for Dots and Waves (Square, Circle, Triangle)</li>
            <li>Repeat options: Repeat, X, Y, No Repeat</li>
            <li>Randomize feature for quick experimentation</li>
            <li>Export as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdvancedImagePatternGenerator;