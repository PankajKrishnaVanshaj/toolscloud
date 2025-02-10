"use client";

import { useState, useRef, useEffect } from "react";

const BarcodeScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [barcode, setBarcode] = useState("");

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing the camera:", error);
    }
  };

  const scanBarcode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = extractBarcode(imageData);
    
    if (code) setBarcode(code);
  };

  // Mock barcode extraction logic (You need to implement actual barcode decoding)
  const extractBarcode = (imageData) => {
    // For simplicity, this function returns a fake barcode
    return "123456789012";
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-4">📷 Barcode Scanner</h2>
      <video ref={videoRef} autoPlay className="w-full rounded-lg border mb-2"></video>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <button onClick={scanBarcode} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
        Scan Barcode
      </button>
      {barcode && <p className="mt-3 text-lg font-medium">Barcode: {barcode}</p>}
    </div>
  );
};

export default BarcodeScanner;
