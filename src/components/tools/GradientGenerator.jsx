"use client";

import { useState } from "react";

const GradientGenerator = () => {
  const [color1, setColor1] = useState("#ff5733");
  const [color2, setColor2] = useState("#3498db");
  const [angle, setAngle] = useState(90);

  const gradientStyle = {
    background: `linear-gradient(${angle}deg, ${color1}, ${color2})`,
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg text-center">

      <div className="flex justify-center gap-4 mb-4">
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium">Color 1</p>
          <input
            type="color"
            value={color1}
            onChange={(e) => setColor1(e.target.value)}
            className="w-16 h-16 cursor-pointer"
          />
        </div>

        <div className="flex flex-col items-center">
          <p className="text-sm font-medium">Color 2</p>
          <input
            type="color"
            value={color2}
            onChange={(e) => setColor2(e.target.value)}
            className="w-16 h-16 cursor-pointer"
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-lg font-medium">Gradient Angle: {angle}°</p>
        <input
          type="range"
          min="0"
          max="360"
          value={angle}
          onChange={(e) => setAngle(e.target.value)}
          className="w-full mt-2"
        />
      </div>

      <div className="w-full h-32 mt-4 rounded-lg" style={gradientStyle}></div>

      <p className="mt-4 text-sm font-medium text-gray-600">
        CSS: <code className="bg-gray-100 px-2 py-1 rounded">{`background: linear-gradient(${angle}deg, ${color1}, ${color2});`}</code>
      </p>
    </div>
  );
};

export default GradientGenerator;
