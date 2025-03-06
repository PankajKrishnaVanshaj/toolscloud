// components/ImageHistogramViewer.jsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ImageHistogramViewer = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [histogramData, setHistogramData] = useState(null);
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

  // Generate histogram data when previewUrl changes
  useEffect(() => {
    if (!previewUrl || !canvasRef.current) return;

    const generateHistogram = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Initialize arrays for RGB channels
        const red = new Array(256).fill(0);
        const green = new Array(256).fill(0);
        const blue = new Array(256).fill(0);

        // Count pixel values
        for (let i = 0; i < data.length; i += 4) {
          red[data[i]]++;
          green[data[i + 1]]++;
          blue[data[i + 2]]++;
        }

        // Prepare chart data
        const chartData = {
          labels: Array.from({ length: 256 }, (_, i) => i),
          datasets: [
            {
              label: "Red",
              data: red,
              backgroundColor: "rgba(255, 0, 0, 0.5)",
              borderColor: "rgb(255, 0, 0)",
              borderWidth: 1,
            },
            {
              label: "Green",
              data: green,
              backgroundColor: "rgba(0, 255, 0, 0.5)",
              borderColor: "rgb(0, 255, 0)",
              borderWidth: 1,
            },
            {
              label: "Blue",
              data: blue,
              backgroundColor: "rgba(0, 0, 255, 0.5)",
              borderColor: "rgb(0, 0, 255)",
              borderWidth: 1,
            },
          ],
        };

        setHistogramData(chartData);
      };

      img.src = previewUrl;
    };

    generateHistogram();
  }, [previewUrl]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "RGB Histogram",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Intensity (0-255)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Pixel Count",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Histogram Viewer
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

          {/* Preview and Histogram */}
          {previewUrl && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Image Preview</h2>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="h-[400px]">
                <h2 className="text-lg font-semibold mb-2">Histogram</h2>
                {histogramData ? (
                  <Bar data={histogramData} options={chartOptions} />
                ) : (
                  <p className="text-gray-500">Generating histogram...</p>
                )}
              </div>
            </div>
          )}

          {!previewUrl && (
            <p className="text-center text-gray-500">
              Upload an image to view its histogram
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageHistogramViewer;