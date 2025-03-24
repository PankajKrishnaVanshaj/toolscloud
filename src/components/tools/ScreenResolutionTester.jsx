"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaDownload, FaInfoCircle } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const ScreenResolutionTester = () => {
  const [screenInfo, setScreenInfo] = useState({
    screenWidth: 0,
    screenHeight: 0,
    windowWidth: 0,
    windowHeight: 0,
    pixelRatio: 0,
    colorDepth: 0,
    orientation: "",
    availableWidth: 0,
    availableHeight: 0,
  });
  const [testPattern, setTestPattern] = useState("checkerboard");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = React.useRef(null);

  // Update screen information
  const updateScreenInfo = useCallback(() => {
    setScreenInfo({
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
      colorDepth: window.screen.colorDepth,
      orientation: window.screen.orientation?.type || "unknown",
      availableWidth: window.screen.availWidth,
      availableHeight: window.screen.availHeight,
    });
  }, []);

  // Initial setup and event listeners
  useEffect(() => {
    updateScreenInfo();
    window.addEventListener("resize", updateScreenInfo);
    window.addEventListener("orientationchange", updateScreenInfo);

    return () => {
      window.removeEventListener("resize", updateScreenInfo);
      window.removeEventListener("orientationchange", updateScreenInfo);
    };
  }, [updateScreenInfo]);

  // Toggle full-screen mode
  const toggleFullScreen = () => {
    if (!isFullScreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Error entering fullscreen:", err);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Download screen info as image
  const downloadScreenInfo = () => {
    if (containerRef.current) {
      html2canvas(containerRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `screen-resolution-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Test pattern styles
  const getTestPatternStyle = () => {
    switch (testPattern) {
      case "checkerboard":
        return {
          backgroundImage:
            "linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        };
      case "grid":
        return {
          backgroundImage: "linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        };
      case "color-bars":
        return {
          backgroundImage: "linear-gradient(to right, red, green, blue, yellow, cyan, magenta, white, black)",
        };
      default:
        return {};
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div
        ref={containerRef}
        className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Screen Resolution Tester
        </h1>

        <div className="space-y-6">
          {/* Display Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-center text-blue-600">
              Display Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <p>
                <span className="font-medium">Screen Resolution:</span>{" "}
                {`${screenInfo.screenWidth} x ${screenInfo.screenHeight} pixels`}
              </p>
              <p>
                <span className="font-medium">Window Size:</span>{" "}
                {`${screenInfo.windowWidth} x ${screenInfo.windowHeight} pixels`}
              </p>
              <p>
                <span className="font-medium">Available Screen:</span>{" "}
                {`${screenInfo.availableWidth} x ${screenInfo.availableHeight} pixels`}
              </p>
              <p>
                <span className="font-medium">Device Pixel Ratio:</span>{" "}
                {`${screenInfo.pixelRatio}x`}
              </p>
              <p>
                <span className="font-medium">Color Depth:</span>{" "}
                {`${screenInfo.colorDepth} bits`}
              </p>
              <p>
                <span className="font-medium">Orientation:</span>{" "}
                {screenInfo.orientation}
              </p>
            </div>
          </div>

          {/* Test Pattern Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Pattern
              </label>
              <select
                value={testPattern}
                onChange={(e) => setTestPattern(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="checkerboard">Checkerboard</option>
                <option value="grid">Grid</option>
                <option value="color-bars">Color Bars</option>
              </select>
            </div>
          </div>

          {/* Visual Test Area */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Resolution Test Area
            </h3>
            <div
              className="w-full h-48 sm:h-64 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 transition-all"
              style={getTestPatternStyle()}
            >
              {screenInfo.windowWidth && screenInfo.windowHeight
                ? `${screenInfo.windowWidth} x ${screenInfo.windowHeight}`
                : "Resize your window to see changes"}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={updateScreenInfo}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Refresh
            </button>
            <button
              onClick={toggleFullScreen}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> {isFullScreen ? "Exit Full Screen" : "Full Screen"}
            </button>
            <button
              onClick={downloadScreenInfo}
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start">
          <FaInfoCircle className="text-blue-600 mr-2 mt-1" />
          <p className="text-xs text-blue-600">
            Window size updates in real-time. Screen resolution is your device's full display size. Available screen excludes taskbars/system UI.
          </p>
        </div>

        {/* Features */}
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Real-time window size updates</li>
            <li>Multiple test patterns: Checkerboard, Grid, Color Bars</li>
            <li>Full-screen mode</li>
            <li>Download results as PNG</li>
            <li>Additional info: Orientation, Available Screen</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScreenResolutionTester;