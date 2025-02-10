"use client";
import { useState, useRef } from "react";

const BarcodeGenerator = () => {
  const [barcode, setBarcode] = useState("123456789012");
  const canvasRef = useRef(null);

  const generateBarcode = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    canvas.width = 200;
    canvas.height = 100;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = "20px Arial";
    ctx.fillText(barcode, 50, 50);
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Barcode Generator</h2>
      <input
        type="text"
        className="border p-2 w-full mb-2"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
      />
      <button onClick={generateBarcode} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
        Generate Barcode
      </button>
      <canvas ref={canvasRef} className="mt-2 border"></canvas>
    </div>
  );
};

export default BarcodeGenerator;
