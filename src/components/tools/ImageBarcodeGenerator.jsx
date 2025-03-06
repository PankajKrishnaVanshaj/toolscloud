// components/ImageBarcodeGenerator.jsx
"use client";
import React, { useState, useRef } from "react";
import bwipjs from "bwip-js";

const ImageBarcodeGenerator = () => {
  const [text, setText] = useState("");
  const [barcodeType, setBarcodeType] = useState("qrcode");
  const [scale, setScale] = useState(3);
  const [height, setHeight] = useState(100);
  const [padding, setPadding] = useState(10);
  const [barcodeUrl, setBarcodeUrl] = useState(null);
  const canvasRef = useRef(null);

  // Available barcode types
  const barcodeTypes = [
    { value: "qrcode", label: "QR Code" },
    { value: "code128", label: "Code 128" },
    { value: "ean13", label: "EAN-13" },
    { value: "upca", label: "UPC-A" },
    { value: "datamatrix", label: "Data Matrix" },
  ];

  // Generate barcode
  const generateBarcode = () => {
    if (!text || !canvasRef.current) return;

    try {
      bwipjs.toCanvas(canvasRef.current, {
        bcid: barcodeType,       // Barcode type
        text: text,             // Text to encode
        scale: scale,           // Scaling factor
        height: height / 10,    // Bar height, in millimeters
        includetext: true,      // Show human-readable text
        textxalign: "center",   // Text alignment
        padding: padding,       // Padding around barcode
      });

      setBarcodeUrl(canvasRef.current.toDataURL("image/png"));
    } catch (error) {
      console.error("Error generating barcode:", error);
      alert("Error generating barcode. Please check your input.");
    }
  };

  // Download barcode
  const downloadBarcode = () => {
    if (!barcodeUrl) return;
    const link = document.createElement("a");
    link.download = `${barcodeType}-barcode.png`;
    link.href = barcodeUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Barcode Generator
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text to Encode
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text or URL"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barcode Type
                </label>
                <select
                  value={barcodeType}
                  onChange={(e) => setBarcodeType(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {barcodeTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scale ({scale}x)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={scale}
                  onChange={(e) => setScale(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height ({height}px)
                </label>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Padding ({padding}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={padding}
                  onChange={(e) => setPadding(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={generateBarcode}
                  disabled={!text}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                >
                  Generate
                </button>
                <button
                  onClick={downloadBarcode}
                  disabled={!barcodeUrl}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center justify-center">
              <div className="bg-gray-100 p-4 rounded-md">
                <canvas ref={canvasRef} className="max-w-full h-auto" />
                {!barcodeUrl && (
                  <p className="text-gray-500 text-center">
                    Enter text and click "Generate" to see barcode
                  </p>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Note: Some barcode types have specific format requirements (e.g., UPC-A needs 12 digits)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageBarcodeGenerator;