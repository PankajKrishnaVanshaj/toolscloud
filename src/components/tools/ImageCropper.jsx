"use client";

import { useState, useRef, useEffect } from "react";

const ImageCropper = () => {
  const [image, setImage] = useState(null);
  const [cropArea, setCropArea] = useState({
    x: 50,
    y: 50,
    width: 150,
    height: 150,
  });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!imgRef.current) return;

    const imgRect = imgRef.current.getBoundingClientRect();

    if (dragging) {
      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;

      setCropArea((prev) => {
        const newX = Math.max(0, Math.min(prev.x + dx, imgRect.width - prev.width));
        const newY = Math.max(0, Math.min(prev.y + dy, imgRect.height - prev.height));
        return { ...prev, x: newX, y: newY };
      });

      startPosRef.current = { x: e.clientX, y: e.clientY };
    } else if (resizing) {
      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;

      setCropArea((prev) => {
        const newWidth = Math.max(50, Math.min(prev.width + dx, imgRect.width - prev.x));
        const newHeight = Math.max(50, Math.min(prev.height + dy, imgRect.height - prev.y));

        return { ...prev, width: newWidth, height: newHeight };
      });

      startPosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
  };

  useEffect(() => {
    const handleTouchMove = (e) => {
      if (dragging || resizing) {
        e.preventDefault();
        const touch = e.touches[0];
        handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
      }
    };
  
    const handleTouchEnd = () => {
      setDragging(false);
      setResizing(false);
    };
  
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);
  
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [dragging, resizing]);
  

  const downloadCroppedImage = () => {
    if (!imgRef.current || !canvasRef.current) return;

    const img = imgRef.current;

    // Create a new canvas to crop the selected area
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size to the crop area size
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    // Calculate the scale factor between the natural and displayed image dimensions
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const displayedWidth = img.getBoundingClientRect().width;
    const displayedHeight = img.getBoundingClientRect().height;

    const scaleX = naturalWidth / displayedWidth;
    const scaleY = naturalHeight / displayedHeight;

    // Scale the crop area to match the natural size of the image
    const scaledX = cropArea.x * scaleX;
    const scaledY = cropArea.y * scaleY;
    const scaledWidth = cropArea.width * scaleX;
    const scaledHeight = cropArea.height * scaleY;

    // Draw the exact cropped image onto the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      scaledX,
      scaledY,
      scaledWidth,
      scaledHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Trigger the download
    const link = document.createElement("a");
    link.download = "cropped-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="p-5 bg-white shadow-lg rounded-2xl flex flex-col gap-5">
      <input
        type="file"
        accept="image/*"
        className="mb-3 w-full p-2 border rounded-lg"
        onChange={handleImageUpload}
      />

      {image && (
        <div ref={containerRef} className="relative w-full">
          <img
            ref={imgRef}
            src={image}
            alt="Uploaded"
            className="w-full max-h-60 object-contain rounded-lg border mb-3"
          />
          <div
            className="absolute border-2 border-red-500"
            style={{
              left: cropArea.x,
              top: cropArea.y,
              width: cropArea.width,
              height: cropArea.height,
              cursor: "move",
            }}
            onMouseDown={handleMouseDown}
          >
            <div
              className="absolute bottom-0 right-0 w-4 h-4 bg-secondary cursor-se-resize"
              onMouseDown={handleResizeMouseDown}
            ></div>
          </div>
        </div>
      )}

      <button
        onClick={downloadCroppedImage}
        className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text border hover:border-secondary p-2 rounded-lg mt-3"
      >
        Download Cropped Image
      </button>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default ImageCropper;
