// components/ImageTiltShiftTool.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageTiltShiftTool = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [blurAmount, setBlurAmount] = useState(10);
  const [focusPosition, setFocusPosition] = useState(50); // Percentage from top
  const [focusWidth, setFocusWidth] = useState(20); // Percentage of height
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
    }
  };

  // Apply tilt-shift effect
  const applyTiltShift = () => {
    if (!image || !canvasRef.current) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;

      // Create temporary canvas for blur
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(img, 0, 0);

      // Apply stack blur (simple approximation)
      stackBlurCanvasRGB(tempCanvas, 0, 0, width, height, blurAmount);

      // Get blurred data
      const blurredData = tempCtx.getImageData(0, 0, width, height).data;

      // Calculate focus area
      const focusTop = (focusPosition - focusWidth / 2) * height / 100;
      const focusBottom = (focusPosition + focusWidth / 2) * height / 100;

      // Combine original and blurred data
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          let blendFactor;

          if (y < focusTop) {
            blendFactor = Math.min(1, (focusTop - y) / (focusTop * 0.5));
          } else if (y > focusBottom) {
            blendFactor = Math.min(1, (y - focusBottom) / ((height - focusBottom) * 0.5));
          } else {
            blendFactor = 0;
          }

          // Blend between original and blurred
          data[i] = data[i] * (1 - blendFactor) + blurredData[i] * blendFactor;
          data[i + 1] = data[i + 1] * (1 - blendFactor) + blurredData[i + 1] * blendFactor;
          data[i + 2] = data[i + 2] * (1 - blendFactor) + blurredData[i + 2] * blendFactor;
          data[i + 3] = data[i + 3]; // Preserve alpha
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL());
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  // Simple stack blur implementation
  const stackBlurCanvasRGB = (canvas, top_x, top_y, width, height, radius) => {
    const context = canvas.getContext("2d");
    const imageData = context.getImageData(top_x, top_y, width, height);
    const pixels = imageData.data;
    
    const mul_table = [
      512,512,456,512,328,456,335,512,405,328,271,456,388,335,292,512,
      454,405,364,328,298,271,496,456,420,388,360,335,312,292,273,512,
      482,454,428,405,383,364,345,328,312,298,284,271,259,496,475,456,
      437,420,404,388,374,360,347,335,323,312,302,292,282,273,265,512,
      497,482,468,454,441,428,417,405,394,383,373,364,354,345,337,328,
      320,312,305,298,291,284,278,271,265,259,507,496,485,475,465,456,
      446,437,428,420,412,404,396,388,381,374,367,360,354,347,341,335,
      329,323,318,312,307,302,297,292,287,282,278,273,269,265,261,512,
      505,497,489,482,475,468,461,454,447,441,435,428,422,417,411,405,
      399,394,389,383,378,373,368,364,359,354,350,345,341,337,332,328,
      324,320,316,312,309,305,301,298,294,291,287,284,281,278,275,271,
      268,265,262,259,257,507,501,496,491,485,480,475,470,465,460,456,
      451,446,442,437,433,428,424,420,416,412,408,404,400,396,392,388,
      385,381,377,374,370,367,363,360,357,354,350,347,344,341,338,335,
      332,329,326,323,320,318,315,312,310,307,304,302,299,297,294,292,
      289,287,285,282,280,278,275,273,271,269,267,265,263,261,259
    ];
    
    const shg_table = [
      9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 
      17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 
      19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
      20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
      21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
      21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
      22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
      22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
      23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
      23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
      23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
      23, 23, 23, 23, 23
    ];

    // Simplified stack blur implementation
    const blurRadius = Math.min(radius, 50);
    const mul_sum = mul_table[blurRadius];
    const shg_sum = shg_table[blurRadius];

    // Horizontal blur
    for (let y = 0; y < height; y++) {
      let r_sum = 0, g_sum = 0, b_sum = 0;
      let r_out_sum = 0, g_out_sum = 0, b_out_sum = 0;
      let r_in_sum = 0, g_in_sum = 0, b_in_sum = 0;

      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (x === 0) {
          for (let m = 0; m <= blurRadius; m++) {
            const idx = (y * width + Math.min(m, width - 1)) * 4;
            r_sum += pixels[idx];
            g_sum += pixels[idx + 1];
            b_sum += pixels[idx + 2];
          }
        }

        if (x >= blurRadius) {
          const idx = (y * width + (x - blurRadius)) * 4;
          pixels[idx] = r_sum / mul_sum;
          pixels[idx + 1] = g_sum / mul_sum;
          pixels[idx + 2] = b_sum / mul_sum;
          
          const p = (y * width + Math.min(x + blurRadius + 1, width - 1)) * 4;
          r_in_sum += pixels[p];
          g_in_sum += pixels[p + 1];
          b_in_sum += pixels[p + 2];
          
          r_sum += r_in_sum;
          g_sum += g_in_sum;
          b_sum += b_in_sum;
          
          const q = (y * width + (x - blurRadius)) * 4;
          r_out_sum += pixels[q];
          g_out_sum += pixels[q + 1];
          b_out_sum += pixels[q + 2];
          
          r_sum -= r_out_sum;
          g_sum -= g_out_sum;
          b_sum -= b_out_sum;
        }
      }
    }

    // Vertical blur would go here for a full implementation
    // This is a simplified version for performance
    
    context.putImageData(imageData, top_x, top_y);
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "tilt-shift.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Tilt-Shift Tool
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Preview and Controls */}
          {previewUrl && (
            <div className="space-y-6">
              <div className="relative max-w-full mx-auto">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blur Amount ({blurAmount})
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={blurAmount}
                    onChange={(e) => setBlurAmount(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Focus Position ({focusPosition}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={focusPosition}
                    onChange={(e) => setFocusPosition(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Focus Width ({focusWidth}%)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={focusWidth}
                    onChange={(e) => setFocusWidth(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={applyTiltShift}
                    disabled={isProcessing}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? "Processing..." : "Apply"}
                  </button>
                  <button
                    onClick={downloadImage}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Adjust settings and click "Apply" to create the tilt-shift effect
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageTiltShiftTool;