"use client";
import { useState, useRef } from "react";

const QRCodeGenerator = () => {
  const [text, setText] = useState("Hello QR");
  const canvasRef = useRef(null);

  const generateQR = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 200;
    canvas.height = 200;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.fillRect(50, 50, 20, 20);
    ctx.fillRect(80, 80, 20, 20);
    ctx.fillRect(120, 50, 20, 20);

    ctx.font = "10px Arial";
    ctx.fillText(text, 10, 180);
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-2">QR Code Generator</h2>
      <input
        type="text"
        className="border p-2 w-full mb-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={generateQR} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
        Generate QR Code
      </button>
      <canvas ref={canvasRef} className="mt-2 border"></canvas>
    </div>
  );
};

export default QRCodeGenerator;
