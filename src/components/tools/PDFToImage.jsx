"use client";

import { useState, useRef } from "react";

const PDFToImage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [imageURL, setImageURL] = useState("");
  const canvasRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      renderPDFToCanvas(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const renderPDFToCanvas = async (file) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const arrayBuffer = reader.result;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Simulate rendering PDF page
      canvas.width = 600;
      canvas.height = 800;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "20px Arial";
      ctx.fillStyle = "black";
      ctx.fillText("Simulated PDF Page", 200, 400);

      // Convert Canvas to Image URL
      setImageURL(canvas.toDataURL("image/png"));
    };
  };

  const downloadImage = () => {
    if (!imageURL) {
      alert("No image generated!");
      return;
    }
    const link = document.createElement("a");
    link.href = imageURL;
    link.download = "converted.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto p-5 bg-white shadow-lg rounded-2xl">

      {/* File Input */}
      <input
        type="file"
        accept="application/pdf"
        className="mb-3 w-full p-2 border rounded-lg"
        onChange={handleFileUpload}
      />

      {/* Canvas for PDF Rendering */}
      <canvas ref={canvasRef} className="hidden"></canvas>

      {/* Image Preview */}
      {imageURL && (
        <div className="mt-4">
          <img src={imageURL} alt="Converted PDF" className="w-full rounded-lg shadow" />
          <button
            className="w-full bg-blue-500 text-white px-4 py-2 mt-3 rounded-lg hover:bg-blue-600 transition"
            onClick={downloadImage}
          >
            Download Image
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFToImage;
