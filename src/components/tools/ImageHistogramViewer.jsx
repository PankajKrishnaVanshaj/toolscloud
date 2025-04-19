"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
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
import { FaUpload, FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the chart

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ImageHistogramViewer = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [histogramData, setHistogramData] = useState(null);
  const [channel, setChannel] = useState("all"); // "all", "red", "green", "blue"
  const [logScale, setLogScale] = useState(false); // Toggle logarithmic scale
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setHistogramData(null); // Reset histogram data
    }
  }, []);

  // Generate histogram data
  const generateHistogram = useCallback(() => {
    if (!previewUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const red = new Array(256).fill(0);
      const green = new Array(256).fill(0);
      const blue = new Array(256).fill(0);

      for (let i = 0; i < data.length; i += 4) {
        red[data[i]]++;
        green[data[i + 1]]++;
        blue[data[i + 2]]++;
      }

      // Apply logarithmic scale if enabled
      const transformData = (arr) =>
        logScale ? arr.map((val) => (val > 0 ? Math.log10(val + 1) : 0)) : arr;

      const datasets = [
        {
          label: "Red",
          data: transformData(red),
          backgroundColor: "rgba(255, 0, 0, 0.5)",
          borderColor: "rgb(255, 0, 0)",
          borderWidth: 1,
          hidden: channel !== "all" && channel !== "red",
        },
        {
          label: "Green",
          data: transformData(green),
          backgroundColor: "rgba(0, 255, 0, 0.5)",
          borderColor: "rgb(0, 255, 0)",
          borderWidth: 1,
          hidden: channel !== "all" && channel !== "green",
        },
        {
          label: "Blue",
          data: transformData(blue),
          backgroundColor: "rgba(0, 0, 255, 0.5)",
          borderColor: "rgb(0, 0, 255)",
          borderWidth: 1,
          hidden: channel !== "all" && channel !== "blue",
        },
      ];

      const chartData = {
        labels: Array.from({ length: 256 }, (_, i) => i),
        datasets,
      };

      setHistogramData(chartData);
    };

    img.src = previewUrl;
  }, [previewUrl, channel, logScale]);

  useEffect(() => {
    generateHistogram();
  }, [generateHistogram]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        onClick: (e, legendItem) => {
          const index = legendItem.datasetIndex;
          const newChannel = ["red", "green", "blue"][index];
          setChannel(channel === newChannel ? "all" : newChannel);
        },
      },
      title: {
        display: true,
        text: `RGB Histogram${logScale ? " (Log Scale)" : ""}`,
      },
      tooltip: {
        mode: "index",
        intersect: false,
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
          text: logScale ? "Log(Pixel Count + 1)" : "Pixel Count",
        },
        beginAtZero: true,
        type: logScale ? "logarithmic" : "linear",
      },
    },
  };

  // Reset function
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setHistogramData(null);
    setChannel("all");
    setLogScale(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Download chart
  const downloadChart = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current.canvas.parentElement).then((canvas) => {
        const link = document.createElement("a");
        link.download = `histogram-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800">
          Image Histogram Viewer
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Upload and Controls */}
          <div className="mb-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {previewUrl && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Channels</option>
                    <option value="red">Red</option>
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={logScale}
                      onChange={(e) => setLogScale(e.target.checked)}
                      className="mr-2 accent-blue-500"
                    />
                    Logarithmic Scale
                  </label>
                </div>
                <button
                  onClick={reset}
                  className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FaSync className="mr-2" /> Reset
                </button>
                <button
                  onClick={downloadChart}
                  disabled={!histogramData}
                  className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download Histogram
                </button>
              </div>
            )}
          </div>

          {/* Preview and Histogram */}
          {previewUrl && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-2 text-gray-700">Image Preview</h2>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md shadow-md"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="relative">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">Histogram</h2>
                <div className="h-[400px] max-h-[70vh]">
                  {histogramData ? (
                    <Bar
                      ref={chartRef}
                      data={histogramData}
                      options={chartOptions}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!previewUrl && (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
              <p className="text-gray-500 italic">
                Upload an image to view its histogram
              </p>
            </div>
          )}

          {/* Features */}
          {previewUrl && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
              <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
                <li>View RGB histograms for uploaded images</li>
                <li>Toggle individual channels (Red, Green, Blue)</li>
                <li>Switch between linear and logarithmic scales</li>
                <li>Download histogram as PNG</li>
                <li>Responsive design with Tailwind CSS</li>
                <li>Interactive legend for channel selection</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageHistogramViewer;