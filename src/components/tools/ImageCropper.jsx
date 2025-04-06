import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FaUpload, FaDownload, FaSync, FaCrop } from 'react-icons/fa';

const ImageCropper = () => {
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [interaction, setInteraction] = useState({ type: null, startX: 0, startY: 0 });
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setCroppedImage(null);
        setCrop({ x: 0, y: 0, width: 200, height: 200 });
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image file');
    }
  }, []);

  // Perform crop
  const performCrop = useCallback(() => {
    if (!image || !canvasRef.current || !previewCanvasRef.current || !imageRef.current) return;

    const img = new Image();
    img.src = image;

    img.onload = () => {
      const canvas = canvasRef.current;
      const previewCanvas = previewCanvasRef.current;
      
      if (!canvas || !previewCanvas) return;

      const ctx = canvas.getContext('2d');
      const previewCtx = previewCanvas.getContext('2d');
      
      if (!ctx || !previewCtx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      previewCanvas.width = crop.width;
      previewCanvas.height = crop.height;

      ctx.drawImage(img, 0, 0);
      previewCtx.drawImage(
        canvas,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

      setCroppedImage(previewCanvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      console.error('Failed to load image');
    };
  }, [image, crop]);

  // Only perform crop when canvas refs are ready
  useEffect(() => {
    if (image && canvasRef.current && previewCanvasRef.current) {
      performCrop();
    }
  }, [image, crop, performCrop]);

  // Get scaled mouse coordinates
  const getScaledCoordinates = (e) => {
    if (!imageRef.current) return { x: 0, y: 0 };
    
    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageRef.current.naturalWidth / rect.width;
    const scaleY = imageRef.current.naturalHeight / rect.height;
    
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  };

  // Check if point is in resize handle
  const getResizeHandle = (x, y) => {
    const handleSize = 10;
    const handles = {
      nw: { x: crop.x, y: crop.y },
      ne: { x: crop.x + crop.width, y: crop.y },
      sw: { x: crop.x, y: crop.y + crop.height },
      se: { x: crop.x + crop.width, y: crop.y + crop.height },
    };

    for (const [key, pos] of Object.entries(handles)) {
      if (Math.abs(x - pos.x) <= handleSize && Math.abs(y - pos.y) <= handleSize) {
        return key;
      }
    }
    return null;
  };

  // Handle mouse down
  const handleMouseDown = useCallback((e) => {
    const pos = getScaledCoordinates(e);
    const resizeHandle = getResizeHandle(pos.x, pos.y);
    
    if (resizeHandle || (pos.x >= crop.x && pos.x <= crop.x + crop.width && 
        pos.y >= crop.y && pos.y <= crop.y + crop.height)) {
      setInteraction({
        type: resizeHandle || 'drag',
        startX: pos.x,
        startY: pos.y,
      });
    }
    e.preventDefault();
  }, [crop]);

  // Handle mouse move
  const handleMouseMove = useCallback((e) => {
    if (!interaction.type || !imageRef.current) return;

    const pos = getScaledCoordinates(e);
    const dx = pos.x - interaction.startX;
    const dy = pos.y - interaction.startY;
    const imgWidth = imageRef.current.naturalWidth;
    const imgHeight = imageRef.current.naturalHeight;

    setCrop((prev) => {
      let newCrop = { ...prev };

      switch (interaction.type) {
        case 'drag':
          newCrop.x = Math.max(0, Math.min(prev.x + dx, imgWidth - prev.width));
          newCrop.y = Math.max(0, Math.min(prev.y + dy, imgHeight - prev.height));
          break;
        case 'nw':
          newCrop.x = Math.max(0, Math.min(prev.x + dx, prev.x + prev.width - 10));
          newCrop.y = Math.max(0, Math.min(prev.y + dy, prev.y + prev.height - 10));
          newCrop.width = Math.max(10, prev.width - dx);
          newCrop.height = Math.max(10, prev.height - dy);
          break;
        case 'ne':
          newCrop.y = Math.max(0, Math.min(prev.y + dy, prev.y + prev.height - 10));
          newCrop.width = Math.max(10, Math.min(prev.width + dx, imgWidth - prev.x));
          newCrop.height = Math.max(10, prev.height - dy);
          break;
        case 'sw':
          newCrop.x = Math.max(0, Math.min(prev.x + dx, prev.x + prev.width - 10));
          newCrop.width = Math.max(10, prev.width - dx);
          newCrop.height = Math.max(10, Math.min(prev.height + dy, imgHeight - prev.y));
          break;
        case 'se':
          newCrop.width = Math.max(10, Math.min(prev.width + dx, imgWidth - prev.x));
          newCrop.height = Math.max(10, Math.min(prev.height + dy, imgHeight - prev.y));
          break;
        default:
          break;
      }

      return newCrop;
    });

    setInteraction((prev) => ({ ...prev, startX: pos.x, startY: pos.y }));
  }, [interaction]);

  // Handle mouse up
  const handleMouseUp = () => {
    setInteraction({ type: null, startX: 0, startY: 0 });
  };

  // Handle crop size changes from inputs
  const handleCropSizeChange = (dimension, value) => {
    const numValue = Math.max(10, parseInt(value) || 10);
    setCrop((prev) => {
      const img = imageRef.current;
      if (!img) return prev;

      const newCrop = { ...prev };
      if (dimension === 'width') {
        newCrop.width = Math.min(numValue, img.naturalWidth - newCrop.x);
      } else {
        newCrop.height = Math.min(numValue, img.naturalHeight - newCrop.y);
      }
      return newCrop;
    });
  };

  // Download cropped image
  const handleDownload = () => {
    if (croppedImage) {
      const link = document.createElement('a');
      link.download = `cropped-image-${Date.now()}.png`;
      link.href = croppedImage;
      link.click();
    }
  };

  // Reset everything
  const handleReset = () => {
    setImage(null);
    setCroppedImage(null);
    setCrop({ x: 0, y: 0, width: 200, height: 200 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image Cropper</h1>

        {/* File Upload */}
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {image && (
          <div className="space-y-6">
            {/* Crop Area and Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative" ref={containerRef}>
                <img
                  ref={imageRef}
                  src={image}
                  alt="Original"
                  className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ userSelect: 'none' }}
                />
                {imageRef.current && (
                  <div
                    className="absolute border-2 border-blue-500 border-dashed"
                    style={{
                      left: `${(crop.x / imageRef.current.naturalWidth) * 100}%`,
                      top: `${(crop.y / imageRef.current.naturalHeight) * 100}%`,
                      width: `${(crop.width / imageRef.current.naturalWidth) * 100}%`,
                      height: `${(crop.height / imageRef.current.naturalHeight) * 100}%`,
                      background: 'rgba(0, 0, 255, 0.1)',
                    }}
                  >
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -top-1 -left-1 cursor-nw-resize" />
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -top-1 -right-1 cursor-ne-resize" />
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -bottom-1 -left-1 cursor-sw-resize" />
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -bottom-1 -right-1 cursor-se-resize" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Cropped Preview</p>
                <canvas
                  ref={previewCanvasRef}
                  className="max-w-full h-auto rounded-lg shadow-md"
                />
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />

            {/* Crop Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crop Width (px)
                </label>
                <input
                  type="number"
                  min="10"
                  value={crop.width}
                  onChange={(e) => handleCropSizeChange('width', e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crop Height (px)
                </label>
                <input
                  type="number"
                  min="10"
                  value={crop.height}
                  onChange={(e) => handleCropSizeChange('height', e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={handleDownload}
                disabled={!croppedImage}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>
        )}

        {!image && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start cropping</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Drag to position crop area</li>
            <li>Resize crop area using corner handles</li>
            <li>Adjust crop size manually with inputs</li>
            <li>Real-time preview of cropped area</li>
            <li>Download cropped image as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;